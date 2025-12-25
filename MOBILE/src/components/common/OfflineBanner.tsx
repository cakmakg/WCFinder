/**
 * Offline Banner Component
 *
 * Displays a banner when the device is offline
 * Automatically shows/hides based on network connectivity
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useIsOnline } from '../../hooks/useNetworkStatus';

interface OfflineBannerProps {
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = 'İnternet bağlantısı yok',
}) => {
  const isOnline = useIsOnline();
  const [slideAnim] = React.useState(new Animated.Value(-60));

  React.useEffect(() => {
    if (!isOnline) {
      // Slide down when offline
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up when online
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
