import { and, between, desc, eq, ilike, like, or, sql, sum } from 'drizzle-orm';

import { generateId } from '@/utils/id-generator';
import {
  CategorySpend,
  CreateTransactionInput,
  MonthlySummary,
  TransactionFilters,
} from '@/types/transaction';
import { endOfMonth, startOfMonth } from '@/utils/date-utils';
import { db } from '../client';
import { transactions } from '../schema';

export const transactionRepository = {
  async findAll(userId: string, filters: TransactionFilters = {}) {
    const { type, categoryId, accountId, creditCardId, startDate, endDate, search, page = 0, limit = 20 } =
      filters;

    const conditions = [eq(transactions.userId, userId)];

    if (type) conditions.push(eq(transactions.type, type));
    if (categoryId) conditions.push(eq(transactions.categoryId, categoryId));
    if (accountId) conditions.push(eq(transactions.accountId, accountId));
    if (creditCardId) conditions.push(eq(transactions.creditCardId, creditCardId));
    if (startDate && endDate) conditions.push(between(transactions.date, startDate, endDate));
    if (search) {
      conditions.push(
        or(like(transactions.merchant, `%${search}%`), like(transactions.note, `%${search}%`))!,
      );
    }

    return db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(page * limit);
  },

  async findById(id: string) {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0] ?? null;
  },

  async create(userId: string, data: CreateTransactionInput) {
    const id = generateId();
    const now = Date.now();
    await db.insert(transactions).values({
      id,
      userId,
      categoryId: data.categoryId,
      accountId: data.accountId ?? null,
      creditCardId: data.creditCardId ?? null,
      type: data.type,
      amount: data.amount,
      note: data.note ?? null,
      merchant: data.merchant ?? null,
      date: data.date,
      isRecurring: data.isRecurring ?? false,
      recurringInterval: data.recurringInterval ?? null,
      createdAt: now,
    });
    return id;
  },

  async update(id: string, data: Partial<CreateTransactionInput>) {
    await db.update(transactions).set(data).where(eq(transactions.id, id));
  },

  async delete(id: string) {
    await db.delete(transactions).where(eq(transactions.id, id));
  },

  async getSummary(userId: string, month: number, year: number): Promise<MonthlySummary> {
    const start = startOfMonth(new Date(year, month, 1)).getTime();
    const end = endOfMonth(new Date(year, month, 1)).getTime();

    const result = await db
      .select({
        type: transactions.type,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), between(transactions.date, start, end)),
      )
      .groupBy(transactions.type);

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of result) {
      if (row.type === 'income') totalIncome = Number(row.total ?? 0);
      if (row.type === 'expense') totalExpense = Number(row.total ?? 0);
    }

    return { totalIncome, totalExpense, netAmount: totalIncome - totalExpense, month, year };
  },

  async getByCategory(userId: string, startDate: number, endDate: number): Promise<CategorySpend[]> {
    const result = await db
      .select({
        categoryId: transactions.categoryId,
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          between(transactions.date, startDate, endDate),
        ),
      )
      .groupBy(transactions.categoryId);

    return result.map((r) => ({ categoryId: r.categoryId, total: Number(r.total ?? 0) }));
  },
};
