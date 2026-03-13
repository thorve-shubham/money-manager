import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { appConfig } from '@/config/env';
import { runMigrations } from '@/db/migrate';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/use-auth-store';
import { useSettingsStore } from '@/store/use-settings-store';
import { MOCK_USER } from '@/types/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { theme, hasSeenOnboarding } = useSettingsStore();
  const { isAuthenticated, isLoading, setUser } = useAuthStore();

  // Resolve which color scheme to use based on user preference
  const colorScheme = theme === 'system' ? systemColorScheme : theme;

  useEffect(() => {
    async function init() {
      // Run DB migrations first — creates tables if they don't exist
      await runMigrations();

      if (appConfig.skipAuth) {
        // Dev mode: skip auth entirely — app goes straight to dashboard as mock user
        setUser(MOCK_USER);
        await SplashScreen.hideAsync();
        return;
      }

      // Restore persisted user from secure storage
      const user = await authService.getStoredUser();
      setUser(user);
      await SplashScreen.hideAsync();
    }

    init();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
          </Stack>
          <Redirect href="/auth/sign-in" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
          </Stack>
          <Redirect href="/onboarding" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
