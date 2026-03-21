export const migration_0002 = {
  name: '0002_accounts',
  sql: `
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      balance TEXT NOT NULL,
      currency TEXT NOT NULL,
      is_active TEXT NOT NULL DEFAULT 'true',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `,
};
