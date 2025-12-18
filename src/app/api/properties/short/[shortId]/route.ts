import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> },
) {
  try {
    const { shortId } = await params;

    if (!shortId) {
      return NextResponse.json({ error: 'Missing shortId parameter' }, { status: 400 });
    }

    const numericShortId = Number(shortId);
    if (!Number.isInteger(numericShortId) || numericShortId <= 0) {
      return NextResponse.json({ error: 'Invalid shortId parameter' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: prop, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('short_id', numericShortId)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        // row not found
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      console.error('Error fetching property by short_id:', error);
      return NextResponse.json(
        { error: 'Failed to fetch property', details: (error as any).message },
        { status: 500 },
      );
    }

    if (!prop) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'short/[shortId]/route.ts:47',message:'Property fetched from database',data:{electricity:(prop as any).electricity,water:(prop as any).water,electricityType:typeof (prop as any).electricity,waterType:typeof (prop as any).water,type:prop.type},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-display',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    const transformedProperty = {
      id: prop.id as string,
      short_id: prop.short_id as number,
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
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'short/[shortId]/route.ts:87',message:'Transformed property before sending',data:{electricity:transformedProperty.electricity,water:transformedProperty.water,type:transformedProperty.type},timestamp:Date.now(),sessionId:'debug-session',runId:'electricity-water-display',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(transformedProperty, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/properties/short/[shortId]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}


