import { migration_0001 } from './0001_initial_schema';
import { migration_0002 } from './0002_accounts';
import { migration_0003 } from './0003_accounts_v2';

export type Migration = {
  name: string;
  sql: string;
};

export const ALL_MIGRATIONS: Migration[] = [migration_0001, migration_0002, migration_0003];
