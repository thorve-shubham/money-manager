import React from 'react';
import {
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
import { useSettingsStore } from '@/store/use-settings-store';

type ThemeOption = 'system' | 'light' | 'dark';

interface ThemeChoiceProps {
  value: ThemeOption;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: (value: ThemeOption) => void;
}

function ThemeChoice({ value, label, description, icon, selected, onSelect }: ThemeChoiceProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      style={[
        styles.themeOption,
        {
          backgroundColor: selected ? '#208AEF12' : theme.backgroundElement,
          borderColor: selected ? '#208AEF' : 'transparent',
          borderWidth: selected ? 2 : 2,
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`Theme: ${label}`}
    >
      {/* Swatch preview */}
      <View style={[styles.swatchContainer, { borderColor: theme.backgroundSelected }]}>
        {value === 'system' && (
          <View style={styles.swatchSystem}>
            <View style={[styles.swatchHalf, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.swatchHalf, { backgroundColor: '#000000' }]} />
          </View>
        )}
        {value === 'light' && (
          <View style={[styles.swatchSolid, { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.swatchText}>☀️</Text>
          </View>
        )}
        {value === 'dark' && (
          <View style={[styles.swatchSolid, { backgroundColor: '#121212' }]}>
            <Text style={styles.swatchText}>🌙</Text>
          </View>
        )}
      </View>

      <View style={styles.themeInfo}>
        <View style={styles.themeIconRow}>
          <Text style={styles.themeIcon}>{icon}</Text>
          <ThemedText type="smallBold" style={{ color: selected ? '#208AEF' : theme.text }}>
            {label}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>

      {/* Radio indicator */}
      <View
        style={[
          styles.radioOuter,
          { borderColor: selected ? '#208AEF' : theme.textSecondary },
        ]}
      >
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

export default function ThemeSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { theme: selectedTheme, setTheme } = useSettingsStore();

  const THEME_OPTIONS: Omit<ThemeChoiceProps, 'selected' | 'onSelect'>[] = [
    {
      value: 'system',
      label: 'System',
      description: 'Follows your device settings automatically.',
      icon: '⚙️',
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Always use light mode.',
      icon: '☀️',
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Always use dark mode.',
      icon: '🌙',
    },
  ];

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
          Appearance
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          Choose how Money Manager looks. System mode automatically switches between light and dark
          based on your device settings.
        </ThemedText>

        <View style={styles.optionsContainer}>
          {THEME_OPTIONS.map((opt) => (
            <ThemeChoice
              key={opt.value}
              {...opt}
              selected={selectedTheme === opt.value}
              onSelect={setTheme}
            />
          ))}
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Changes take effect immediately.
        </ThemedText>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  description: {
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  swatchContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  swatchSystem: {
    flex: 1,
    flexDirection: 'row',
  },
  swatchHalf: {
    flex: 1,
  },
  swatchSolid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchText: {
    fontSize: 20,
  },
  themeInfo: {
    flex: 1,
    gap: 4,
  },
  themeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeIcon: {
    fontSize: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#208AEF',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
  },
});
