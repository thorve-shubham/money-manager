import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { formatDate } from '@/utils/date-utils';

type TransactionType = 'income' | 'expense' | 'transfer';

interface TransactionRowProps {
  icon: string;
  merchant?: string;
  categoryName: string;
  amount: number;
  date: number;
  type: TransactionType;
  currency: string;
  onPress?: () => void;
}

const ICON_BG: Record<TransactionType, string> = {
  income: '#22C55E20',
  expense: '#EF444420',
  transfer: '#208AEF20',
};

export function TransactionRow({
  icon,
  merchant,
  categoryName,
  amount,
  date,
  type,
  currency,
  onPress,
}: TransactionRowProps) {
  const theme = useTheme();
  const iconBg = ICON_BG[type];
  const amountType = type === 'transfer' ? 'neutral' : type;

  const inner = (
    <View style={styles.row}>
      {/* Left: Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Middle: Name + date */}
      <View style={styles.middle}>
        <Text
          style={[styles.primaryText, { color: theme.text }]}
          numberOfLines={1}
        >
          {merchant ?? categoryName}
        </Text>
        {merchant ? (
          <Text
            style={[styles.secondaryText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {categoryName}
          </Text>
        ) : null}
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {formatDate(date, 'short')}
        </Text>
      </View>

      {/* Right: Amount */}
      <AmountDisplay amount={amount} currency={currency} type={amountType} size="md" />
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 20,
  },
  middle: {
    flex: 1,
    gap: 1,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
