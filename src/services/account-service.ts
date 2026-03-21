import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export type Account = {
  id: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  balance: string;
  currency: string;
  isActive: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAccountInput = {
  bankName: string;
  sortCode: string;
  accountNumber: string;
  currency: string;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const accountService = {
  getAllAccounts(): Account[] {
    return db.select().from(schema.accounts).all() as Account[];
  },

  getAccountById(id: string): Account | undefined {
    return (
      (db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.id, id))
        .get() as Account | undefined) ?? undefined
    );
  },

  createAccount(input: CreateAccountInput): Account {
    const now = new Date().toISOString();
    const account: Account = {
      id: generateId(),
      bankName: input.bankName,
      sortCode: input.sortCode,
      accountNumber: input.accountNumber,
      balance: '0',
      currency: input.currency,
      isActive: 'true',
      createdAt: now,
      updatedAt: now,
    };
    db.insert(schema.accounts).values(account).run();
    return account;
  },

  updateAccount(id: string, input: UpdateAccountInput): Account {
    const existing = accountService.getAccountById(id);
    if (!existing) {
      throw new Error(`Account ${id} not found`);
    }
    const now = new Date().toISOString();
    const updated: Account = { ...existing, ...input, updatedAt: now };
    db.update(schema.accounts).set(updated).where(eq(schema.accounts.id, id)).run();
    return updated;
  },

  deleteAccount(id: string): void {
    db.delete(schema.accounts).where(eq(schema.accounts.id, id)).run();
  },
};
