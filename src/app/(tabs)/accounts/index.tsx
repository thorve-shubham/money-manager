import { FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { AccountCard } from '@/components/accounts';
import { useAccounts, type Account } from '@/hooks/use-accounts';
import { useTheme } from '@/theme';
import { spacing, borderRadius } from '@/theme';

export default function AccountsScreen() {
  const { accounts, isLoading, error, refresh, deleteAccount } = useAccounts();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleEdit = (account: Account) => {
    router.push({ pathname: '/(tabs)/accounts/[id]', params: { id: account.id } });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText variant="secondary">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AccountCard account={item} onEdit={handleEdit} onDelete={(a) => deleteAccount(a.id)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="secondary" size="md">
              No accounts yet
            </ThemedText>
            <ThemedText variant="secondary" size="sm">
              Tap + to add your first account
            </ThemedText>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/accounts/add')}
        accessibilityLabel="Add account"
        accessibilityRole="button"
      >
        <ThemedText size="xxl" weight="regular" style={{ color: colors.surface, lineHeight: 32 }}>
          +
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
