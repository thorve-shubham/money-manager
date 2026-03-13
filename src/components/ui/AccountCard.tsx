import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { AmountDisplay } from '@/components/ui/AmountDisplay';

interface AccountCardProps {
  name: string;
  bankName?: string;
  balance: number;
  currency: string;
  color: string;
  accountNumberLast4?: string;
  isDefault: boolean;
  onPress?: () => void;
}

export function AccountCard({
  name,
  bankName,
  balance,
  currency,
  color,
  accountNumberLast4,
  isDefault,
  onPress,
}: AccountCardProps) {
  const theme = useTheme();

  const inner = (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      {/* Colored left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: color }]} />

      <View style={styles.content}>
        {/* Top row: name + default badge */}
        <View style={styles.topRow}>
          <View style={styles.nameBlock}>
            <Text style={[styles.accountName, { color: theme.text }]} numberOfLines={1}>
              {name}
            </Text>
            {bankName ? (
              <Text style={[styles.bankName, { color: theme.textSecondary }]} numberOfLines={1}>
                {bankName}
              </Text>
            ) : null}
          </View>
          {isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.defaultBadgeText, { color }]}>Default</Text>
            </View>
          )}
        </View>

        {/* Bottom row: balance + last 4 */}
        <View style={styles.bottomRow}>
          <AmountDisplay amount={balance} currency={currency} type="neutral" size="lg" />
          {accountNumberLast4 ? (
            <Text style={[styles.accountNumber, { color: theme.textSecondary }]}>
              •••• {accountNumberLast4}
            </Text>
          ) : null}
        </View>
      </View>
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
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
  },
  bankName: {
    fontSize: 12,
    fontWeight: '500',
  },
  defaultBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  accountNumber: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
