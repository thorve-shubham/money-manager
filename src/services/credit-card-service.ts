import { CreditCard, BillingPeriod } from '@/types/credit-card';
import { transactionRepository } from '@/db/repositories/transaction-repository';
import { creditCardRepository } from '@/db/repositories/credit-card-repository';
import { toYYYYMM } from '@/utils/date-utils';

export const creditCardService = {
  /**
   * Get the billing period (start/end dates) for a credit card given a reference date.
   * e.g. billingCycleDay=5 means billing starts on the 5th of each month.
   */
  getBillingPeriod(card: CreditCard, referenceDate: Date = new Date()): BillingPeriod {
    const day = card.billingCycleDay;
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const today = referenceDate.getDate();

    let cycleStart: Date;
    if (today >= day) {
      // Current cycle started this month on billingCycleDay
      cycleStart = new Date(year, month, day, 0, 0, 0, 0);
    } else {
      // Current cycle started last month on billingCycleDay
      cycleStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    // Cycle ends the day before next cycle start
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);
    cycleEnd.setDate(cycleEnd.getDate() - 1);
    cycleEnd.setHours(23, 59, 59, 999);

    return { start: cycleStart, end: cycleEnd };
  },

  /**
   * Get the payment due date for a billing period.
   * paymentDueDay is the number of days after billing cycle ends.
   */
  getStatementDueDate(card: CreditCard, billingEnd: Date): Date {
    const dueDate = new Date(billingEnd);
    dueDate.setDate(dueDate.getDate() + card.paymentDueDay);
    return dueDate;
  },

  /**
   * Get total spend on a credit card within a billing period.
   */
  async getCurrentCycleSpend(cardId: string, billingPeriod: BillingPeriod): Promise<number> {
    const txns = await transactionRepository.findAll('', {
      creditCardId: cardId,
      startDate: billingPeriod.start.getTime(),
      endDate: billingPeriod.end.getTime(),
    });
    return txns.reduce((sum, t) => sum + t.amount, 0);
  },

  /**
   * Generate a statement for a credit card for a given month.
   */
  async generateStatement(
    card: CreditCard,
    month: number,
    year: number,
  ): Promise<string> {
    const billingPeriod = this.getBillingPeriod(card, new Date(year, month, 15));
    const totalDue = await this.getCurrentCycleSpend(card.id, billingPeriod);
    const minimumDue = Math.max(totalDue * 0.05, 200); // 5% or minimum ₹200
    const dueDate = this.getStatementDueDate(card, billingPeriod.end);

    return creditCardRepository.createStatement({
      creditCardId: card.id,
      statementMonth: toYYYYMM(billingPeriod.end),
      totalDue,
      minimumDue,
      dueDate: dueDate.getTime(),
    });
  },

  /**
   * Get available credit (limit - current cycle spend).
   */
  async getAvailableCredit(card: CreditCard): Promise<number> {
    const period = this.getBillingPeriod(card);
    const spent = await this.getCurrentCycleSpend(card.id, period);
    return Math.max(0, card.creditLimit - spent);
  },
};
