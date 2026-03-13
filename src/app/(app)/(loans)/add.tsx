import React, { useMemo } from 'react';
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
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useLoanStore } from '@/store/use-loan-store';
import { LoanType } from '@/types/loan';
import { formatCurrency } from '@/utils/currency-formatter';

const schema = z.object({
  name: z.string().min(1, 'Loan name is required'),
  lenderName: z.string().min(1, 'Lender name is required'),
  type: z.enum(['home', 'car', 'personal', 'education', 'other'] as const),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().min(0, 'Rate must be 0 or more').max(100, 'Rate cannot exceed 100%'),
  emiAmount: z.number().positive('EMI amount must be greater than 0'),
  emiDay: z.number().min(1).max(28),
  startDate: z.number(),
  tenureMonths: z.number().positive('Tenure must be greater than 0'),
});

type FormData = z.infer<typeof schema>;

const LOAN_TYPES: { key: LoanType; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'car', label: 'Car', icon: '🚗' },
  { key: 'personal', label: 'Personal', icon: '👤' },
  { key: 'education', label: 'Education', icon: '🎓' },
  { key: 'other', label: 'Other', icon: '💰' },
];

function formatDateForInput(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function calculateEMI(principal: number, ratePA: number, tenureMonths: number): number {
  if (ratePA === 0) return principal / tenureMonths;
  const rateMonthly = ratePA / 12 / 100;
  return (
    (principal * rateMonthly * Math.pow(1 + rateMonthly, tenureMonths)) /
    (Math.pow(1 + rateMonthly, tenureMonths) - 1)
  );
}

export default function AddLoanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addLoan } = useLoanStore();

  const userId = user?.id ?? '';

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
      lenderName: '',
      type: 'personal',
      principalAmount: 0,
      interestRate: 0,
      emiAmount: 0,
      emiDay: 1,
      startDate: Date.now(),
      tenureMonths: 12,
    },
  });

  const principal = watch('principalAmount');
  const interestRate = watch('interestRate');
  const tenureMonths = watch('tenureMonths');
  const selectedType = watch('type');
  const [startDateText, setStartDateText] = React.useState(formatDateForInput(Date.now()));

  const calculatedEMI = useMemo(
    () =>
      principal > 0 && tenureMonths > 0
        ? calculateEMI(principal, interestRate, tenureMonths)
        : 0,
    [principal, interestRate, tenureMonths],
  );

  function handleStartDateChange(text: string) {
    setStartDateText(text);
    const parts = text.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const parsed = new Date(year, month - 1, day);
      if (!isNaN(parsed.getTime())) {
        setValue('startDate', parsed.getTime());
      }
    }
  }

  async function onSubmit(data: FormData) {
    try {
      await addLoan(userId, {
        name: data.name,
        lenderName: data.lenderName,
        principalAmount: data.principalAmount,
        interestRate: data.interestRate,
        emiAmount: data.emiAmount,
        emiDay: data.emiDay,
        startDate: data.startDate,
        tenureMonths: data.tenureMonths,
        type: data.type,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to add loan. Please try again.');
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
            Add Loan
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Loan Type */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Loan Type
            </ThemedText>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeScroll}
                >
                  {LOAN_TYPES.map((lt) => {
                    const active = value === lt.key;
                    return (
                      <TouchableOpacity
                        key={lt.key}
                        onPress={() => onChange(lt.key)}
                        style={[
                          styles.typeChip,
                          {
                            backgroundColor: active
                              ? '#208AEF'
                              : theme.backgroundElement,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`Loan type: ${lt.label}`}
                      >
                        <Text style={styles.typeChipIcon}>{lt.icon}</Text>
                        <Text
                          style={[
                            styles.typeChipText,
                            { color: active ? '#FFFFFF' : theme.text },
                          ]}
                        >
                          {lt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            />
          </View>

          {/* Loan Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Loan Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Home Loan, Car Loan"
                error={errors.name?.message}
                leftIcon="📋"
                accessibilityLabel="Loan name"
              />
            )}
          />

          {/* Lender Name */}
          <Controller
            control={control}
            name="lenderName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Lender / Bank"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. HDFC Bank, SBI"
                error={errors.lenderName?.message}
                leftIcon="🏦"
                accessibilityLabel="Lender name"
              />
            )}
          />

          {/* Principal Amount */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Principal Amount
            </ThemedText>
            <Controller
              control={control}
              name="principalAmount"
              render={({ field: { value, onChange } }) => (
                <AmountInput value={value} onChangeValue={onChange} currency="INR" />
              )}
            />
            {errors.principalAmount && (
              <Text style={styles.errorText}>{errors.principalAmount.message}</Text>
            )}
          </View>

          {/* Interest Rate */}
          <Controller
            control={control}
            name="interestRate"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Interest Rate (% p.a.)"
                value={String(value)}
                onChangeText={(t) => onChange(parseFloat(t) || 0)}
                onBlur={onBlur}
                keyboardType="decimal-pad"
                placeholder="8.5"
                error={errors.interestRate?.message}
                leftIcon="📊"
                accessibilityLabel="Annual interest rate"
              />
            )}
          />

          {/* Tenure */}
          <Controller
            control={control}
            name="tenureMonths"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Tenure (months)"
                value={String(value)}
                onChangeText={(t) => onChange(parseInt(t) || 0)}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder="60"
                error={errors.tenureMonths?.message}
                leftIcon="📅"
                accessibilityLabel="Loan tenure in months"
              />
            )}
          />

          {/* Calculated EMI preview */}
          {calculatedEMI > 0 && (
            <Card style={styles.emiPreview}>
              <ThemedText type="small" themeColor="textSecondary">
                Calculated Monthly EMI
              </ThemedText>
              <ThemedText type="smallBold" style={styles.emiValue}>
                {formatCurrency(calculatedEMI, 'INR')}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setValue('emiAmount', Math.round(calculatedEMI))}
                accessibilityRole="button"
                accessibilityLabel="Use calculated EMI amount"
              >
                <Text style={styles.useEmiLink}>Use this value →</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* EMI Amount */}
          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Monthly EMI Amount
            </ThemedText>
            <Controller
              control={control}
              name="emiAmount"
              render={({ field: { value, onChange } }) => (
                <AmountInput value={value} onChangeValue={onChange} currency="INR" />
              )}
            />
            {errors.emiAmount && (
              <Text style={styles.errorText}>{errors.emiAmount.message}</Text>
            )}
          </View>

          {/* EMI Day */}
          <Controller
            control={control}
            name="emiDay"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="EMI Day of Month (1–28)"
                value={String(value)}
                onChangeText={(t) => onChange(parseInt(t) || 1)}
                onBlur={onBlur}
                keyboardType="number-pad"
                placeholder="5"
                error={errors.emiDay?.message}
                leftIcon="🗓"
                accessibilityLabel="Day of month for EMI"
              />
            )}
          />

          {/* Start Date */}
          <Input
            label="Start Date (DD/MM/YYYY)"
            value={startDateText}
            onChangeText={handleStartDateChange}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            leftIcon="📅"
            accessibilityLabel="Loan start date"
          />

          {/* Save */}
          <Button
            label="Add Loan"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            accessibilityLabel="Add loan"
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
  typeScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
  },
  typeChipIcon: {
    fontSize: 16,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emiPreview: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  emiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#208AEF',
  },
  useEmiLink: {
    color: '#208AEF',
    fontSize: 14,
    fontWeight: '600',
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
