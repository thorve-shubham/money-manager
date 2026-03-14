import { StyleSheet, Switch, View } from 'react-native';
import { ThemedView, ThemedText } from '@/components';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText size="xxl" weight="bold" style={styles.title}>
        Settings
      </ThemedText>

      <ThemedView variant="surface" style={styles.row}>
        <ThemedText size="md">Dark Mode</ThemedText>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
});
