import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { deleteMultipleFromCloudinary, uploadBufferToCloudinary } from '@/lib/cloudinary-server';
import { createPropertySchema } from '@/lib/validations/property-create';
import { normalizeSubtypeToId } from '@/lib/subtype-mapper';

export const runtime = 'nodejs';
export const maxDuration = 30;

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
            error: `Файлът ${file.name} не е изображение`,
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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await uploadBufferToCloudinary(buffer, folder);

        resolve({
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          success: true,
        });
      } catch (error) {
        resolve({
          secure_url: '',
          public_id: '',
          success: false,
          error: error instanceof Error ? error.message : 'Неуспешно качване',
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Липсва параметър id' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: prop, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // row not found
        return NextResponse.json({ error: 'Имотът не е намерен' }, { status: 404 });
      }

      console.error('Error fetching property by id:', error);
      return NextResponse.json(
        { error: 'Неуспешно зареждане на имот', details: error.message },
        { status: 500 },
      );
    }

    if (!prop) {
      return NextResponse.json({ error: 'Имотът не е намерен' }, { status: 404 });
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'[id]/route.ts:132',message:'Property fetched from database',data:{electricity:(prop as any).electricity,water:(prop as any).water,electricityType:typeof (prop as any).electricity,waterType:typeof (prop as any).water,type:prop.type},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-display',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const transformedProperty = {
      id: prop.id as string,
      short_id: prop.short_id as number | undefined,
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type,
      status: prop.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent', // Map sale_or_rent to status for backward compatibility
      city: prop.city || '',
      neighborhood: prop.neighborhood || undefined,
      price: Number(prop.price) || 0,
      currency: '€',
      area: Number(prop.area_sqm) || 0,
      rooms: (prop as any).rooms || undefined,
      bathrooms: (prop as any).bathrooms || undefined,
      subtype: prop.subtype || undefined,
      construction_type: prop.construction_type || undefined,
      completion_degree: prop.completion_degree || undefined,
      building_type: prop.building_type || undefined,
      floor: prop.floor ? String(prop.floor) : undefined,
      total_floors: prop.total_floors ? Number(prop.total_floors) : undefined,
      year_built: prop.build_year || undefined,
      yard_area_sqm: prop.yard_area_sqm ? Number(prop.yard_area_sqm) : undefined,
      electricity: (prop as any).electricity || undefined,
      water: (prop as any).water || undefined,
      hotel_category: (prop as any).hotel_category || undefined,
      agricultural_category: (prop as any).agricultural_category || undefined,
      bed_base: (prop as any).bed_base || undefined,
      works: (prop as any).works || undefined,
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
      created_at: prop.created_at || new Date().toISOString(),
      updated_at: prop.updated_at || new Date().toISOString(),
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'[id]/route.ts:171',message:'Transformed property before sending',data:{electricity:transformedProperty.electricity,water:transformedProperty.water,type:transformedProperty.type},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-display',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(transformedProperty, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/properties/[id]:', error);
    return NextResponse.json(
      {
        error: 'Вътрешна грешка на сървъра',
        details: error instanceof Error ? error.message : 'Неизвестна грешка',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Липсва параметър id' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // First fetch image_public_ids for cleanup
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, image_public_ids')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      if ((fetchError as any)?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Имотът не е намерен' }, { status: 404 });
      }
      console.error('Error fetching property before delete:', fetchError);
      return NextResponse.json(
        { error: 'Failed to delete property', details: (fetchError as any)?.message },
        { status: 500 },
      );
    }

    const imagePublicIds: string[] = Array.isArray((existing as any).image_public_ids)
      ? (existing as any).image_public_ids
      : [];

    const { error: deleteError } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting property by id:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete property', details: deleteError.message },
        { status: 500 },
      );
    }

    // Best-effort cleanup of images
    if (imagePublicIds.length > 0) {
      await deleteMultipleFromCloudinary(imagePublicIds);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/properties/[id]:', error);
    return NextResponse.json(
      {
        error: 'Вътрешна грешка на сървъра',
        details: error instanceof Error ? error.message : 'Неизвестна грешка',
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Липсва параметър id' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // First, fetch the existing property to get current images
    const { data: existingProperty, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProperty) {
      if ((fetchError as any)?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Имотът не е намерен' }, { status: 404 });
      }
      console.error('Error fetching property before update:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch property', details: (fetchError as any)?.message },
        { status: 500 },
      );
    }

    // Parse multipart/form-data
    const formData = await request.formData();

    // Extract text fields
    const textFields: Record<string, string | string[]> = {};
    const featuresArray: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (key === 'images' || key === 'broker_image' || key === 'existing_images') continue;
      
      if (key === 'features') {
        featuresArray.push(value.toString());
      } else {
        textFields[key] = value.toString();
      }
    }

    // Get existing images from form data
    const existingImagesInput = formData.getAll('existing_images');
    const existingImageUrlsFromForm = Array.isArray(existingImagesInput)
      ? existingImagesInput.map((v) => v.toString()).filter(Boolean)
      : [];

    // Get new image files
    const newImageFiles = formData.getAll('images') as File[];
    const brokerImageFile = formData.get('broker_image') as File | null;

    // Validate new images if provided
    for (const file of newImageFiles) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: 'Всички полета за изображения трябва да са валидни файлове' },
          { status: 400 }
        );
      }
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `errors.fileNotImage:${file.name}` },
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
          { error: 'Снимката на брокера трябва да е валиден файл' },
          { status: 400 }
        );
      }
      if (!brokerImageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'errors.brokerImageNotImage' },
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

    // Get existing images from database
    const currentImageUrls: string[] = (existingProperty.image_urls || []) as string[];
    const currentImagePublicIds: string[] = (existingProperty.image_public_ids || []) as string[];

    // Use existing images from form if provided, otherwise keep current database images
    const finalExistingImageUrls = existingImageUrlsFromForm.length > 0
      ? existingImageUrlsFromForm
      : currentImageUrls;
    const finalExistingImagePublicIds = existingImageUrlsFromForm.length > 0
      ? currentImagePublicIds.slice(0, existingImageUrlsFromForm.length)
      : currentImagePublicIds;

    // Upload new images if any
    let newImageUrls: string[] = [];
    let newImagePublicIds: string[] = [];

    if (newImageFiles.length > 0) {
      const semaphore = { count: 0, queue: [] as Array<() => void> };
      const uploadPromises = newImageFiles.map((file) =>
        uploadImageWithLimit(file, 'properties', semaphore)
      );

      const uploadResults = await Promise.allSettled(uploadPromises);

      const successfulUploads: UploadResult[] = [];
      const failedUploads: UploadResult[] = [];

      uploadResults.forEach((result) => {
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
            error: result.reason?.message || 'Неуспешно качване',
          });
        }
      });

      if (failedUploads.length > 0 && successfulUploads.length === 0) {
        return NextResponse.json(
          {
            error: 'Всички качвания на изображения не са успешни',
            details: failedUploads.map((f) => f.error).filter(Boolean),
          },
          { status: 500 }
        );
      }

      newImageUrls = successfulUploads.map((u) => u.secure_url);
      newImagePublicIds = successfulUploads.map((u) => u.public_id);
    }

    // Combine existing and new images
    const allImageUrls = [...finalExistingImageUrls, ...newImageUrls];
    const allImagePublicIds = [...finalExistingImagePublicIds, ...newImagePublicIds];

    // Check if we have at least one image
    if (allImageUrls.length === 0) {
      // Cleanup newly uploaded images if any
      if (newImagePublicIds.length > 0) {
        await deleteMultipleFromCloudinary(newImagePublicIds);
      }
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Upload broker image if provided
    let brokerImageUrl: string | null = existingProperty.broker_image || null;
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

    // Prepare data for validation (only validate if there are new images)
    if (newImageFiles.length > 0) {
      const validationData: any = {
        ...textFields,
        features: featuresArray.length > 0 ? featuresArray : undefined,
        images: newImageFiles,
      };

      const validationResult = createPropertySchema.safeParse(validationData);
      
      if (!validationResult.success) {
        // Cleanup newly uploaded images
        if (newImagePublicIds.length > 0) {
          await deleteMultipleFromCloudinary(newImagePublicIds);
        }
        if (brokerImagePublicId) {
          await deleteMultipleFromCloudinary([brokerImagePublicId]);
        }
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }
    }

    // Calculate price_per_sqm if not provided
    const price = Number(textFields.price) || Number(existingProperty.price);
    const area = Number(textFields.area_sqm) || Number(existingProperty.area_sqm);
    const pricePerSqm = textFields.price_per_sqm
      ? Number(textFields.price_per_sqm)
      : area > 0 ? price / area : 0;

    // LANGUAGE-AGNOSTIC: Normalize subtype to English ID before updating database
    // Handles subtypes in any language (Bulgarian, Russian, English, German) and converts to English IDs
    // Admin forms send English IDs (from option.id), but we normalize for safety and backward compatibility
    // This ensures database always stores English IDs regardless of UI language or input format
    // Note: normalizeSubtypeToId only works for apartment subtypes. For other types (house, villa, etc.),
    // the subtype is already an English ID and should be passed through as-is.
    const subtypeValue = textFields.subtype || existingProperty.subtype;
    const propertyType = textFields.type || existingProperty.type;
    const normalizedSubtype = subtypeValue 
      ? (propertyType === 'apartment' ? normalizeSubtypeToId(subtypeValue) : subtypeValue)
      : null;

    // Prepare update payload
    const updatePayload: any = {
      sale_or_rent: textFields.sale_or_rent || existingProperty.sale_or_rent,
      type: textFields.type || existingProperty.type,
      subtype: normalizedSubtype,
      area_sqm: area,
      price: price,
      price_per_sqm: pricePerSqm,
      // Floor: if provided and not empty, use it; if empty string, clear it (set to null); otherwise keep existing
      floor: textFields.floor !== undefined 
        ? (textFields.floor === '' ? null : String(textFields.floor))
        : (existingProperty.floor || null),
      total_floors: textFields.total_floors ? Number(textFields.total_floors) : existingProperty.total_floors || null,
      city: textFields.city || existingProperty.city,
      neighborhood: textFields.neighborhood || existingProperty.neighborhood || null,
      title: textFields.title || existingProperty.title,
      description: textFields.description || existingProperty.description,
      build_year: textFields.build_year ? Number(textFields.build_year) : existingProperty.build_year || null,
      construction_type: textFields.construction_type || existingProperty.construction_type || null,
      completion_degree: textFields.completion_degree || existingProperty.completion_degree || null,
      furniture: textFields.furniture || existingProperty.furniture || null,
      features: featuresArray.length > 0 ? featuresArray : existingProperty.features || [],
      broker_name: textFields.broker_name || existingProperty.broker_name || null,
      broker_position: textFields.broker_position || existingProperty.broker_position || null,
      broker_phone: textFields.broker_phone || existingProperty.broker_phone || null,
      broker_image: brokerImageUrl,
      image_urls: allImageUrls,
      image_public_ids: allImagePublicIds,
      updated_at: new Date().toISOString(),
    };

    // Add additional property-specific fields
    // Map yard_area from form to yard_area_sqm in database
    if (textFields.yard_area !== undefined) {
      if (textFields.yard_area !== '' && textFields.yard_area !== null) {
        const yardAreaValue = Number(textFields.yard_area);
        if (!isNaN(yardAreaValue) && yardAreaValue > 0) {
          updatePayload.yard_area_sqm = yardAreaValue;
        } else {
          updatePayload.yard_area_sqm = null;
        }
      } else {
        // Empty string means clear the value
        updatePayload.yard_area_sqm = null;
      }
    } else if (existingProperty.yard_area_sqm !== undefined && existingProperty.yard_area_sqm !== null) {
      // If yard_area is not in textFields, keep existing value (don't modify)
      updatePayload.yard_area_sqm = existingProperty.yard_area_sqm;
    }
    if (textFields.hotel_category) {
      updatePayload.hotel_category = textFields.hotel_category;
    } else if (existingProperty.hotel_category) {
      updatePayload.hotel_category = existingProperty.hotel_category;
    }
    if (textFields.agricultural_category) {
      updatePayload.agricultural_category = textFields.agricultural_category;
    } else if (existingProperty.agricultural_category) {
      updatePayload.agricultural_category = existingProperty.agricultural_category;
    }
    if (textFields.electricity) {
      updatePayload.electricity = textFields.electricity;
    } else if (existingProperty.electricity) {
      updatePayload.electricity = existingProperty.electricity;
    }
    if (textFields.water) {
      updatePayload.water = textFields.water;
    } else if (existingProperty.water) {
      updatePayload.water = existingProperty.water;
    }
    if (textFields.bed_base !== undefined) {
      updatePayload.bed_base = Number(textFields.bed_base);
    } else if (existingProperty.bed_base !== undefined) {
      updatePayload.bed_base = existingProperty.bed_base;
    }

    // Ensure we never include yard_area (wrong column name) - only yard_area_sqm
    // Also handle case where existingProperty might have yard_area (old column name)
    if ('yard_area' in updatePayload) {
      delete updatePayload.yard_area;
    }
    // If existingProperty has yard_area (old column), use it to set yard_area_sqm if not already set
    if (existingProperty.yard_area && !updatePayload.yard_area_sqm && textFields.yard_area === undefined) {
      updatePayload.yard_area_sqm = Number(existingProperty.yard_area) || null;
    }

    // Update in Supabase
    const { data: updatedProperty, error: updateError } = await supabaseAdmin
      .from('properties')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    // If update fails, cleanup newly uploaded images
    if (updateError || !updatedProperty) {
      console.error('Supabase update error:', updateError);
      console.error('Update payload:', JSON.stringify(updatePayload, null, 2));
      console.error('Text fields:', textFields);
      
      // Cleanup newly uploaded images (not existing ones)
      if (newImagePublicIds.length > 0) {
        await deleteMultipleFromCloudinary(newImagePublicIds);
      }
      if (brokerImagePublicId) {
        await deleteMultipleFromCloudinary([brokerImagePublicId]);
      }

      const errorMessage = updateError?.message || updateError?.details || 'Unknown error';
      return NextResponse.json(
        {
          error: 'Failed to update property',
          details: errorMessage,
          supabaseError: updateError,
        },
        { status: 500 }
      );
    }

    // Transform the updated property to match Property interface
    const transformedProperty = {
      id: updatedProperty.id as string,
      short_id: updatedProperty.short_id as number | undefined,
      title: updatedProperty.title || '',
      description: updatedProperty.description || '',
      type: updatedProperty.type,
      status: updatedProperty.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent', // Map sale_or_rent to status for backward compatibility
      city: updatedProperty.city || '',
      neighborhood: updatedProperty.neighborhood || undefined,
      price: Number(updatedProperty.price) || 0,
      currency: '€',
      area: Number(updatedProperty.area_sqm) || 0,
      rooms: (updatedProperty as any).rooms || undefined,
      bathrooms: (updatedProperty as any).bathrooms || undefined,
      subtype: updatedProperty.subtype || undefined,
      construction_type: updatedProperty.construction_type || undefined,
      completion_degree: updatedProperty.completion_degree || undefined,
      floor: updatedProperty.floor ? String(updatedProperty.floor) : undefined,
      total_floors: updatedProperty.total_floors ? Number(updatedProperty.total_floors) : undefined,
      year_built: updatedProperty.build_year || undefined,
      images: ((updatedProperty.image_urls || []) as string[]).map((url: string, index: number) => ({
        id: `${updatedProperty.id}-img-${index}`,
        url,
        public_id: ((updatedProperty.image_public_ids || []) as string[])[index] || '',
        width: 0,
        height: 0,
        is_primary: index === 0,
      })),
      features: updatedProperty.features || [],
      furniture: (updatedProperty as any).furniture || undefined,
      hotel_category: (updatedProperty as any).hotel_category || undefined,
      agricultural_category: (updatedProperty as any).agricultural_category || undefined,
      bed_base: (updatedProperty as any).bed_base || undefined,
      works: (updatedProperty as any).works || undefined,
      broker_name: updatedProperty.broker_name || undefined,
      broker_phone: updatedProperty.broker_phone || undefined,
      broker_position: updatedProperty.broker_position || undefined,
      broker_image: updatedProperty.broker_image || undefined,
      view_count: 0,
      created_at: updatedProperty.created_at || new Date().toISOString(),
      updated_at: updatedProperty.updated_at || new Date().toISOString(),
    };

    return NextResponse.json(transformedProperty, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PUT /api/properties/[id]:', error);
    return NextResponse.json(
      {
        error: 'Вътрешна грешка на сървъра',
        details: error instanceof Error ? error.message : 'Неизвестна грешка',
      },
      { status: 500 },
    );
  }
}
