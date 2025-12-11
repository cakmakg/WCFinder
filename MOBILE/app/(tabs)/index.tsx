/**
 * Map Screen (Home)
 * 
 * Main screen showing map with nearby toilets
 * Features:
 * - Full-screen map
 * - Bottom sheet with business list
 * - Search bar
 * - GPS tracking
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, Platform, TouchableOpacity, FlatList } from 'react-native';
import { Text, Searchbar, Button, IconButton, useTheme, ActivityIndicator, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BusinessMap } from '../../src/components/map/BusinessMap';
import { BusinessCard } from '../../src/components/business/BusinessCard';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useLocation } from '../../src/hooks/useLocation';
import { Business } from '../../src/services/businessService';
import { searchLocationSuggestions, searchLocation, GeocodingSuggestion } from '../../src/services/geocoding';

export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentUser } = useSelector((state: any) => state.auth);
  const { location, loading: locationLoading, getCurrentLocation, watchLocation, calculateDistance, error: locationError } = useLocation();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchedCity, setSearchedCity] = useState<string | null>(null); // Store searched city name
  const [isTracking, setIsTracking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const locationSubscriptionRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<any>(null);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // Fetch businesses based on user location or searched location
  const businessParams = useMemo(() => {
    const params: any = {
      limit: 50,
    };
    
    // Use searched location if available, otherwise use user location
    const activeLocation = searchedLocation 
      ? { latitude: searchedLocation.lat, longitude: searchedLocation.lng }
      : location;
    
    if (activeLocation) {
      params.latitude = activeLocation.latitude;
      params.longitude = activeLocation.longitude;
      params.radius = 5; // 5km radius
    }
    
    // Only add search param if we're NOT searching for a location (i.e., searching for business names)
    // If searchedLocation is set, it means user searched for a city/location, not a business name
    if (searchQuery.trim() && !searchedLocation) {
      params.search = searchQuery.trim();
    }
    
    return params;
  }, [location?.latitude, location?.longitude, searchedLocation, searchQuery]);

  const { businesses, loading: businessesLoading, error: businessesError, refresh } = useBusiness(businessParams);

  // Get active location for distance calculation (searched location takes priority)
  const activeLocationForDistance = useMemo(() => {
    return searchedLocation 
      ? { latitude: searchedLocation.lat, longitude: searchedLocation.lng }
      : location;
  }, [searchedLocation, location]);

  // Calculate distances for businesses
  const businessesWithDistance = useMemo(() => {
    if (!businesses || businesses.length === 0) {
      return [];
    }
    
    // If no location available, return businesses without distance
    if (!activeLocationForDistance) {
      return businesses;
    }
    
    return businesses.map(business => {
      if (!business.location?.coordinates) return business;
      
      const [longitude, latitude] = business.location.coordinates;
      const distance = calculateDistance(
        activeLocationForDistance.latitude,
        activeLocationForDistance.longitude,
        latitude,
        longitude
      );
      
      return { ...business, distance };
    }).sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
  }, [businesses, activeLocationForDistance, calculateDistance]);

  // Filter businesses by search query (only if searching for business names, not locations)
  const filteredBusinesses = useMemo(() => {
    let result = businessesWithDistance;
    
    // If searchedCity is set, filter by city name
    if (searchedCity) {
      const cityLower = searchedCity.toLowerCase();
      result = result.filter((business: any) => {
        // Check if business address contains the searched city
        if (typeof business.address === 'string') {
          return business.address.toLowerCase().includes(cityLower);
        } else if (business.address) {
          const city = (business.address.city || '').toLowerCase();
          const address = (business.address.street || '').toLowerCase();
          const fullAddress = `${address} ${city}`.toLowerCase();
          return city.includes(cityLower) || fullAddress.includes(cityLower);
        }
        return false;
      });
    }
    
    // If searchedLocation is set but no city filter, show all businesses from that location
    if (searchedLocation && !searchedCity) {
      return result;
    }
    
    // If no search query, return all businesses with distance
    if (!searchQuery.trim()) {
      return result;
    }
    
    // If searching for business names (not location), filter by business name/address/type
    if (!searchedLocation && !searchedCity) {
      const query = searchQuery.toLowerCase();
      result = result.filter((business: any) => {
        const name = (business.name || business.businessName || '').toLowerCase();
        const address = (typeof business.address === 'string' ? business.address : business.address?.street || '').toLowerCase();
        const businessType = (business.businessType || '').toLowerCase();
        
        return name.includes(query) || address.includes(query) || businessType.includes(query);
      });
    }
    
    return result;
  }, [businessesWithDistance, searchQuery, searchedLocation, searchedCity]);

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Start/stop GPS tracking
  const toggleTracking = useCallback(async () => {
    if (isTracking) {
      // Stop tracking
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
      setIsTracking(false);
    } else {
      // Start tracking
      const subscription = await watchLocation();
      if (subscription) {
        locationSubscriptionRef.current = subscription;
        setIsTracking(true);
      }
    }
  }, [isTracking, watchLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  const handleMarkerPress = (business: Business) => {
    setSelectedBusiness(business);
    // Open bottom sheet to show business details
    bottomSheetRef.current?.snapToIndex(1);
    // Scroll to business in list
    setTimeout(() => {
      // Find business index and scroll
    }, 300);
  };

  const handleBusinessPress = (business: Business) => {
    router.push({
      pathname: '/(modals)/business-detail',
      params: { id: business._id },
    });
  };

  const handleRefresh = () => {
    getCurrentLocation();
    refresh();
  };

  // Search location suggestions (autocomplete)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearchingLocation(true);
        const suggestions = await searchLocationSuggestions(searchQuery, 5);
        setSearchSuggestions(suggestions);
        setIsSearchingLocation(false);
      }, 500); // Debounce 500ms
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionSelect = async (suggestion: GeocodingSuggestion) => {
    // Extract city name from suggestion
    const cityName = suggestion.city || suggestion.displayName.split(',')[0] || suggestion.displayName;
    
    setSearchQuery(cityName);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    Keyboard.dismiss();

    // Set searched location and city
    setSearchedLocation({ lat: suggestion.lat, lng: suggestion.lng });
    setSearchedCity(cityName);
    
    // Focus map on selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: suggestion.lat,
        longitude: suggestion.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }

    // Refresh businesses for the new location
    // businessParams will automatically update due to searchedLocation change
    setTimeout(() => {
      refresh();
    }, 100);
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    Keyboard.dismiss();
    setIsSearchingLocation(true);

    const result = await searchLocation(searchQuery);
    if (result) {
      // Extract city name from result
      const cityName = result.city || result.displayName.split(',')[0] || searchQuery;
      
      setSearchedLocation({ lat: result.lat, lng: result.lng });
      setSearchedCity(cityName);
      
      // Focus map on searched location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: result.lat,
          longitude: result.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    }

    setIsSearchingLocation(false);
  };

  const isLoading = locationLoading || businessesLoading;
  const hasBusinesses = filteredBusinesses && filteredBusinesses.length > 0;

  return (
    <View style={styles.container}>
      {/* Map View - Full Screen */}
      <BusinessMap
        ref={mapRef}
        businesses={businesses || []}
        userLocation={location}
        selectedBusiness={selectedBusiness}
        searchedLocation={searchedLocation}
        onMarkerPress={handleMarkerPress}
      />

      {/* Search Bar - Overlay on Map */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search location (e.g., Bonn, Köln)..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          icon="magnify"
          clearIcon="close-circle"
          loading={isSearchingLocation}
          onSubmitEditing={handleSearchSubmit}
          onClear={() => {
            setSearchQuery('');
            setSearchSuggestions([]);
            setShowSuggestions(false);
            setSearchedLocation(null);
            setSearchedCity(null);
            Keyboard.dismiss();
          }}
          onFocus={() => {
            if (searchQuery.trim().length >= 2) {
              setShowSuggestions(true);
            }
          }}
        />
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={searchSuggestions}
              keyExtractor={(item, index) => `${item.lat}-${item.lng}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSuggestionSelect(item)}
                  style={styles.suggestionItem}
                >
                  <List.Icon icon="map-marker" />
                  <View style={styles.suggestionTextContainer}>
                    <Text variant="bodyMedium" style={styles.suggestionTitle}>
                      {item.city || item.displayName.split(',')[0]}
                    </Text>
                    <Text variant="bodySmall" style={styles.suggestionSubtitle} numberOfLines={1}>
                      {item.displayName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      {/* GPS Tracking Button */}
      <View style={styles.gpsButtonContainer}>
        <IconButton
          icon={isTracking ? "crosshairs-gps" : "crosshairs"}
          size={24}
          iconColor={isTracking ? theme.colors.primary : theme.colors.onSurface}
          style={[
            styles.gpsButton,
            isTracking && { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={toggleTracking}
          disabled={locationLoading}
        />
      </View>

      {/* Refresh Button */}
      <View style={styles.refreshButtonContainer}>
        <IconButton
          icon="refresh"
          size={24}
          iconColor={theme.colors.onSurface}
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isLoading}
        />
      </View>

      {/* Bottom Sheet - Business List */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      >
        <View style={styles.bottomSheetHeader}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetTitleContainer}>
            <Text variant="titleLarge" style={styles.bottomSheetTitle}>
              {searchQuery.trim() ? `Search Results (${filteredBusinesses.length})` : `Nearby Toilets (${filteredBusinesses.length})`}
            </Text>
            {location && (
              <Text variant="bodySmall" style={styles.bottomSheetSubtitle}>
                📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && !hasBusinesses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading toilets...</Text>
            </View>
          ) : hasBusinesses ? (
            filteredBusinesses.map((business: any) => (
              <BusinessCard
                key={business._id}
                business={business}
                distance={business.distance}
                onPress={handleBusinessPress}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium" style={styles.emptyText}>
                {searchQuery.trim() ? 'No toilets found' : 'No toilets nearby'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                {searchQuery.trim() 
                  ? 'Try a different search term'
                  : 'Try refreshing or expanding your search radius'}
              </Text>
              <Button
                mode="outlined"
                onPress={handleRefresh}
                style={styles.emptyButton}
                icon="refresh"
              >
                Refresh
              </Button>
            </View>
          )}

          {businessesError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{businessesError}</Text>
              <Button onPress={handleRefresh} mode="outlined" compact>
                Retry
              </Button>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchbar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gpsButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 110,
    right: 16,
    zIndex: 10,
  },
  gpsButton: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 180 : 170,
    right: 16,
    zIndex: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    opacity: 0.6,
    fontSize: 12,
  },
  refreshButton: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomSheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bottomSheetTitleContainer: {
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    opacity: 0.7,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
});
