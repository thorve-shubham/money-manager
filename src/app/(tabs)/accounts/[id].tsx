import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { AccountForm } from '@/components/accounts';
import { accountService, type Account } from '@/services/account-service';
import { useTheme } from '@/theme';
import { spacing } from '@/theme';
import type { AccountFormValues } from '@/utils/account-validation';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [account, setAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const found = accountService.getAccountById(id);
      setAccount(found ?? null);
    }
  }, [id]);

  const handleSubmit = (values: AccountFormValues) => {
    if (!id) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      accountService.updateAccount(id, values);
      router.back();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to update account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  const initialValues: AccountFormValues = {
    bankName: account.bankName,
    sortCode: account.sortCode,
    accountNumber: account.accountNumber,
    currency: account.currency,
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Account' }} />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {submitError && (
            <ThemedText size="sm" style={[styles.error, { color: colors.danger }]}>
              {submitError}
            </ThemedText>
          )}
          <AccountForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    margin: spacing.lg,
  },
});
