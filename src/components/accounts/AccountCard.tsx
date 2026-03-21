import { TouchableOpacity, Alert, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { useTheme } from '@/theme';
import { spacing, borderRadius } from '@/theme';
import type { Account } from '@/services/account-service';

type Props = {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};

export function AccountCard({ account, onEdit, onDelete }: Props) {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete the ${account.bankName} account ending ${account.accountNumber.slice(-4)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(account),
        },
      ]
    );
  };

  return (
    <ThemedView variant="surface" style={styles.card}>
      <View style={styles.left}>
        <ThemedText size="lg" weight="semibold">
          {account.bankName}
        </ThemedText>
        <ThemedText variant="secondary" size="sm">
          {account.sortCode}{'  '}
          {account.accountNumber}
        </ThemedText>
      </View>

      <View style={styles.right}>
        <ThemedText size="xl" weight="semibold">
          {account.balance}
        </ThemedText>
        <ThemedText variant="secondary" size="xs">
          {account.currency}
        </ThemedText>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit(account)}
            style={styles.actionButton}
            accessibilityLabel={`Edit ${account.bankName} account`}
          >
            <ThemedText size="sm" style={{ color: colors.primary }}>
              Edit
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.actionButton}
            accessibilityLabel={`Delete ${account.bankName} account`}
          >
            <ThemedText size="sm" style={{ color: colors.danger }}>
              Delete
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    paddingVertical: spacing.xs,
  },
});
