import { AmortizationEntry, CreateLoanInput, Loan, RecordPaymentInput } from '@/types/loan';
import { loanRepository } from '@/db/repositories/loan-repository';
import { transactionRepository } from '@/db/repositories/transaction-repository';
import { generateId } from '@/utils/id-generator';

export const loanService = {
  /**
   * Calculate EMI using the standard reducing balance formula:
   * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
   * where r = monthly interest rate, n = tenure in months
   */
  calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
    if (annualRate === 0) return principal / tenureMonths;
    const monthlyRate = annualRate / 100 / 12;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  },

  /**
   * Generate full amortization schedule for a loan.
   */
  calculateAmortization(loan: Loan): AmortizationEntry[] {
    const schedule: AmortizationEntry[] = [];
    let balance = loan.principalAmount;
    const monthlyRate = loan.interestRate / 100 / 12;
    const startDate = new Date(loan.startDate);

    for (let month = 1; month <= loan.tenureMonths; month++) {
      const interestComponent = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const principalComponent = Math.min(loan.emiAmount - interestComponent, balance);
      balance = Math.max(0, balance - principalComponent);

      const date = new Date(startDate);
      date.setMonth(date.getMonth() + month);
      date.setDate(loan.emiDay);

      schedule.push({
        month,
        date,
        emi: loan.emiAmount,
        principal: Math.round(principalComponent * 100) / 100,
        interest: Math.round(interestComponent * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });

      if (balance <= 0) break;
    }

    return schedule;
  },

  /**
   * Get the next EMI due date for a loan.
   */
  getNextEmiDate(loan: Loan): Date {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), loan.emiDay);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  },

  /**
   * Record an EMI payment:
   * - Calculates principal/interest split at current outstanding
   * - Updates outstanding amount
   * - Creates a linked expense transaction
   */
  async recordPayment(
    loan: Loan,
    categoryId: string,
    input: RecordPaymentInput,
  ): Promise<void> {
    const monthlyRate = loan.interestRate / 100 / 12;
    const interestComponent =
      monthlyRate === 0 ? 0 : loan.outstandingAmount * monthlyRate;
    const principalComponent = Math.max(0, input.amount - interestComponent);
    const newOutstanding = Math.max(0, loan.outstandingAmount - principalComponent);

    await loanRepository.recordPayment({
      loanId: loan.id,
      amount: input.amount,
      paymentDate: input.paymentDate,
      principalComponent: Math.round(principalComponent * 100) / 100,
      interestComponent: Math.round(interestComponent * 100) / 100,
      note: input.note,
    });

    await loanRepository.updateOutstanding(loan.id, newOutstanding);

    // Create linked expense transaction if account is set
    if (loan.accountId) {
      await transactionRepository.create(loan.userId, {
        categoryId,
        accountId: loan.accountId,
        type: 'expense',
        amount: input.amount,
        merchant: loan.lenderName,
        note: `EMI payment - ${loan.name}`,
        date: input.paymentDate,
      });
    }
  },

  /**
   * Calculate how much of the loan has been repaid (as a 0-1 ratio).
   */
  getRepaidRatio(loan: Loan): number {
    if (loan.principalAmount === 0) return 1;
    return Math.min(1, 1 - loan.outstandingAmount / loan.principalAmount);
  },
};
