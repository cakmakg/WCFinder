/**
 * Map Screen - Main Home Screen
 *
 * Full-screen map with toilet locations
 * Uber/Delivery app style with bottom sheet for details
 * 
 * Features:
 * - Real-time user location
 * - Custom toilet markers
 * - Search bar overlay
 * - Bottom sheet for toilet details
 * - Distance calculation
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform, Alert, Keyboard, Linking, Text, FlatList, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
import { FAB, IconButton, ActivityIndicator, Text as PaperText } from 'react-native-paper';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ToiletMarker } from '../../src/components/map/ToiletMarker';
import { ToiletDetailsSheet } from '../../src/components/map/ToiletDetailsSheet';
import { BusinessCard } from '../../src/components/business/BusinessCard';
import { useToilets } from '../../src/hooks/useToilets';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useLocation } from '../../src/hooks/useLocation';
import { searchLocationSuggestions, searchLocation, GeocodingSuggestion } from '../../src/services/geocoding';
import { Business } from '../../src/services/businessService';

interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const businessListSheetRef = useRef<BottomSheet>(null);
  const { currentUser } = useSelector((state: any) => state.auth);
  const { location, getCurrentLocation, calculateDistance } = useLocation();
  const params = useLocalSearchParams<{ search?: string }>();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedToilet, setSelectedToilet] = useState<any>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearestToiletCoords, setNearestToiletCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle search parameter from StartPage
  useEffect(() => {
    if (params.search) {
      const searchText = decodeURIComponent(params.search);
      setSearchQuery(searchText);
      // Perform location search
      handleSearchFromParam(searchText);
    }
  }, [params.search]);

  const handleSearchFromParam = async (searchText: string) => {
    if (!searchText.trim()) return;

    setIsSearchingLocation(true);
    try {
      const result = await searchLocation(searchText);
      if (result) {
        setSearchedLocation({ lat: result.lat, lng: result.lng });
        
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: result.lat,
            longitude: result.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Get toilets from API based on location
  const toiletParams = useMemo(() => {
    const params: any = {
      limit: 100,
    };
    
    // Use searched location if available, otherwise use user location
    const activeLocation = searchedLocation 
      ? { latitude: searchedLocation.lat, longitude: searchedLocation.lng }
      : userLocation;
    
    if (activeLocation) {
      params.latitude = activeLocation.latitude;
      params.longitude = activeLocation.longitude;
      params.radius = 10; // 10km radius
    }
    
    return params;
  }, [userLocation?.latitude, userLocation?.longitude, searchedLocation]);

  const { toilets, loading: toiletsLoading, error: toiletsError, refresh } = useToilets(toiletParams);

  // Debug: Log toilets data
  useEffect(() => {
    console.log('[MapScreen] Toilets state:', {
      count: toilets.length,
      loading: toiletsLoading,
      error: toiletsError,
      toiletsWithLocation: toilets.filter((t: any) => 
        !!(t.location?.coordinates || t.business?.location?.coordinates)
      ).length,
      sampleToilet: toilets[0] ? {
        id: toilets[0]._id,
        name: toilets[0].name,
        hasLocation: !!(toilets[0].location?.coordinates || toilets[0].business?.location?.coordinates),
        hasBusiness: !!toilets[0].business,
        businessId: toilets[0].business?._id,
        businessLocation: !!toilets[0].business?.location,
      } : null,
    });
  }, [toilets, toiletsLoading, toiletsError]);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
  // Bottom sheet snap points - keep map visible at 50% height
  const businessListSnapPoints = useMemo(() => ['30%', '50%'], []);

  // Get businesses for list
  const businessParams = useMemo(() => {
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10, // 10km radius
        search: searchQuery || undefined,
      };
    }
    return {
      search: searchQuery || undefined,
    };
  }, [location?.latitude, location?.longitude, searchQuery]);

  const { businesses, loading: businessesLoading, error: businessesError, refreshing: businessesRefreshing, refresh: refreshBusinesses } = useBusiness(businessParams);

  // Compute minimum toilet fee per business from loaded toilets
  const minFeeByBusinessId = useMemo(() => {
    const map: Record<string, number> = {};
    toilets.forEach((toilet: any) => {
      const bId = typeof toilet.business === 'object'
        ? toilet.business?._id
        : (toilet.business || toilet.businessId);
      if (bId && typeof toilet.fee === 'number') {
        if (map[bId] === undefined || toilet.fee < map[bId]) {
          map[bId] = toilet.fee;
        }
      }
    });
    return map;
  }, [toilets]);

  // Calculate distance for each business
  const businessesWithDistance = useMemo(() => {
    if (!businesses || !Array.isArray(businesses)) return [];
    if (!location) return businesses.map(b => ({ business: b }));
    
    return businesses.map((business) => {
      if (!business.location?.coordinates) {
        return { business };
      }
      
      const [longitude, latitude] = business.location.coordinates;
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        latitude,
        longitude
      );
      
      return { business, distance };
    }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }, [businesses, location]);

  const handleBusinessPress = (business: Business) => {
    router.push({
      pathname: '/(modals)/business-detail',
      params: { id: business._id },
    });
  };

  const handleRefreshBusinesses = () => {
    getCurrentLocation();
    refreshBusinesses();
  };

  /**
   * Request location permissions and get current location
   */
  useEffect(() => {
    (async () => {
      try {
        // Check current permission status first
        const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
        console.log('[MapScreen] Initial permission status:', currentStatus);

        let permissionStatus = currentStatus;

        // If not granted, request permission
        if (currentStatus !== 'granted') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          permissionStatus = status;
          console.log('[MapScreen] Permission request result:', status);
        }

        if (permissionStatus !== 'granted') {
          // Detect if running in Expo Go or standalone app
          const isExpoGo = Constants.executionEnvironment === 'storeClient';

          Alert.alert(
            'Standortzugriff erforderlich',
            `Bitte erlauben Sie den Standortzugriff, um WCs in Ihrer Nähe zu sehen.\n\nEinstellungen > ${isExpoGo ? 'Expo Go' : 'WCFinder'} > Standort > Erlauben`,
            [
              { text: 'Abbrechen', style: 'cancel' },
              {
                text: 'Einstellungen öffnen',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openSettings();
                  } else {
                    const pkg = isExpoGo ? 'host.exp.exponent' : 'com.wcfinder.app';
                    IntentLauncher.startActivityAsync(
                      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                      { data: 'package:' + pkg }
                    );
                  }
                }
              }
            ]
          );
          // Default to a city center (e.g., Berlin) - ONLY if permission denied
          console.log('[MapScreen] Permission denied, using default location (Berlin)');
          setUserLocation({
            latitude: 52.5200,
            longitude: 13.4050,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          return;
        }

        // Permission granted - get actual location
        console.log('[MapScreen] Permission granted, getting current location...');
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        console.log('[MapScreen] Got real user location:', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error: any) {
        console.error('[MapScreen] Error getting location:', error.message || error);
        // Fallback location ONLY on error
        console.log('[MapScreen] Using fallback location (Berlin) due to error');
        setUserLocation({
          latitude: 52.5200,
          longitude: 13.4050,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    })();
  }, []);

  /**
   * Handle toilet marker press
   * Navigate directly to business detail page (booking page)
   * Same navigation as List Screen's BusinessCard onPress
   */
  const handleMarkerPress = useCallback((toilet: any) => {
    console.log('[MapScreen] Toilet marker pressed:', toilet.name);

    // Get business ID from toilet
    const businessId = toilet.business?._id || toilet.businessId;
    
    if (!businessId) {
      console.warn('[MapScreen] No business ID found for toilet:', toilet._id);
      // Fallback: show bottom sheet if no business ID
      setSelectedToilet(toilet);
      bottomSheetRef.current?.expand();
      return;
    }

    // Navigate to business detail page (same as List Screen)
    // This matches the navigation in list.tsx -> handleBusinessPress
    router.push({
      pathname: '/(modals)/business-detail',
      params: { id: businessId },
    });
  }, [router]);
    
  /**
   * Handle booking button from bottom sheet
   */
  const handleBooking = useCallback(() => {
    if (!selectedToilet) return;

    console.log('[MapScreen] Booking toilet:', selectedToilet.name);

    // Get business ID from toilet
    const businessId = selectedToilet.business?._id || selectedToilet.businessId;
    
    if (!businessId) {
      console.warn('[MapScreen] No business ID found for toilet:', selectedToilet._id);
      return;
    }

    // Navigate to business detail modal (booking page)
    router.push({
      pathname: '/(modals)/business-detail',
      params: { id: businessId },
    });
  }, [selectedToilet, router]);

  /**
   * Center map on user location
   * Gets fresh current location and centers map on it
   * Tries direct API first, then falls back to useLocation hook
   */
  const centerOnUser = useCallback(async () => {
    try {
      console.log('[MapScreen] Centering on user location...');

      // First, check current permission status (don't request yet)
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      console.log('[MapScreen] Current permission status:', currentStatus);

      // If permission is denied, show alert with option to open settings
      if (currentStatus === 'denied') {
        // Detect if running in Expo Go or standalone app
        const isExpoGo = Constants.executionEnvironment === 'storeClient';

        Alert.alert(
          'Standortzugriff verweigert',
          `Der Standortzugriff wurde abgelehnt. Bitte aktivieren Sie ihn manuell in den Geräteeinstellungen.\n\nEinstellungen > ${isExpoGo ? 'Expo Go' : 'WCFinder'} > Standort`,
          [
            { text: 'Abbrechen', style: 'cancel' },
            {
              text: 'Einstellungen öffnen',
              onPress: async () => {
                // Open app settings
                if (Platform.OS === 'ios') {
                  // On iOS, open app settings
                  Linking.openSettings();
                } else {
                  // On Android, open app settings
                  const pkg = isExpoGo ? 'host.exp.exponent' : 'com.wcfinder.app';
                  IntentLauncher.startActivityAsync(
                    IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                    { data: 'package:' + pkg }
                  );
                }
              }
            }
          ]
        );

        // Fallback to cached location if available
        if (userLocation && mapRef.current) {
          console.log('[MapScreen] Using cached location (permission denied)');
          mapRef.current.animateToRegion(userLocation, 1000);
        }
        return;
    }
    
      // If permission is not determined yet, request it
      if (currentStatus === 'undetermined') {
        console.log('[MapScreen] Requesting permission...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('[MapScreen] Permission request result:', status);

        if (status !== 'granted') {
          // Detect if running in Expo Go or standalone app
          const isExpoGo = Constants.executionEnvironment === 'storeClient';
          
          Alert.alert(
            'Standortzugriff erforderlich',
            `Bitte erlauben Sie den Standortzugriff für WCs in der Nähe und GPS-Funktionen.\n\nEinstellungen > ${isExpoGo ? 'Expo Go' : 'WCFinder'} > Standort > Erlauben`,
            [
              { text: 'Abbrechen', style: 'cancel' },
              {
                text: 'Einstellungen öffnen',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openSettings();
                  } else {
                    const pkg = isExpoGo ? 'host.exp.exponent' : 'com.wcfinder.app';
                    IntentLauncher.startActivityAsync(
                      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                      { data: 'package:' + pkg }
                    );
                  }
                }
              }
            ]
          );

          // Fallback to cached location if available
          if (userLocation && mapRef.current) {
            console.log('[MapScreen] Using cached location (permission not granted)');
            mapRef.current.animateToRegion(userLocation, 1000);
          }
          return;
        }
        // Permission granted, continue to get location below
      }

      // Try direct location API first (more reliable)
      try {
        console.log('[MapScreen] Getting location via direct API...');
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (currentLocation && currentLocation.coords) {
          const region = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          console.log('[MapScreen] Got location via direct API:', region);
          
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 1000);
            
            // Update userLocation state for consistency
            setUserLocation({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            
            console.log('[MapScreen] Map centered successfully');
            return; // Success, exit early
          }
        }
      } catch (directError: any) {
        console.warn('[MapScreen] Direct location API failed:', directError.message);

        // Try useLocation hook as fallback
        try {
          console.log('[MapScreen] Trying useLocation hook...');
          const freshLocation = await getCurrentLocation();
          
          if (freshLocation && mapRef.current) {
            const region = {
              latitude: freshLocation.latitude,
              longitude: freshLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };

            console.log('[MapScreen] Got location via hook:', region);
            mapRef.current.animateToRegion(region, 1000);
            
            setUserLocation({
              latitude: freshLocation.latitude,
              longitude: freshLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            
            console.log('[MapScreen] Map centered via hook');
            return; // Success, exit early
          }
        } catch (hookError: any) {
          console.warn('[MapScreen] useLocation hook also failed:', hookError.message);
        }
      }
      
      // Last fallback: use cached userLocation
      if (userLocation && mapRef.current) {
        console.log('[MapScreen] Using cached userLocation as final fallback');
        mapRef.current.animateToRegion(userLocation, 1000);
      } else {
        console.warn('[MapScreen] No location available');
        Alert.alert(
          'Standort nicht gefunden',
          'Ihr Standort konnte nicht ermittelt werden. Bitte stellen Sie sicher, dass GPS aktiviert ist.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('[MapScreen] Error centering on user:', error.message || error);

      if (userLocation && mapRef.current) {
        console.log('[MapScreen] Using cached location due to error');
        mapRef.current.animateToRegion(userLocation, 1000);
      } else {
        Alert.alert(
          'Standort nicht gefunden',
          'Ihr Standort konnte nicht ermittelt werden. Bitte stellen Sie sicher, dass GPS aktiviert ist.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [userLocation, getCurrentLocation]);

  /**
   * Navigate to nearest toilet
   * Centers map to show both user and nearest WC, draws a route line
   */
  const handleNavigateToNearest = useCallback(() => {
    if (!location || toilets.length === 0) {
      Alert.alert('Kein WC gefunden', 'Es konnten keine WCs in Ihrer Nähe gefunden werden.');
      return;
    }

    let nearest: any = null;
    let minDist = Infinity;

    toilets.forEach((toilet: any) => {
      const coords = toilet.location?.coordinates || toilet.business?.location?.coordinates;
      if (!coords) return;
      const [lng, lat] = coords;
      const dist = calculateDistance(location.latitude, location.longitude, lat, lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = toilet;
      }
    });

    if (!nearest) {
      Alert.alert('Kein WC gefunden', 'Es konnten keine WCs in Ihrer Nähe gefunden werden.');
      return;
    }

    const coords = nearest.location?.coordinates || nearest.business?.location?.coordinates;
    if (!coords) return;
    const [lng, lat] = coords;

    setNearestToiletCoords({ latitude: lat, longitude: lng });
    setSelectedToilet(nearest);
    bottomSheetRef.current?.expand();

    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: lat, longitude: lng },
        ],
        { edgePadding: { top: 120, right: 60, bottom: 380, left: 60 }, animated: true }
      );
    }
  }, [location, toilets, calculateDistance]);

  /**
   * Filter toilets by search query
   */
  const filteredToilets = useMemo(() => {
    if (!searchQuery.trim()) {
      console.log('[MapScreen] filteredToilets (no search):', toilets.length);
      return toilets;
      }

    const query = searchQuery.toLowerCase();
    const filtered = toilets.filter((toilet: any) => {
      const businessName = toilet.business?.name?.toLowerCase() || toilet.business?.businessName?.toLowerCase() || '';
      const address = typeof toilet.business?.address === 'string' 
        ? toilet.business.address.toLowerCase()
        : `${toilet.business?.address?.street || ''}, ${toilet.business?.address?.city || ''}`.toLowerCase();
      const city = toilet.business?.address?.city?.toLowerCase() || '';

      return (
        businessName.includes(query) ||
        address.includes(query) ||
        city.includes(query)
      );
    });
    
    console.log('[MapScreen] filteredToilets (with search):', filtered.length);
    return filtered;
  }, [toilets, searchQuery]);

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

  const handleSuggestionSelect = async (suggestion: GeocodingSuggestion) => {
    const cityName = suggestion.city || suggestion.displayName.split(',')[0] || suggestion.displayName;
    
    setSearchQuery(cityName);
    setShowSuggestions(false);
    setSearchSuggestions([]);
    Keyboard.dismiss();

    setSearchedLocation({ lat: suggestion.lat, lng: suggestion.lng });
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: suggestion.lat,
        longitude: suggestion.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }

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
      setSearchedLocation({ lat: result.lat, lng: result.lng });
      
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

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <PaperText variant="bodyMedium" style={{ marginTop: 12, color: '#64748b' }}>
          Standort wird ermittelt...
        </PaperText>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={userLocation}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Navigation Polyline — user to nearest toilet */}
        {nearestToiletCoords && location && (
          <Polyline
            coordinates={[
              { latitude: location.latitude, longitude: location.longitude },
              nearestToiletCoords,
            ]}
            strokeColor="#0891b2"
            strokeWidth={3}
            lineDashPattern={[8, 6]}
          />
        )}

        {/* Toilet Markers */}
        {filteredToilets.length > 0 ? (
          filteredToilets.map((toilet: any) => {
            const hasLocation = !!(toilet.location?.coordinates || toilet.business?.location?.coordinates);
            if (!hasLocation) {
              console.warn('[MapScreen] Skipping toilet without location:', toilet._id);
              return null;
            }
            return (
              <ToiletMarker
                key={toilet._id}
                toilet={toilet}
                onPress={() => handleMarkerPress(toilet)}
                isSelected={selectedToilet?._id === toilet._id}
      />
            );
          })
        ) : (
          <View style={{ position: 'absolute', top: 100, left: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 8 }}>
            <Text style={{ textAlign: 'center', color: '#666' }}>
              {toiletsLoading ? 'Wird geladen...' : toilets.length === 0 ? 'Keine WCs in Ihrer Nähe gefunden' : 'Keine Suchergebnisse'}
            </Text>
          </View>
        )}
      </MapView>

      {/* Search Bar Overlay */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="map-search" size={20} color="#0891b2" style={styles.searchIcon} />
          <TextInput
            placeholder="WC oder Ort suchen..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (!text.trim()) {
                setSearchSuggestions([]);
                setShowSuggestions(false);
                setSearchedLocation(null);
              }
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {isSearchingLocation ? (
            <ActivityIndicator size="small" color="#0891b2" style={styles.searchRight} />
          ) : searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchSuggestions([]);
                setShowSuggestions(false);
                setSearchedLocation(null);
              }}
              style={styles.searchRight}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Location Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <View style={styles.suggestionsCard}>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion.displayName + index}
                onPress={() => handleSuggestionSelect(suggestion)}
                style={[
                  styles.suggestionItem,
                  index < searchSuggestions.length - 1 && styles.suggestionDivider,
                ]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#0891b2" style={{ marginRight: 8 }} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Sheet for Toilet Details */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheet}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedToilet && (
            <ToiletDetailsSheet
              toilet={selectedToilet}
              userLocation={userLocation}
              onBookPress={handleBooking}
            />
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* Bottom Sheet for Business List - Always visible at 50% max */}
      <BottomSheet
        ref={businessListSheetRef}
        index={1}
        snapPoints={businessListSnapPoints}
        enablePanDownToClose={false}
        enableOverDrag={false}
        backgroundStyle={styles.bottomSheet}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        animateOnMount={true}
      >
        <BottomSheetFlatList
          data={businessesWithDistance}
          keyExtractor={(item: { business: Business; distance?: number }) => item.business._id}
          renderItem={({ item }: { item: { business: Business; distance?: number } }) => (
            <BusinessCard
              business={item.business}
              distance={item.distance}
              minFee={minFeeByBusinessId[item.business._id]}
              onPress={handleBusinessPress}
            />
          )}
          contentContainerStyle={styles.businessListContent}
          ListHeaderComponent={
            <View style={styles.businessListHeader}>
              <PaperText variant="headlineSmall" style={styles.businessListTitle}>
                WCs in der Nähe
              </PaperText>
              {businessesLoading && businesses.length === 0 && (
                <ActivityIndicator size="small" style={styles.businessListLoading} />
              )}
            </View>
          }
          ListEmptyComponent={
            businessesLoading ? (
              <View style={styles.businessListEmpty}>
                <ActivityIndicator size="large" />
                <Text style={styles.businessListEmptyText}>WCs werden geladen...</Text>
              </View>
            ) : businessesError ? (
              <View style={styles.businessListEmpty}>
                <Text style={styles.businessListErrorText}>{businessesError}</Text>
              </View>
            ) : (
              <View style={styles.businessListEmpty}>
                <Text style={styles.businessListEmptyText}>Keine WCs gefunden</Text>
                {searchQuery && (
                  <Text style={styles.businessListEmptySubtext}>Versuchen Sie einen anderen Suchbegriff</Text>
                )}
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={businessesRefreshing}
              onRefresh={handleRefreshBusinesses}
            />
          }
        />
      </BottomSheet>

      {/* Navigate to Nearest WC FAB — rendered after sheets so it appears on top */}
      <FAB
        icon="navigation-variant"
        style={styles.navigationFab}
        onPress={handleNavigateToNearest}
        size="medium"
        color="#fff"
      />

      {/* Center on User FAB */}
      <FAB
        icon="crosshairs-gps"
        style={styles.locationFab}
        onPress={centerOnUser}
        size="medium"
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    elevation: 6,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(8,145,178,0.12)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    paddingVertical: 0,
    height: 52,
  },
  searchRight: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(8,145,178,0.08)',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
  },
  navigationFab: {
    position: 'absolute',
    right: 16,
    bottom: 160,
    backgroundColor: '#0891b2',
    elevation: 6,
  },
  locationFab: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: '#fff',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetIndicator: {
    backgroundColor: '#E0E0E0',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  businessListContent: {
    padding: 16,
  },
  businessListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  businessListTitle: {
    fontWeight: 'bold',
  },
  businessListLoading: {
    marginLeft: 8,
  },
  businessListEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  businessListEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: 12,
  },
  businessListEmptySubtext: {
    opacity: 0.5,
    marginTop: 8,
  },
  businessListErrorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 12,
  },
});
