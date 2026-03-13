export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  bankName: string;
  cardNumberLast4: string;
  creditLimit: number;
  billingCycleDay: number;
  paymentDueDay: number;
  color: string;
  createdAt: number;
}

export interface CreditCardStatement {
  id: string;
  creditCardId: string;
  statementMonth: number;
  totalDue: number;
  minimumDue: number;
  dueDate: number;
  isPaid: boolean;
  paidAmount: number | null;
  paidDate: number | null;
}

export interface CreateCreditCardInput {
  name: string;
  bankName: string;
  cardNumberLast4: string;
  creditLimit: number;
  billingCycleDay: number;
  paymentDueDay: number;
  color: string;
}

export interface BillingPeriod {
  start: Date;
  end: Date;
}
