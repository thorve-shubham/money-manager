import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset } from '@/constants/theme';

function TabIcon({ focused, emoji }: { focused: boolean; emoji: string }) {
  const scale = useSharedValue(focused ? 1.15 : 1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.15 : 1, { damping: 10, stiffness: 200 }) }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={styles.tabIcon}>
        <Animated.Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>
          {emoji}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.addButtonContainer}
      accessibilityLabel="Add transaction"
      accessibilityRole="button">
      <View style={styles.addButton}>
        <Animated.Text style={styles.addButtonText}>+</Animated.Text>
      </View>
    </Pressable>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.backgroundElement,
            height: Platform.select({ ios: 84, android: 64 }),
            paddingBottom: Platform.select({ ios: 28, android: 8 }),
          },
          tabBarActiveTintColor: '#208AEF',
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}>
        <Tabs.Screen
          name="(dashboard)/index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="📊" />,
          }}
        />
        <Tabs.Screen
          name="(transactions)/index"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🧾" />,
          }}
        />
        <Tabs.Screen
          name="__add"
          options={{
            title: '',
            tabBarButton: () => <AddButton onPress={() => setAddSheetVisible(true)} />,
          }}
        />
        <Tabs.Screen
          name="(accounts)/index"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="🏦" />,
          }}
        />
        <Tabs.Screen
          name="(settings)/index"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} emoji="⚙️" />,
          }}
        />
      </Tabs>

      <BottomSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        title="Add Transaction">
        {/* AddTransactionForm will be rendered here */}
        <View style={{ height: 400 }} />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center' },
  tabEmoji: { fontSize: 22 },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.select({ ios: 16, android: 8 }),
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 32,
  },
});
