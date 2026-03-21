import { getRawDb } from './client';
import { ALL_MIGRATIONS, Migration } from './migrations';

type MigrationRow = {
  name: string;
  applied_at: string;
};

function createMigrationsTable(): void {
  const rawDb = getRawDb();
  rawDb.execSync(`
    CREATE TABLE IF NOT EXISTS __migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

function getAppliedMigrations(): Set<string> {
  const rawDb = getRawDb();
  const rows = rawDb.getAllSync<MigrationRow>(
    'SELECT name FROM __migrations ORDER BY applied_at ASC;'
  );
  return new Set(rows.map((r) => r.name));
}

function applyMigration(migration: Migration): void {
  const rawDb = getRawDb();
  rawDb.execSync(migration.sql);
  rawDb.runSync('INSERT INTO __migrations (name, applied_at) VALUES (?, ?);', [
    migration.name,
    new Date().toISOString(),
  ]);
}

export function runMigrations(): void {
  createMigrationsTable();
  const applied = getAppliedMigrations();

  for (const migration of ALL_MIGRATIONS) {
    if (!applied.has(migration.name)) {
      applyMigration(migration);
    }
  }
}
