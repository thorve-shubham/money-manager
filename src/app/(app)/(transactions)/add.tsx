import React, { useEffect, useState } from 'react';
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
import { CategoryChip } from '@/components/ui/CategoryChip';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useAccountStore } from '@/store/use-account-store';
import { useCategoryStore } from '@/store/use-category-store';
import { useCreditCardStore } from '@/store/use-credit-card-store';
import { useTransactionStore } from '@/store/use-transaction-store';
import { TransactionType } from '@/types/transaction';

const schema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense', 'transfer'] as const),
  categoryId: z.string().min(1, 'Please select a category'),
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  date: z.number(),
  merchant: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TRANSACTION_TYPES: { key: TransactionType; label: string; color: string }[] = [
  { key: 'income', label: 'Income', color: '#22C55E' },
  { key: 'expense', label: 'Expense', color: '#EF4444' },
  { key: 'transfer', label: 'Transfer', color: '#208AEF' },
];

function formatDateForInput(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function AddTransactionScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { creditCards, fetchCreditCards } = useCreditCardStore();
  const { addTransaction } = useTransactionStore();

  const userId = user?.id ?? '';
  const currency = 'INR';

  const [dateText, setDateText] = useState(formatDateForInput(Date.now()));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      categoryId: '',
      accountId: undefined,
      creditCardId: undefined,
      date: Date.now(),
      merchant: '',
      note: '',
    },
  });

  const selectedType = watch('type');
  const selectedCategoryId = watch('categoryId');
  const selectedAccountId = watch('accountId');
  const selectedCreditCardId = watch('creditCardId');

  useEffect(() => {
    if (!userId) return;
    fetchCategories(userId);
    fetchAccounts(userId);
    fetchCreditCards(userId);
  }, [userId]);

  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === 'both',
  );

  function handleDateChange(text: string) {
    setDateText(text);
    const parts = text.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const parsed = new Date(year, month - 1, day);
      if (!isNaN(parsed.getTime())) {
        setValue('date', parsed.getTime());
      }
    }
  }

  async function onSubmit(data: FormData) {
    try {
      await addTransaction(userId, {
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        accountId: data.accountId,
        creditCardId: data.creditCardId,
        date: data.date,
        merchant: data.merchant,
        note: data.note,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
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
            Add Transaction
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Input */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange } }) => (
              <AmountInput
                value={value}
                onChangeValue={onChange}
                currency={currency}
              />
            )}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount.message}</Text>
          )}

          {/* Type Toggle */}
          <View style={styles.sectionLabel}>
            <ThemedText type="small" themeColor="textSecondary">Type</ThemedText>
          </View>
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <View style={[styles.typeRow, { backgroundColor: theme.backgroundElement }]}>
                {TRANSACTION_TYPES.map((t) => {
                  const active = value === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => {
                        onChange(t.key);
                        setValue('categoryId', '');
                        if (t.key === 'income') {
                          setValue('creditCardId', undefined);
                        }
                      }}
                      style={[
                        styles.typePill,
                        active && { backgroundColor: t.color },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`Transaction type: ${t.label}`}
                    >
                      <Text style={[styles.typePillText, { color: active ? '#FFFFFF' : theme.textSecondary }]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />

          {/* Category Picker */}
          <View style={styles.sectionLabel}>
            <ThemedText type="small" themeColor="textSecondary">Category</ThemedText>
          </View>
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { value, onChange } }) => (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {filteredCategories.map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    icon={cat.icon}
                    name={cat.name}
                    color={cat.color}
                    selected={value === cat.id}
                    onPress={() => onChange(cat.id)}
                  />
                ))}
              </ScrollView>
            )}
          />
          {errors.categoryId && (
            <Text style={styles.errorText}>{errors.categoryId.message}</Text>
          )}

          {/* Account Selector */}
          {(selectedType === 'income' || selectedType === 'transfer') && accounts.length > 0 && (
            <>
              <View style={styles.sectionLabel}>
                <ThemedText type="small" themeColor="textSecondary">Account</ThemedText>
              </View>
              <Controller
                control={control}
                name="accountId"
                render={({ field: { value, onChange } }) => (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                  >
                    {accounts.map((acct) => {
                      const selected = value === acct.id;
                      return (
                        <TouchableOpacity
                          key={acct.id}
                          onPress={() => onChange(acct.id)}
                          style={[
                            styles.accountChip,
                            {
                              backgroundColor: selected
                                ? acct.color
                                : theme.backgroundElement,
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Select account: ${acct.name}`}
                        >
                          <Text
                            style={[
                              styles.accountChipText,
                              { color: selected ? '#FFFFFF' : theme.text },
                            ]}
                          >
                            {acct.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              />
            </>
          )}

          {/* Credit Card Selector (for expenses) */}
          {selectedType === 'expense' && creditCards.length > 0 && (
            <>
              <View style={styles.sectionLabel}>
                <ThemedText type="small" themeColor="textSecondary">
                  Account / Credit Card
                </ThemedText>
              </View>
              <Controller
                control={control}
                name="creditCardId"
                render={({ field: { value, onChange } }) => (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                  >
                    {accounts.map((acct) => {
                      const selected = selectedAccountId === acct.id && !value;
                      return (
                        <TouchableOpacity
                          key={`acct-${acct.id}`}
                          onPress={() => {
                            setValue('accountId', acct.id);
                            onChange(undefined);
                          }}
                          style={[
                            styles.accountChip,
                            {
                              backgroundColor: selected
                                ? acct.color
                                : theme.backgroundElement,
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Select account: ${acct.name}`}
                        >
                          <Text
                            style={[
                              styles.accountChipText,
                              { color: selected ? '#FFFFFF' : theme.text },
                            ]}
                          >
                            🏦 {acct.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {creditCards.map((card) => {
                      const selected = value === card.id;
                      return (
                        <TouchableOpacity
                          key={`card-${card.id}`}
                          onPress={() => {
                            onChange(card.id);
                            setValue('accountId', undefined);
                          }}
                          style={[
                            styles.accountChip,
                            {
                              backgroundColor: selected
                                ? card.color
                                : theme.backgroundElement,
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`Select credit card: ${card.name}`}
                        >
                          <Text
                            style={[
                              styles.accountChipText,
                              { color: selected ? '#FFFFFF' : theme.text },
                            ]}
                          >
                            💳 {card.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              />
            </>
          )}

          {/* Date */}
          <Input
            label="Date (DD/MM/YYYY)"
            value={dateText}
            onChangeText={handleDateChange}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            leftIcon="📅"
            accessibilityLabel="Transaction date"
          />

          {/* Merchant */}
          <Controller
            control={control}
            name="merchant"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Merchant (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Amazon, Swiggy"
                leftIcon="🏪"
                accessibilityLabel="Merchant name"
              />
            )}
          />

          {/* Note */}
          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Note (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Add a note..."
                leftIcon="📝"
                multiline
                numberOfLines={3}
                style={styles.noteInput}
                accessibilityLabel="Transaction note"
              />
            )}
          />

          {/* Save */}
          <Button
            label="Save Transaction"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            accessibilityLabel="Save transaction"
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
  sectionLabel: {
    marginBottom: -8,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  typePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  accountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  accountChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: -8,
  },
  bottomPad: {
    height: 24,
  },
});
