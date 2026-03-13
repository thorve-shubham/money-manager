import { create } from 'zustand';

import { Account, CreateAccountInput } from '@/types/account';
import { accountRepository } from '@/db/repositories/account-repository';
import { handleError } from '@/utils/error-handler';

interface AccountState {
  accounts: Account[];
  totalBalance: number;
  isLoading: boolean;
  fetchAccounts: (userId: string) => Promise<void>;
  addAccount: (userId: string, data: CreateAccountInput) => Promise<string | undefined>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  totalBalance: 0,
  isLoading: false,

  fetchAccounts: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await accountRepository.findAll(userId);
      const total = await accountRepository.getTotalBalance(userId);
      set({ accounts: data as Account[], totalBalance: Number(total), isLoading: false });
    } catch (error) {
      handleError(error);
      set({ isLoading: false });
    }
  },

  addAccount: async (userId, data) => {
    try {
      const id = await accountRepository.create(userId, data);
      await get().fetchAccounts(userId);
      return id;
    } catch (error) {
      handleError(error);
    }
  },

  updateAccount: async (id, data) => {
    try {
      await accountRepository.update(id, data as any);
      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
      }));
    } catch (error) {
      handleError(error);
    }
  },

  deleteAccount: async (id) => {
    try {
      await accountRepository.delete(id);
      set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
    } catch (error) {
      handleError(error);
    }
  },
}));
