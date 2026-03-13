import { eq, sum } from 'drizzle-orm';

import { generateId } from '@/utils/id-generator';
import { CreateAccountInput } from '@/types/account';
import { db } from '../client';
import { accounts } from '../schema';

export const accountRepository = {
  async findAll(userId: string) {
    return db.select().from(accounts).where(eq(accounts.userId, userId)).orderBy(accounts.isDefault, accounts.name);
  },

  async findById(id: string) {
    const result = await db.select().from(accounts).where(eq(accounts.id, id));
    return result[0] ?? null;
  },

  async create(userId: string, data: CreateAccountInput) {
    const id = generateId();
    const now = Date.now();

    // If this should be default, clear existing defaults first
    if (data.isDefault) {
      await db.update(accounts).set({ isDefault: false }).where(eq(accounts.userId, userId));
    }

    await db.insert(accounts).values({
      id,
      userId,
      name: data.name,
      type: data.type,
      bankName: data.bankName ?? null,
      accountNumberLast4: data.accountNumberLast4 ?? null,
      balance: data.initialBalance,
      currency: data.currency,
      color: data.color,
      isDefault: data.isDefault ?? false,
      createdAt: now,
    });
    return id;
  },

  async update(id: string, data: Partial<Omit<CreateAccountInput, 'initialBalance'> & { balance: number }>) {
    await db.update(accounts).set(data).where(eq(accounts.id, id));
  },

  async updateBalance(id: string, newBalance: number) {
    await db.update(accounts).set({ balance: newBalance }).where(eq(accounts.id, id));
  },

  async delete(id: string) {
    await db.delete(accounts).where(eq(accounts.id, id));
  },

  async getTotalBalance(userId: string) {
    const result = await db
      .select({ total: sum(accounts.balance) })
      .from(accounts)
      .where(eq(accounts.userId, userId));
    return result[0]?.total ?? 0;
  },
};
