import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AccountCard } from '@/components/ui/AccountCard';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { CreditCardWidget } from '@/components/ui/CreditCardWidget';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Section } from '@/components/ui/Section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useAccountStore } from '@/store/use-account-store';
import { useCreditCardStore } from '@/store/use-credit-card-store';

export default function AccountsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { accounts, totalBalance, isLoading: accountsLoading, fetchAccounts } = useAccountStore();
  const { creditCards, isLoading: cardsLoading, fetchCreditCards } = useCreditCardStore();

  const userId = user?.id ?? '';
  const currency = 'INR';
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    await Promise.all([fetchAccounts(userId), fetchCreditCards(userId)]);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const isLoading = (accountsLoading || cardsLoading) && !refreshing;

  if (isLoading) {
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
          Accounts
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
        }
      >
        {/* Total Balance */}
        <ThemedView type="backgroundElement" style={styles.totalCard}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.totalLabel}>
            Total Balance
          </ThemedText>
          <AmountDisplay amount={totalBalance} currency={currency} type="neutral" size="lg" />
        </ThemedView>

        {/* Bank Accounts Section */}
        <Section
          title="Bank Accounts"
          rightAction={{
            label: '+ Add',
            onPress: () => router.push('/(accounts)/bank/add'),
          }}
        >
          {accounts.length === 0 ? (
            <EmptyState
              icon="🏦"
              title="No bank accounts"
              description="Add your first bank account to track your balance."
              action={{
                label: 'Add Account',
                onPress: () => router.push('/(accounts)/bank/add'),
              }}
            />
          ) : (
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                name={account.name}
                bankName={account.bankName ?? undefined}
                balance={account.balance}
                currency={account.currency}
                color={account.color}
                accountNumberLast4={account.accountNumberLast4 ?? undefined}
                isDefault={account.isDefault}
                onPress={() => router.push(`/(accounts)/bank/${account.id}`)}
              />
            ))
          )}
        </Section>

        {/* Credit Cards Section */}
        <Section
          title="Credit Cards"
          rightAction={{
            label: '+ Add',
            onPress: () => router.push('/(accounts)/credit/add'),
          }}
        >
          {creditCards.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No credit cards"
              description="Add your credit cards to track spending and payment cycles."
              action={{
                label: 'Add Credit Card',
                onPress: () => router.push('/(accounts)/credit/add'),
              }}
            />
          ) : (
            creditCards.map((card) => (
              <CreditCardWidget
                key={card.id}
                name={card.name}
                bankName={card.bankName}
                cardNumberLast4={card.cardNumberLast4}
                creditLimit={card.creditLimit}
                usedAmount={0}
                color={card.color}
                currency={currency}
                onPress={() => router.push(`/(accounts)/credit/${card.id}`)}
              />
            ))
          )}
        </Section>

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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  totalCard: {
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
  bottomPad: {
    height: 24,
  },
});
