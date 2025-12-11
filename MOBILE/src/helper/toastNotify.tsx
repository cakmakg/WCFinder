/**
 * Toast Notification Helper for React Native
 * 
 * Uses react-native-paper Snackbar for notifications
 * Alternative to react-toastify (web only)
 */

import { Snackbar } from 'react-native-paper';
import { useState, useCallback } from 'react';

// Global snackbar state
let globalSnackbar: {
  show: (message: string, type: 'success' | 'error' | 'warning') => void;
} | null = null;

export const setGlobalSnackbar = (snackbar: typeof globalSnackbar) => {
  globalSnackbar = snackbar;
};

export const toastSuccessNotify = (msg: string) => {
  if (globalSnackbar) {
    globalSnackbar.show(msg, 'success');
  } else {
    console.log('✅', msg);
  }
};

export const toastErrorNotify = (msg: string) => {
  if (globalSnackbar) {
    globalSnackbar.show(msg, 'error');
  } else {
    console.error('❌', msg);
  }
};

export const toastWarnNotify = (msg: string) => {
  if (globalSnackbar) {
    globalSnackbar.show(msg, 'warning');
  } else {
    console.warn('⚠️', msg);
  }
};

// Hook for using Snackbar in components
export const useSnackbar = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'warning'>('success');

  const show = useCallback((msg: string, msgType: 'success' | 'error' | 'warning' = 'success') => {
    setMessage(msg);
    setType(msgType);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const SnackbarComponent = () => (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={type === 'error' ? 3000 : 2000}
      action={{
        label: 'OK',
        onPress: hide,
      }}
      style={{
        backgroundColor: type === 'error' ? '#d32f2f' : type === 'warning' ? '#ed6c02' : '#2e7d32',
      }}
    >
      {message}
    </Snackbar>
  );

  return { show, hide, SnackbarComponent };
};

