import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface CategoryChipProps {
  icon: string;
  name: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({
  icon,
  name,
  color,
  selected = false,
  onPress,
}: CategoryChipProps) {
  const theme = useTheme();

  const chipStyle = [
    styles.chip,
    { backgroundColor: theme.backgroundElement },
    selected && { borderColor: color, borderWidth: 2, backgroundColor: `${color}18` },
  ];

  const content = (
    <View style={chipStyle}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}25` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.name,
          { color: selected ? color : theme.text },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
    alignSelf: 'flex-start',
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 13,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 100,
  },
  pressed: {
    opacity: 0.75,
  },
});
