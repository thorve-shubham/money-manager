import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { accounts } from './accounts';
import { categories } from './categories';
import { creditCards } from './credit-cards';
import { users } from './users';

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  accountId: text('account_id').references(() => accounts.id),
  creditCardId: text('credit_card_id').references(() => creditCards.id),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  amount: real('amount').notNull(),
  note: text('note'),
  merchant: text('merchant'),
  date: integer('date').notNull(),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  recurringInterval: text('recurring_interval', {
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  }),
  createdAt: integer('created_at').notNull(),
});
