import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { accounts } from './accounts';
import { users } from './users';

export const loans = sqliteTable('loans', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  lenderName: text('lender_name').notNull(),
  principalAmount: real('principal_amount').notNull(),
  outstandingAmount: real('outstanding_amount').notNull(),
  interestRate: real('interest_rate').notNull(),
  emiAmount: real('emi_amount').notNull(),
  emiDay: integer('emi_day').notNull(),
  startDate: integer('start_date').notNull(),
  endDate: integer('end_date').notNull(),
  tenureMonths: integer('tenure_months').notNull(),
  type: text('type', { enum: ['home', 'car', 'personal', 'education', 'other'] }).notNull(),
  accountId: text('account_id').references(() => accounts.id),
  createdAt: integer('created_at').notNull(),
});

export const loanPayments = sqliteTable('loan_payments', {
  id: text('id').primaryKey(),
  loanId: text('loan_id')
    .notNull()
    .references(() => loans.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  paymentDate: integer('payment_date').notNull(),
  principalComponent: real('principal_component').notNull(),
  interestComponent: real('interest_component').notNull(),
  note: text('note'),
});
