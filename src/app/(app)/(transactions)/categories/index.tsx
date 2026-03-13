import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/use-auth-store';
import { useCategoryStore } from '@/store/use-category-store';
import { Category } from '@/types/category';

const TYPE_COLORS: Record<string, string> = {
  income: '#22C55E',
  expense: '#EF4444',
  both: '#208AEF',
};

function CategoryRow({
  category,
  onDelete,
}: {
  category: Category;
  onDelete: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <ThemedView style={[styles.rowContainer, { borderBottomColor: theme.backgroundElement }]}>
      {/* Icon circle */}
      <View
        style={[styles.iconCircle, { backgroundColor: `${category.color}20` }]}
      >
        <Text style={styles.icon}>{category.icon}</Text>
      </View>

      {/* Name and type */}
      <View style={styles.rowInfo}>
        <ThemedText type="smallBold">{category.name}</ThemedText>
        <View style={styles.badgeRow}>
          <Badge
            label={category.type.charAt(0).toUpperCase() + category.type.slice(1)}
            color={TYPE_COLORS[category.type] ?? '#208AEF'}
          />
          {category.isSystem && (
            <Badge label="System" color={theme.backgroundSelected} textColor={theme.textSecondary} />
          )}
        </View>
      </View>

      {/* Delete (only for custom categories) */}
      {!category.isSystem && (
        <TouchableOpacity
          onPress={() => onDelete(category.id)}
          style={styles.deleteBtn}
          accessibilityLabel={`Delete category ${category.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

export default function CategoriesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, isLoading, fetchCategories, deleteCategory } = useCategoryStore();

  const userId = user?.id ?? '';
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    await fetchCategories(userId);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  function handleDelete(id: string) {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(id),
        },
      ],
    );
  }

  const systemCategories = categories.filter((c) => c.isSystem);
  const customCategories = categories.filter((c) => !c.isSystem);

  type ListItem =
    | { type: 'header'; title: string }
    | { type: 'category'; data: Category };

  const listData: ListItem[] = [
    ...(systemCategories.length > 0
      ? [
          { type: 'header' as const, title: 'System Categories' },
          ...systemCategories.map((c) => ({ type: 'category' as const, data: c })),
        ]
      : []),
    ...(customCategories.length > 0
      ? [
          { type: 'header' as const, title: 'Custom Categories' },
          ...customCategories.map((c) => ({ type: 'category' as const, data: c })),
        ]
      : []),
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
          Categories
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${index}` : item.data.id
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#208AEF" />
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <ThemedView style={styles.sectionHeader}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeaderText}>
                    {item.title}
                  </ThemedText>
                </ThemedView>
              );
            }
            return (
              <CategoryRow category={item.data} onDelete={handleDelete} />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="🏷"
              title="No categories"
              description="Add your first custom category."
            />
          }
          contentContainerStyle={listData.length === 0 ? styles.emptyContent : styles.listContent}
        />
      )}

      {/* Add button */}
      <ThemedView style={[styles.footer, { borderTopColor: theme.backgroundElement }]}>
        <Button
          label="+ Add Category"
          onPress={() => router.push('/(transactions)/categories/add')}
          variant="primary"
          size="md"
          fullWidth
          accessibilityLabel="Add new category"
        />
      </ThemedView>
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  rowInfo: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContent: {
    flex: 1,
  },
});
