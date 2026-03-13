import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useCategoryStore } from '@/store/use-category-store';
import { useTransactionStore } from '@/store/use-transaction-store';
import { formatDate } from '@/utils/date-utils';
import { Transaction, TransactionType } from '@/types/transaction';
import { Category } from '@/types/category';

type FilterType = 'all' | TransactionType;

interface SectionData {
  title: string;
  data: Transaction[];
}

function groupByDate(transactions: Transaction[]): SectionData[] {
  const map: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = formatDate(tx.date, 'long');
    if (!map[key]) map[key] = [];
    map[key].push(tx);
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { user } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { transactions, summary, isLoading, fetchTransactions, fetchSummary } =
    useTransactionStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = user?.id ?? '';
  const currency = 'INR';

  const loadData = useCallback(
    async (searchValue?: string) => {
      if (!userId) return;
      await Promise.all([
        fetchTransactions(userId, {
          type: filter === 'all' ? undefined : filter,
          search: searchValue ?? search,
        }),
        fetchSummary(userId, new Date().getMonth(), new Date().getFullYear()),
        fetchCategories(userId),
      ]);
    },
    [userId, filter, search],
  );

  useEffect(() => {
    loadData();
  }, [filter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadData(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const sections = useMemo(() => groupByDate(transactions), [transactions]);

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Transactions
        </ThemedText>
        <View style={styles.headerSummary}>
          <AmountDisplay
            amount={summary?.totalIncome ?? 0}
            currency={currency}
            type="income"
            size="sm"
          />
          <AmountDisplay
            amount={summary?.totalExpense ?? 0}
            currency={currency}
            type="expense"
            size="sm"
          />
        </View>
      </View>

      {/* Filter pills */}
      <View style={[styles.filterRow, { backgroundColor: theme.backgroundElement }]}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterPill,
                active && { backgroundColor: '#208AEF' },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filter by ${f.label}`}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: active ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundElement }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          accessibilityLabel="Search transactions"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Text style={[styles.clearIcon, { color: theme.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {isLoading && !refreshing ? (
        <LoadingSpinner fullScreen />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
          }
          renderSectionHeader={({ section: { title } }) => (
            <ThemedView style={[styles.sectionHeader, { borderBottomColor: theme.backgroundElement }]}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeaderText}>
                {title}
              </ThemedText>
            </ThemedView>
          )}
          renderItem={({ item }) => {
            const cat = categoryMap[item.categoryId];
            return (
              <ThemedView style={styles.rowContainer}>
                <TransactionRow
                  icon={cat?.icon ?? '💰'}
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
              icon="🧾"
              title="No transactions"
              description={
                search
                  ? 'No transactions match your search.'
                  : 'Add a transaction to get started.'
              }
            />
          }
          contentContainerStyle={sections.length === 0 ? styles.emptyContent : styles.listContent}
          stickySectionHeadersEnabled
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSummary: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    fontWeight: '600',
    padding: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowContainer: {
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
