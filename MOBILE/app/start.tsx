/**
 * Start Page - Landing Screen
 *
 * Welcome screen with gradient hero, search, and feature cards
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FEATURES = [
  { icon: 'map-marker-radius', title: 'In der Nähe', desc: 'Toiletten in Ihrer Nähe finden' },
  { icon: 'calendar-clock', title: 'Einfach buchen', desc: 'In Sekunden buchen' },
  { icon: 'shield-check', title: 'Sicher & zuverlässig', desc: 'Geprüfte Anbieter' },
] as const;

export default function StartPage() {
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
      router.push({
        pathname: '/(tabs)',
        params: { search: encodeURIComponent(searchLocation.trim()) },
      });
      setTimeout(() => setIsSearching(false), 300);
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
          <Text variant="headlineSmall" style={styles.logoText}>WCFinder</Text>
        </View>
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton} activeOpacity={0.7}>
          <Text style={styles.loginButtonLabel}>Anmelden</Text>
        </TouchableOpacity>
      </View>

      {/* Gradient Hero */}
      <LinearGradient
        colors={['#0891b2', '#0e7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroIconCircle}>
          <MaterialCommunityIcons name="toilet" size={40} color="#0891b2" />
        </View>
        <Text variant="displaySmall" style={styles.heroTitle}>
          WC in Ihrer Nähe finden
        </Text>
        <Text variant="bodyLarge" style={styles.heroSubtitle}>
          Buchen Sie ab € 1.60 pro Tag
        </Text>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <TextInput
            mode="outlined"
            placeholder="Standort suchen"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchLocation}
            onChangeText={setSearchLocation}
            onSubmitEditing={handleSearch}
            style={styles.searchInput}
            outlineColor="rgba(255,255,255,0.4)"
            activeOutlineColor="#fff"
            textColor="#fff"
            left={<TextInput.Icon icon="map-search" color="rgba(255,255,255,0.8)" />}
            right={
              searchLocation ? (
                <TextInput.Icon
                  icon="close"
                  color="rgba(255,255,255,0.8)"
                  onPress={() => setSearchLocation('')}
                />
              ) : (
                <TextInput.Icon
                  icon="crosshairs-gps"
                  color="rgba(255,255,255,0.8)"
                  onPress={handleGetStarted}
                />
              )
            }
            editable={!isSearching}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={[styles.searchButton, isSearching && { opacity: 0.7 }]}
            activeOpacity={0.85}
            disabled={isSearching}
          >
            <Text style={styles.searchButtonLabel}>
              {isSearching ? 'Suche...' : 'Suche'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={handleGetStarted}
          style={styles.getStartedButton}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedButtonLabel}>Jetzt starten</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>Funktionen</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.icon} style={styles.featureCard}>
              <MaterialCommunityIcons name={f.icon} size={32} color="#0891b2" />
              <Text variant="titleMedium" style={styles.featureTitle}>{f.title}</Text>
              <Text variant="bodyMedium" style={styles.featureDescription}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerLogo}>
            <View style={[styles.logo, { width: 32, height: 32 }]}>
              <MaterialCommunityIcons name="toilet" size={20} color="white" />
            </View>
            <Text variant="titleMedium" style={styles.footerLogoText}>WCFinder</Text>
          </View>
          <Text variant="bodySmall" style={styles.footerText}>
            © 2025 WCFinder. Alle Rechte vorbehalten.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
    borderWidth: 1.5,
    borderColor: '#0891b2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  loginButtonLabel: {
    color: '#0891b2',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSection: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  heroIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBox: {
    width: '100%',
    gap: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  searchButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonLabel: {
    color: '#0891b2',
    fontWeight: '600',
    fontSize: 15,
  },
  getStartedButton: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 4,
  },
  getStartedButtonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  featuresSection: {
    padding: 24,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#0f172a',
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
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#0891b2',
  },
  featureTitle: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#0f172a',
    fontSize: 13,
  },
  featureDescription: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 11,
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
