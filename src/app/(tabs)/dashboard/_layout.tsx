import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function DashboardLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
  );
}
