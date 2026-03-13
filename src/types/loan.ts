export type LoanType = 'home' | 'car' | 'personal' | 'education' | 'other';

export interface Loan {
  id: string;
  userId: string;
  name: string;
  lenderName: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  emiAmount: number;
  emiDay: number;
  startDate: number;
  endDate: number;
  tenureMonths: number;
  type: LoanType;
  accountId: string | null;
  createdAt: number;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: number;
  principalComponent: number;
  interestComponent: number;
  note: string | null;
}

export interface CreateLoanInput {
  name: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  emiAmount: number;
  emiDay: number;
  startDate: number;
  tenureMonths: number;
  type: LoanType;
  accountId?: string;
}

export interface AmortizationEntry {
  month: number;
  date: Date;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface RecordPaymentInput {
  amount: number;
  paymentDate: number;
  note?: string;
}
