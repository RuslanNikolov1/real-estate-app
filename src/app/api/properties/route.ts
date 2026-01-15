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
      } catch (e) {
        console.error('Error parsing filters:', e);
      }
    }

    // Build query
    let query = supabaseAdmin.from('properties').select('*');

    // Get propertyTypeId and baseRoute from query params (needed for filtering and debug logging)
    const baseRoute = searchParams.get('baseRoute');
    const propertyTypeId = searchParams.get('propertyTypeId');

    // Apply filters if provided
    if (filters) {
      // Property ID filter (short_id)
      if (filters.propertyId && filters.propertyId.trim()) {
        query = query.eq('short_id', filters.propertyId.trim());
      }
      
      // Status filter (for-sale/for-rent)
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.neighborhoods && Array.isArray(filters.neighborhoods) && filters.neighborhoods.length > 0) {
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
      
      // Debug: Log filter parameters for hotels
      if (propertyTypeId === 'hotels-motels') {
        console.log('Hotel filter parameters:', {
          propertyTypeId,
          baseRoute,
          hasFilters: !!filters,
          propertyTypes: filters?.propertyTypes,
          filtersKeys: filters ? Object.keys(filters) : [],
        });
      }
      
      if (propertyTypeId && typeMapping[propertyTypeId]) {
        query = query.in('type', typeMapping[propertyTypeId]);
      }
      
      // Also support direct type filter from filters object
      if (filters.type && typeof filters.type === 'string') {
        query = query.eq('type', filters.type);
      }
      
      // Support types array filter
      if (filters.types && Array.isArray(filters.types) && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }
      
      // Sale/Rent filter based on baseRoute (using sale_or_rent instead of status)
      if (baseRoute === '/sale/search') {
        query = query.eq('sale_or_rent', 'sale');
      } else if (baseRoute === '/rent/search') {
        query = query.eq('sale_or_rent', 'rent');
      }
      
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
      
      // Price per sqm filters - only apply for sale properties, not rent
      // Rent hotels don't have area_sqm (it's null), so price_per_sqm is also null
      // Filtering by price_per_sqm would exclude all rent hotels
      if (baseRoute !== '/rent/search') {
        if (filters.pricePerSqmFrom !== undefined && filters.pricePerSqmFrom !== null && filters.pricePerSqmFrom > 0) {
          query = query.gte('price_per_sqm', filters.pricePerSqmFrom);
        }
        if (filters.pricePerSqmTo !== undefined && filters.pricePerSqmTo !== null && filters.pricePerSqmTo > 0) {
          query = query.lte('price_per_sqm', filters.pricePerSqmTo);
        }
      }

      // Furnishing filter (Обзавеждане) for rent apartments
      // UI sends IDs: 'furnished', 'partially-furnished', 'unfurnished'
      // Map them to furniture column values: 'full', 'partial', 'none'
      if (filters.selectedFurnishing && Array.isArray(filters.selectedFurnishing) && filters.selectedFurnishing.length > 0) {
        const furnishingMap: Record<string, string> = {
          furnished: 'full',
          'partially-furnished': 'partial',
          unfurnished: 'none',
        };

        const mappedFurniture = filters.selectedFurnishing
          .map((id: string) => furnishingMap[id])
          .filter((val: string | undefined): val is string => !!val);

        if (mappedFurniture.length > 0) {
          query = query.in('furniture', mappedFurniture);
        }
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
      
      // Garage property types filter (garage-standalone, parking-space, whole-parking)
      // Only apply when propertyTypeId is garages-parking
      if (filters.propertyTypes && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0 && propertyTypeId === 'garages-parking') {
        const validPropertyTypes = filters.propertyTypes.filter(
          (propertyType: string) => propertyType && propertyType !== 'all'
        );
        if (validPropertyTypes.length > 0) {
          // Filter by subtype for garage properties
          // The type filter is already applied at line 159 if propertyTypeId === 'garages-parking'
          query = query.in('subtype', validPropertyTypes);
        }
      }
      
      // Hotel property types filter (hotel, family-hotel, hostel-pension, lodge, etc.)
      // Only apply when propertyTypeId is hotels-motels
      if (filters.propertyTypes && Array.isArray(filters.propertyTypes) && filters.propertyTypes.length > 0 && propertyTypeId === 'hotels-motels') {
        const validPropertyTypes = filters.propertyTypes.filter(
          (propertyType: string) => propertyType && propertyType !== 'all'
        );
        if (validPropertyTypes.length > 0) {
          // Filter by subtype for hotel properties
          // The type filter is already applied at line 159 if propertyTypeId === 'hotels-motels'
          console.log('Hotel subtype filter applied:', {
            propertyTypeId,
            requestedSubtypes: validPropertyTypes,
            filtersPropertyTypes: filters.propertyTypes,
          });
          query = query.in('subtype', validPropertyTypes);
        }
      }
      
      // Location types filter (Разположение) for restaurants/establishments
      // Only apply when propertyTypeId is restaurants
      // This filters by subtype column in the database
      if (filters.locationTypes && Array.isArray(filters.locationTypes) && filters.locationTypes.length > 0 && propertyTypeId === 'restaurants') {
        const validLocationTypes = filters.locationTypes.filter(
          (locationType: string) => locationType && locationType !== 'all'
        );
        if (validLocationTypes.length > 0) {
          // Filter by subtype for restaurant properties
          // The type filter is already applied at line 169 if propertyTypeId === 'restaurants'
          query = query.in('subtype', validLocationTypes);
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
      
      // Hotel category - handle 'uncategorized' and 'unspecified' as NULL
      if (filters.selectedCategories && Array.isArray(filters.selectedCategories) && filters.selectedCategories.length > 0) {
        if (propertyTypeId === 'hotels-motels') {
          const hasUncategorized = filters.selectedCategories.includes('uncategorized') || filters.selectedCategories.includes('unspecified');
          const validCategories = filters.selectedCategories.filter(
            (cat: string) => cat !== 'all' && cat !== 'uncategorized' && cat !== 'unspecified'
          );
          
          if (validCategories.length > 0 && hasUncategorized) {
            // Match either valid categories OR NULL
            // Use OR query with PostgREST filter syntax
            // Format: "column.in.(value1,value2),column.is.null"
            const categoryList = validCategories.join(',');
            query = query.or(`hotel_category.in.(${categoryList}),hotel_category.is.null`);
          } else if (validCategories.length > 0) {
            // Only valid categories
            query = query.in('hotel_category', validCategories);
          } else if (hasUncategorized) {
            // Only NULL (uncategorized/unspecified)
            query = query.is('hotel_category', null);
          }
        } else if (propertyTypeId === 'agricultural-land') {
          query = query.in('agricultural_category', filters.selectedCategories);
        }
      }
      
      // Bed base for hotels - handle NULL values when "not provided" is selected
      if (filters.isBedBaseNotProvided) {
        // Include hotels with NULL bed_base
        query = query.is('bed_base', null);
      } else {
        // Only apply range filters if "not provided" is not selected
        if (filters.bedBaseFrom !== undefined && filters.bedBaseFrom !== null && filters.bedBaseFrom > 0) {
          query = query.gte('bed_base', filters.bedBaseFrom);
        }
        if (filters.bedBaseTo !== undefined && filters.bedBaseTo !== null && filters.bedBaseTo > 0) {
          query = query.lte('bed_base', filters.bedBaseTo);
        }
      }
    }

    // Comprehensive debug logging before query execution
    // Log all active filters to help diagnose filtering issues
    if (propertyTypeId === 'hotels-motels') {
      const activeFilters: Record<string, any> = {
        baseRoute,
        propertyTypeId,
        saleOrRent: baseRoute === '/sale/search' ? 'sale' : baseRoute === '/rent/search' ? 'rent' : 'none',
      };

      if (filters) {
        if (filters.propertyTypes) activeFilters.propertyTypes = filters.propertyTypes;
        if (filters.city) activeFilters.city = filters.city;
        if (filters.neighborhoods) activeFilters.neighborhoods = filters.neighborhoods;
        if (filters.areaFrom) activeFilters.areaFrom = filters.areaFrom;
        if (filters.areaTo) activeFilters.areaTo = filters.areaTo;
        if (filters.priceFrom) activeFilters.priceFrom = filters.priceFrom;
        if (filters.priceTo) activeFilters.priceTo = filters.priceTo;
        if (filters.pricePerSqmFrom) activeFilters.pricePerSqmFrom = filters.pricePerSqmFrom;
        if (filters.pricePerSqmTo) activeFilters.pricePerSqmTo = filters.pricePerSqmTo;
        if (filters.selectedCategories) activeFilters.selectedCategories = filters.selectedCategories;
        if (filters.bedBaseFrom) activeFilters.bedBaseFrom = filters.bedBaseFrom;
        if (filters.bedBaseTo) activeFilters.bedBaseTo = filters.bedBaseTo;
        if (filters.isBedBaseNotProvided) activeFilters.isBedBaseNotProvided = filters.isBedBaseNotProvided;
        if (filters.selectedFeatures) activeFilters.selectedFeatures = filters.selectedFeatures;
        if (filters.selectedConstructionTypes) activeFilters.selectedConstructionTypes = filters.selectedConstructionTypes;
        if (filters.selectedCompletionStatuses) activeFilters.selectedCompletionStatuses = filters.selectedCompletionStatuses;
        
        // Note about pricePerSqm filters
        if (baseRoute === '/rent/search') {
          activeFilters.pricePerSqmFiltersSkipped = true;
          activeFilters.reason = 'Rent hotels have null price_per_sqm, so these filters are skipped';
        }
      }

      console.log('Hotel query - All active filters before execution:', activeFilters);
    }

    // Order and limit
    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: properties, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties', details: error.message },
        { status: 500 }
      );
    }

    // Debug: Log query results for subtype filtering
    if (filters?.apartmentSubtypes) {
      console.log('Query results for subtype filter:', {
        requestedSubtypes: filters.apartmentSubtypes,
        foundProperties: properties?.length || 0,
        propertyTypes: [...new Set((properties || []).map((p: any) => p.type))],
        foundSubtypes: [...new Set((properties || []).map((p: any) => p.subtype).filter(Boolean))],
      });
    }
    
    // Debug: Log query results for hotel subtype filtering
    if (filters && filters.propertyTypes && propertyTypeId === 'hotels-motels') {
      const queryResults = {
        propertyTypeId,
        baseRoute,
        requestedSubtypes: filters.propertyTypes,
        foundProperties: properties?.length || 0,
        propertyTypes: [...new Set((properties || []).map((p: any) => p.type))],
        foundSubtypes: [...new Set((properties || []).map((p: any) => p.subtype).filter(Boolean))],
        allProperties: (properties || []).map((p: any) => ({
          id: p.id,
          type: p.type,
          subtype: p.subtype,
          sale_or_rent: p.sale_or_rent,
          city: p.city,
          price: p.price,
          price_per_sqm: p.price_per_sqm,
        })),
        appliedFilters: {
          saleOrRent: baseRoute === '/sale/search' ? 'sale' : baseRoute === '/rent/search' ? 'rent' : 'none',
          type: 'hotel',
          subtype: filters.propertyTypes.filter((t: string) => t !== 'all'),
          pricePerSqmFiltered: baseRoute === '/rent/search' ? false : !!(filters.pricePerSqmFrom || filters.pricePerSqmTo),
        },
      };

      console.log('Hotel subtype filter query results:', queryResults);

      // If no properties found, log diagnostic information
      if (properties?.length === 0) {
        console.warn('No hotels found with current filters. Diagnostic info:', {
          expectedFilters: {
            type: 'hotel',
            sale_or_rent: baseRoute === '/rent/search' ? 'rent' : 'sale',
            subtype: filters.propertyTypes.filter((t: string) => t !== 'all'),
          },
          pricePerSqmFilterSkipped: baseRoute === '/rent/search',
          suggestion: 'Check if hotel in database matches: type=hotel, sale_or_rent=' + (baseRoute === '/rent/search' ? 'rent' : 'sale') + ', subtype=' + filters.propertyTypes.filter((t: string) => t !== 'all').join(','),
        });
      }
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
    }));

    return NextResponse.json(transformedProperties, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
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

