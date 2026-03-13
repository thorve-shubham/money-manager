import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/utils/currency-formatter';

interface CreditCardWidgetProps {
  name: string;
  bankName: string;
  cardNumberLast4: string;
  creditLimit: number;
  usedAmount: number;
  color: string;
  currency: string;
  onPress?: () => void;
}

/**
 * Standard credit card aspect ratio is 85.6mm x 53.98mm = ~1.586
 * We set width to 100% and compute height via paddingBottom trick.
 */
export function CreditCardWidget({
  name,
  bankName,
  cardNumberLast4,
  creditLimit,
  usedAmount,
  color,
  currency,
  onPress,
}: CreditCardWidgetProps) {
  const availableAmount = Math.max(0, creditLimit - usedAmount);
  const usageProgress = creditLimit > 0 ? usedAmount / creditLimit : 0;
  const usagePercent = Math.round(usageProgress * 100);

  // Choose warning color based on usage
  const progressColor =
    usageProgress >= 0.9
      ? '#EF4444'
      : usageProgress >= 0.7
      ? '#F59E0B'
      : '#22C55E';

  const inner = (
    <View style={[styles.card, { backgroundColor: color }]}>
      {/* Decorative circles for skeuomorphic feel */}
      <View style={[styles.circleLeft, { backgroundColor: `${adjustBrightness(color, 1.15)}` }]} />
      <View style={[styles.circleRight, { backgroundColor: `${adjustBrightness(color, 1.25)}` }]} />

      {/* Top row: bank name */}
      <View style={styles.topRow}>
        <Text style={styles.bankName}>{bankName}</Text>
        <View style={styles.chipSimulation}>
          <View style={styles.chipInner} />
        </View>
      </View>

      {/* Card number */}
      <Text style={styles.cardNumber}>
        •••• •••• •••• {cardNumberLast4}
      </Text>

      {/* Card holder name */}
      <Text style={styles.cardName} numberOfLines={1}>
        {name}
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Usage section */}
      <View style={styles.usageSection}>
        <View style={styles.usageRow}>
          <View>
            <Text style={styles.usageLabel}>Used</Text>
            <Text style={styles.usageAmount}>
              {formatCurrency(usedAmount, currency)}
            </Text>
          </View>
          <View style={styles.usageRight}>
            <Text style={[styles.usageLabel, styles.alignRight]}>Available</Text>
            <Text style={styles.usageAmount}>
              {formatCurrency(availableAmount, currency)}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrapper}>
          <ProgressBar
            progress={usageProgress}
            color={progressColor}
            height={5}
          />
          <Text style={styles.usagePercent}>{usagePercent}% used</Text>
        </View>

        {/* Limit */}
        <Text style={styles.limitText}>
          Limit: {formatCurrency(creditLimit, currency)}
        </Text>
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

/**
 * Lighten a hex color by a factor (>1 = lighter, <1 = darker).
 * Used for decorative circles on the card.
 */
function adjustBrightness(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  const r = Math.min(255, Math.round(parseInt(clean.slice(0, 2), 16) * factor));
  const g = Math.min(255, Math.round(parseInt(clean.slice(2, 4), 16) * factor));
  const b = Math.min(255, Math.round(parseInt(clean.slice(4, 6), 16) * factor));
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    // Maintain ~1.586 aspect ratio via minHeight (approx)
    aspectRatio: 1.586,
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  // Decorative overlapping circles
  circleLeft: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -60,
    right: 20,
    opacity: 0.45,
  },
  circleRight: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    top: -20,
    right: -30,
    opacity: 0.35,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bankName: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Simulated EMV chip
  chipSimulation: {
    width: 32,
    height: 24,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInner: {
    width: 20,
    height: 15,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 4,
  },
  cardName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  usageSection: {
    gap: 6,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alignRight: {
    textAlign: 'right',
  },
  usageAmount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  usageRight: {
    alignItems: 'flex-end',
  },
  progressWrapper: {
    gap: 3,
  },
  usagePercent: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
  },
  limitText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.85,
  },
});
