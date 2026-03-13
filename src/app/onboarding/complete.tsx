import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSettingsStore } from '@/store/use-settings-store';

function ConfettiDot({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const colors = ['#208AEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(800, { duration: 2000 }));
    opacity.value = withDelay(delay, withSequence(withTiming(1, { duration: 100 }), withDelay(1600, withTiming(0, { duration: 300 }))));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${translateY.value * 0.5}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiDot,
        { backgroundColor: color, left: x },
        style,
      ]}
    />
  );
}

export default function OnboardingComplete() {
  const { setHasSeenOnboarding } = useSettingsStore();

  const confetti = Array.from({ length: 20 }, (_, i) => ({
    delay: Math.random() * 600,
    x: Math.random() * 400,
  }));

  function handleGetStarted() {
    setHasSeenOnboarding(true);
    router.replace('/(app)/(dashboard)');
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.confettiContainer} pointerEvents="none">
        {confetti.map((c, i) => (
          <ConfettiDot key={i} delay={c.delay} x={c.x} />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.content}>
          <ThemedText style={styles.icon}>🎉</ThemedText>
          <ThemedText type="subtitle" style={styles.title}>
            You&apos;re All Set!
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.desc}>
            Your Money Manager is ready to use.
            Start tracking your finances today!
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.footer}>
          <Pressable
            style={styles.startButton}
            onPress={handleGetStarted}
            accessibilityLabel="Start using Money Manager"
            accessibilityRole="button">
            <ThemedText type="default" style={styles.startButtonText}>
              Let&apos;s Go! 🚀
            </ThemedText>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  confettiContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  confettiDot: {
    position: 'absolute',
    top: -20,
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  safeArea: { flex: 1, paddingHorizontal: 32, paddingBottom: 48, justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  icon: { fontSize: 80 },
  title: { textAlign: 'center' },
  desc: { textAlign: 'center', lineHeight: 26 },
  footer: {},
  startButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#208AEF',
  },
  startButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 17 },
});
