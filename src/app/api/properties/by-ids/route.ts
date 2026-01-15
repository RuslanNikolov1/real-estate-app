import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-ids/route.ts:9',message:'API route called',data:{idsCount:ids?.length||0,ids:ids||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    // Validate input
    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Invalid input: ids must be an array' },
        { status: 400 }
      );
    }
    
    // Return empty array if no IDs provided
    if (ids.length === 0) {
      return NextResponse.json({ properties: [] });
    }
    
    const supabase = getSupabaseAdminClient();
    
    // Separate UUIDs from numeric IDs (short_id)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidIds: string[] = [];
    const numericIds: number[] = [];
    
    for (const id of ids) {
      if (uuidPattern.test(id)) {
        uuidIds.push(id);
      } else {
        const numId = Number(id);
        if (!isNaN(numId) && numId > 0) {
          numericIds.push(numId);
        }
      }
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-ids/route.ts:40',message:'ID separation result',data:{uuidIdsCount:uuidIds.length,uuidIds,numericIdsCount:numericIds.length,numericIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    // Fetch properties by UUIDs and short_ids separately
    const queries: Promise<any>[] = [];
    
    if (uuidIds.length > 0) {
      queries.push(
        supabase
          .from('properties')
          .select('*')
          .in('id', uuidIds)
      );
    }
    
    if (numericIds.length > 0) {
      queries.push(
        supabase
          .from('properties')
          .select('*')
          .in('short_id', numericIds)
      );
    }
    
    const results = await Promise.all(queries);
    
    // Combine results and remove duplicates
    const allProperties: any[] = [];
    const seenIds = new Set<string>();
    
    for (const result of results) {
      if (result.error) {
        console.error('Error fetching properties:', result.error);
        continue;
      }
      
      if (result.data) {
        for (const prop of result.data) {
          // Use both id and short_id to deduplicate
          const key = `${prop.id}-${prop.short_id}`;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            allProperties.push(prop);
          }
        }
      }
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-ids/route.ts:87',message:'Properties fetched from DB',data:{allPropertiesCount:allProperties.length,propertyIds:allProperties.map((p:any)=>p.id),propertyShortIds:allProperties.map((p:any)=>p.short_id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    if (allProperties.length === 0) {
      return NextResponse.json({ properties: [] });
    }
    
    // Transform data to match Property interface (same pattern as short route)
    const properties = allProperties.map((prop: any) => ({
      id: prop.id as string,
      short_id: prop.short_id as number,
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type,
      status: prop.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent',
      city: prop.city || '',
      neighborhood: prop.neighborhood || undefined,
      price: Number(prop.price) || 0,
      currency: '€',
      area: Number(prop.area_sqm) || 0,
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
      images: (prop.image_urls || []).map((url: string, index: number) => ({
        id: `${prop.id}-img-${index}`,
        url,
        public_id: prop.image_public_ids?.[index] || '',
        width: 0,
        height: 0,
        is_primary: index === 0,
      })),
      features: prop.features || [],
      furniture: prop.furniture || undefined,
      broker_name: prop.broker_name || undefined,
      broker_phone: prop.broker_phone || undefined,
      broker_position: prop.broker_position || undefined,
      broker_image: prop.broker_image || undefined,
      view_count: 0,
      created_at: prop.created_at || new Date().toISOString(),
      updated_at: prop.updated_at || new Date().toISOString(),
    }));
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-ids/route.ts:141',message:'API route returning',data:{propertiesCount:properties.length,transformedPropertyIds:properties.map((p:any)=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error in by-ids route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
