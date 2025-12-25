/**
 * Network Status Hook
 *
 * Monitors network connectivity and provides offline support
 * Uses @react-native-community/netinfo for real-time network state
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  details: any | null;
}

/**
 * Hook to monitor network connectivity
 *
 * @returns {NetworkStatus} Current network status
 *
 * @example
 * const { isConnected, isInternetReachable } = useNetworkStatus();
 *
 * if (!isConnected) {
 *   return <OfflineScreen />;
 * }
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    details: null,
  });

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });

      console.log('[NetworkStatus] Initial state:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      };

      setNetworkStatus(newStatus);

      console.log('[NetworkStatus] State changed:', {
        isConnected: newStatus.isConnected,
        isInternetReachable: newStatus.isInternetReachable,
        type: newStatus.type,
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
};

/**
 * Hook to check if device is online
 *
 * @returns {boolean} True if connected to internet
 *
 * @example
 * const isOnline = useIsOnline();
 *
 * if (!isOnline) {
 *   showOfflineMessage();
 * }
 */
export const useIsOnline = (): boolean => {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  // If isInternetReachable is null (unknown), fall back to isConnected
  if (isInternetReachable === null) {
    return isConnected;
  }

  return isConnected && isInternetReachable;
};
