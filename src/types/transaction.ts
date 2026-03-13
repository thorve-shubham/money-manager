export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  accountId: string | null;
  creditCardId: string | null;
  type: TransactionType;
  amount: number;
  note: string | null;
  merchant: string | null;
  date: number;
  isRecurring: boolean;
  recurringInterval: RecurringInterval | null;
  createdAt: number;
}

export interface CreateTransactionInput {
  categoryId: string;
  accountId?: string;
  creditCardId?: string;
  type: TransactionType;
  amount: number;
  note?: string;
  merchant?: string;
  date: number;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  creditCardId?: string;
  startDate?: number;
  endDate?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  month: number;
  year: number;
}

export interface CategorySpend {
  categoryId: string;
  total: number;
}
