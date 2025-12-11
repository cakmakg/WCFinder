/**
 * List Screen
 * 
 * Filterable list view of toilets/businesses
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { BusinessCard } from '../../src/components/business/BusinessCard';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useLocation } from '../../src/hooks/useLocation';
import { Business } from '../../src/services/businessService';

export default function ListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { location, getCurrentLocation } = useLocation();
  
  // Fetch businesses
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

  const { businesses, loading, error, refreshing, refresh } = useBusiness(businessParams);

  // Filter businesses by search query
  const filteredBusinesses = useMemo(() => {
    if (!businesses || !Array.isArray(businesses)) return [];
    if (!searchQuery.trim()) return businesses;
    
    const query = searchQuery.toLowerCase();
    return businesses.filter((business) =>
      business.name.toLowerCase().includes(query) ||
      business.address?.toLowerCase().includes(query)
    );
  }, [businesses, searchQuery]);

  // Calculate distance for each business
  const businessesWithDistance = useMemo(() => {
    if (!filteredBusinesses || !Array.isArray(filteredBusinesses)) return [];
    if (!location) return filteredBusinesses.map(b => ({ business: b }));
    
    return filteredBusinesses.map((business) => {
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
  }, [filteredBusinesses, location]);

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

  // Calculate distance (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Toilet List
        </Text>
        <Searchbar
          placeholder="Search toilets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {loading && (!businesses || businesses.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading toilets...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : businessesWithDistance.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No toilets found</Text>
          {searchQuery && (
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={businessesWithDistance}
          keyExtractor={(item) => item.business._id}
          renderItem={({ item }) => (
            <BusinessCard
              business={item.business}
              distance={item.distance}
              onPress={handleBusinessPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.5,
  },
});

