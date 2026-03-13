import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export default function SetupAccount() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText style={styles.icon}>🏦</ThemedText>
          <ThemedText type="subtitle">Add Your First Account</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.desc}>
            Connect a bank account to start tracking your finances. You can always add more later.
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: '#208AEF' }]}
            onPress={() => router.push('/onboarding/complete')}
            accessibilityLabel="Add bank account"
            accessibilityRole="button">
            <ThemedText type="default" style={styles.primaryButtonText}>
              Add Bank Account
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.skipButton, { borderColor: theme.backgroundElement }]}
            onPress={() => router.push('/onboarding/complete')}
            accessibilityLabel="Skip for now"
            accessibilityRole="button">
            <ThemedText type="default" themeColor="textSecondary">
              Skip for now
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 32, paddingBottom: 48, justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  icon: { fontSize: 72 },
  desc: { textAlign: 'center', lineHeight: 26 },
  footer: { gap: 12 },
  primaryButton: { paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
  skipButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
