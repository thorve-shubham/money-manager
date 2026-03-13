import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="features" />
      <Stack.Screen name="setup-currency" />
      <Stack.Screen name="setup-account" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
