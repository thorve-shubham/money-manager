import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { formatAmount } from '@/utils/currency-formatter';
import { SUPPORTED_CURRENCIES } from '@/utils/currency-formatter';

interface AmountInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  currency?: string;
  placeholder?: string;
}

function getCurrencySymbol(currency: string): string {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  return found?.symbol ?? currency;
}

export function AmountInput({
  value,
  onChangeValue,
  currency = 'INR',
  placeholder = '0.00',
}: AmountInputProps) {
  const theme = useTheme();
  // Keep raw string while user types; sync to formatted when value changes externally.
  const [rawText, setRawText] = useState<string>(
    value !== 0 ? String(value) : ''
  );

  const currencySymbol = getCurrencySymbol(currency);

  function handleChangeText(text: string) {
    // Allow only digits and a single decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const normalized =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join('')}`
        : sanitized;

    setRawText(normalized);
    const parsed = parseFloat(normalized);
    onChangeValue(isNaN(parsed) ? 0 : parsed);
  }

  // Format the display value with locale grouping (e.g. 1,00,000)
  const displayValue =
    rawText === '' || rawText === '.'
      ? rawText
      : (() => {
          const [intPart, decimalPart] = rawText.split('.');
          const formattedInt = new Intl.NumberFormat('en-IN').format(
            parseInt(intPart || '0', 10)
          );
          return decimalPart !== undefined
            ? `${formattedInt}.${decimalPart}`
            : formattedInt;
        })();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.symbol, { color: theme.textSecondary }]}>
        {currencySymbol}
      </Text>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={displayValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
        returnKeyType="done"
        accessibilityLabel="Amount input"
        maxLength={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  symbol: {
    fontSize: 24,
    fontWeight: '600',
  },
  input: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    minWidth: 80,
    textAlign: 'center',
  },
});
