/**
 * Tab Navigation Layout
 * 
 * Main app navigation with bottom tabs
 * Only accessible when authenticated
 */

import { Tabs, Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenStorage } from '../../src/utils/secureStorage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
