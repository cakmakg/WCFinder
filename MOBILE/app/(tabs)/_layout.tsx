/**
 * Tab Navigation Layout
 *
 * Modern bottom tab navigation (Uber/Delivery app style)
 * 3 main tabs: Map (Home), Favorites, Profile
 * Only accessible when authenticated
 */

import { Tabs, Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { tokenStorage } from '../../src/utils/secureStorage';

export default function TabLayout() {
  const { currentUser } = useSelector((state: any) => state.auth);
  const [checked, setChecked] = useState(false);

  // Check secure storage once to avoid transient redirects while auth initializes
  useEffect(() => {
    let mounted = true;
    tokenStorage.getAccessToken().then(() => {
      if (mounted) setChecked(true);
    }).catch(() => {
      if (mounted) setChecked(true);
    });
    return () => { mounted = false; };
  }, []);

  // Redirect to auth if not authenticated and initial check finished
  if (!currentUser) {
    if (!checked) {
      // Still verifying stored token, avoid redirect yet
      return null;
    }
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200EE', // Modern purple color
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
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
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'map' : 'map-outline'}
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
          title: 'List',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'format-list-bulleted' : 'format-list-bulleted'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={28}
              color={color}
            />
          ),
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
