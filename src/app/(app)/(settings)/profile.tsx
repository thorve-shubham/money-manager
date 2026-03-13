import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';

export default function ProfileSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    setNameError('');
    setIsSaving(true);
    try {
      if (user) {
        setUser({ ...user, name: name.trim() });
      }
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            Profile
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Avatar name={name || (user?.name ?? 'U')} avatarUrl={user?.avatarUrl} size="lg" />
            <ThemedText type="small" themeColor="textSecondary" style={styles.avatarHint}>
              Your initials are used when no photo is set.
            </ThemedText>
          </View>

          {/* Name */}
          <Input
            label="Display Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (text.trim()) setNameError('');
            }}
            placeholder="Your name"
            error={nameError}
            leftIcon="👤"
            accessibilityLabel="Display name"
          />

          {/* Email (read-only) */}
          <ThemedView type="backgroundElement" style={styles.emailRow}>
            <Text style={styles.emailIcon}>📧</Text>
            <View style={styles.emailInfo}>
              <ThemedText type="small" themeColor="textSecondary">
                Email
              </ThemedText>
              <ThemedText type="smallBold">{user?.email ?? '—'}</ThemedText>
            </View>
            <ThemedView
              type="backgroundSelected"
              style={styles.readOnlyBadge}
            >
              <ThemedText type="small" themeColor="textSecondary" style={styles.readOnlyText}>
                Read-only
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.emailNote}>
            Email is managed by your authentication provider and cannot be changed here.
          </ThemedText>

          {/* Save */}
          <Button
            label="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSaving}
            accessibilityLabel="Save profile changes"
          />

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
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
    gap: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  avatarHint: {
    textAlign: 'center',
    fontSize: 13,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  emailIcon: {
    fontSize: 18,
  },
  emailInfo: {
    flex: 1,
    gap: 3,
  },
  readOnlyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  readOnlyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emailNote: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
  },
  bottomPad: {
    height: 24,
  },
});
