// This screen is never shown — the "+" tab button opens a BottomSheet instead.
// Required by expo-router to register the tab slot.
import React from 'react';
import { View } from 'react-native';

export default function AddPlaceholder() {
  return <View />;
}
