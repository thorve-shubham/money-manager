import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ThemedView } from '@/components/themed-view';

type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardPadding;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ variant = 'md', onPress, children, style }: CardProps) {
  const inner = (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, styles[`padding_${variant}`], style]}
    >
      {children}
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    // Shadow for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  padding_sm: {
    padding: 12,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 24,
  },
});
