import { create } from 'zustand';

import { CreateLoanInput, Loan, LoanPayment, RecordPaymentInput } from '@/types/loan';
import { loanRepository } from '@/db/repositories/loan-repository';
import { handleError } from '@/utils/error-handler';

interface LoanState {
  loans: Loan[];
  totalOutstanding: number;
  isLoading: boolean;
  fetchLoans: (userId: string) => Promise<void>;
  addLoan: (userId: string, data: CreateLoanInput) => Promise<string | undefined>;
  deleteLoan: (id: string) => Promise<void>;
  getPayments: (loanId: string) => Promise<LoanPayment[]>;
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  totalOutstanding: 0,
  isLoading: false,

  fetchLoans: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await loanRepository.findAll(userId);
      const total = await loanRepository.getTotalOutstanding(userId);
      set({ loans: data as Loan[], totalOutstanding: total, isLoading: false });
    } catch (error) {
      handleError(error);
      set({ isLoading: false });
    }
  },

  addLoan: async (userId, data) => {
    try {
      const id = await loanRepository.create(userId, data);
      await get().fetchLoans(userId);
      return id;
    } catch (error) {
      handleError(error);
    }
  },

  deleteLoan: async (id) => {
    try {
      await loanRepository.delete(id);
      set((state) => ({ loans: state.loans.filter((l) => l.id !== id) }));
    } catch (error) {
      handleError(error);
    }
  },

  getPayments: async (loanId) => {
    try {
      const data = await loanRepository.getPayments(loanId);
      return data as LoanPayment[];
    } catch (error) {
      handleError(error);
      return [];
    }
  },
}));
