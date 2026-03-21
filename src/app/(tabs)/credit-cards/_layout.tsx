import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function CreditCardsLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Credit Cards',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
  );
}
