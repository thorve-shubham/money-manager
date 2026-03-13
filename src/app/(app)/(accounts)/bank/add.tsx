import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useAccountStore } from '@/store/use-account-store';
import { SUPPORTED_CURRENCIES } from '@/utils/currency-formatter';

const PRESET_COLORS = [
  '#208AEF', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899',
];

const schema = z.object({
  name: z.string().min(1, 'Account name is required'),
  bankName: z.string().optional(),
  accountNumberLast4: z
    .string()
    .length(4, 'Must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Must be 4 numeric digits')
    .optional()
    .or(z.literal('')),
  initialBalance: z.number().min(0, 'Balance cannot be negative'),
  currency: z.string().min(1, 'Currency is required'),
  color: z.string().min(1),
  isDefault: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function AddBankAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addAccount } = useAccountStore();

  const userId = user?.id ?? '';
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      bankName: '',
      accountNumberLast4: '',
      initialBalance: 0,
      currency: 'INR',
      color: PRESET_COLORS[0],
      isDefault: false,
    },
  });

  const selectedCurrency = watch('currency');
  const isDefault = watch('isDefault');

  async function onSubmit(data: FormData) {
    try {
      await addAccount(userId, {
        name: data.name,
        type: 'bank',
        bankName: data.bankName || undefined,
        accountNumberLast4:
          data.accountNumberLast4 && data.accountNumberLast4.length === 4
            ? data.accountNumberLast4
            : undefined,
        initialBalance: data.initialBalance,
        currency: data.currency,
        color: data.color,
        isDefault: data.isDefault,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add account. Please try again.');
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.headerRow, { borderBottomColor: theme.backgroundElement }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={[styles.cancelButton, { color: '#208AEF' }]}>Cancel</Text>
          </TouchableOpacity>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Add Bank Account
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Account Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Account Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. SBI Savings, HDFC Current"
                error={errors.name?.message}
                leftIcon="🏦"
                accessibilityLabel="Account name"
              />
            )}
          />

          {/* Bank Name */}
          <Controller
            control={control}
            name="bankName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Bank Name (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. State Bank of India"
                leftIcon="🏛"
                accessibilityLabel="Bank name"
              />
            )}
          />

          {/* Account Number last 4 */}
          <Controller
            control={control}
            name="accountNumberLast4"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Last 4 Digits of Account (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="1234"
                keyboardType="number-pad"
                maxLength={4}
                error={errors.accountNumberLast4?.message}
                leftIcon="🔢"
                accessibilityLabel="Last 4 digits of account number"
              />
            )}
          />

          {/* Initial Balance */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Initial Balance
            </ThemedText>
            <Controller
              control={control}
              name="initialBalance"
              render={({ field: { value, onChange } }) => (
                <AmountInput
                  value={value}
                  onChangeValue={onChange}
                  currency={selectedCurrency}
                />
              )}
            />
            {errors.initialBalance && (
              <Text style={styles.errorText}>{errors.initialBalance.message}</Text>
            )}
          </View>

          {/* Currency */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Currency
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              style={[styles.currencyButton, { backgroundColor: theme.backgroundElement }]}
              accessibilityLabel="Select currency"
              accessibilityRole="button"
            >
              <Text style={[styles.currencyButtonText, { color: theme.text }]}>
                💱 {selectedCurrency} — {SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency)?.name}
              </Text>
              <Text style={[styles.currencyChevron, { color: theme.textSecondary }]}>
                {showCurrencyPicker ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showCurrencyPicker && (
              <ThemedView type="backgroundElement" style={styles.currencyList}>
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const selected = selectedCurrency === curr.code;
                  return (
                    <TouchableOpacity
                      key={curr.code}
                      onPress={() => {
                        setValue('currency', curr.code);
                        setShowCurrencyPicker(false);
                      }}
                      style={[
                        styles.currencyOption,
                        selected && { backgroundColor: '#208AEF18' },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Select currency ${curr.name}`}
                    >
                      <Text style={[styles.currencySymbol, { color: selected ? '#208AEF' : theme.textSecondary }]}>
                        {curr.symbol}
                      </Text>
                      <ThemedText type="small" style={{ color: selected ? '#208AEF' : theme.text }}>
                        {curr.code} — {curr.name}
                      </ThemedText>
                      {selected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ThemedView>
            )}
          </View>

          {/* Color Picker */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Color
            </ThemedText>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((color) => {
                const selected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      setSelectedColor(color);
                      setValue('color', color);
                    }}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selected && styles.colorSwatchSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select color ${color}`}
                    accessibilityState={{ selected }}
                  >
                    {selected && <Text style={styles.colorCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Set as Default */}
          <ThemedView type="backgroundElement" style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <ThemedText type="smallBold">Set as Default Account</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Used when adding transactions without specifying an account
              </ThemedText>
            </View>
            <Controller
              control={control}
              name="isDefault"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: theme.backgroundSelected, true: '#208AEF' }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Set as default account"
                />
              )}
            />
          </ThemedView>

          {/* Save */}
          <Button
            label="Add Account"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            accessibilityLabel="Add bank account"
          />

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  currencyButtonText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  currencyChevron: {
    fontSize: 12,
    fontWeight: '600',
  },
  currencyList: {
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  checkmark: {
    marginLeft: 'auto',
    color: '#208AEF',
    fontWeight: '700',
    fontSize: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: 4,
  },
  bottomPad: {
    height: 24,
  },
});
