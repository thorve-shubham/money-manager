import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 32,
  md: 44,
  lg: 64,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 24,
};

/** Derives a deterministic background color from a string (name) */
function colorFromName(name: string): string {
  const PALETTE = [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#14B8A6', // teal
    '#208AEF', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
  const dimension = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const bgColor = colorFromName(name);
  const initials = getInitials(name);

  const containerStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor: bgColor,
    },
  ];

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[containerStyle, { backgroundColor: 'transparent' }]}
        accessibilityLabel={`${name}'s avatar`}
      />
    );
  }

  return (
    <View style={containerStyle} accessibilityLabel={`${name}'s avatar`}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
