import { Tabs } from 'expo-router';
import { useTheme } from '@/theme';
import { TabBarIcon } from '@/components';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iosName="chart.bar.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iosName="banknote.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="credit-cards"
        options={{
          title: 'Credit Cards',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iosName="creditcard.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon iosName="gearshape.fill" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
