import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function AccountsLayout() {
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
