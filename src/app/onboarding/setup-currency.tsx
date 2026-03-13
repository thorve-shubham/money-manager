import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/use-settings-store';
import { SUPPORTED_CURRENCIES } from '@/utils/currency-formatter';

export default function SetupCurrency() {
  const theme = useTheme();
  const { setCurrency, currency } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currency);

  const filtered = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Choose Your Currency</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            This will be your default currency for all transactions.
          </ThemedText>
        </View>

        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
          placeholder="Search currency..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search currency"
        />

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.currencyRow,
                {
                  backgroundColor:
                    selected === item.code ? '#208AEF20' : theme.backgroundElement,
                  borderColor: selected === item.code ? '#208AEF' : 'transparent',
                },
              ]}
              onPress={() => setSelected(item.code)}
              accessibilityLabel={`Select ${item.name}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: selected === item.code }}>
              <View style={styles.currencyLeft}>
                <ThemedText type="default" style={styles.currencySymbol}>
                  {item.symbol}
                </ThemedText>
                <View>
                  <ThemedText type="default">{item.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.code}
                  </ThemedText>
                </View>
              </View>
              {selected === item.code && (
                <ThemedText style={{ color: '#208AEF' }}>✓</ThemedText>
              )}
            </Pressable>
          )}
        />

        <View style={styles.footer}>
          <Pressable
            style={[styles.continueButton, { backgroundColor: '#208AEF' }]}
            onPress={() => {
              setCurrency(selected);
              router.push('/onboarding/setup-account');
            }}
            accessibilityLabel="Continue"
            accessibilityRole="button">
            <ThemedText type="default" style={styles.continueButtonText}>
              Continue →
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, paddingBottom: 48 },
  header: { paddingTop: 32, paddingBottom: 24, gap: 8 },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  list: { flex: 1 },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  currencyLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  currencySymbol: { fontSize: 24, width: 36, textAlign: 'center' },
  footer: { paddingTop: 16 },
  continueButton: { paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  continueButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
});
