import { runMigrations } from '@/db/migrator';

// Shared state arrays — declared with let/mock prefix so jest-babel hoists them before jest.mock
const mockExecSyncCalls: string[] = [];
const mockMigrationsApplied: Array<{ name: string; applied_at: string }> = [];
const mockRunSyncCalls: Array<{ sql: string; args: unknown[] }> = [];
let mockTableExists = false;

// Mocks are declared as lets so they can be re-assigned in beforeEach.
// The mock factory captures these by reference — the inner arrow functions
// look up the current value at call time, so beforeEach reassignment works.
let mockExecSync: jest.Mock;
let mockGetAllSync: jest.Mock;
let mockRunSync: jest.Mock;

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: (sql: string) => mockExecSync(sql),
    getAllSync: <T>(sql: string): T[] => mockGetAllSync(sql),
    runSync: (sql: string, args: unknown[]) => mockRunSync(sql, args),
  })),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({})),
}));

beforeEach(() => {
  mockTableExists = false;
  mockExecSyncCalls.length = 0;
  mockMigrationsApplied.length = 0;
  mockRunSyncCalls.length = 0;

  mockExecSync = jest.fn((sql: string) => {
    mockExecSyncCalls.push(sql);
    if (sql.includes('CREATE TABLE IF NOT EXISTS __migrations')) {
      mockTableExists = true;
    }
  });

  mockGetAllSync = jest.fn((_sql: string) => {
    return mockMigrationsApplied;
  });

  mockRunSync = jest.fn((sql: string, args: unknown[]) => {
    mockRunSyncCalls.push({ sql, args });
    if (sql.includes('INSERT INTO __migrations')) {
      mockMigrationsApplied.push({
        name: args[0] as string,
        applied_at: args[1] as string,
      });
    }
  });
});

describe('runMigrations', () => {
  it('creates the __migrations table on first run', () => {
    runMigrations();
    expect(mockTableExists).toBe(true);
    const ddlCall = mockExecSyncCalls.find((sql) =>
      sql.includes('CREATE TABLE IF NOT EXISTS __migrations')
    );
    expect(ddlCall).toBeDefined();
  });

  it('runs pending migration SQL', () => {
    runMigrations();
    const categoriesDdl = mockExecSyncCalls.find((sql) =>
      sql.includes('CREATE TABLE IF NOT EXISTS categories')
    );
    expect(categoriesDdl).toBeDefined();
  });

  it('records each applied migration in __migrations with an ISO timestamp', () => {
    runMigrations();
    expect(mockMigrationsApplied).toHaveLength(3);
    expect(mockMigrationsApplied[0].name).toBe('0001_initial_schema');
    expect(mockMigrationsApplied[0].applied_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
    expect(mockMigrationsApplied[1].name).toBe('0002_accounts');
    expect(mockMigrationsApplied[1].applied_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
    expect(mockMigrationsApplied[2].name).toBe('0003_accounts_v2');
    expect(mockMigrationsApplied[2].applied_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
  });

  it('skips already-applied migrations on second run', () => {
    runMigrations(); // first run — applies migration
    const countAfterFirst = mockExecSyncCalls.filter((sql) =>
      sql.includes('CREATE TABLE IF NOT EXISTS categories')
    ).length;

    runMigrations(); // second run — migration already recorded
    const countAfterSecond = mockExecSyncCalls.filter((sql) =>
      sql.includes('CREATE TABLE IF NOT EXISTS categories')
    ).length;

    expect(countAfterSecond).toBe(countAfterFirst);
  });

  it('does not insert a duplicate record into __migrations on second run', () => {
    runMigrations();
    runMigrations();
    const inserts = mockRunSyncCalls.filter(({ sql }) =>
      sql.includes('INSERT INTO __migrations')
    );
    expect(inserts).toHaveLength(3);
  });
});
