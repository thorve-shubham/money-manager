import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export default function OnboardingWelcome() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.hero}>
          <ThemedText style={styles.emoji}>💰</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Welcome to{'\n'}Money Manager
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Your complete personal finance companion.
            Track every rupee, manage accounts, and achieve financial clarity.
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.footer}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: '#208AEF' }]}
            onPress={() => router.push('/onboarding/features')}
            accessibilityLabel="Get started"
            accessibilityRole="button">
            <ThemedText type="default" style={styles.primaryButtonText}>
              Get Started →
            </ThemedText>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingBottom: 48,
    paddingTop: 64,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  emoji: { fontSize: 72 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 26, maxWidth: 300 },
  footer: { gap: 12 },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
});
