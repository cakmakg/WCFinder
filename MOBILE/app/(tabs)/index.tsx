/**
 * Map Screen (Home)
 * 
 * Main screen showing map with nearby toilets
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function MapScreen() {
  const { currentUser } = useSelector((state: any) => state.auth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Map
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Find nearby toilets
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text variant="bodyLarge" style={styles.placeholder}>
          Map view coming soon...
        </Text>
        <Text variant="bodySmall" style={styles.placeholder}>
          Willkommen, {currentUser?.firstName || currentUser?.username}!
        </Text>
      </ScrollView>
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.5,
  },
});
