/**
 * useLocation Hook
 * 
 * Custom hook for location/GPS operations
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Location permission denied');
        Alert.alert(
          'Permission Required',
          'Please enable location permissions in your device settings to find nearby toilets.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      // Check permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      console.error('Error getting location:', err);
      setError(err.message || 'Failed to get location');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  // Watch location (for real-time updates)
  const watchLocation = useCallback(async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          };
          setLocation(locationData);
        }
      );

      return subscription;
    } catch (err: any) {
      console.error('Error watching location:', err);
      setError(err.message || 'Failed to watch location');
      return null;
    }
  }, [requestPermission]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }, []);

  // Get initial permission status
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status);
    });
  }, []);

  return {
    location,
    loading,
    error,
    permissionStatus,
    getCurrentLocation,
    watchLocation,
    calculateDistance,
    requestPermission,
  };
};

