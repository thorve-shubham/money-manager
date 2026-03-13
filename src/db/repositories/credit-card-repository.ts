import { eq } from 'drizzle-orm';

import { generateId } from '@/utils/id-generator';
import { CreateCreditCardInput } from '@/types/credit-card';
import { db } from '../client';
import { creditCards, creditCardStatements } from '../schema';

export const creditCardRepository = {
  async findAll(userId: string) {
    return db.select().from(creditCards).where(eq(creditCards.userId, userId)).orderBy(creditCards.name);
  },

  async findById(id: string) {
    const result = await db.select().from(creditCards).where(eq(creditCards.id, id));
    return result[0] ?? null;
  },

  async create(userId: string, data: CreateCreditCardInput) {
    const id = generateId();
    await db.insert(creditCards).values({ id, userId, ...data, createdAt: Date.now() });
    return id;
  },

  async update(id: string, data: Partial<CreateCreditCardInput>) {
    await db.update(creditCards).set(data).where(eq(creditCards.id, id));
  },

  async delete(id: string) {
    await db.delete(creditCards).where(eq(creditCards.id, id));
  },

  async getStatements(creditCardId: string) {
    return db
      .select()
      .from(creditCardStatements)
      .where(eq(creditCardStatements.creditCardId, creditCardId))
      .orderBy(creditCardStatements.statementMonth);
  },

  async createStatement(data: {
    creditCardId: string;
    statementMonth: number;
    totalDue: number;
    minimumDue: number;
    dueDate: number;
  }) {
    const id = generateId();
    await db.insert(creditCardStatements).values({ id, ...data, isPaid: false });
    return id;
  },

  async markStatementPaid(statementId: string, paidAmount: number) {
    await db
      .update(creditCardStatements)
      .set({ isPaid: true, paidAmount, paidDate: Date.now() })
      .where(eq(creditCardStatements.id, statementId));
  },
};
