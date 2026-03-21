// Replaces 0002_accounts: removes name/account_type, adds sort_code/account_number.
// Safe to drop and recreate in development — no real user data yet.
export const migration_0003 = {
  name: '0003_accounts_v2',
  sql: `
    DROP TABLE IF EXISTS accounts;
    CREATE TABLE accounts (
      id TEXT PRIMARY KEY NOT NULL,
      bank_name TEXT NOT NULL,
      sort_code TEXT NOT NULL,
      account_number TEXT NOT NULL,
      balance TEXT NOT NULL,
      currency TEXT NOT NULL,
      is_active TEXT NOT NULL DEFAULT 'true',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
};
