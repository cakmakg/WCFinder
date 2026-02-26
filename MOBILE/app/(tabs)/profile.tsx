/**
 * Profile Screen
 *
 * User profile with gradient hero, modern menu cards.
 * Owner/admin users see a simple dashboard section below the menu.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useOwnerStats } from '../../src/hooks/useOwnerStats';

export default function ProfileScreen() {
  const { currentUser, token, isInitializing, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const { stats, loading: statsLoading, error: statsError } = useOwnerStats(isOwner);

  useEffect(() => {
    if (__DEV__) {
      console.log('[Profile] state:', {
        hasUser: !!currentUser,
        hasToken: !!token,
        isInitializing,
        isAuthenticated,
      });
    }
  }, [currentUser, token, isInitializing, isAuthenticated]);

  const openMyBookings = () => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
    router.push('/(modals)/my-bookings');
  };

  const displayName =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.username || 'Benutzer';

  const initials =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
      : (currentUser?.username?.[0] || 'B').toUpperCase();

  const formatEuro = (value: number) =>
    value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Gradient Hero */}
      <LinearGradient
        colors={['#0891b2', '#0e7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>{displayName}</Text>
        {currentUser?.email && (
          <Text style={styles.heroEmail}>{currentUser.email}</Text>
        )}
        {currentUser?.role && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{currentUser.role}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          onPress={openMyBookings}
          style={styles.menuItem}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIconBox}>
              <MaterialCommunityIcons name="calendar-check-outline" size={22} color="#0891b2" />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>Meine Buchungen</Text>
              <Text style={styles.menuItemSubtitle}>Ihre Reservierungen anzeigen</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#9ca3af" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          onPress={logout}
          style={[styles.menuItem, styles.menuItemDanger]}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconBox, styles.menuIconBoxDanger]}>
              <MaterialCommunityIcons name="logout" size={22} color="#dc2626" />
            </View>
            <Text style={styles.menuItemTitleDanger}>Abmelden</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Owner Dashboard */}
      {isOwner && (
        <View style={styles.dashboardSection}>
          {/* Dashboard Header */}
          <LinearGradient
            colors={['#0891b2', '#0e7490']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dashboardHeader}
          >
            <MaterialCommunityIcons name="view-dashboard-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.dashboardHeaderText}>Mein Dashboard</Text>
          </LinearGradient>

          {statsLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0891b2" />
            </View>
          ) : statsError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{statsError}</Text>
            </View>
          ) : (
            <>
              {/* Today Row */}
              <View style={styles.cardRow}>
                <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                  <MaterialCommunityIcons name="calendar-today" size={20} color="#0891b2" style={styles.cardIcon} />
                  <Text style={styles.cardLabel}>Heute{'\n'}Buchungen</Text>
                  <Text style={styles.cardValue}>{stats.todayBookings}</Text>
                </View>
                <View style={[styles.statCard, { flex: 1 }]}>
                  <MaterialCommunityIcons name="currency-eur" size={20} color="#0891b2" style={styles.cardIcon} />
                  <Text style={styles.cardLabel}>Heute{'\n'}Umsatz</Text>
                  <Text style={styles.cardValue}>€{formatEuro(stats.todayRevenue)}</Text>
                </View>
              </View>

              {/* Month Row */}
              <View style={styles.cardRow}>
                <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#0891b2" style={styles.cardIcon} />
                  <Text style={styles.cardLabel}>Dieser Monat{'\n'}Buchungen</Text>
                  <Text style={styles.cardValue}>{stats.monthBookings}</Text>
                </View>
                <View style={[styles.statCard, { flex: 1 }]}>
                  <MaterialCommunityIcons name="chart-line" size={20} color="#0891b2" style={styles.cardIcon} />
                  <Text style={styles.cardLabel}>Dieser Monat{'\n'}Umsatz</Text>
                  <Text style={styles.cardValue}>€{formatEuro(stats.monthRevenue)}</Text>
                </View>
              </View>

              {/* Pending Payout — full width */}
              <View style={[styles.statCard, styles.pendingCard]}>
                <View style={styles.pendingRow}>
                  <MaterialCommunityIcons name="cash-clock" size={22} color="#f59e0b" />
                  <Text style={styles.pendingLabel}>Ausstehende Auszahlung</Text>
                  <Text style={styles.pendingValue}>€{formatEuro(stats.pendingPayout)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    paddingTop: 70,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  menuSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#0891b2',
  },
  menuItemDanger: {
    borderLeftColor: '#dc2626',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconBoxDanger: {
    backgroundColor: '#fee2e2',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  menuItemTitleDanger: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  // Dashboard
  dashboardSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dashboardHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorBox: {
    padding: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  statCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0891b2',
    padding: 14,
  },
  cardIcon: {
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  pendingCard: {
    margin: 12,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  pendingValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d97706',
  },
});
