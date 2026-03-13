import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { users } from './users';

export const creditCards = sqliteTable('credit_cards', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  bankName: text('bank_name').notNull(),
  cardNumberLast4: text('card_number_last4').notNull(),
  creditLimit: real('credit_limit').notNull(),
  billingCycleDay: integer('billing_cycle_day').notNull(),
  paymentDueDay: integer('payment_due_day').notNull(),
  color: text('color').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const creditCardStatements = sqliteTable('credit_card_statements', {
  id: text('id').primaryKey(),
  creditCardId: text('credit_card_id')
    .notNull()
    .references(() => creditCards.id, { onDelete: 'cascade' }),
  statementMonth: integer('statement_month').notNull(),
  totalDue: real('total_due').notNull(),
  minimumDue: real('minimum_due').notNull(),
  dueDate: integer('due_date').notNull(),
  isPaid: integer('is_paid', { mode: 'boolean' }).notNull().default(false),
  paidAmount: real('paid_amount'),
  paidDate: integer('paid_date'),
});
