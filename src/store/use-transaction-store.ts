import { create } from 'zustand';

import { CreateTransactionInput, MonthlySummary, Transaction, TransactionFilters } from '@/types/transaction';
import { transactionRepository } from '@/db/repositories/transaction-repository';
import { handleError } from '@/utils/error-handler';

interface TransactionState {
  transactions: Transaction[];
  summary: MonthlySummary | null;
  selectedMonth: number;
  selectedYear: number;
  isLoading: boolean;
  fetchTransactions: (userId: string, filters?: TransactionFilters) => Promise<void>;
  fetchSummary: (userId: string, month: number, year: number) => Promise<void>;
  addTransaction: (userId: string, data: CreateTransactionInput) => Promise<string | undefined>;
  updateTransaction: (id: string, data: Partial<CreateTransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setSelectedMonth: (month: number, year: number) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => {
  const now = new Date();
  return {
    transactions: [],
    summary: null,
    selectedMonth: now.getMonth(),
    selectedYear: now.getFullYear(),
    isLoading: false,

    fetchTransactions: async (userId, filters) => {
      set({ isLoading: true });
      try {
        const data = await transactionRepository.findAll(userId, filters);
        set({ transactions: data as Transaction[], isLoading: false });
      } catch (error) {
        handleError(error);
        set({ isLoading: false });
      }
    },

    fetchSummary: async (userId, month, year) => {
      try {
        const summary = await transactionRepository.getSummary(userId, month, year);
        set({ summary });
      } catch (error) {
        handleError(error);
      }
    },

    addTransaction: async (userId, data) => {
      try {
        const id = await transactionRepository.create(userId, data);
        const { selectedMonth, selectedYear } = get();
        await get().fetchSummary(userId, selectedMonth, selectedYear);
        return id;
      } catch (error) {
        handleError(error);
      }
    },

    updateTransaction: async (id, data) => {
      try {
        await transactionRepository.update(id, data);
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
      } catch (error) {
        handleError(error);
      }
    },

    deleteTransaction: async (id) => {
      try {
        await transactionRepository.delete(id);
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      } catch (error) {
        handleError(error);
      }
    },

    setSelectedMonth: (month, year) => set({ selectedMonth: month, selectedYear: year }),
  };
});
