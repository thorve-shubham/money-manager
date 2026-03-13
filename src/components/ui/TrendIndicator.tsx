import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TrendIndicatorProps {
  /** Positive value = upward (green), negative = downward (red) */
  value: number;
  showSign?: boolean;
}

export function TrendIndicator({ value, showSign = true }: TrendIndicatorProps) {
  const isPositive = value >= 0;
  const color = isPositive ? '#22C55E' : '#EF4444';
  const arrow = isPositive ? '▲' : '▼';
  const absValue = Math.abs(value);
  const sign = showSign ? (isPositive ? '+' : '-') : '';

  return (
    <View style={styles.container}>
      <Text style={[styles.arrow, { color }]}>{arrow}</Text>
      <Text style={[styles.value, { color }]}>
        {sign}
        {absValue.toFixed(1)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  arrow: {
    fontSize: 10,
    fontWeight: '700',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
