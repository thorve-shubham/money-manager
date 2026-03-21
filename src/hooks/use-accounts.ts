import { useState, useCallback } from 'react';
import { accountService, type Account } from '@/services/account-service';

export type { Account };

type UseAccountsReturn = {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  deleteAccount: (id: string) => void;
};

export function useAccounts(): UseAccountsReturn {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const data = accountService.getAllAccounts();
      setAccounts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(
    (id: string) => {
      try {
        accountService.deleteAccount(id);
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete account');
      }
    },
    [refresh]
  );

  return { accounts, isLoading, error, refresh, deleteAccount };
}
