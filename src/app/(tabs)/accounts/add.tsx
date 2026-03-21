import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { AccountForm } from '@/components/accounts';
import { accountService } from '@/services/account-service';
import { useTheme } from '@/theme';
import { spacing } from '@/theme';
import type { AccountFormValues } from '@/utils/account-validation';

export default function AddAccountScreen() {
  const { colors } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (values: AccountFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      accountService.createAccount(values);
      router.back();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Add Account' }} />
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
            onSubmit={handleSubmit}
            submitLabel="Add Account"
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
  error: {
    margin: spacing.lg,
  },
});
