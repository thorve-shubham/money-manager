import { create } from 'zustand';

import { CreateCreditCardInput, CreditCard, CreditCardStatement } from '@/types/credit-card';
import { creditCardRepository } from '@/db/repositories/credit-card-repository';
import { handleError } from '@/utils/error-handler';

interface CreditCardState {
  creditCards: CreditCard[];
  isLoading: boolean;
  fetchCreditCards: (userId: string) => Promise<void>;
  addCreditCard: (userId: string, data: CreateCreditCardInput) => Promise<string | undefined>;
  updateCreditCard: (id: string, data: Partial<CreateCreditCardInput>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  getStatements: (creditCardId: string) => Promise<CreditCardStatement[]>;
  markStatementPaid: (statementId: string, amount: number) => Promise<void>;
}

export const useCreditCardStore = create<CreditCardState>((set, get) => ({
  creditCards: [],
  isLoading: false,

  fetchCreditCards: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await creditCardRepository.findAll(userId);
      set({ creditCards: data as CreditCard[], isLoading: false });
    } catch (error) {
      handleError(error);
      set({ isLoading: false });
    }
  },

  addCreditCard: async (userId, data) => {
    try {
      const id = await creditCardRepository.create(userId, data);
      await get().fetchCreditCards(userId);
      return id;
    } catch (error) {
      handleError(error);
    }
  },

  updateCreditCard: async (id, data) => {
    try {
      await creditCardRepository.update(id, data);
      set((state) => ({
        creditCards: state.creditCards.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
    } catch (error) {
      handleError(error);
    }
  },

  deleteCreditCard: async (id) => {
    try {
      await creditCardRepository.delete(id);
      set((state) => ({ creditCards: state.creditCards.filter((c) => c.id !== id) }));
    } catch (error) {
      handleError(error);
    }
  },

  getStatements: async (creditCardId) => {
    try {
      const data = await creditCardRepository.getStatements(creditCardId);
      return data as CreditCardStatement[];
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  markStatementPaid: async (statementId, amount) => {
    try {
      await creditCardRepository.markStatementPaid(statementId, amount);
    } catch (error) {
      handleError(error);
    }
  },
}));
