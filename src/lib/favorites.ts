import { supabase } from './supabase';

/**
 * Get the list of favorite property IDs for the current user
 */
export async function getFavorites(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('favorites')
      .eq('id', user.id)
      .single();
    
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
    return result;
  } catch (err) {
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
    if (!propertyIds || propertyIds.length === 0) return [];
    
    const response = await fetch('/api/properties/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: propertyIds }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
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
    return properties;
  } catch (err) {
    console.error('Error in fetchPropertiesByIds:', err);
    return [];
  }
}
