/**
 * useOffline Hook
 * 
 * Monitors network status and provides offline state
 */

import { useState, useEffect } from 'react';
// Note: Install with: npx expo install @react-native-community/netinfo
// import NetInfo from '@react-native-community/netinfo';
import { isOnline } from '../utils/offline';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initial check
    isOnline().then(online => {
      setIsOffline(!online);
      setIsChecking(false);
    });

    // Subscribe to network state changes
    let unsubscribe: (() => void) | null = null;
    
    try {
      const NetInfo = require('@react-native-community/netinfo');
      unsubscribe = NetInfo.addEventListener((state: any) => {
        setIsOffline(!state.isConnected);
        setIsChecking(false);
      });
    } catch (error) {
      console.warn('NetInfo not available');
      setIsChecking(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOffline,
    isOnline: !isOffline,
    isChecking,
  };
};

