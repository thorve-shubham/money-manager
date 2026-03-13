import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate, daysUntil } from '@/utils/date-utils';

interface LoanCardProps {
  name: string;
  lenderName: string;
  outstandingAmount: number;
  emiAmount: number;
  nextEmiDate: number;
  currency: string;
  /** Value between 0 and 1 representing percentage of loan paid off */
  progress: number;
  onPress?: () => void;
}

export function LoanCard({
  name,
  lenderName,
  outstandingAmount,
  emiAmount,
  nextEmiDate,
  currency,
  progress,
  onPress,
}: LoanCardProps) {
  const theme = useTheme();
  const days = daysUntil(nextEmiDate);
  const dueLabel =
    days === 0
      ? 'Due today'
      : days < 0
      ? `Overdue by ${Math.abs(days)}d`
      : `Due in ${days}d`;
  const dueColor = days <= 0 ? '#EF4444' : days <= 3 ? '#F59E0B' : theme.textSecondary;

  const inner = (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.loanName, { color: theme.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.lenderName, { color: theme.textSecondary }]} numberOfLines={1}>
            {lenderName}
          </Text>
        </View>
        <View style={styles.outstandingBlock}>
          <Text style={[styles.outstandingLabel, { color: theme.textSecondary }]}>
            Outstanding
          </Text>
          <AmountDisplay
            amount={outstandingAmount}
            currency={currency}
            type="expense"
            size="md"
          />
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} color="#208AEF" height={6} showLabel />
        <Text style={[styles.progressCaption, { color: theme.textSecondary }]}>
          {Math.round(progress * 100)}% paid off
        </Text>
      </View>

      {/* EMI row */}
      <View style={[styles.emiRow, { borderTopColor: theme.backgroundSelected }]}>
        <View style={styles.emiBlock}>
          <Text style={[styles.emiLabel, { color: theme.textSecondary }]}>Next EMI</Text>
          <AmountDisplay amount={emiAmount} currency={currency} type="neutral" size="sm" />
        </View>
        <View style={styles.emiDateBlock}>
          <Text style={[styles.emiLabel, { color: theme.textSecondary }]}>Due date</Text>
          <Text style={[styles.emiDate, { color: theme.text }]}>
            {formatDate(nextEmiDate, 'short')}
          </Text>
        </View>
        <View style={[styles.dueBadge, { backgroundColor: `${dueColor}18` }]}>
          <Text style={[styles.dueText, { color: dueColor }]}>{dueLabel}</Text>
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
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  loanName: {
    fontSize: 16,
    fontWeight: '700',
  },
  lenderName: {
    fontSize: 12,
    fontWeight: '500',
  },
  outstandingBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  outstandingLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressSection: {
    gap: 4,
  },
  progressCaption: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: -4,
  },
  emiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emiBlock: {
    gap: 2,
  },
  emiDateBlock: {
    gap: 2,
    flex: 1,
  },
  emiLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  emiDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  dueBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dueText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
