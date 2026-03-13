import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/currency-formatter';

type AmountType = 'income' | 'expense' | 'neutral';
type AmountSize = 'sm' | 'md' | 'lg';

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  type?: AmountType;
  size?: AmountSize;
}

const TYPE_COLORS: Record<AmountType, string | null> = {
  income: '#22C55E',
  expense: '#EF4444',
  neutral: null,
};

const PREFIX: Record<AmountType, string> = {
  income: '+',
  expense: '-',
  neutral: '',
};

export function AmountDisplay({
  amount,
  currency = 'INR',
  type = 'neutral',
  size = 'md',
}: AmountDisplayProps) {
  const theme = useTheme();
  const color = TYPE_COLORS[type] ?? theme.text;
  const prefix = PREFIX[type];
  const formatted = formatCurrency(Math.abs(amount), currency);

  return (
    <Text style={[styles.base, styles[`size_${size}`], { color }]}>
      {prefix}
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  size_sm: {
    fontSize: 13,
  },
  size_md: {
    fontSize: 16,
  },
  size_lg: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
});
