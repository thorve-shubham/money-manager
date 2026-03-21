import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('money-manager.db');

export const db = drizzle(expoDb, { schema });

export function getRawDb(): ReturnType<typeof openDatabaseSync> {
  return expoDb;
}
