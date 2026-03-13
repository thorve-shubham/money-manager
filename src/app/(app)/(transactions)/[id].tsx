import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useCategoryStore } from '@/store/use-category-store';
import { useTransactionStore } from '@/store/use-transaction-store';
import { useAccountStore } from '@/store/use-account-store';
import { useCreditCardStore } from '@/store/use-credit-card-store';
import { formatDate } from '@/utils/date-utils';
import { Transaction } from '@/types/transaction';

const TYPE_COLORS: Record<string, string> = {
  income: '#22C55E',
  expense: '#EF4444',
  transfer: '#208AEF',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuthStore();
  const { transactions, isLoading, fetchTransactions, deleteTransaction } =
    useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { creditCards, fetchCreditCards } = useCreditCardStore();

  const userId = user?.id ?? '';

  useEffect(() => {
    if (!userId) return;
    fetchTransactions(userId);
    fetchCategories(userId);
    fetchAccounts(userId);
    fetchCreditCards(userId);
  }, [userId]);

  const transaction = useMemo(
    () => transactions.find((t: Transaction) => t.id === id),
    [transactions, id],
  );

  const category = useMemo(
    () => categories.find((c) => c.id === transaction?.categoryId),
    [categories, transaction],
  );

  const account = useMemo(
    () => accounts.find((a) => a.id === transaction?.accountId),
    [accounts, transaction],
  );

  const creditCard = useMemo(
    () => creditCards.find((c) => c.id === transaction?.creditCardId),
    [creditCards, transaction],
  );

  function handleDelete() {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (transaction) {
              await deleteTransaction(transaction.id);
              router.back();
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={[styles.backButton, { color: '#208AEF' }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <ThemedView style={styles.notFound}>
          <Text style={styles.notFoundIcon}>🔍</Text>
          <ThemedText type="smallBold">Transaction not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const typeColor = TYPE_COLORS[transaction.type] ?? '#208AEF';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Navigation header */}
      <View style={[styles.headerRow, { borderBottomColor: theme.backgroundElement }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backButton, { color: '#208AEF' }]}>‹ Back</Text>
        </TouchableOpacity>
        <ThemedText type="smallBold" style={styles.headerTitle}>
          Transaction Detail
        </ThemedText>
        <TouchableOpacity
          onPress={handleDelete}
          accessibilityLabel="Delete transaction"
          accessibilityRole="button"
        >
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Hero */}
        <Card style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.categoryIcon}>{category?.icon ?? '💰'}</Text>
            <AmountDisplay
              amount={transaction.amount}
              currency={account?.currency ?? 'INR'}
              type={transaction.type === 'transfer' ? 'neutral' : transaction.type}
              size="lg"
            />
            <Badge
              label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              color={typeColor}
            />
            {transaction.merchant && (
              <ThemedText type="default" style={styles.merchantText}>
                {transaction.merchant}
              </ThemedText>
            )}
          </View>
        </Card>

        {/* Details Card */}
        <Card>
          <View style={styles.detailsContainer}>
            <DetailRow label="Category" value={category?.name ?? '—'} />
            <View style={[styles.rowDivider, { backgroundColor: theme.backgroundElement }]} />
            <DetailRow label="Date" value={formatDate(transaction.date, 'long')} />
            <View style={[styles.rowDivider, { backgroundColor: theme.backgroundElement }]} />
            {account && (
              <>
                <DetailRow label="Account" value={account.name} />
                <View style={[styles.rowDivider, { backgroundColor: theme.backgroundElement }]} />
              </>
            )}
            {creditCard && (
              <>
                <DetailRow label="Credit Card" value={creditCard.name} />
                <View style={[styles.rowDivider, { backgroundColor: theme.backgroundElement }]} />
              </>
            )}
            {transaction.note && (
              <>
                <DetailRow label="Note" value={transaction.note} />
                <View style={[styles.rowDivider, { backgroundColor: theme.backgroundElement }]} />
              </>
            )}
            <DetailRow
              label="Recurring"
              value={
                transaction.isRecurring
                  ? `Yes (${transaction.recurringInterval ?? '—'})`
                  : 'No'
              }
            />
          </View>
        </Card>

        {/* Action row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.backgroundElement }]}
            onPress={handleDelete}
            accessibilityLabel="Delete this transaction"
            accessibilityRole="button"
          >
            <Text style={styles.actionDeleteText}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  backButton: {
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 4,
    paddingRight: 8,
  },
  deleteButton: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  heroContent: {
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  merchantText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  detailsContainer: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundIcon: {
    fontSize: 48,
  },
});
