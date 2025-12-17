import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToCloudinary, deleteMultipleFromCloudinary } from '@/lib/cloudinary-server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { createPropertySchema } from '@/lib/validations/property-create';
import { normalizeSubtypeToId, getSubtypeSearchValues } from '@/lib/subtype-mapper';

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
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    // Check if filters are provided
    const filtersParam = searchParams.get('filters');
    let filters: any = null;
    if (filtersParam) {
      try {
        filters = JSON.parse(decodeURIComponent(filtersParam));
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:113',message:'API received filters',data:{filtersParam,filters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
      } catch (e) {
        console.error('Error parsing filters:', e);
      }
    }

    // Build query
    let query = supabaseAdmin.from('properties').select('*');
    
    // #region agent log
    const baseRoute = searchParams.get('baseRoute');
    const propertyTypeId = searchParams.get('propertyTypeId');
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:120',message:'Query initialization',data:{baseRoute,propertyTypeId,hasFilters:!!filters},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion

    // Apply filters if provided
    if (filters) {
      // Property ID filter (short_id)
      if (filters.propertyId && filters.propertyId.trim()) {
        query = query.eq('short_id', filters.propertyId.trim());
      }
      
      // Status filter (for-sale/for-rent)
      if (filters.city) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:131',message:'Applying city filter',data:{city:filters.city,type:typeof filters.city},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        // Check what city values actually exist in database (case-insensitive check)
        // #region agent log
        const cityCheckQuery = supabaseAdmin.from('properties').select('city, neighborhood').ilike('city', `%${filters.city}%`).limit(10);
        cityCheckQuery.then(({ data: cityCheckData }) => {
          fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:138',message:'Database city values check (case-insensitive)',data:{requestedCity:filters.city,foundCities:cityCheckData?.map((p:any) => ({city:p.city,neighborhood:p.neighborhood})) || []},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        }).catch(() => {});
        // #endregion
        
        query = query.eq('city', filters.city);
      }
      
      if (filters.neighborhoods && Array.isArray(filters.neighborhoods) && filters.neighborhoods.length > 0) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:150',message:'Applying neighborhood filter',data:{neighborhoods:filters.neighborhoods,city:filters.city,count:filters.neighborhoods.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        
        // Check what neighborhood values actually exist in database for this city
        // #region agent log
        if (filters.city) {
          const neighborhoodCheckQuery = supabaseAdmin.from('properties').select('city, neighborhood').eq('city', filters.city).limit(20);
          neighborhoodCheckQuery.then(({ data: neighborhoodCheckData }) => {
            fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:157',message:'Database neighborhood values for city',data:{requestedCity:filters.city,requestedNeighborhoods:filters.neighborhoods,foundNeighborhoods:neighborhoodCheckData?.map((p:any) => p.neighborhood).filter(Boolean) || [],allProperties:neighborhoodCheckData?.map((p:any) => ({city:p.city,neighborhood:p.neighborhood})) || []},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
          }).catch(() => {});
        }
        // #endregion
        
        query = query.in('neighborhood', filters.neighborhoods);
      }
      
      // Property type filter - map filter types to database types
      const typeMapping: Record<string, string[]> = {
        'apartments': ['apartment'],
        'houses-villas': ['house', 'villa'],
        'stores-offices': ['office', 'shop'],
        'building-plots': ['land'],
        'agricultural-land': ['agricultural'],
        'warehouses-industrial': ['warehouse'],
        'garages-parking': ['garage'],
        'hotels-motels': ['hotel'],
        'restaurants': ['restaurant'],
        'replace-real-estates': ['replace-real-estates'],
        'buy-real-estates': ['buy-real-estates'],
        'other-real-estates': ['other-real-estates'],
      };
      
      // Determine property types from baseRoute or filters
      if (propertyTypeId && typeMapping[propertyTypeId]) {
        query = query.in('type', typeMapping[propertyTypeId]);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:188',message:'Applied property type filter',data:{propertyTypeId,types:typeMapping[propertyTypeId]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      }
      
      // Also support direct type filter from filters object
      if (filters.type && typeof filters.type === 'string') {
        query = query.eq('type', filters.type);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:193',message:'Applied direct type filter',data:{type:filters.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      }
      
      // Support types array filter
      if (filters.types && Array.isArray(filters.types) && filters.types.length > 0) {
        query = query.in('type', filters.types);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:198',message:'Applied types array filter',data:{types:filters.types},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      }
      
      // Sale/Rent filter based on baseRoute (using sale_or_rent instead of status)
      if (baseRoute === '/sale/search') {
        query = query.eq('sale_or_rent', 'sale');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:203',message:'Applied sale filter',data:{baseRoute,sale_or_rent:'sale'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      } else if (baseRoute === '/rent/search') {
        query = query.eq('sale_or_rent', 'rent');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:205',message:'Applied rent filter',data:{baseRoute,sale_or_rent:'rent'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      }
      
      // Check what sale_or_rent value the property actually has
      // #region agent log
      if (filters.city && filters.neighborhoods) {
        const propertyCheckQuery = supabaseAdmin.from('properties').select('city, neighborhood, sale_or_rent, type').eq('city', filters.city).in('neighborhood', filters.neighborhoods).limit(5);
        propertyCheckQuery.then(({ data: propertyCheckData }) => {
          fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:212',message:'Property sale_or_rent check',data:{requestedCity:filters.city,requestedNeighborhoods:filters.neighborhoods,baseRoute,properties:propertyCheckData?.map((p:any) => ({city:p.city,neighborhood:p.neighborhood,sale_or_rent:p.sale_or_rent,type:p.type})) || []},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
        }).catch(() => {});
      }
      // #endregion
      
      // Area filters - only apply if explicitly set (not 0, null, or undefined)
      if (filters.areaFrom !== undefined && filters.areaFrom !== null && filters.areaFrom > 0) {
        query = query.gte('area_sqm', filters.areaFrom);
      }
      if (filters.areaTo !== undefined && filters.areaTo !== null && filters.areaTo > 0) {
        query = query.lte('area_sqm', filters.areaTo);
      }
      
      // Price filters - only apply if explicitly set (not 0, null, or undefined)
      if (filters.priceFrom !== undefined && filters.priceFrom !== null && filters.priceFrom > 0) {
        query = query.gte('price', filters.priceFrom);
      }
      if (filters.priceTo !== undefined && filters.priceTo !== null && filters.priceTo > 0) {
        query = query.lte('price', filters.priceTo);
      }
      
      // Price per sqm filters - only apply if explicitly set (not 0, null, or undefined)
      if (filters.pricePerSqmFrom !== undefined && filters.pricePerSqmFrom !== null && filters.pricePerSqmFrom > 0) {
        query = query.gte('price_per_sqm', filters.pricePerSqmFrom);
      }
      if (filters.pricePerSqmTo !== undefined && filters.pricePerSqmTo !== null && filters.pricePerSqmTo > 0) {
        query = query.lte('price_per_sqm', filters.pricePerSqmTo);
      }
      
      // Subtype filter (for apartments only)
      // LANGUAGE-AGNOSTIC: Filter always receives English IDs (e.g., 'one-bedroom', 'studio')
      // regardless of the site's UI language. This ensures consistent database queries.
      // 
      // Ensure apartmentSubtypes filter ONLY applies to apartment type properties
      // Filter apartments by subtype - exclude "all" from the filter
      // Handle both IDs (from filters) and labels (possibly stored in database for backward compatibility)
      if (filters.apartmentSubtypes && Array.isArray(filters.apartmentSubtypes) && filters.apartmentSubtypes.length > 0) {
        // Filter out "all" option and any empty values
        const validSubtypes = filters.apartmentSubtypes.filter(
          (subtype: string) => subtype && subtype !== 'all'
        );
        
        // Only apply filter if we have valid subtypes (not just "all" selected)
        if (validSubtypes.length > 0) {
          // Ensure we only filter apartment types when using apartment subtypes
          // This prevents subtype filters from accidentally matching other property types
          // Database stores type as 'apartment' (singular), filter UI uses 'apartments' (plural)
          // Type filter is already applied at line 154 if propertyTypeId === 'apartments'
          // Only apply type filter if propertyTypeId is not set or is not 'apartments'
          if (!propertyTypeId || propertyTypeId !== 'apartments') {
            query = query.in('type', ['apartment']);
          }
          
          // Normalize all subtype IDs first to ensure consistency
          // Even though filters send English IDs, normalize for safety and to handle edge cases
          const normalizedSubtypes = validSubtypes
            .map((subtype: string) => normalizeSubtypeToId(subtype))
            .filter((id: string | null): id is string => id !== null && id !== 'all');
          
          if (normalizedSubtypes.length > 0) {
            // Get all possible search values (both English IDs and Bulgarian labels) for each normalized subtype
            // This handles cases where database might have labels instead of IDs (for backward compatibility)
            // The filter ALWAYS sends English IDs like 'one-bedroom', 'two-bedroom', 'studio', etc.
            // We also search for Bulgarian labels to find old data that might have been stored with labels
            const searchValues = new Set<string>();
            
            normalizedSubtypes.forEach((normalizedId: string) => {
              // normalizedId is always an English ID (e.g., 'one-bedroom', 'studio', 'two-bedroom', 'multi-bedroom', etc.)
              // Use helper function to get both English ID and Bulgarian label for database matching
              // This ensures we find properties stored with either format
              const values = getSubtypeSearchValues(normalizedId);
              values.forEach(value => searchValues.add(value));
            });
            
            // Use OR query to match either ID or label
            // This will match properties where:
            // - subtype = 'studio' OR subtype = 'Едностаен'
            // - subtype = 'one-bedroom' OR subtype = 'Двустаен'
            // - subtype = 'two-bedroom' OR subtype = 'Тристаен'
            // - etc. for all subtypes
            // Combined with type = 'apartment' filter, this ensures we only get apartment properties
            // Works regardless of site language because IDs are always English
            const finalSearchValues = Array.from(searchValues);
            
            // Debug logging to help diagnose filtering issues
            console.log('Subtype filter debug:', {
              inputSubtypes: validSubtypes,
              normalizedSubtypes,
              searchValues: finalSearchValues,
              propertyTypeId,
              baseRoute,
            });
            
            if (finalSearchValues.length > 0) {
              query = query.in('subtype', finalSearchValues);
            } else {
              console.warn('No valid search values for subtype filter after normalization');
            }
          }
        }
        // If "all" is selected or only "all" is in the array, don't filter by subtype
      }
      
      // House types filter - same logic
      if (filters.houseTypes && Array.isArray(filters.houseTypes) && filters.houseTypes.length > 0) {
        const validHouseTypes = filters.houseTypes.filter(
          (houseType: string) => houseType && houseType !== 'all'
        );
        
        if (validHouseTypes.length > 0) {
          query = query.in('subtype', validHouseTypes);
        }
      }
      
      // Construction type
      if (filters.selectedConstructionTypes && Array.isArray(filters.selectedConstructionTypes) && filters.selectedConstructionTypes.length > 0) {
        query = query.in('construction_type', filters.selectedConstructionTypes);
      }
      
      // Completion degree
      if (filters.selectedCompletionStatuses && Array.isArray(filters.selectedCompletionStatuses) && filters.selectedCompletionStatuses.length > 0) {
        query = query.in('completion_degree', filters.selectedCompletionStatuses);
      }
      
      // Floor filters - only apply if explicitly set (not 0, null, or undefined)
      if (filters.floorFrom !== undefined && filters.floorFrom !== null && filters.floorFrom > 0) {
        // Convert to string for text comparison, or use numeric comparison if possible
        query = query.gte('floor', filters.floorFrom.toString());
      }
      if (filters.floorTo !== undefined && filters.floorTo !== null && filters.floorTo > 0) {
        query = query.lte('floor', filters.floorTo.toString());
      }
      
      // Floor options filter (specific floor values)
      if (filters.selectedFloorOptions && Array.isArray(filters.selectedFloorOptions) && filters.selectedFloorOptions.length > 0) {
        query = query.in('floor', filters.selectedFloorOptions);
      }
      
      // Year built filters - only apply if explicitly set (not 0, null, or undefined)
      if (filters.yearFrom !== undefined && filters.yearFrom !== null && filters.yearFrom > 0) {
        query = query.gte('build_year', filters.yearFrom);
      }
      if (filters.yearTo !== undefined && filters.yearTo !== null && filters.yearTo > 0) {
        query = query.lte('build_year', filters.yearTo);
      }
      
      // Features filter (array contains)
      if (filters.selectedFeatures && Array.isArray(filters.selectedFeatures) && filters.selectedFeatures.length > 0) {
        query = query.contains('features', filters.selectedFeatures);
      }
      
      // Hotel category
      if (filters.selectedCategories && Array.isArray(filters.selectedCategories) && filters.selectedCategories.length > 0) {
        if (propertyTypeId === 'hotels-motels') {
          query = query.in('hotel_category', filters.selectedCategories);
        } else if (propertyTypeId === 'agricultural-land') {
          query = query.in('agricultural_category', filters.selectedCategories);
        }
      }
      
      // Bed base for hotels - only apply if explicitly set (not 0, null, or undefined)
      if (filters.bedBaseFrom !== undefined && filters.bedBaseFrom !== null && filters.bedBaseFrom > 0) {
        query = query.gte('bed_base', filters.bedBaseFrom);
      }
      if (filters.bedBaseTo !== undefined && filters.bedBaseTo !== null && filters.bedBaseTo > 0) {
        query = query.lte('bed_base', filters.bedBaseTo);
      }
    }

    // Order and limit
    query = query.order('created_at', { ascending: false }).limit(limit);
    
    // #region agent log
    // Log final query state before execution
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:375',message:'Query state before execution',data:{baseRoute,propertyTypeId,hasCityFilter:!!filters?.city,hasNeighborhoodFilter:!!(filters?.neighborhoods?.length),limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion

    const { data: properties, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: 'Неуспешно зареждане на имоти', details: error.message },
        { status: 500 }
      );
    }
    
    // #region agent log
    if (filters && (filters.city || filters.neighborhoods)) {
      const sampleProperties = (properties || []).slice(0, 5).map((p: any) => ({
        id: p.id,
        city: p.city,
        neighborhood: p.neighborhood,
        title: p.title?.substring(0, 50)
      }));
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:356',message:'Query results for city/neighborhood filter',data:{requestedCity:filters.city,requestedNeighborhoods:filters.neighborhoods,resultCount:properties?.length || 0,sampleProperties},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    }
    // #endregion

    // #region agent log
    if (filters?.neighborhoods && Array.isArray(filters.neighborhoods) && filters.neighborhoods.length > 0) {
      console.log('API: Query results for neighborhood filter:', {
        requestedNeighborhoods: filters.neighborhoods,
        requestedCity: filters.city,
        foundProperties: properties?.length || 0,
        foundNeighborhoods: [...new Set((properties || []).map((p: any) => p.neighborhood).filter(Boolean))],
        foundCities: [...new Set((properties || []).map((p: any) => p.city).filter(Boolean))],
      });
    }
    // #endregion

    // Debug: Log query results for subtype filtering
    if (filters?.apartmentSubtypes) {
      console.log('Query results for subtype filter:', {
        requestedSubtypes: filters.apartmentSubtypes,
        foundProperties: properties?.length || 0,
        propertyTypes: [...new Set((properties || []).map((p: any) => p.type))],
        foundSubtypes: [...new Set((properties || []).map((p: any) => p.subtype).filter(Boolean))],
      });
    }

    // Transform database properties to match Property interface
    const transformedProperties = (properties || []).map((prop: any) => ({
      id: prop.id,
      short_id: prop.short_id ?? undefined,
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type,
      status: prop.sale_or_rent === 'sale' ? 'for-sale' : 'for-rent', // Map sale_or_rent to status for backward compatibility
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
      floor: prop.floor ? String(prop.floor) : undefined,
      total_floors: prop.total_floors ? Number(prop.total_floors) : undefined,
      year_built: prop.build_year || undefined,
      yard_area_sqm: prop.yard_area_sqm ? Number(prop.yard_area_sqm) : undefined,
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

    return NextResponse.json(transformedProperties, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/properties:', error);
    return NextResponse.json(
      {
        error: 'Вътрешна грешка на сървъра',
        details: error instanceof Error ? error.message : 'Неизвестна грешка',
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
        { error: 'Поне едно изображение е задължително' },
        { status: 400 }
      );
    }

    // Validate each image
    for (const file of imageFiles) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: 'Всички полета за изображения трябва да са валидни файлове' },
          { status: 400 }
        );
      }
      if (!file.type.startsWith('image/')) {
          return NextResponse.json(
          { error: `Файлът ${file.name} не е изображение` },
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
          { error: 'Снимката на брокера трябва да е файл с изображение' },
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
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:594',message:'Zod validation result',data:{success:validationResult.success,validationDataKeys:Object.keys(validationData),errors:validationResult.success ? null : validationResult.error.errors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    if (!validationResult.success) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:600',message:'Validation failed - returning error',data:{errors:validationResult.error.errors,formatted:validationResult.error.format()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      // Field name mappings in Bulgarian
      const fieldNames: Record<string, string> = {
        'sale_or_rent': 'Статус',
        'type': 'Тип имот',
        'subtype': 'Подтип',
        'area_sqm': 'Площ',
        'price': 'Цена',
        'price_per_sqm': 'Цена на м²',
        'floor': 'Етаж',
        'total_floors': 'Общо етажи',
        'yard_area': 'Площ на двора',
        'city': 'Град',
        'neighborhood': 'Квартал',
        'title': 'Заглавие',
        'description': 'Описание',
        'build_year': 'Година на строеж',
        'construction_type': 'Конструкция',
        'completion_degree': 'Степен на завършеност',
        'features': 'Особености',
        'broker_name': 'Име на брокера',
        'broker_position': 'Длъжност',
        'broker_phone': 'Телефон на брокера',
        'images': 'Изображения',
      };
      
      // Format validation errors in Bulgarian
      const formattedErrors = validationResult.error.errors.map((err) => {
        let message = err.message;
        const fieldPath = err.path.join('.');
        const fieldLabel = fieldNames[fieldPath] || fieldPath;
        
        // Translate common Zod error messages to Bulgarian
        if (err.code === 'invalid_type') {
          if (err.expected === 'string') {
            message = `${fieldLabel} трябва да е текст`;
          } else if (err.expected === 'number') {
            message = `${fieldLabel} трябва да е число`;
          } else if (err.expected === 'array') {
            message = `${fieldLabel} трябва да е списък`;
          }
        } else if (err.code === 'invalid_enum_value') {
          message = `Невалидна стойност за ${fieldLabel}. Очаква се една от следните: ${err.options?.join(', ') || ''}`;
        } else if (err.code === 'too_small') {
          if (err.type === 'string') {
            message = `${fieldLabel} трябва да има поне ${err.minimum} символа`;
          } else if (err.type === 'number') {
            message = `${fieldLabel} трябва да е поне ${err.minimum}`;
          }
        } else if (err.code === 'too_big') {
          if (err.type === 'number') {
            message = `${fieldLabel} трябва да е най-много ${err.maximum}`;
          }
        } else if (err.code === 'invalid_string') {
          message = `Невалиден формат за ${fieldLabel}`;
        }
        
        // Use the custom message from schema if available, otherwise use translated message
        return {
          path: fieldPath,
          fieldLabel: fieldLabel,
          message: message,
        };
      });
      
      return NextResponse.json(
        {
          error: 'Валидацията не бе успешна',
          details: formattedErrors,
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
          error: 'Всички качвания на изображения не са успешни',
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
      area_sqm: validatedData.area_sqm,
      price: validatedData.price,
      price_per_sqm: pricePerSqm,
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
          error: 'Неуспешно създаване на имот',
          details: insertError?.message || 'Неизвестна грешка',
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
        error: 'Вътрешна грешка на сървъра',
        details: error instanceof Error ? error.message : 'Неизвестна грешка',
      },
      { status: 500 }
    );
  }
}

