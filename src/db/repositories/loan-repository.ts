import { eq, sum } from 'drizzle-orm';

import { generateId } from '@/utils/id-generator';
import { CreateLoanInput } from '@/types/loan';
import { db } from '../client';
import { loanPayments, loans } from '../schema';

export const loanRepository = {
  async findAll(userId: string) {
    return db.select().from(loans).where(eq(loans.userId, userId)).orderBy(loans.name);
  },

  async findById(id: string) {
    const result = await db.select().from(loans).where(eq(loans.id, id));
    return result[0] ?? null;
  },

  async create(userId: string, data: CreateLoanInput) {
    const id = generateId();
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + data.tenureMonths);

    await db.insert(loans).values({
      id,
      userId,
      name: data.name,
      lenderName: data.lenderName,
      principalAmount: data.principalAmount,
      outstandingAmount: data.principalAmount,
      interestRate: data.interestRate,
      emiAmount: data.emiAmount,
      emiDay: data.emiDay,
      startDate: data.startDate,
      endDate: endDate.getTime(),
      tenureMonths: data.tenureMonths,
      type: data.type,
      accountId: data.accountId ?? null,
      createdAt: Date.now(),
    });
    return id;
  },

  async update(id: string, data: Partial<Loan>) {
    await db.update(loans).set(data).where(eq(loans.id, id));
  },

  async updateOutstanding(id: string, outstandingAmount: number) {
    await db.update(loans).set({ outstandingAmount }).where(eq(loans.id, id));
  },

  async delete(id: string) {
    await db.delete(loans).where(eq(loans.id, id));
  },

  async getPayments(loanId: string) {
    return db
      .select()
      .from(loanPayments)
      .where(eq(loanPayments.loanId, loanId))
      .orderBy(loanPayments.paymentDate);
  },

  async recordPayment(data: {
    loanId: string;
    amount: number;
    paymentDate: number;
    principalComponent: number;
    interestComponent: number;
    note?: string;
  }) {
    const id = generateId();
    await db.insert(loanPayments).values({ id, ...data, note: data.note ?? null });
    return id;
  },

  async getTotalOutstanding(userId: string) {
    const result = await db
      .select({ total: sum(loans.outstandingAmount) })
      .from(loans)
      .where(eq(loans.userId, userId));
    return Number(result[0]?.total ?? 0);
  },
};

// Type workaround for partial update
type Loan = Awaited<ReturnType<typeof loanRepository.findById>>;
