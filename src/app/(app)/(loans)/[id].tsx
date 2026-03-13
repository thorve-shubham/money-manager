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
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useLoanStore } from '@/store/use-loan-store';
import { Loan, LoanPayment } from '@/types/loan';
import { formatDate, daysUntil } from '@/utils/date-utils';
import { formatCurrency } from '@/utils/currency-formatter';

function getNextEmiDate(emiDay: number): number {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), emiDay);
  if (candidate.getTime() < now.getTime()) {
    candidate.setMonth(candidate.getMonth() + 1);
  }
  return candidate.getTime();
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor ?? theme.text }]}>{value}</Text>
    </View>
  );
}

export default function LoanDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuthStore();
  const { loans, isLoading, fetchLoans, getPayments } = useLoanStore();

  const userId = user?.id ?? '';
  const currency = 'INR';
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<LoanPayment[]>([]);

  const loan = useMemo<Loan | undefined>(
    () => loans.find((l) => l.id === id),
    [loans, id],
  );

  const loadData = useCallback(async () => {
    if (!userId || !id) return;
    await fetchLoans(userId);
    const pmts = await getPayments(id);
    setPayments(pmts);
  }, [userId, id]);

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

  if (!loan) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnContainer}>
          <Text style={[styles.backButton, { color: '#208AEF' }]}>‹ Back</Text>
        </TouchableOpacity>
        <ThemedView style={styles.loadingContainer}>
          <Text style={styles.notFoundIcon}>🏦</Text>
          <ThemedText type="smallBold">Loan not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const paidAmount = loan.principalAmount - loan.outstandingAmount;
  const paidRatio = loan.principalAmount > 0 ? paidAmount / loan.principalAmount : 0;
  const nextEmi = getNextEmiDate(loan.emiDay);
  const daysToEmi = daysUntil(nextEmi);
  const dueColor = daysToEmi <= 0 ? '#EF4444' : daysToEmi <= 3 ? '#F59E0B' : '#22C55E';

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
          {loan.name}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item: LoanPayment) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
        }
        ListHeaderComponent={
          <>
            {/* Summary Card */}
            <ThemedView type="backgroundElement" style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <ThemedText type="smallBold" style={styles.loanName}>
                    {loan.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {loan.lenderName} • {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)}
                  </ThemedText>
                </View>
                <AmountDisplay
                  amount={loan.outstandingAmount}
                  currency={currency}
                  type="expense"
                  size="lg"
                />
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <ProgressBar progress={paidRatio} color="#208AEF" height={8} />
                <View style={styles.progressLabels}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Paid: {formatCurrency(paidAmount, currency)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {Math.round(paidRatio * 100)}% complete
                  </ThemedText>
                </View>
              </View>
            </ThemedView>

            {/* Info rows */}
            <ThemedView type="backgroundElement" style={styles.infoCard}>
              <InfoRow label="Principal Amount" value={formatCurrency(loan.principalAmount, currency)} />
              <View style={[styles.rowDivider, { backgroundColor: theme.backgroundSelected }]} />
              <InfoRow label="Interest Rate" value={`${loan.interestRate}% p.a.`} />
              <View style={[styles.rowDivider, { backgroundColor: theme.backgroundSelected }]} />
              <InfoRow
                label="Monthly EMI"
                value={formatCurrency(loan.emiAmount, currency)}
                valueColor="#208AEF"
              />
              <View style={[styles.rowDivider, { backgroundColor: theme.backgroundSelected }]} />
              <InfoRow label="Tenure" value={`${loan.tenureMonths} months`} />
              <View style={[styles.rowDivider, { backgroundColor: theme.backgroundSelected }]} />
              <InfoRow label="Start Date" value={formatDate(loan.startDate, 'medium')} />
              <View style={[styles.rowDivider, { backgroundColor: theme.backgroundSelected }]} />
              <InfoRow
                label="Next EMI Date"
                value={formatDate(nextEmi, 'medium')}
                valueColor={dueColor}
              />
              <View style={[styles.rowDivider, { backgroundColor: theme.backgroundSelected }]} />
              <InfoRow
                label="Days Until EMI"
                value={
                  daysToEmi === 0
                    ? 'Due today'
                    : daysToEmi < 0
                    ? `Overdue by ${Math.abs(daysToEmi)}d`
                    : `In ${daysToEmi} days`
                }
                valueColor={dueColor}
              />
            </ThemedView>

            {/* Record payment button */}
            <View style={styles.recordPaymentContainer}>
              <Button
                label="Record Payment"
                onPress={() => {
                  // Navigate to payment recording — placeholder for now
                }}
                variant="primary"
                size="md"
                fullWidth
                accessibilityLabel="Record EMI payment"
              />
            </View>

            {/* Payments heading */}
            <View style={styles.txHeader}>
              <ThemedText type="smallBold" style={styles.txHeaderText}>
                Payment History
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {payments.length} payments
              </ThemedText>
            </View>
          </>
        }
        renderItem={({ item }: { item: LoanPayment }) => (
          <ThemedView type="backgroundElement" style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>💸</Text>
              <View>
                <ThemedText type="smallBold">
                  {formatCurrency(item.amount, currency)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDate(item.paymentDate, 'medium')}
                </ThemedText>
                {item.note && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.note}
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={styles.paymentBreakdown}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.breakdownText}>
                P: {formatCurrency(item.principalComponent, currency)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.breakdownText}>
                I: {formatCurrency(item.interestComponent, currency)}
              </ThemedText>
            </View>
          </ThemedView>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="💸"
            title="No payments recorded"
            description="Record your EMI payments to track your loan progress."
          />
        }
        contentContainerStyle={styles.listContent}
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
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loanName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressSection: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '55%',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  recordPaymentContainer: {
    margin: 16,
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
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentIcon: {
    fontSize: 22,
  },
  paymentBreakdown: {
    alignItems: 'flex-end',
  },
  breakdownText: {
    fontSize: 11,
  },
  separator: {
    height: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
});
