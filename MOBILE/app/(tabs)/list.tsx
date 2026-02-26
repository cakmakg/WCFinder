/**
 * List Screen
 *
 * Filterable list view of toilets/businesses with gradient header
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BusinessCard } from '../../src/components/business/BusinessCard';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useToilets } from '../../src/hooks/useToilets';
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

  // Fetch toilets for fee data (location-based, same params as businesses)
  const toiletParams = useMemo(() => location
    ? { latitude: location.latitude, longitude: location.longitude, radius: 10 }
    : undefined
  , [location?.latitude, location?.longitude]);
  const { toilets } = useToilets(toiletParams, { enabled: !!location });

  // Compute minimum toilet fee per business
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
    const R = 6371;
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
      {/* Gradient Header */}
      <LinearGradient
        colors={['#0891b2', '#0e7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>WC in der Nähe</Text>
            <Text style={styles.headerSubtitle}>Finden Sie eine Toilette</Text>
          </View>
          <View style={styles.headerIconCircle}>
            <MaterialCommunityIcons name="toilet" size={32} color="#0891b2" />
          </View>
        </View>
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="WCs suchen..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#0891b2"
          inputStyle={{ color: '#0f172a' }}
        />
      </View>

      {/* Content */}
      {loading && (!businesses || businesses.length === 0) ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#0891b2" />
          <Text style={styles.stateText}>WCs werden geladen...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#d32f2f" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : businessesWithDistance.length === 0 ? (
        <View style={styles.stateContainer}>
          <MaterialCommunityIcons name="toilet" size={56} color="rgba(8,145,178,0.25)" />
          <Text style={styles.emptyText}>Keine WCs gefunden</Text>
          {searchQuery && (
            <Text style={styles.emptySubtext}>Versuchen Sie einen anderen Suchbegriff</Text>
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
              minFee={minFeeByBusinessId[item.business._id]}
              onPress={handleBusinessPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0891b2"
              colors={['#0891b2']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  searchbar: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  stateText: {
    marginTop: 4,
    opacity: 0.6,
    color: '#0f172a',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
