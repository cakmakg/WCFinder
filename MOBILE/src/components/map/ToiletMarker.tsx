/**
 * Toilet Marker Component
 *
 * Custom marker for toilets on the map
 * Modern, colorful pin design inspired by Uber/Delivery apps
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ToiletMarkerProps {
  toilet: any;
  onPress: () => void;
  isSelected?: boolean;
}

export const ToiletMarker: React.FC<ToiletMarkerProps> = ({
  toilet,
  onPress,
  isSelected = false,
}) => {
  // Get coordinates from toilet location
  const coordinates = toilet.location?.coordinates || toilet.business?.location?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    console.warn('[ToiletMarker] Invalid coordinates for toilet:', toilet._id);
    return null;
  }

  const [longitude, latitude] = coordinates;

  // Get marker color based on availability or type
  const getMarkerColor = () => {
    if (isSelected) {
      return '#6200EE'; // Purple for selected
    }

    // Green for available, orange for busy, red for occupied
    if (toilet.isAvailable === false) {
      return '#FF5252'; // Red
    }

    return '#00C853'; // Green (available)
  };

  const markerSize = isSelected ? 48 : 40;
  const iconSize = isSelected ? 24 : 20;

  return (
    <Marker
      coordinate={{
        latitude,
        longitude,
      }}
      onPress={onPress}
      tracksViewChanges={false} // Performance optimization
    >
      <View style={styles.markerContainer}>
        <View style={[
          styles.markerCircle, 
          { 
            backgroundColor: getMarkerColor(),
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
          }
        ]}>
          <MaterialCommunityIcons
            name="toilet"
            size={iconSize}
            color="#fff"
          />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
