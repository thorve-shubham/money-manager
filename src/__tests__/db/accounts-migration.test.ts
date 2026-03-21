import { runMigrations } from '@/db/migrator';

const mockExecSyncCalls: string[] = [];
const mockMigrationsApplied: Array<{ name: string; applied_at: string }> = [];
const mockRunSyncCalls: Array<{ sql: string; args: unknown[] }> = [];

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
  mockExecSyncCalls.length = 0;
  mockMigrationsApplied.length = 0;
  mockRunSyncCalls.length = 0;

  mockExecSync = jest.fn((sql: string) => {
    mockExecSyncCalls.push(sql);
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

describe('accounts migration (0003_accounts_v2)', () => {
  it('creates the accounts table with the v2 schema', () => {
    runMigrations();
    const ddl = mockExecSyncCalls.find((sql) => sql.includes('CREATE TABLE accounts'));
    expect(ddl).toBeDefined();
  });

  it('includes sort_code and account_number columns', () => {
    runMigrations();
    const ddl = mockExecSyncCalls.find((sql) =>
      sql.includes('CREATE TABLE accounts')
    ) as string;
    expect(ddl).toContain('sort_code');
    expect(ddl).toContain('account_number');
  });

  it('does not include name or account_type columns', () => {
    runMigrations();
    const ddl = mockExecSyncCalls.find((sql) =>
      sql.includes('CREATE TABLE accounts')
    ) as string;
    expect(ddl).not.toContain('account_type');
    expect(ddl).not.toContain('"name"');
  });

  it('records 0003_accounts_v2 migration with an ISO timestamp', () => {
    runMigrations();
    const entry = mockMigrationsApplied.find((m) => m.name === '0003_accounts_v2');
    expect(entry).toBeDefined();
    expect(entry!.applied_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('runs all 3 migrations in order on a fresh database', () => {
    runMigrations();
    expect(mockMigrationsApplied).toHaveLength(3);
    expect(mockMigrationsApplied[0].name).toBe('0001_initial_schema');
    expect(mockMigrationsApplied[1].name).toBe('0002_accounts');
    expect(mockMigrationsApplied[2].name).toBe('0003_accounts_v2');
  });

  it('skips 0003_accounts_v2 on second run', () => {
    runMigrations();
    const countAfterFirst = mockExecSyncCalls.filter((sql) =>
      sql.includes('CREATE TABLE accounts')
    ).length;
    runMigrations();
    const countAfterSecond = mockExecSyncCalls.filter((sql) =>
      sql.includes('CREATE TABLE accounts')
    ).length;
    expect(countAfterSecond).toBe(countAfterFirst);
  });
});
