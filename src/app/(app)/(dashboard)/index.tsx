import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { Card } from '@/components/ui/Card';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { CreditCardWidget } from '@/components/ui/CreditCardWidget';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoanCard } from '@/components/ui/LoanCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { TrendIndicator } from '@/components/ui/TrendIndicator';
import { Avatar } from '@/components/ui/Avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useAccountStore } from '@/store/use-account-store';
import { useCategoryStore } from '@/store/use-category-store';
import { useCreditCardStore } from '@/store/use-credit-card-store';
import { useLoanStore } from '@/store/use-loan-store';
import { useTransactionStore } from '@/store/use-transaction-store';
import { daysUntil, formatDate, formatMonthYear, startOfMonth, endOfMonth } from '@/utils/date-utils';
import { formatCurrency } from '@/utils/currency-formatter';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getNextEmiDate(emiDay: number, startDate: number): number {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), emiDay);
  if (candidate.getTime() < now.getTime()) {
    candidate.setMonth(candidate.getMonth() + 1);
  }
  return candidate.getTime();
}

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { user } = useAuthStore();
  const { totalBalance, fetchAccounts } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { creditCards, fetchCreditCards } = useCreditCardStore();
  const { loans, fetchLoans } = useLoanStore();
  const {
    transactions,
    summary,
    selectedMonth,
    selectedYear,
    isLoading,
    fetchTransactions,
    fetchSummary,
    setSelectedMonth,
  } = useTransactionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const userId = user?.id ?? '';
  const currency = 'INR';

  const selectedDate = useMemo(
    () => new Date(selectedYear, selectedMonth, 1),
    [selectedMonth, selectedYear],
  );

  const loadData = useCallback(async () => {
    if (!userId) return;
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    await Promise.all([
      fetchTransactions(userId, {
        startDate: start.getTime(),
        endDate: end.getTime(),
        limit: 5,
      }),
      fetchSummary(userId, selectedMonth, selectedYear),
      fetchAccounts(userId),
      fetchCategories(userId),
      fetchCreditCards(userId),
      fetchLoans(userId),
    ]);
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  function navigateMonth(direction: -1 | 1) {
    const d = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(d.getMonth(), d.getFullYear());
  }

  const recentTransactions = transactions.slice(0, 5);

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const upcomingCreditCards = useMemo(
    () =>
      creditCards.filter((card) => {
        const now = new Date();
        const dueDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          card.paymentDueDay,
        );
        if (dueDate.getTime() < now.getTime()) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        return daysUntil(dueDate.getTime()) <= 7;
      }),
    [creditCards],
  );

  const upcomingLoans = useMemo(
    () =>
      loans.filter((loan) => {
        const nextEmi = getNextEmiDate(loan.emiDay, loan.startDate);
        return daysUntil(nextEmi) <= 7;
      }),
    [loans],
  );

  const incomeTrend = 0;
  const expenseTrend = 0;

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar name={user?.name ?? 'User'} avatarUrl={user?.avatarUrl} size="md" />
            <View style={styles.greetingBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                {getGreeting()},
              </ThemedText>
              <ThemedText type="smallBold">{user?.name ?? 'there'}</ThemedText>
            </View>
          </View>
          {/* Month navigator */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={() => navigateMonth(-1)}
              style={styles.monthArrow}
              accessibilityLabel="Previous month"
              accessibilityRole="button"
            >
              <Text style={[styles.monthArrowText, { color: theme.text }]}>‹</Text>
            </Pressable>
            <Text style={[styles.monthLabel, { color: theme.text }]}>
              {formatMonthYear(selectedDate)}
            </Text>
            <Pressable
              onPress={() => navigateMonth(1)}
              style={styles.monthArrow}
              accessibilityLabel="Next month"
              accessibilityRole="button"
            >
              <Text style={[styles.monthArrowText, { color: theme.text }]}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Net Worth Card */}
        <Card style={styles.netWorthCard}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.netWorthLabel}>
            Total Balance
          </ThemedText>
          <AmountDisplay amount={totalBalance} currency={currency} type="neutral" size="lg" />
        </Card>

        {/* Income / Expense Row */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryCardInner}>
              <Text style={styles.summaryIcon}>📈</Text>
              <ThemedText type="small" themeColor="textSecondary">
                Income
              </ThemedText>
              <AmountDisplay
                amount={summary?.totalIncome ?? 0}
                currency={currency}
                type="income"
                size="sm"
              />
              <TrendIndicator value={incomeTrend} />
            </View>
          </Card>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryCardInner}>
              <Text style={styles.summaryIcon}>📉</Text>
              <ThemedText type="small" themeColor="textSecondary">
                Expenses
              </ThemedText>
              <AmountDisplay
                amount={summary?.totalExpense ?? 0}
                currency={currency}
                type="expense"
                size="sm"
              />
              <TrendIndicator value={expenseTrend} />
            </View>
          </Card>
        </View>

        {/* Category Chips */}
        {categories.length > 0 && (
          <Section title="Spending by Category">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories
                .filter((c) => c.type !== 'income')
                .map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    icon={cat.icon}
                    name={cat.name}
                    color={cat.color}
                    selected={selectedCategoryId === cat.id}
                    onPress={() =>
                      setSelectedCategoryId(
                        selectedCategoryId === cat.id ? null : cat.id,
                      )
                    }
                  />
                ))}
            </ScrollView>
          </Section>
        )}

        {/* Recent Transactions */}
        <Section
          title="Recent Transactions"
          rightAction={{
            label: 'See all →',
            onPress: () => router.push('/(transactions)'),
          }}
        >
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No transactions yet"
              description="Add your first transaction to get started."
            />
          ) : (
            recentTransactions.map((tx: Transaction) => {
              const cat = categoryMap[tx.categoryId];
              return (
                <TransactionRow
                  key={tx.id}
                  icon={cat?.icon ?? '💰'}
                  merchant={tx.merchant ?? undefined}
                  categoryName={cat?.name ?? 'Unknown'}
                  amount={tx.amount}
                  date={tx.date}
                  type={tx.type}
                  currency={currency}
                  onPress={() => router.push(`/(transactions)/${tx.id}`)}
                />
              );
            })
          )}
        </Section>

        {/* Upcoming Payments */}
        {(upcomingCreditCards.length > 0 || upcomingLoans.length > 0) && (
          <Section title="Upcoming Payments">
            {upcomingCreditCards.map((card) => {
              const now = new Date();
              const dueDate = new Date(now.getFullYear(), now.getMonth(), card.paymentDueDay);
              if (dueDate.getTime() < now.getTime()) dueDate.setMonth(dueDate.getMonth() + 1);
              const days = daysUntil(dueDate.getTime());
              return (
                <Card key={card.id} onPress={() => router.push(`/(accounts)/credit/${card.id}`)}>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingIcon}>💳</Text>
                    <View style={styles.upcomingDetails}>
                      <ThemedText type="smallBold">{card.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Payment due {days === 0 ? 'today' : `in ${days}d`}
                      </ThemedText>
                    </View>
                    <Text style={styles.upcomingWarning}>⚠️</Text>
                  </View>
                </Card>
              );
            })}
            {upcomingLoans.map((loan) => {
              const nextEmi = getNextEmiDate(loan.emiDay, loan.startDate);
              const days = daysUntil(nextEmi);
              const paidRatio =
                loan.principalAmount > 0
                  ? 1 - loan.outstandingAmount / loan.principalAmount
                  : 0;
              return (
                <LoanCard
                  key={loan.id}
                  name={loan.name}
                  lenderName={loan.lenderName}
                  outstandingAmount={loan.outstandingAmount}
                  emiAmount={loan.emiAmount}
                  nextEmiDate={nextEmi}
                  currency={currency}
                  progress={paidRatio}
                  onPress={() => router.push(`/(loans)/${loan.id}`)}
                />
              );
            })}
          </Section>
        )}

        <View style={styles.bottomPad} />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greetingBlock: {
    gap: 1,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthArrow: {
    padding: 4,
  },
  monthArrowText: {
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 26,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  netWorthCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  netWorthLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
  },
  summaryCardInner: {
    gap: 4,
  },
  summaryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingIcon: {
    fontSize: 22,
  },
  upcomingDetails: {
    flex: 1,
    gap: 2,
  },
  upcomingWarning: {
    fontSize: 18,
  },
  bottomPad: {
    height: 24,
  },
});
