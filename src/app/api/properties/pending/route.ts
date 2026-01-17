import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { uploadBufferToCloudinary, deleteMultipleFromCloudinary } from '@/lib/cloudinary-server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createPropertySchema } from '@/lib/validations/property-create';
import { normalizeSubtypeToId } from '@/lib/subtype-mapper';
import { sendEmail } from '@/lib/email';

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

// Helper to create Supabase server client for auth
async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// GET /api/properties/pending - Fetch pending properties (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.email !== 'ruslannikolov1@gmail.com') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all pending properties using admin client (bypasses RLS)
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: pendingProperties, error: fetchError } = await supabaseAdmin
      .from('pending_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching pending properties:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending properties' },
        { status: 500 }
      );
    }

    // Transform database properties to match Property interface
    const transformedProperties = (pendingProperties || []).map((prop: any) => ({
      id: prop.id,
      short_id: prop.short_id ?? undefined,
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type,
      status: prop.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent',
      city: prop.city || '',
      neighborhood: prop.neighborhood || undefined,
      price: Number(prop.price) || 0,
      currency: '€',
      area: Number(prop.area_sqm) || 0, // Handle NULL by defaulting to 0
      rooms: prop.rooms || undefined,
      bathrooms: prop.bathrooms || undefined,
      subtype: prop.subtype || undefined,
      construction_type: prop.construction_type || undefined,
      completion_degree: prop.completion_degree || undefined,
      building_type: prop.building_type || undefined,
      floor: prop.floor ? String(prop.floor) : undefined,
      total_floors: prop.total_floors ? Number(prop.total_floors) : undefined,
      year_built: prop.build_year || undefined,
      yard_area_sqm: prop.yard_area_sqm ? Number(prop.yard_area_sqm) : undefined,
      electricity: prop.electricity || undefined,
      water: prop.water || undefined,
      hotel_category: prop.hotel_category || undefined,
      agricultural_category: prop.agricultural_category || undefined,
      bed_base: prop.bed_base || undefined,
      works: prop.works || undefined,
      furniture: prop.furniture || undefined,
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
    }));

    return NextResponse.json(transformedProperties);
  } catch (error) {
    console.error('Unexpected error in GET /api/properties/pending:', error);
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
    // Parse JSON payload (images already uploaded to Cloudinary from client)
    const body = await request.json();

    // Validate that image URLs are provided
    if (!body.image_urls || !Array.isArray(body.image_urls) || body.image_urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Validate that public_ids match URLs
    if (body.image_public_ids && body.image_public_ids.length !== body.image_urls.length) {
      return NextResponse.json(
        { error: 'Image URLs and public IDs must match' },
        { status: 400 }
      );
    }

    // Prepare data for Zod validation
    const validationData: any = {
      ...body,
      images: body.image_urls, // Pass URLs for validation
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

    // Images are already uploaded to Cloudinary, use provided URLs and public_ids
    const imageUrls = body.image_urls as string[];
    const uploadedPublicIds = (body.image_public_ids as string[]) || imageUrls.map(() => '');
    // Broker image is already uploaded to Cloudinary from client
    const brokerImageUrl = body.broker_image || null;
    const brokerImagePublicId = body.broker_image_public_id || null;

    // Calculate price_per_sqm if not provided
    // For rent hotels, area_sqm may be undefined, so we can't calculate price_per_sqm
    const pricePerSqm = validatedData.price_per_sqm
      ? validatedData.price_per_sqm
      : validatedData.area_sqm
      ? validatedData.price / validatedData.area_sqm
      : null;

    // LANGUAGE-AGNOSTIC: Normalize subtype to English ID before saving to database
    // Handles subtypes in any language (Bulgarian, Russian, English, German) and converts to English IDs
    // Admin forms send English IDs (from option.id), but we normalize for safety and backward compatibility
    // This ensures database always stores English IDs regardless of UI language or input format
    // Note: normalizeSubtypeToId only works for apartment subtypes. For other types (house, villa, etc.),
    // the subtype is already an English ID and should be passed through as-is.
    const normalizedSubtype = validatedData.subtype 
      ? (validatedData.type === 'apartment' ? normalizeSubtypeToId(validatedData.subtype) : validatedData.subtype)
      : null;

    // Prepare payload for Supabase
    // Map yard_area from form to yard_area_sqm in database
    const payload = {
      sale_or_rent: validatedData.sale_or_rent,
      type: validatedData.type,
      subtype: normalizedSubtype,
      area_sqm: validatedData.area_sqm || null,
      price: validatedData.price,
      price_per_sqm: pricePerSqm || null,
      floor: validatedData.floor || null,
      total_floors: validatedData.total_floors || null,
      yard_area_sqm: validatedData.yard_area || null,
      city: validatedData.city,
      neighborhood: validatedData.neighborhood,
      title: validatedData.title,
      description: validatedData.description,
      build_year: validatedData.build_year || null,
      construction_type: validatedData.construction_type || null,
      completion_degree: validatedData.completion_degree || null,
      furniture: validatedData.furniture || null,
      features: validatedData.features || [],
      hotel_category: validatedData.hotel_category || null,
      agricultural_category: validatedData.agricultural_category || null,
      bed_base: validatedData.bed_base !== undefined && !isNaN(validatedData.bed_base) ? validatedData.bed_base : null,
      works: validatedData.works || null,
      building_type: (validatedData as any).building_type || null,
      broker_name: validatedData.broker_name,
      broker_position: validatedData.broker_position || null,
      broker_phone: validatedData.broker_phone,
      broker_image: brokerImageUrl,
      image_urls: imageUrls,
      image_public_ids: uploadedPublicIds,
    };

    // Insert into pending_properties table
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: insertedProperty, error: insertError } = await supabaseAdmin
      .from('pending_properties')
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
          error: 'Failed to create pending property',
          details: insertError?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Send email notification to broker (don't block response if email fails)
    try {
      const brokerEmail = process.env.BROKER_EMAIL || 'ruslannikolov1@gmail.com';

      // Create email content (Bulgarian)
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              h2 { color: #e10600; border-bottom: 2px solid #e10600; padding-bottom: 10px; }
              .message { margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Заявка за одобряване на имот публикуван от клиент</h2>
              <div class="message">
                <p>Нова заявка за одобряване на имот е получена и изисква ваше внимание.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const emailText = `Заявка за одобряване на имот публикуван от клиент

Нова заявка за одобряване на имот е получена и изисква ваше внимание.`;

      // Send email via Mailtrap (don't throw error if it fails)
      const emailResult = await sendEmail({
        to: brokerEmail,
        subject: 'Заявка за одобряване на имот публикуван от клиент',
        text: emailText,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error('Failed to send property approval email:', emailResult.error);
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Error sending property approval email:', emailError);
    }

    // Return success with inserted property
    return NextResponse.json(insertedProperty, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/properties/pending:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
