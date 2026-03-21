import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: text('created_at').notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  bankName: text('bank_name').notNull(),
  sortCode: text('sort_code').notNull(),
  accountNumber: text('account_number').notNull(),
  balance: text('balance').notNull(),
  currency: text('currency').notNull(),
  isActive: text('is_active').notNull().default('true'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
