import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: '📊',
    title: 'Track Income & Expenses',
    description:
      'Log every transaction in seconds. Categorize spending and see where your money goes.',
  },
  {
    icon: '💳',
    title: 'Credit Card Management',
    description:
      'Track billing cycles, due dates, and outstanding amounts for all your credit cards.',
  },
  {
    icon: '🏦',
    title: 'Bank Accounts',
    description:
      'Manage multiple bank accounts and track your debit card transactions in one place.',
  },
  {
    icon: '🏠',
    title: 'Loans & EMI Tracker',
    description:
      'Monitor outstanding loans, track EMI payments, and see your full amortization schedule.',
  },
];

export default function OnboardingFeatures() {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  function goNext() {
    if (activeIndex < FEATURES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.push('/onboarding/setup-currency');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          ref={flatListRef}
          data={FEATURES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInRight.delay(index * 100)}
              style={[styles.slide, { width }]}>
              <ThemedText style={styles.featureIcon}>{item.icon}</ThemedText>
              <ThemedText type="subtitle" style={styles.featureTitle}>
                {item.title}
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.featureDesc}>
                {item.description}
              </ThemedText>
            </Animated.View>
          )}
          keyExtractor={(_, i) => String(i)}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {FEATURES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeIndex ? '#208AEF' : theme.backgroundElement,
                    width: i === activeIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <Pressable
            style={[styles.nextButton, { backgroundColor: '#208AEF' }]}
            onPress={goNext}
            accessibilityLabel={activeIndex === FEATURES.length - 1 ? 'Continue' : 'Next'}
            accessibilityRole="button">
            <ThemedText type="default" style={styles.nextButtonText}>
              {activeIndex === FEATURES.length - 1 ? 'Continue →' : 'Next →'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingBottom: 48 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
    paddingTop: 64,
  },
  featureIcon: { fontSize: 72 },
  featureTitle: { textAlign: 'center' },
  featureDesc: { textAlign: 'center', lineHeight: 26 },
  footer: { paddingHorizontal: 32, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  nextButton: { paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  nextButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
});
