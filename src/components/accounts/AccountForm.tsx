import { useState } from 'react';
import { TextInput, TouchableOpacity, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { useTheme } from '@/theme';
import { spacing, borderRadius, typography } from '@/theme';
import {
  validateAccountForm,
  isFormValid,
  type AccountFormValues,
  type AccountFormErrors,
} from '@/utils/account-validation';
import { DEFAULT_CURRENCY } from '@/constants/app';

type Props = {
  initialValues?: Partial<AccountFormValues>;
  onSubmit: (values: AccountFormValues) => void;
  submitLabel: string;
  isSubmitting: boolean;
};

export function AccountForm({ initialValues, onSubmit, submitLabel, isSubmitting }: Props) {
  const { colors } = useTheme();

  const [values, setValues] = useState<AccountFormValues>({
    bankName: initialValues?.bankName ?? '',
    sortCode: initialValues?.sortCode ?? '',
    accountNumber: initialValues?.accountNumber ?? '',
    currency: initialValues?.currency ?? DEFAULT_CURRENCY,
  });
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof AccountFormValues, val: string) => {
    const next = { ...values, [field]: val };
    setValues(next);
    if (submitted) {
      setErrors(validateAccountForm(next));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const validationErrors = validateAccountForm(values);
    setErrors(validationErrors);
    if (!isFormValid(validationErrors)) return;
    onSubmit(values);
  };

  const inputStyle = (field: keyof AccountFormValues) => [
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderColor: submitted && errors[field] ? colors.danger : colors.border,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <ThemedText size="sm" weight="medium" style={styles.label}>
          Bank Name
        </ThemedText>
        <TextInput
          style={inputStyle('bankName')}
          placeholder="e.g. Barclays"
          placeholderTextColor={colors.textDisabled}
          value={values.bankName}
          onChangeText={(v) => updateField('bankName', v)}
          returnKeyType="next"
        />
        {submitted && errors.bankName && (
          <ThemedText size="sm" style={{ color: colors.danger }}>
            {errors.bankName}
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText size="sm" weight="medium" style={styles.label}>
          Sort Code
        </ThemedText>
        <TextInput
          style={inputStyle('sortCode')}
          placeholder="12-34-56"
          placeholderTextColor={colors.textDisabled}
          value={values.sortCode}
          onChangeText={(v) => updateField('sortCode', v)}
          keyboardType="numeric"
          maxLength={8}
          returnKeyType="next"
        />
        {submitted && errors.sortCode && (
          <ThemedText size="sm" style={{ color: colors.danger }}>
            {errors.sortCode}
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText size="sm" weight="medium" style={styles.label}>
          Account Number
        </ThemedText>
        <TextInput
          style={inputStyle('accountNumber')}
          placeholder="12345678"
          placeholderTextColor={colors.textDisabled}
          value={values.accountNumber}
          onChangeText={(v) => updateField('accountNumber', v)}
          keyboardType="numeric"
          maxLength={8}
          returnKeyType="next"
        />
        {submitted && errors.accountNumber && (
          <ThemedText size="sm" style={{ color: colors.danger }}>
            {errors.accountNumber}
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText size="sm" weight="medium" style={styles.label}>
          Currency
        </ThemedText>
        <TextInput
          style={inputStyle('currency')}
          placeholder="GBP"
          placeholderTextColor={colors.textDisabled}
          value={values.currency}
          onChangeText={(v) => updateField('currency', v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={3}
          returnKeyType="done"
        />
        {submitted && errors.currency && (
          <ThemedText size="sm" style={{ color: colors.danger }}>
            {errors.currency}
          </ThemedText>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[
          styles.submitButton,
          { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
      >
        <ThemedText weight="semibold" style={{ color: colors.surface }}>
          {submitLabel}
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
