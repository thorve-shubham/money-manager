import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoanCard } from '@/components/ui/LoanCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useLoanStore } from '@/store/use-loan-store';
import { Loan } from '@/types/loan';

function getNextEmiDate(emiDay: number): number {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), emiDay);
  if (candidate.getTime() < now.getTime()) {
    candidate.setMonth(candidate.getMonth() + 1);
  }
  return candidate.getTime();
}

export default function LoansScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { loans, totalOutstanding, isLoading, fetchLoans } = useLoanStore();

  const userId = user?.id ?? '';
  const currency = 'INR';
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    await fetchLoans(userId);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Loans & EMIs
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/(loans)/add')}
          style={styles.addBtn}
          accessibilityLabel="Add new loan"
          accessibilityRole="button"
        >
          <ThemedText type="smallBold" style={styles.addBtnText}>
            + Add
          </ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={loans}
        keyExtractor={(item: Loan) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
        }
        ListHeaderComponent={
          <ThemedView type="backgroundElement" style={styles.totalCard}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.totalLabel}>
              Total Outstanding
            </ThemedText>
            <AmountDisplay
              amount={totalOutstanding}
              currency={currency}
              type="expense"
              size="lg"
            />
            <ThemedText type="small" themeColor="textSecondary">
              across {loans.length} loan{loans.length !== 1 ? 's' : ''}
            </ThemedText>
          </ThemedView>
        }
        renderItem={({ item }: { item: Loan }) => {
          const paidRatio =
            item.principalAmount > 0
              ? 1 - item.outstandingAmount / item.principalAmount
              : 0;
          const nextEmi = getNextEmiDate(item.emiDay);
          return (
            <LoanCard
              name={item.name}
              lenderName={item.lenderName}
              outstandingAmount={item.outstandingAmount}
              emiAmount={item.emiAmount}
              nextEmiDate={nextEmi}
              currency={currency}
              progress={paidRatio}
              onPress={() => router.push(`/(loans)/${item.id}`)}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="🏦"
            title="No loans"
            description="Add your loans and EMIs to track outstanding amounts and payment schedules."
            action={{
              label: 'Add Loan',
              onPress: () => router.push('/(loans)/add'),
            }}
          />
        }
        contentContainerStyle={loans.length === 0 ? styles.emptyContent : styles.listContent}
      />

      {/* FAB */}
      {loans.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/(loans)/add')}
          style={styles.fab}
          accessibilityLabel="Add loan"
          accessibilityRole="button"
        >
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      )}
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
  addBtn: {
    padding: 8,
  },
  addBtnText: {
    color: '#208AEF',
    fontSize: 15,
  },
  totalCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  separator: {
    height: 12,
    marginHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  emptyContent: {
    flex: 1,
    paddingBottom: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 32,
  },
});
