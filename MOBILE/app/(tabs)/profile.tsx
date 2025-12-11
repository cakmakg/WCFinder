/**
 * Profile Screen
 * 
 * User profile, payment history, settings, logout
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useAuth } from '../../src/hooks/useAuth';

export default function ProfileScreen() {
  const { currentUser } = useSelector((state: any) => state.auth);
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Profilinformationen
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Benutzername:</Text>
            <Text style={styles.value}>{currentUser?.username}</Text>
          </View>
          {currentUser?.email && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>E-Mail:</Text>
              <Text style={styles.value}>{currentUser.email}</Text>
            </View>
          )}
          {currentUser?.firstName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Vorname:</Text>
              <Text style={styles.value}>{currentUser.firstName}</Text>
            </View>
          )}
          {currentUser?.lastName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nachname:</Text>
              <Text style={styles.value}>{currentUser.lastName}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Rolle:</Text>
            <Text style={styles.value}>{currentUser?.role}</Text>
          </View>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Button
        mode="outlined"
        onPress={logout}
        style={styles.logoutButton}
        textColor="#d32f2f"
      >
        Abmelden
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 20,
  },
  logoutButton: {
    marginTop: 10,
    borderColor: '#d32f2f',
  },
});

