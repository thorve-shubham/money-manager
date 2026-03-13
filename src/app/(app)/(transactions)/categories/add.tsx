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

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useCategoryStore } from '@/store/use-category-store';
import { CategoryType } from '@/types/category';

const EMOJI_OPTIONS = [
  '🍕', '🍔', '🍜', '☕', '🛒', '🎬', '🎮', '📚',
  '💪', '🏥', '🚗', '✈️', '🏠', '💡', '📱', '👗',
  '💄', '🎁', '🐾', '🌱', '⚽', '🎵', '💰', '📈',
  '🏦', '💳', '🛍', '🧾', '🔧', '🎓',
];

const COLOR_OPTIONS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#208AEF', '#8B5CF6', '#EC4899',
  '#6B7280', '#F43F5E', '#06B6D4', '#84CC16',
];

const CATEGORY_TYPES: { key: CategoryType; label: string }[] = [
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
  { key: 'both', label: 'Both' },
];

export default function AddCategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addCategory } = useCategoryStore();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [selectedColor, setSelectedColor] = useState('#208AEF');
  const [selectedType, setSelectedType] = useState<CategoryType>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?.id ?? '';

  async function handleSave() {
    if (!name.trim()) {
      setNameError('Category name is required');
      return;
    }
    setNameError('');
    setIsSubmitting(true);
    try {
      await addCategory(userId, {
        name: name.trim(),
        icon: selectedEmoji,
        color: selectedColor,
        type: selectedType,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={[styles.cancelButton, { color: '#208AEF' }]}>Cancel</Text>
          </TouchableOpacity>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Add Category
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Preview */}
          <ThemedView type="backgroundElement" style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}20` }]}>
              <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            </View>
            <ThemedText type="smallBold" style={{ color: selectedColor }}>
              {name || 'Category Name'}
            </ThemedText>
          </ThemedView>

          {/* Name Input */}
          <Input
            label="Category Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (text.trim()) setNameError('');
            }}
            placeholder="e.g. Groceries, Salary"
            error={nameError}
            accessibilityLabel="Category name"
          />

          {/* Type selector */}
          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              Type
            </ThemedText>
            <View style={[styles.typeRow, { backgroundColor: theme.backgroundElement }]}>
              {CATEGORY_TYPES.map((t) => {
                const active = selectedType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setSelectedType(t.key)}
                    style={[
                      styles.typePill,
                      active && { backgroundColor: '#208AEF' },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Category type: ${t.label}`}
                  >
                    <Text
                      style={[
                        styles.typePillText,
                        { color: active ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Emoji Picker */}
          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              Icon
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji) => {
                const selected = selectedEmoji === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    style={[
                      styles.emojiCell,
                      selected && {
                        backgroundColor: `${selectedColor}25`,
                        borderColor: selectedColor,
                        borderWidth: 2,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select emoji ${emoji}`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </View>

          {/* Color Picker */}
          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              Color
            </ThemedText>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => {
                const selected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selected && styles.colorSwatchSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select color ${color}`}
                    accessibilityState={{ selected }}
                  >
                    {selected && <Text style={styles.colorCheckmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save */}
          <Button
            label="Save Category"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            accessibilityLabel="Save category"
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
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 22,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  typePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderRadius: 16,
  },
  emojiCell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiText: {
    fontSize: 22,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheckmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomPad: {
    height: 24,
  },
});
