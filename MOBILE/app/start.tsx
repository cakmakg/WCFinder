/**
 * Start Page - Landing Screen
 * 
 * Similar to CLIENT's StartPage
 * Welcome screen with hero section, login button, and navigation to map
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StartPage() {
  const theme = useTheme();
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleGetStarted = () => {
    router.push('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSearch = () => {
    if (searchLocation.trim()) {
      setIsSearching(true);
      Keyboard.dismiss();
      // Navigate to map with search query
      router.push({
        pathname: '/(tabs)',
        params: { search: encodeURIComponent(searchLocation.trim()) },
      });
      // Reset searching state after navigation
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    } else {
      handleGetStarted();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="toilet" size={24} color="white" />
          </View>
          <Text variant="headlineSmall" style={styles.logoText}>
            WCFinder
          </Text>
        </View>
        <Button
          mode="outlined"
          onPress={handleLogin}
          style={styles.loginButton}
          labelStyle={styles.loginButtonLabel}
        >
          Login
        </Button>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <Text variant="displaySmall" style={styles.heroTitle}>
              Find Toilets Near You
            </Text>
            <Text variant="bodyLarge" style={styles.heroSubtitle}>
              Buche ab € 1.60 pro Tag
            </Text>

            {/* Search Box */}
            <View style={styles.searchBox}>
              <TextInput
                mode="outlined"
                placeholder="Standort suchen"
                value={searchLocation}
                onChangeText={setSearchLocation}
                onSubmitEditing={handleSearch}
                style={styles.searchInput}
                left={<TextInput.Icon icon="map-search" />}
                right={
                  searchLocation ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => setSearchLocation('')}
                    />
                  ) : (
                    <TextInput.Icon
                      icon="crosshairs-gps"
                      onPress={() => {
                        // Get current location
                        handleGetStarted();
                      }}
                    />
                  )
                }
                editable={!isSearching}
              />
              <Button
                mode="contained"
                onPress={handleSearch}
                loading={isSearching}
                disabled={isSearching}
                style={styles.searchButton}
                contentStyle={styles.searchButtonContent}
              >
                {isSearching ? 'Suche...' : 'Suche'}
              </Button>
            </View>

            {/* Get Started Button */}
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.getStartedButton}
              contentStyle={styles.getStartedButtonContent}
              labelStyle={styles.getStartedButtonLabel}
            >
              Get Started
            </Button>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Features
        </Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <MaterialCommunityIcons name="map-marker" size={32} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.featureTitle}>
              Find Nearby
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              Locate toilets near you
            </Text>
          </View>
          <View style={styles.featureCard}>
            <MaterialCommunityIcons name="calendar-clock" size={32} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.featureTitle}>
              Easy Booking
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              Book in seconds
            </Text>
          </View>
          <View style={styles.featureCard}>
            <MaterialCommunityIcons name="shield-check" size={32} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.featureTitle}>
              Secure
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              Safe and reliable
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerLogo}>
            <View style={[styles.logo, { width: 32, height: 32 }]}>
              <MaterialCommunityIcons name="toilet" size={20} color="white" />
            </View>
            <Text variant="titleMedium" style={styles.footerLogoText}>
              WCFinder
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.footerText}>
            © 2024 WCFinder. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#0891b2',
  },
  loginButton: {
    borderColor: '#0891b2',
  },
  loginButtonLabel: {
    color: '#0891b2',
    fontWeight: '600',
  },
  heroSection: {
    minHeight: 400,
    position: 'relative',
    backgroundColor: 'rgba(8,145,178,0.1)',
  },
  heroGradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    gap: 16,
  },
  heroTitle: {
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  searchBox: {
    width: '100%',
    gap: 12,
  },
  searchInput: {
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 8,
  },
  searchButtonContent: {
    paddingVertical: 8,
  },
  getStartedButton: {
    backgroundColor: '#0891b2',
    borderRadius: 8,
    marginTop: 8,
  },
  getStartedButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  getStartedButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  featureCard: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  featureTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
  },
  footer: {
    backgroundColor: '#1e293b',
    padding: 24,
  },
  footerContent: {
    alignItems: 'center',
    gap: 12,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLogoText: {
    fontWeight: 'bold',
    color: 'white',
  },
  footerText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
});

