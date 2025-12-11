/**
 * Modal Stack Layout
 * 
 * Modal screens (BusinessDetail, Payment, ScanQR, etc.)
 */

import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen 
        name="business-detail" 
        options={{ title: 'Business Details' }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ title: 'Payment' }} 
      />
      <Stack.Screen 
        name="scan-qr" 
        options={{ title: 'Scan QR Code' }} 
      />
    </Stack>
  );
}

