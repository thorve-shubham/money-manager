import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { Button } from '@/components/ui/Button';
import { CreditCardWidget } from '@/components/ui/CreditCardWidget';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useCategoryStore } from '@/store/use-category-store';
import { useCreditCardStore } from '@/store/use-credit-card-store';
import { useTransactionStore } from '@/store/use-transaction-store';
import { CreditCard, CreditCardStatement } from '@/types/credit-card';
import { Category } from '@/types/category';
import { daysUntil, formatDate } from '@/utils/date-utils';
import { formatCurrency } from '@/utils/currency-formatter';

function getPaymentDueDate(paymentDueDay: number): Date {
  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth(), paymentDueDay);
  if (due.getTime() < now.getTime()) {
    due.setMonth(due.getMonth() + 1);
  }
  return due;
}

function getStatementDate(billingCycleDay: number): Date {
  const now = new Date();
  const stmt = new Date(now.getFullYear(), now.getMonth(), billingCycleDay);
  if (stmt.getTime() < now.getTime()) {
    stmt.setMonth(stmt.getMonth() + 1);
  }
  return stmt;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.statCard}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      {sub && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.statSub}>
          {sub}
        </ThemedText>
      )}
    </ThemedView>
  );
}

export default function CreditCardDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuthStore();
  const { creditCards, isLoading: cardLoading, fetchCreditCards, getStatements, markStatementPaid } =
    useCreditCardStore();
  const { transactions, isLoading: txLoading, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();

  const userId = user?.id ?? '';
  const currency = 'INR';
  const [refreshing, setRefreshing] = useState(false);
  const [statements, setStatements] = useState<CreditCardStatement[]>([]);

  const card = useMemo<CreditCard | undefined>(
    () => creditCards.find((c) => c.id === id),
    [creditCards, id],
  );

  const cardTransactions = useMemo(
    () => transactions.filter((t) => t.creditCardId === id),
    [transactions, id],
  );

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const currentCycleSpend = useMemo(
    () => cardTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0),
    [cardTransactions],
  );

  const loadData = useCallback(async () => {
    if (!userId || !id) return;
    await Promise.all([
      fetchCreditCards(userId),
      fetchTransactions(userId, { creditCardId: id }),
      fetchCategories(userId),
    ]);
    const stmts = await getStatements(id);
    setStatements(stmts);
  }, [userId, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  function handleMarkPaid() {
    const unpaid = statements.find((s) => !s.isPaid);
    if (!unpaid) {
      Alert.alert('No Statement', 'No outstanding statement to mark as paid.');
      return;
    }
    Alert.alert(
      'Mark as Paid',
      `Mark statement of ${formatCurrency(unpaid.totalDue, currency)} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await markStatementPaid(unpaid.id, unpaid.totalDue);
            await loadData();
          },
        },
      ],
    );
  }

  const isLoading = (cardLoading || txLoading) && !refreshing;

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnContainer}>
          <Text style={[styles.backButton, { color: '#208AEF' }]}>‹ Back</Text>
        </TouchableOpacity>
        <ThemedView style={styles.loadingContainer}>
          <Text style={styles.notFoundIcon}>💳</Text>
          <ThemedText type="smallBold">Card not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const usageRatio = card.creditLimit > 0 ? currentCycleSpend / card.creditLimit : 0;
  const availableCredit = Math.max(0, card.creditLimit - currentCycleSpend);
  const paymentDueDate = getPaymentDueDate(card.paymentDueDay);
  const statementDate = getStatementDate(card.billingCycleDay);
  const daysToStatement = daysUntil(statementDate.getTime());
  const daysToPayment = daysUntil(paymentDueDate.getTime());

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
          {card.name}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={cardTransactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
        }
        ListHeaderComponent={
          <>
            {/* Card Widget */}
            <View style={styles.cardWidgetContainer}>
              <CreditCardWidget
                name={card.name}
                bankName={card.bankName}
                cardNumberLast4={card.cardNumberLast4}
                creditLimit={card.creditLimit}
                usedAmount={currentCycleSpend}
                color={card.color}
                currency={currency}
              />
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Current Cycle Spend"
                value={formatCurrency(currentCycleSpend, currency)}
                sub={`${Math.round(usageRatio * 100)}% of limit`}
              />
              <StatCard
                label="Available Credit"
                value={formatCurrency(availableCredit, currency)}
                sub={`Limit: ${formatCurrency(card.creditLimit, currency)}`}
              />
              <StatCard
                label="Statement Date"
                value={`${daysToStatement}d`}
                sub={formatDate(statementDate.getTime(), 'short')}
              />
              <StatCard
                label="Payment Due"
                value={`${daysToPayment}d`}
                sub={formatDate(paymentDueDate.getTime(), 'short')}
              />
            </View>

            {/* Usage bar */}
            <View style={styles.usageSection}>
              <ProgressBar
                progress={usageRatio}
                color={usageRatio >= 0.9 ? '#EF4444' : usageRatio >= 0.7 ? '#F59E0B' : '#22C55E'}
                height={8}
                showLabel
              />
            </View>

            {/* Mark as Paid */}
            <View style={styles.markPaidContainer}>
              <Button
                label="Mark as Paid"
                onPress={handleMarkPaid}
                variant="primary"
                size="md"
                fullWidth
                accessibilityLabel="Mark statement as paid"
              />
            </View>

            {/* Transactions heading */}
            <View style={styles.txHeader}>
              <ThemedText type="smallBold" style={styles.txHeaderText}>
                Transactions
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {cardTransactions.length} total
              </ThemedText>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const cat = categoryMap[item.categoryId];
          return (
            <ThemedView style={styles.txRow}>
              <TransactionRow
                icon={cat?.icon ?? '💳'}
                merchant={item.merchant ?? undefined}
                categoryName={cat?.name ?? 'Unknown'}
                amount={item.amount}
                date={item.date}
                type={item.type}
                currency={currency}
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
            icon="💳"
            title="No transactions"
            description="No transactions recorded for this card."
          />
        }
        contentContainerStyle={cardTransactions.length === 0 ? styles.emptyContent : styles.listContent}
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
  backBtnContainer: {
    padding: 16,
  },
  headerSpacer: {
    width: 60,
  },
  cardWidgetContainer: {
    margin: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 11,
  },
  usageSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  markPaidContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
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
