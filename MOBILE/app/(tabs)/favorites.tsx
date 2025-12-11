/**
 * Favorites Screen
 * 
 * User's favorite toilets/businesses
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Favorites
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text variant="bodyLarge" style={styles.placeholder}>
          Favorites coming soon...
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

