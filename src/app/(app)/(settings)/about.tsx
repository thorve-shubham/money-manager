import Constants from 'expo-constants';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

interface LinkRowProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function LinkRow({ icon, label, onPress }: LinkRowProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.linkRow}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <Text style={styles.linkIcon}>{icon}</Text>
      <ThemedText type="small" style={styles.linkLabel}>
        {label}
      </ThemedText>
      <Text style={[styles.linkChevron, { color: theme.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const theme = useTheme();
  const router = useRouter();

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode?.toString() ??
    '1';

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
          About
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Identity */}
        <View style={styles.appIdentity}>
          <Text style={styles.appEmoji}>💰</Text>
          <ThemedText type="subtitle" style={styles.appName}>
            Money Manager
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Track, manage, and grow your finances
          </ThemedText>
        </View>

        {/* Version Info */}
        <ThemedView type="backgroundElement" style={styles.versionCard}>
          <View style={styles.versionRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Version
            </ThemedText>
            <ThemedText type="smallBold">{version}</ThemedText>
          </View>
          <View style={[styles.versionDivider, { backgroundColor: theme.backgroundSelected }]} />
          <View style={styles.versionRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Build
            </ThemedText>
            <ThemedText type="smallBold">{buildNumber}</ThemedText>
          </View>
          <View style={[styles.versionDivider, { backgroundColor: theme.backgroundSelected }]} />
          <View style={styles.versionRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Platform
            </ThemedText>
            <ThemedText type="smallBold">iOS &amp; Android</ThemedText>
          </View>
        </ThemedView>

        {/* Links */}
        <View style={styles.section}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            Resources
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.linksCard}>
            <LinkRow
              icon="📄"
              label="Privacy Policy"
              onPress={() => {
                // Linking.openURL('https://your-privacy-policy-url.com');
              }}
            />
            <View style={[styles.linkDivider, { backgroundColor: theme.backgroundSelected }]} />
            <LinkRow
              icon="📜"
              label="Terms of Service"
              onPress={() => {
                // Linking.openURL('https://your-terms-url.com');
              }}
            />
            <View style={[styles.linkDivider, { backgroundColor: theme.backgroundSelected }]} />
            <LinkRow
              icon="🐛"
              label="Report a Bug"
              onPress={() => {
                // Linking.openURL('mailto:support@moneymanager.app?subject=Bug%20Report');
              }}
            />
            <View style={[styles.linkDivider, { backgroundColor: theme.backgroundSelected }]} />
            <LinkRow
              icon="⭐"
              label="Rate the App"
              onPress={() => {
                // Linking.openURL('market://details?id=com.moneymanager.app');
              }}
            />
          </ThemedView>
        </View>

        {/* Made with love */}
        <View style={styles.madeWith}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.madeWithText}>
            Made with ❤️ using React Native &amp; Expo
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.copyright}>
            © {new Date().getFullYear()} Money Manager. All rights reserved.
          </ThemedText>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  headerSpacer: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  appIdentity: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  appEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  versionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  versionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },
  linksCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  linkIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  linkLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  linkChevron: {
    fontSize: 20,
  },
  linkDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  madeWith: {
    alignItems: 'center',
    gap: 6,
  },
  madeWithText: {
    fontSize: 13,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
  },
  bottomPad: {
    height: 32,
  },
});
