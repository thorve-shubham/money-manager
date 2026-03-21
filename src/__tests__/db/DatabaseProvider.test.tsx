import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { DatabaseProvider } from '@/db/provider';

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    runSync: jest.fn(),
  })),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({})),
}));

// Prefixed with 'mock' so jest-babel hoists the declaration alongside jest.mock
let mockMigrationShouldFail = false;

jest.mock('@/db/migrator', () => ({
  runMigrations: jest.fn(() => {
    if (mockMigrationShouldFail) {
      throw new Error('Migration failed: table already exists');
    }
  }),
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
}));

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  mockMigrationShouldFail = false;
});

describe('DatabaseProvider', () => {
  it('renders successfully without crashing', async () => {
    // In the test environment useEffect is flushed synchronously,
    // so we assert the final ready state rather than the transient loading state.
    const { getByText } = wrap(
      <DatabaseProvider>
        <Text>App</Text>
      </DatabaseProvider>
    );
    await waitFor(() => {
      expect(getByText('App')).toBeTruthy();
    });
  });

  it('renders children after migrations succeed', async () => {
    const { getByText } = wrap(
      <DatabaseProvider>
        <Text>AppContent</Text>
      </DatabaseProvider>
    );
    await waitFor(() => {
      expect(getByText('AppContent')).toBeTruthy();
    });
  });

  it('shows error text when migrations throw', async () => {
    mockMigrationShouldFail = true;
    const { getByText } = wrap(
      <DatabaseProvider>
        <Text>App</Text>
      </DatabaseProvider>
    );
    await waitFor(() => {
      expect(
        getByText('Database error: Migration failed: table already exists')
      ).toBeTruthy();
    });
  });

  it('does not render children when in error state', async () => {
    mockMigrationShouldFail = true;
    const { queryByText } = wrap(
      <DatabaseProvider>
        <Text>ShouldNotAppear</Text>
      </DatabaseProvider>
    );
    await waitFor(() => {
      expect(queryByText('ShouldNotAppear')).toBeNull();
    });
  });

  it('error message includes the thrown error message', async () => {
    mockMigrationShouldFail = true;
    const { getByText } = wrap(
      <DatabaseProvider>
        <Text>App</Text>
      </DatabaseProvider>
    );
    await waitFor(() => {
      expect(
        getByText('Database error: Migration failed: table already exists')
      ).toBeTruthy();
    });
  });
});
