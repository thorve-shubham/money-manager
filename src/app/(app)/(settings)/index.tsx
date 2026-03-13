import Constants from 'expo-constants';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useSettingsStore } from '@/store/use-settings-store';

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  labelColor?: string;
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  labelColor,
}: MenuItemProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.menuIconCircle, { backgroundColor: theme.backgroundSelected }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.menuLabel,
          { color: labelColor ?? theme.text },
        ]}
      >
        {label}
      </Text>
      <View style={styles.menuRight}>
        {value && (
          <Text style={[styles.menuValue, { color: theme.textSecondary }]}>{value}</Text>
        )}
        {showChevron && (
          <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function MenuSection({ title, children }: { title?: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.menuSection}>
      {title && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      )}
      <ThemedView type="backgroundElement" style={styles.menuSectionCard}>
        {children}
      </ThemedView>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { theme: selectedTheme, currency } = useSettingsStore();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ],
    );
  }

  const themeLabel =
    selectedTheme === 'system'
      ? 'System'
      : selectedTheme === 'dark'
      ? 'Dark'
      : 'Light';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Settings
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <MenuSection title="Account">
          <TouchableOpacity
            onPress={() => router.push('/(settings)/profile')}
            style={styles.profileRow}
            accessibilityRole="button"
            accessibilityLabel="View profile settings"
          >
            <Avatar
              name={user?.name ?? 'User'}
              avatarUrl={user?.avatarUrl}
              size="lg"
            />
            <View style={styles.profileInfo}>
              <ThemedText type="smallBold" style={styles.profileName}>
                {user?.name ?? 'User'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {user?.email ?? ''}
              </ThemedText>
            </View>
            <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </MenuSection>

        {/* Preferences */}
        <MenuSection title="Preferences">
          <MenuItem
            icon="🎨"
            label="Appearance"
            value={themeLabel}
            onPress={() => router.push('/(settings)/theme')}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSelected }]} />
          <MenuItem
            icon="💱"
            label="Default Currency"
            value={currency}
            onPress={() => {}}
          />
        </MenuSection>

        {/* Data */}
        <MenuSection title="Data">
          <MenuItem
            icon="☁️"
            label="Backup Data"
            onPress={() => router.push('/(settings)/backup')}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSelected }]} />
          <MenuItem
            icon="📥"
            label="Restore Data"
            onPress={() => router.push('/(settings)/backup')}
          />
        </MenuSection>

        {/* About */}
        <MenuSection title="About">
          <MenuItem
            icon="ℹ️"
            label="About App"
            value={`v${appVersion}`}
            onPress={() => router.push('/(settings)/about')}
          />
        </MenuSection>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutButton, { backgroundColor: '#EF444418' }]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
    gap: 8,
  },
  menuSection: {
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingHorizontal: 4,
  },
  menuSectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '400',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  signOutSection: {
    marginTop: 16,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  bottomPad: {
    height: 32,
  },
});
