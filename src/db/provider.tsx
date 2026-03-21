import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { runMigrations } from './migrator';

type DbStatus = 'pending' | 'ready' | 'error';

type DatabaseContextValue = {
  status: DbStatus;
};

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return ctx;
}

type Props = {
  children: React.ReactNode;
};

export function DatabaseProvider({ children }: Props) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<DbStatus>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    try {
      runMigrations();
      setStatus('ready');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown database error';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  if (status === 'pending') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          testID="db-loading-indicator"
          color={colors.primary}
          size="large"
        />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {`Database error: ${errorMessage}`}
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ status }}>
      {children}
    </DatabaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
