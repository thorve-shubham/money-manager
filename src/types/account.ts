export type AccountType = 'bank' | 'wallet' | 'cash';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bankName: string | null;
  accountNumberLast4: string | null;
  balance: number;
  currency: string;
  color: string;
  isDefault: boolean;
  createdAt: number;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  bankName?: string;
  accountNumberLast4?: string;
  initialBalance: number;
  currency: string;
  color: string;
  isDefault?: boolean;
}
