import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToCloudinary, deleteMultipleFromCloudinary } from '@/lib/cloudinary-server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createPropertySchema } from '@/lib/validations/property-create';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const maxDuration = 30; // Maximum execution time (seconds)

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_CONCURRENT_UPLOADS = 5;

interface UploadResult {
  secure_url: string;
  public_id: string;
  success: boolean;
  error?: string;
}

/**
 * Upload a single file with concurrency limit
 */
async function uploadImageWithLimit(
  file: File,
  folder: string,
  semaphore: { count: number; queue: Array<() => void> }
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const executeUpload = async () => {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          resolve({
            secure_url: '',
            public_id: '',
            success: false,
            error: `File ${file.name} is not an image`,
          });
          semaphore.count--;
          if (semaphore.queue.length > 0) {
            const next = semaphore.queue.shift();
            if (next) next();
          }
          return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          resolve({
            secure_url: '',
            public_id: '',
            success: false,
            error: `errors.fileSizeExceeded:${file.name}`,
          });
          semaphore.count--;
          if (semaphore.queue.length > 0) {
            const next = semaphore.queue.shift();
            if (next) next();
          }
          return;
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const result = await uploadBufferToCloudinary(buffer, folder);

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          success: true,
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        resolve({
          secure_url: '',
          public_id: '',
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      } finally {
        semaphore.count--;
        if (semaphore.queue.length > 0) {
          const next = semaphore.queue.shift();
          if (next) next();
        }
      }
    };

    if (semaphore.count < MAX_CONCURRENT_UPLOADS) {
      semaphore.count++;
      executeUpload();
    } else {
      semaphore.queue.push(executeUpload);
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch last N properties ordered by created_at descending
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties', details: error.message },
        { status: 500 }
      );
    }

    // Transform database properties to match Property interface
    const transformedProperties = (properties || []).map((prop: any) => ({
      id: prop.id,
      short_id: prop.short_id ?? undefined,
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type,
      status: prop.status,
      city: prop.city || '',
      neighborhood: prop.neighborhood || undefined,
      price: Number(prop.price) || 0,
      currency: 'лв',
      area: Number(prop.area_sqm) || 0,
      rooms: prop.rooms || undefined,
      bathrooms: prop.bathrooms || undefined,
      subtype: prop.subtype || undefined,
      construction_type: prop.construction_type || undefined,
      completion_degree: prop.completion_degree || undefined,
      floor: prop.floor ? Number(prop.floor) : undefined,
      total_floors: prop.total_floors ? Number(prop.total_floors) : undefined,
      year_built: prop.build_year || undefined,
      images: (prop.image_urls || []).map((url: string, index: number) => ({
        id: `${prop.id}-img-${index}`,
        url,
        public_id: prop.image_public_ids?.[index] || '',
        width: 0,
        height: 0,
        is_primary: index === 0,
      })),
      features: prop.features || [],
      broker_name: prop.broker_name || undefined,
      broker_phone: prop.broker_phone || undefined,
      broker_position: prop.broker_position || undefined,
      broker_image: prop.broker_image || undefined,
      view_count: 0,
      created_at: prop.created_at || prop.date_posted || new Date().toISOString(),
      updated_at: prop.updated_at || new Date().toISOString(),
    }));

    return NextResponse.json(transformedProperties, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/properties:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse multipart/form-data
    const formData = await request.formData();

    // Extract text fields
    const textFields: Record<string, string | string[]> = {};
    const featuresArray: string[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (key === 'images' || key === 'broker_image') continue; // Handle images separately
      
      if (key === 'features') {
        // Handle features array - collect all feature values
        featuresArray.push(value.toString());
      } else {
        textFields[key] = value.toString();
      }
    }
    
    // Add features array if it exists
    if (featuresArray.length > 0) {
      textFields.features = featuresArray;
    }

    // Extract images
    const imageFiles = formData.getAll('images') as File[];
    const brokerImageFile = formData.get('broker_image') as File | null;
    
    // Validate images exist
    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Validate each image
    for (const file of imageFiles) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: 'All image fields must be valid files' },
          { status: 400 }
        );
      }
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File ${file.name} is not an image` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `errors.fileSizeExceeded:${file.name}` },
          { status: 400 }
        );
      }
    }

    // Validate broker image if provided
    if (brokerImageFile) {
      if (!(brokerImageFile instanceof File)) {
        return NextResponse.json(
          { error: 'Broker image must be a valid file' },
          { status: 400 }
        );
      }
      if (!brokerImageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `Broker image must be an image file` },
          { status: 400 }
        );
      }
      if (brokerImageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'errors.brokerImageSizeExceeded' },
          { status: 400 }
        );
      }
    }

    // Prepare data for Zod validation
    const validationData: any = {
      ...textFields,
      features: featuresArray.length > 0 ? featuresArray : undefined,
      images: imageFiles,
    };

    // Validate with Zod
    const validationResult = createPropertySchema.safeParse(validationData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Upload images with concurrency limit
    const semaphore = { count: 0, queue: [] as Array<() => void> };
    const uploadPromises = imageFiles.map((file) =>
      uploadImageWithLimit(file, 'properties', semaphore)
    );

    const uploadResults = await Promise.allSettled(uploadPromises);

    // Check for upload failures
    const successfulUploads: UploadResult[] = [];
    const failedUploads: UploadResult[] = [];

    uploadResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successfulUploads.push(result.value);
        } else {
          failedUploads.push(result.value);
        }
      } else {
        failedUploads.push({
          secure_url: '',
          public_id: '',
          success: false,
          error: result.reason?.message || 'Upload failed',
        });
      }
    });

    // If all uploads failed, return error
    if (successfulUploads.length === 0) {
      return NextResponse.json(
        {
          error: 'All image uploads failed',
          details: failedUploads.map((f) => f.error).filter(Boolean),
        },
        { status: 500 }
      );
    }

    // Collect public_ids for potential cleanup
    const uploadedPublicIds = successfulUploads.map((u) => u.public_id);
    const imageUrls = successfulUploads.map((u) => u.secure_url);

    // Upload broker image if provided
    let brokerImageUrl: string | null = null;
    let brokerImagePublicId: string | null = null;
    if (brokerImageFile) {
      const brokerArrayBuffer = await brokerImageFile.arrayBuffer();
      const brokerBuffer = Buffer.from(brokerArrayBuffer);
      try {
        const brokerUpload = await uploadBufferToCloudinary(brokerBuffer, 'brokers');
        brokerImageUrl = brokerUpload.secure_url;
        brokerImagePublicId = brokerUpload.public_id;
      } catch (error) {
        console.error('Error uploading broker image:', error);
      }
    }

    // Calculate price_per_sqm if not provided
    const pricePerSqm = validatedData.price_per_sqm
      ? validatedData.price_per_sqm
      : validatedData.price / validatedData.area_sqm;

    // Prepare payload for Supabase
    const payload = {
      status: validatedData.status,
      sale_or_rent: validatedData.sale_or_rent,
      type: validatedData.type,
      subtype: validatedData.subtype || null,
      area_sqm: validatedData.area_sqm,
      price: validatedData.price,
      price_per_sqm: pricePerSqm,
      floor: validatedData.floor || null,
      total_floors: validatedData.total_floors || null,
      city: validatedData.city,
      neighborhood: validatedData.neighborhood,
      title: validatedData.title,
      description: validatedData.description,
      build_year: validatedData.build_year || null,
      construction_type: validatedData.construction_type || null,
      completion_degree: validatedData.completion_degree || null,
      features: validatedData.features || [],
      broker_name: validatedData.broker_name,
      broker_position: validatedData.broker_position || null,
      broker_phone: validatedData.broker_phone,
      broker_image: brokerImageUrl,
      image_urls: imageUrls,
      image_public_ids: uploadedPublicIds,
    };

    // Insert into Supabase
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: insertedProperty, error: insertError } = await supabaseAdmin
      .from('properties')
      .insert(payload)
      .select()
      .single();

    // If Supabase insert fails, cleanup uploaded images
    if (insertError || !insertedProperty) {
      console.error('Supabase insert error:', insertError);
      
      // Cleanup all uploaded images (including broker image if any)
      await deleteMultipleFromCloudinary(
        brokerImagePublicId ? [...uploadedPublicIds, brokerImagePublicId] : uploadedPublicIds
      );

      return NextResponse.json(
        {
          error: 'Failed to create property',
          details: insertError?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Return success with inserted property
    return NextResponse.json(insertedProperty, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/properties:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

