/**
 * Start Page — Landing Screen (Soft Glass redesign)
 *
 * Gradient hero with a 3D icon, an overlapping glass search card, and
 * staggered feature rows. Behavior is unchanged: search → map with query,
 * "Karte öffnen" → map, "Anmelden" → login.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  AppButton,
  AnimatedPressable,
  Icon,
  Icon3D,
  Card,
  Reveal,
} from '../src/components/ui';
import { icons3d } from '../src/theme/icons3d';
import { colors, gradients, space, radius, shadow } from '../src/theme/tokens';

const FEATURES = [
  { icon: icons3d.pin, title: 'In der Nähe', desc: 'Toiletten in Ihrer Nähe finden' },
  { icon: icons3d.card, title: 'Einfach buchen', desc: 'In Sekunden reservieren' },
  { icon: icons3d.locked, title: 'Sicher & geprüft', desc: 'Verifizierte Anbieter' },
] as const;

export default function StartPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const openMap = () => router.push('/(tabs)');
  const handleLogin = () => router.push('/(auth)/login');

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
      openMap();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
          <View style={styles.logoRow}>
            <View style={styles.logoTile}>
              <Icon name="toilet" size="md" color="onDark" />
            </View>
            <Text variant="title" color="primaryDark">
              WCFinder
            </Text>
          </View>
          <AnimatedPressable onPress={handleLogin} style={styles.loginBtn} accessibilityRole="button">
            <Text variant="bodyStrong" color="primary">
              Anmelden
            </Text>
          </AnimatedPressable>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Reveal>
            <View style={styles.heroIconCircle}>
              <Icon3D source={icons3d.toilet} size={64} accessibilityLabel="WCFinder" />
            </View>
          </Reveal>
          <Reveal index={1}>
            <Text variant="display" color="onDark" center style={styles.heroTitle}>
              WC in Ihrer Nähe
            </Text>
          </Reveal>
          <Reveal index={2}>
            <Text variant="bodyLg" color={colors.glassHighlight} center>
              Buchen Sie ab € 1,60 pro Tag
            </Text>
          </Reveal>
        </LinearGradient>

        {/* Overlapping search card */}
        <Reveal index={3} style={styles.searchWrap}>
          <Card elevation="lg" padding={space.base} style={styles.searchCard}>
            <TextInput
              mode="flat"
              placeholder="Stadt oder Ort suchen"
              value={searchLocation}
              onChangeText={setSearchLocation}
              onSubmitEditing={handleSearch}
              editable={!isSearching}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              left={<TextInput.Icon icon="map-search" color={colors.primary} />}
              right={
                searchLocation ? (
                  <TextInput.Icon icon="close-circle" color={colors.textTertiary} onPress={() => setSearchLocation('')} />
                ) : undefined
              }
            />
            <AppButton
              label={isSearching ? 'Suche…' : 'WCs finden'}
              onPress={handleSearch}
              loading={isSearching}
              trailingIcon="arrow-right"
              style={styles.searchButton}
            />
          </Card>
        </Reveal>

        {/* Explore without search */}
        <Reveal index={4} style={styles.exploreWrap}>
          <AppButton label="Karte öffnen" variant="secondary" icon="map-outline" onPress={openMap} />
        </Reveal>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} index={i} delay={120}>
              <Card elevation="sm" padding={space.base}>
                <View style={styles.featureRow}>
                  <View style={styles.featureIconTile}>
                    <Icon3D source={f.icon} size={44} accessibilityLabel={f.title} />
                  </View>
                  <View style={styles.featureText}>
                    <Text variant="bodyStrong">{f.title}</Text>
                    <Text variant="caption" color="textSecondary">
                      {f.desc}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size="md" color="textTertiary" />
                </View>
              </Card>
            </Reveal>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
          <Text variant="caption" color="textTertiary" center>
            © 2025 WCFinder · Alle Rechte vorbehalten
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.base,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logoTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.brandGlow,
  },
  loginBtn: {
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  hero: {
    paddingTop: space.xl,
    paddingBottom: space['3xl'],
    paddingHorizontal: space.lg,
    alignItems: 'center',
    gap: space.md,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
  },
  heroIconCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
    ...shadow.md,
  },
  heroTitle: { marginTop: space.xs },
  searchWrap: {
    marginTop: -space.xl,
    paddingHorizontal: space.base,
  },
  searchCard: { gap: space.md },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  searchButton: { marginTop: space.xxs },
  exploreWrap: { paddingHorizontal: space.base, paddingTop: space.md },
  features: {
    paddingHorizontal: space.base,
    paddingTop: space.xl,
    gap: space.md,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  featureIconTile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: 2 },
  footer: {
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    alignItems: 'center',
  },
});
