/**
 * Geocoding Service
 * 
 * Converts location names (cities, addresses) to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  country?: string;
}

export interface GeocodingSuggestion {
  displayName: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

/**
 * Search for location suggestions (autocomplete)
 */
export const searchLocationSuggestions = async (query: string, limit: number = 5): Promise<GeocodingSuggestion[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(query)}&` +
      `limit=${limit}&` +
      `addressdetails=1&` +
      `extratags=1`,
      {
        headers: {
          'User-Agent': 'WCFinder Mobile App'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        country: item.address?.country,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Geocoding suggestions error:', error);
    return [];
  }
};

/**
 * Search for a single location (for direct search)
 */
export const searchLocation = async (query: string): Promise<GeocodingResult | null> => {
  try {
    if (!query || query.trim().length < 2) {
      return null;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(query)}&` +
      `limit=1&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WCFinder Mobile App'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      const item = data[0];
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        country: item.address?.country,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocoding: Convert coordinates to address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&` +
      `lat=${lat}&` +
      `lon=${lng}&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WCFinder Mobile App'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

