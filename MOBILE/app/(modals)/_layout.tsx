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
        name="my-bookings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="payment-success"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="owner-profile"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

