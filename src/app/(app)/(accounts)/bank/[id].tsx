import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useAccountStore } from '@/store/use-account-store';
import { useCategoryStore } from '@/store/use-category-store';
import { useTransactionStore } from '@/store/use-transaction-store';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';

export default function BankAccountDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuthStore();
  const { accounts, isLoading: accountLoading, fetchAccounts } = useAccountStore();
  const { transactions, isLoading: txLoading, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const userId = user?.id ?? '';
  const [refreshing, setRefreshing] = useState(false);

  const account = useMemo<Account | undefined>(
    () => accounts.find((a) => a.id === id),
    [accounts, id],
  );

  const accountTransactions = useMemo<Transaction[]>(
    () => transactions.filter((t) => t.accountId === id),
    [transactions, id],
  );

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    await Promise.all([
      fetchAccounts(userId),
      fetchTransactions(userId, { accountId: id }),
      fetchCategories(userId),
    ]);
  }, [userId, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const isLoading = (accountLoading || txLoading) && !refreshing;

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backBtnText, { color: '#208AEF' }]}>‹ Back</Text>
        </TouchableOpacity>
        <ThemedView style={styles.loadingContainer}>
          <Text style={styles.notFoundIcon}>🏦</Text>
          <ThemedText type="smallBold">Account not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: theme.backgroundElement }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backButton, { color: '#208AEF' }]}>‹ Back</Text>
        </TouchableOpacity>
        <ThemedText type="smallBold" style={styles.headerTitle}>
          {account.name}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={accountTransactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
        }
        ListHeaderComponent={
          <>
            {/* Account info card */}
            <View style={[styles.accountCard, { borderLeftColor: account.color }]}>
              <ThemedView type="backgroundElement" style={styles.accountCardInner}>
                <View style={styles.accountCardRow}>
                  <View style={styles.accountCardInfo}>
                    <ThemedText type="smallBold" style={styles.accountName}>
                      {account.name}
                    </ThemedText>
                    {account.bankName && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {account.bankName}
                      </ThemedText>
                    )}
                    {account.accountNumberLast4 && (
                      <ThemedText type="small" themeColor="textSecondary">
                        Account •••• {account.accountNumberLast4}
                      </ThemedText>
                    )}
                  </View>
                  <View style={styles.balanceBlock}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Balance
                    </ThemedText>
                    <AmountDisplay
                      amount={account.balance}
                      currency={account.currency}
                      type="neutral"
                      size="lg"
                    />
                  </View>
                </View>
              </ThemedView>
            </View>

            {/* Transactions heading */}
            <View style={styles.txHeader}>
              <ThemedText type="smallBold" style={styles.txHeaderText}>
                Transactions
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {accountTransactions.length} total
              </ThemedText>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const cat = categoryMap[item.categoryId];
          return (
            <ThemedView style={styles.txRow}>
              <TransactionRow
                icon={cat?.icon ?? '💰'}
                merchant={item.merchant ?? undefined}
                categoryName={cat?.name ?? 'Unknown'}
                amount={item.amount}
                date={item.date}
                type={item.type}
                currency={account.currency}
                onPress={() => router.push(`/(transactions)/${item.id}`)}
              />
            </ThemedView>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.backgroundElement }]} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🧾"
            title="No transactions"
            description="No transactions recorded for this account."
          />
        }
        contentContainerStyle={accountTransactions.length === 0 ? styles.emptyContent : styles.listContent}
      />
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
    gap: 12,
  },
  notFoundIcon: {
    fontSize: 48,
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
  backBtn: {
    padding: 16,
  },
  backBtnText: {
    fontSize: 17,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 60,
  },
  accountCard: {
    margin: 16,
    borderLeftWidth: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accountCardInner: {
    padding: 16,
    borderRadius: 12,
  },
  accountCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accountCardInfo: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
  },
  balanceBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  txHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  txRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContent: {
    flex: 1,
    paddingBottom: 32,
  },
});
