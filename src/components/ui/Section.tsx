import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface SectionAction {
  label: string;
  onPress: () => void;
}

interface SectionProps {
  title: string;
  rightAction?: SectionAction;
  children: React.ReactNode;
}

export function Section({ title, rightAction, children }: SectionProps) {
  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <ThemedText type="smallBold" style={styles.title}>
          {title}
        </ThemedText>
        {rightAction ? (
          <Pressable
            onPress={rightAction.onPress}
            style={({ pressed }) => [pressed && styles.pressed]}
            accessibilityRole="button"
            hitSlop={8}
          >
            <ThemedText type="small" themeColor="textSecondary" style={styles.actionLabel}>
              {rightAction.label}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  actionLabel: {
    color: '#208AEF',
    fontWeight: '600',
  },
  content: {
    gap: 8,
  },
  pressed: {
    opacity: 0.6,
  },
});
