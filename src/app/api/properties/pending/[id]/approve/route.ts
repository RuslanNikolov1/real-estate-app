import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

// Vercel serverless function configuration
export const runtime = 'nodejs';
export const maxDuration = 30;

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

// POST /api/properties/pending/[id]/approve - Approve pending property (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

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

    // Fetch pending property from database
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: pendingProperty, error: fetchError } = await supabaseAdmin
      .from('pending_properties')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !pendingProperty) {
      return NextResponse.json(
        { error: 'Pending property not found' },
        { status: 404 }
      );
    }

    // Handle area_sqm NULL case: set default value of 0 when null
    const areaSqm = pendingProperty.area_sqm !== null && pendingProperty.area_sqm !== undefined
      ? pendingProperty.area_sqm
      : 0;

    // Calculate price_per_sqm if not provided and area_sqm is available
    const pricePerSqm = pendingProperty.price_per_sqm
      ? pendingProperty.price_per_sqm
      : areaSqm > 0
      ? Number(pendingProperty.price) / areaSqm
      : null;

    // Map all fields from pending_properties to properties table format
    const propertyPayload = {
      sale_or_rent: pendingProperty.sale_or_rent,
      type: pendingProperty.type,
      subtype: pendingProperty.subtype || null,
      area_sqm: areaSqm, // Use defaulted value (0 if null)
      price: pendingProperty.price,
      price_per_sqm: pricePerSqm,
      floor: pendingProperty.floor || null,
      total_floors: pendingProperty.total_floors || null,
      yard_area_sqm: pendingProperty.yard_area_sqm || null,
      city: pendingProperty.city,
      neighborhood: pendingProperty.neighborhood || null,
      title: pendingProperty.title,
      description: pendingProperty.description,
      build_year: pendingProperty.build_year || null,
      construction_type: pendingProperty.construction_type || null,
      completion_degree: pendingProperty.completion_degree || null,
      furniture: pendingProperty.furniture || null,
      features: pendingProperty.features || [],
      hotel_category: pendingProperty.hotel_category || null,
      agricultural_category: pendingProperty.agricultural_category || null,
      bed_base: pendingProperty.bed_base || null,
      works: pendingProperty.works || null,
      building_type: pendingProperty.building_type || null,
      broker_name: pendingProperty.broker_name,
      broker_position: pendingProperty.broker_position || null,
      broker_phone: pendingProperty.broker_phone,
      broker_image: pendingProperty.broker_image || null,
      image_urls: pendingProperty.image_urls || [],
      image_public_ids: pendingProperty.image_public_ids || [],
    };

    // Insert into properties table (new IDs will be auto-generated)
    const { data: approvedProperty, error: insertError } = await supabaseAdmin
      .from('properties')
      .insert(propertyPayload)
      .select()
      .single();

    if (insertError || !approvedProperty) {
      console.error('Error inserting approved property:', insertError);
      return NextResponse.json(
        {
          error: 'Failed to approve property',
          details: insertError?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Delete from pending_properties table
    const { error: deleteError } = await supabaseAdmin
      .from('pending_properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting pending property after approval:', deleteError);
      // Property was already inserted, so we log the error but don't fail the request
      // In a production system, you might want to handle this with a transaction or rollback
    }

    // Transform the approved property to match Property interface
    const transformedProperty = {
      id: approvedProperty.id as string,
      short_id: approvedProperty.short_id as number | undefined,
      title: approvedProperty.title || '',
      description: approvedProperty.description || '',
      type: approvedProperty.type,
      status: approvedProperty.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent',
      city: approvedProperty.city || '',
      neighborhood: approvedProperty.neighborhood || undefined,
      price: Number(approvedProperty.price) || 0,
      currency: '€',
      area: Number(approvedProperty.area_sqm) || 0,
      rooms: approvedProperty.rooms || undefined,
      bathrooms: approvedProperty.bathrooms || undefined,
      subtype: approvedProperty.subtype || undefined,
      construction_type: approvedProperty.construction_type || undefined,
      completion_degree: approvedProperty.completion_degree || undefined,
      building_type: approvedProperty.building_type || undefined,
      floor: approvedProperty.floor ? String(approvedProperty.floor) : undefined,
      total_floors: approvedProperty.total_floors ? Number(approvedProperty.total_floors) : undefined,
      year_built: approvedProperty.build_year || undefined,
      yard_area_sqm: approvedProperty.yard_area_sqm ? Number(approvedProperty.yard_area_sqm) : undefined,
      electricity: approvedProperty.electricity || undefined,
      water: approvedProperty.water || undefined,
      hotel_category: approvedProperty.hotel_category || undefined,
      agricultural_category: approvedProperty.agricultural_category || undefined,
      bed_base: approvedProperty.bed_base || undefined,
      works: approvedProperty.works || undefined,
      furniture: approvedProperty.furniture || undefined,
      images: (approvedProperty.image_urls || []).map((url: string, index: number) => ({
        id: `${approvedProperty.id}-img-${index}`,
        url,
        public_id: approvedProperty.image_public_ids?.[index] || '',
        width: 0,
        height: 0,
        is_primary: index === 0,
      })),
      features: approvedProperty.features || [],
      broker_name: approvedProperty.broker_name || undefined,
      broker_phone: approvedProperty.broker_phone || undefined,
      broker_position: approvedProperty.broker_position || undefined,
      broker_image: approvedProperty.broker_image || undefined,
      view_count: 0,
      created_at: approvedProperty.created_at || new Date().toISOString(),
      updated_at: approvedProperty.updated_at || new Date().toISOString(),
    };

    return NextResponse.json(transformedProperty, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/properties/pending/[id]/approve:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
