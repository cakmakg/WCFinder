/**
 * Business Map Component
 * 
 * Displays map with business markers
 * Note: react-native-maps only works on iOS/Android, not on web
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { Business } from '../../services/businessService';
import { LocationData } from '../../hooks/useLocation';

// Conditional import for react-native-maps (only on native platforms)
let MapView: any = null;
let Marker: any = null;
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
  }
}

interface BusinessMapProps {
  businesses?: Business[];
  userLocation?: LocationData | null;
  selectedBusiness?: Business | null;
  searchedLocation?: { lat: number; lng: number } | null;
  onMarkerPress?: (business: Business) => void;
  onRegionChangeComplete?: (region: Region) => void;
}

export const BusinessMap = React.forwardRef<any, BusinessMapProps>(({
  businesses,
  userLocation,
  selectedBusiness,
  searchedLocation,
  onMarkerPress,
  onRegionChangeComplete,
}, ref) => {
  const mapRef = useRef<any>(null);
  
  // Expose mapRef to parent via forwardRef
  React.useImperativeHandle(ref, () => mapRef.current, []);

  // Initial region (default to Berlin if no user location)
  const getInitialRegion = (): Region => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Default to Berlin
    return {
      latitude: 52.5200,
      longitude: 13.4050,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  // Focus on selected business
  useEffect(() => {
    if (selectedBusiness && mapRef.current && selectedBusiness.location?.coordinates) {
      const [longitude, latitude] = selectedBusiness.location.coordinates;
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [selectedBusiness]);

  // Focus on searched location (priority over user location)
  useEffect(() => {
    if (searchedLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: searchedLocation.lat,
        longitude: searchedLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [searchedLocation]);

  // Focus on user location (if no searched location)
  useEffect(() => {
    if (userLocation && !searchedLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [userLocation, searchedLocation]);

  // Web platform için fallback
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={[styles.container, styles.webFallback]}>
        <Text style={styles.webFallbackText}>
          Map view is only available on iOS and Android
        </Text>
        <Text style={styles.webFallbackSubtext}>
          Please use the mobile app to view the map
        </Text>
        {businesses && businesses.length > 0 && (
          <Text style={styles.webFallbackCount}>
            {businesses.length} toilet{businesses.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={getInitialRegion()}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {/* User location marker (if available) */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {/* Business markers */}
        {businesses && Array.isArray(businesses) && businesses.map((business) => {
          if (!business.location?.coordinates) return null;
          
          const [longitude, latitude] = business.location.coordinates;
          const isSelected = selectedBusiness?._id === business._id;

          return (
            <Marker
              key={business._id}
              coordinate={{ latitude, longitude }}
              title={business.name || business.businessName || 'Business'}
              description={typeof business.address === 'string' ? business.address : business.address?.street || ''}
              pinColor={isSelected ? 'red' : (business.fee === 0 || business.price === 0) ? 'green' : 'orange'}
              onPress={() => onMarkerPress?.(business)}
            />
          );
        })}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  webFallbackText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  webFallbackSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  webFallbackCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
});

