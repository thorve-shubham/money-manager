import { accountService } from '@/services/account-service';
import type { Account } from '@/services/account-service';

let mockSelectResult: Account[] = [];
let mockGetResult: Account | undefined = undefined;
let mockInsertRun: jest.Mock;
let mockUpdateRun: jest.Mock;
let mockDeleteRun: jest.Mock;

jest.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        all: () => mockSelectResult,
        where: () => ({ get: () => mockGetResult }),
      }),
    }),
    insert: () => ({ values: () => ({ run: () => mockInsertRun() }) }),
    update: () => ({ set: () => ({ where: () => ({ run: () => mockUpdateRun() }) }) }),
    delete: () => ({ where: () => ({ run: () => mockDeleteRun() }) }),
  },
  schema: { accounts: { id: {} } },
}));

jest.mock('drizzle-orm', () => ({ eq: jest.fn(() => null) }));

const sampleAccount: Account = {
  id: 'acc-1',
  bankName: 'Barclays',
  sortCode: '12-34-56',
  accountNumber: '12345678',
  balance: '5000',
  currency: 'GBP',
  isActive: 'true',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  mockSelectResult = [];
  mockGetResult = undefined;
  mockInsertRun = jest.fn();
  mockUpdateRun = jest.fn();
  mockDeleteRun = jest.fn();
});

describe('accountService', () => {
  describe('getAllAccounts', () => {
    it('returns all accounts from the database', () => {
      mockSelectResult = [sampleAccount];
      expect(accountService.getAllAccounts()).toEqual([sampleAccount]);
    });

    it('returns an empty array when no accounts exist', () => {
      expect(accountService.getAllAccounts()).toEqual([]);
    });
  });

  describe('getAccountById', () => {
    it('returns the matching account', () => {
      mockGetResult = sampleAccount;
      expect(accountService.getAccountById('acc-1')).toEqual(sampleAccount);
    });

    it('returns undefined when account does not exist', () => {
      expect(accountService.getAccountById('nonexistent')).toBeUndefined();
    });
  });

  describe('createAccount', () => {
    it('returns an account with a generated id and timestamps', () => {
      const input = {
        bankName: 'HSBC',
        sortCode: '40-47-84',
        accountNumber: '12345678',
        currency: 'GBP',
      };
      const result = accountService.createAccount(input);
      expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(result.bankName).toBe(input.bankName);
      expect(result.sortCode).toBe(input.sortCode);
      expect(result.accountNumber).toBe(input.accountNumber);
      expect(result.balance).toBe('0');
      expect(result.isActive).toBe('true');
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('calls the database insert', () => {
      accountService.createAccount({
        bankName: 'Test',
        sortCode: '123456',
        accountNumber: '12345678',
        currency: 'GBP',
      });
      expect(mockInsertRun).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAccount', () => {
    it('returns the updated account with new values', () => {
      mockGetResult = sampleAccount;
      const result = accountService.updateAccount('acc-1', { bankName: 'NatWest' });
      expect(result.bankName).toBe('NatWest');
      expect(result.updatedAt).not.toBe(sampleAccount.updatedAt);
    });

    it('calls the database update', () => {
      mockGetResult = sampleAccount;
      accountService.updateAccount('acc-1', { bankName: 'Updated Bank' });
      expect(mockUpdateRun).toHaveBeenCalledTimes(1);
    });

    it('throws when the account does not exist', () => {
      expect(() => accountService.updateAccount('nonexistent', {})).toThrow();
    });
  });

  describe('deleteAccount', () => {
    it('calls the database delete', () => {
      accountService.deleteAccount('acc-1');
      expect(mockDeleteRun).toHaveBeenCalledTimes(1);
    });
  });
});
