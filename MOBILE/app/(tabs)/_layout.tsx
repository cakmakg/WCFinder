/**
 * Tab Navigation Layout
 *
 * Modern bottom tab navigation (Uber/Delivery app style)
 * 3 main tabs: Map (Home), Favorites, Profile
 * Map and List are public (no auth required)
 * Profile requires authentication
 */

import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const { currentUser } = useSelector((state: any) => state.auth);
  const router = useRouter();

  // Map and List are public - no auth required
  // Profile requires authentication (handled in listeners)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: 'rgba(8,145,178,0.15)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      {/* Map Screen (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Karte',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'map-marker-radius' : 'map-marker-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* List Screen */}
      <Tabs.Screen
        name="list"
        options={{
          title: 'WC-Liste',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="toilet"
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Screen - Requires Auth */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account-circle' : 'account-circle-outline'}
              size={28}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Check if user is logged in before navigating to profile
            if (!currentUser) {
              e.preventDefault();
              // Redirect to login instead
              router.push('/(auth)/login');
            }
          },
        }}
      />

      {/* Hide Favorites Screen */}
      <Tabs.Screen
        name="favorites"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}
