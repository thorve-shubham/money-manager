import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { users } from './users';

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['bank', 'wallet', 'cash'] }).notNull(),
  bankName: text('bank_name'),
  accountNumberLast4: text('account_number_last4'),
  balance: real('balance').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  color: text('color').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
});
