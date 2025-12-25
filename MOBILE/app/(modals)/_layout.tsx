/**
 * Modal Stack Layout
 * 
 * Modal screens (BusinessDetail, Payment, ScanQR, etc.)
 */

import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen
        name="business-detail"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="payment"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="scan-qr"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

