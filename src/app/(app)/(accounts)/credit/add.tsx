import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
import { useCreditCardStore } from '@/store/use-credit-card-store';

const PRESET_COLORS = [
  '#1A1A2E', '#16213E', '#0F3460', '#533483',
  '#E94560', '#208AEF', '#22C55E', '#F59E0B',
];

const schema = z.object({
  name: z.string().min(1, 'Card name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  cardNumberLast4: z
    .string()
    .length(4, 'Must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Must be 4 numeric digits'),
  creditLimit: z.number().positive('Credit limit must be greater than 0'),
  billingCycleDay: z.number().min(1).max(28),
  paymentDueDay: z.number().min(1).max(28),
  color: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function AddCreditCardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addCreditCard } = useCreditCardStore();

  const userId = user?.id ?? '';
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

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
      cardNumberLast4: '',
      creditLimit: 0,
      billingCycleDay: 1,
      paymentDueDay: 20,
      color: PRESET_COLORS[0],
    },
  });

  const creditLimit = watch('creditLimit');
  const billingDay = watch('billingCycleDay');
  const paymentDay = watch('paymentDueDay');

  async function onSubmit(data: FormData) {
    try {
      await addCreditCard(userId, {
        name: data.name,
        bankName: data.bankName,
        cardNumberLast4: data.cardNumberLast4,
        creditLimit: data.creditLimit,
        billingCycleDay: data.billingCycleDay,
        paymentDueDay: data.paymentDueDay,
        color: data.color,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add credit card. Please try again.');
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
            Add Credit Card
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card Preview */}
          <ThemedView
            style={[styles.cardPreview, { backgroundColor: selectedColor }]}
          >
            <Text style={styles.previewCardName}>{watch('name') || 'Card Name'}</Text>
            <Text style={styles.previewCardNumber}>
              •••• •••• •••• {watch('cardNumberLast4') || '••••'}
            </Text>
            <Text style={styles.previewBankName}>{watch('bankName') || 'Bank Name'}</Text>
          </ThemedView>

          {/* Card Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Card Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. HDFC Regalia, SBI Elite"
                error={errors.name?.message}
                leftIcon="💳"
                accessibilityLabel="Credit card name"
              />
            )}
          />

          {/* Bank Name */}
          <Controller
            control={control}
            name="bankName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Bank Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. HDFC Bank, SBI"
                error={errors.bankName?.message}
                leftIcon="🏦"
                accessibilityLabel="Bank name"
              />
            )}
          />

          {/* Last 4 digits */}
          <Controller
            control={control}
            name="cardNumberLast4"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Last 4 Digits"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="1234"
                keyboardType="number-pad"
                maxLength={4}
                error={errors.cardNumberLast4?.message}
                leftIcon="🔢"
                accessibilityLabel="Last 4 digits of card number"
              />
            )}
          />

          {/* Credit Limit */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Credit Limit
            </ThemedText>
            <Controller
              control={control}
              name="creditLimit"
              render={({ field: { value, onChange } }) => (
                <AmountInput value={value} onChangeValue={onChange} currency="INR" />
              )}
            />
            {errors.creditLimit && (
              <Text style={styles.errorText}>{errors.creditLimit.message}</Text>
            )}
          </View>

          {/* Billing Cycle Day */}
          <Controller
            control={control}
            name="billingCycleDay"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Billing Cycle Day (1–28)"
                value={String(value)}
                onChangeText={(t) => onChange(Number(t.replace(/\D/g, '')) || 1)}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder="1"
                error={errors.billingCycleDay?.message}
                leftIcon="📅"
                accessibilityLabel="Billing cycle day"
              />
            )}
          />

          {/* Payment Due Day */}
          <Controller
            control={control}
            name="paymentDueDay"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Payment Due Day (1–28)"
                value={String(value)}
                onChangeText={(t) => onChange(Number(t.replace(/\D/g, '')) || 1)}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder="20"
                error={errors.paymentDueDay?.message}
                leftIcon="🗓"
                accessibilityLabel="Payment due day"
              />
            )}
          />

          {/* Color Picker */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Card Color
            </ThemedText>
            <View style={styles.colorGrid}>
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
                    accessibilityLabel={`Select card color ${color}`}
                    accessibilityState={{ selected }}
                  >
                    {selected && <Text style={styles.colorCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save */}
          <Button
            label="Add Credit Card"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            accessibilityLabel="Add credit card"
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
  cardPreview: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  previewCardName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '700',
  },
  previewCardNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
  },
  previewBankName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
