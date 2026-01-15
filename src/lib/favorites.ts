import { supabase } from './supabase';

/**
 * Get the list of favorite property IDs for the current user
 */
export async function getFavorites(): Promise<string[]> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:7',message:'getFavorites called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const { data: { user } } = await supabase.auth.getUser();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:10',message:'User check result',data:{hasUser:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('favorites')
      .eq('id', user.id)
      .single();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:18',message:'Database query result',data:{hasError:!!error,errorCode:error?.code,hasData:!!data,favoritesCount:data?.favorites?.length||0,favorites:data?.favorites||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        await supabase
          .from('user_profiles')
          .insert({ id: user.id, favorites: [] });
        return [];
      }
      console.error('Error fetching favorites:', error);
      return [];
    }
    
    const result = data?.favorites || [];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:31',message:'getFavorites returning',data:{favoritesCount:result.length,favorites:result,favoriteTypes:result.map((id:any)=>typeof id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    return result;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:33',message:'getFavorites error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    console.error('Error in getFavorites:', err);
    return [];
  }
}

/**
 * Add a property to the user's favorites
 */
export async function addFavorite(propertyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const favorites = await getFavorites();
    
    // Already favorited
    if (favorites.includes(propertyId)) return true;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ favorites: [...favorites, propertyId] })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in addFavorite:', err);
    return false;
  }
}

/**
 * Remove a property from the user's favorites
 */
export async function removeFavorite(propertyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const favorites = await getFavorites();
    const updated = favorites.filter(id => id !== propertyId);
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ favorites: updated })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in removeFavorite:', err);
    return false;
  }
}

/**
 * Toggle a property in the user's favorites (add if not present, remove if present)
 */
export async function toggleFavorite(propertyId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.includes(propertyId) 
      ? await removeFavorite(propertyId)
      : await addFavorite(propertyId);
  } catch (err) {
    console.error('Error in toggleFavorite:', err);
    return false;
  }
}

/**
 * Check if a property is in the user's favorites
 */
export async function isFavorite(propertyId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.includes(propertyId);
  } catch (err) {
    console.error('Error in isFavorite:', err);
    return false;
  }
}

/**
 * Fetch full property data for a list of property IDs
 */
export async function fetchPropertiesByIds(propertyIds: string[]): Promise<any[]> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:125',message:'fetchPropertiesByIds called',data:{propertyIdsCount:propertyIds?.length||0,propertyIds:propertyIds||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (!propertyIds || propertyIds.length === 0) return [];
    
    const response = await fetch('/api/properties/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: propertyIds }),
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:135',message:'API response received',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (!response.ok) {
      const errorText = await response.text();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:138',message:'API error response',data:{status:response.status,errorText,propertyIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      console.error('Error fetching properties by IDs:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        propertyIds,
      });
      return [];
    }
    
    const data = await response.json();
    const properties = data.properties || [];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:147',message:'fetchPropertiesByIds returning',data:{propertiesCount:properties.length,propertyIds:properties.map((p:any)=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return properties;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/23d33c4b-a0ad-4538-aeac-a1971bd88e6a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'favorites.ts:149',message:'fetchPropertiesByIds error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    console.error('Error in fetchPropertiesByIds:', err);
    return [];
  }
}
