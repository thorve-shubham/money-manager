import { StyleSheet } from 'react-native';
import { ThemedView, ThemedText } from '@/components';

export default function AccountsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText size="xxl" weight="bold">
        Accounts
      </ThemedText>
      <ThemedText variant="secondary" size="md">
        Coming soon
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
