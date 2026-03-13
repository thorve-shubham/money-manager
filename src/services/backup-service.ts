import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { db } from '@/db/client';
import { accounts, categories, creditCards, creditCardStatements, loanPayments, loans, transactions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BACKUP_VERSION = 1;
const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;

interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    users: unknown[];
    categories: unknown[];
    accounts: unknown[];
    creditCards: unknown[];
    creditCardStatements: unknown[];
    transactions: unknown[];
    loans: unknown[];
    loanPayments: unknown[];
  };
}

export const backupService = {
  async createBackup(userId: string): Promise<string> {
    // Ensure backup directory exists
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }

    // Query all user data
    const [
      usersData,
      categoriesData,
      accountsData,
      creditCardsData,
      statementsData,
      transactionsData,
      loansData,
      paymentsData,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)),
      db.select().from(categories).where(eq(categories.userId, userId)),
      db.select().from(accounts).where(eq(accounts.userId, userId)),
      db.select().from(creditCards).where(eq(creditCards.userId, userId)),
      db.select().from(creditCardStatements),
      db.select().from(transactions).where(eq(transactions.userId, userId)),
      db.select().from(loans).where(eq(loans.userId, userId)),
      db.select().from(loanPayments),
    ]);

    const backup: BackupData = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        users: usersData,
        categories: categoriesData,
        accounts: accountsData,
        creditCards: creditCardsData,
        creditCardStatements: statementsData,
        transactions: transactionsData,
        loans: loansData,
        loanPayments: paymentsData,
      },
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `money-manager-backup-${dateStr}.json`;
    const filePath = `${BACKUP_DIR}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share/save the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Save Backup File',
        UTI: 'public.json',
      });
    }

    return filePath;
  },

  async restoreFromBackup(userId: string): Promise<void> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let backup: BackupData;
    try {
      backup = JSON.parse(content) as BackupData;
    } catch {
      throw new Error('Invalid backup file: could not parse JSON.');
    }

    if (!backup.version || backup.version > BACKUP_VERSION) {
      throw new Error('Incompatible backup version. Please use the latest app.');
    }

    if (!backup.data) {
      throw new Error('Invalid backup file: missing data.');
    }

    // Restore data — clear existing user data first, then re-insert
    await db.delete(transactions).where(eq(transactions.userId, userId));
    await db.delete(loanPayments);
    await db.delete(loans).where(eq(loans.userId, userId));
    await db.delete(creditCardStatements);
    await db.delete(creditCards).where(eq(creditCards.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));
    await db.delete(categories).where(eq(categories.userId, userId));

    // Re-insert
    if (backup.data.categories.length > 0) {
      await db.insert(categories).values(backup.data.categories as any[]).onConflictDoNothing();
    }
    if (backup.data.accounts.length > 0) {
      await db.insert(accounts).values(backup.data.accounts as any[]).onConflictDoNothing();
    }
    if (backup.data.creditCards.length > 0) {
      await db.insert(creditCards).values(backup.data.creditCards as any[]).onConflictDoNothing();
    }
    if (backup.data.creditCardStatements.length > 0) {
      await db.insert(creditCardStatements).values(backup.data.creditCardStatements as any[]).onConflictDoNothing();
    }
    if (backup.data.transactions.length > 0) {
      await db.insert(transactions).values(backup.data.transactions as any[]).onConflictDoNothing();
    }
    if (backup.data.loans.length > 0) {
      await db.insert(loans).values(backup.data.loans as any[]).onConflictDoNothing();
    }
    if (backup.data.loanPayments.length > 0) {
      await db.insert(loanPayments).values(backup.data.loanPayments as any[]).onConflictDoNothing();
    }
  },

  async getLastBackupDate(): Promise<string | null> {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) return null;

    const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
    const backupFiles = files
      .filter((f) => f.startsWith('money-manager-backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) return null;

    // Extract date from filename
    const match = backupFiles[0].match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  },
};
