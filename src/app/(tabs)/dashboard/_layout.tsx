import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function DashboardLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Money Manager',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
  );
}
