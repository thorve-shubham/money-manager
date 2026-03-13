import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authService, useGoogleAuth } from '@/services/auth-service';
import { useAuthStore } from '@/store/use-auth-store';
import { useTheme } from '@/hooks/use-theme';
import { generateId } from '@/utils/id-generator';

export default function SignInScreen() {
  const theme = useTheme();
  const { setUser, setLoading, isLoading } = useAuthStore();
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      handleGoogleSuccess(response.authentication.accessToken);
    }
  }, [response]);

  async function handleGoogleSuccess(accessToken: string) {
    setLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await res.json();
      const user = {
        id: generateId(),
        googleId: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await authService.storeUser(user);
      setUser(user);
    } catch {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            💰 Money Manager
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            Track expenses, manage accounts{'\n'}and take control of your finances
          </ThemedText>
        </View>

        <View style={styles.actions}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.text} />
          ) : (
            <>
              <Pressable
                style={[styles.googleButton, { backgroundColor: theme.backgroundElement }]}
                onPress={() => promptAsync()}
                disabled={!request}
                accessibilityLabel="Sign in with Google"
                accessibilityRole="button">
                <ThemedText type="default" style={styles.googleButtonText}>
                  🔐  Sign in with Google
                </ThemedText>
              </Pressable>

              <ThemedText type="small" themeColor="textSecondary" style={styles.terms}>
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </ThemedText>
            </>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', lineHeight: 24 },
  actions: { gap: 16 },
  googleButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  googleButtonText: { fontWeight: '600' },
  terms: { textAlign: 'center', lineHeight: 18 },
});
