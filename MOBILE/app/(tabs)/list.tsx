/**
 * List Screen
 * 
 * Filterable list view of toilets/businesses
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Searchbar, Card, Chip } from 'react-native-paper';
import { useState } from 'react';

export default function ListScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Toilet List
        </Text>
        <Searchbar
          placeholder="Search toilets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <ScrollView style={styles.content}>
        <Text variant="bodyLarge" style={styles.placeholder}>
          List view coming soon...
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
    marginBottom: 16,
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 8,
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

