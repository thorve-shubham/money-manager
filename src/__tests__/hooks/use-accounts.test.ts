import { renderHook, act } from '@testing-library/react-native';
import { useAccounts } from '@/hooks/use-accounts';
import type { Account } from '@/services/account-service';

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

const mockGetAllAccounts = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('@/services/account-service', () => ({
  accountService: {
    getAllAccounts: () => mockGetAllAccounts(),
    deleteAccount: (id: string) => mockDeleteAccount(id),
  },
}));

beforeEach(() => {
  mockGetAllAccounts.mockReturnValue([]);
  mockDeleteAccount.mockReturnValue(undefined);
});

describe('useAccounts', () => {
  it('starts with empty accounts and not loading', () => {
    const { result } = renderHook(() => useAccounts());
    expect(result.current.accounts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('populates accounts after refresh', () => {
    mockGetAllAccounts.mockReturnValue([sampleAccount]);
    const { result } = renderHook(() => useAccounts());
    act(() => {
      result.current.refresh();
    });
    expect(result.current.accounts).toEqual([sampleAccount]);
  });

  it('sets error when getAllAccounts throws', () => {
    mockGetAllAccounts.mockImplementation(() => {
      throw new Error('DB read failed');
    });
    const { result } = renderHook(() => useAccounts());
    act(() => {
      result.current.refresh();
    });
    expect(result.current.error).toBe('DB read failed');
    expect(result.current.accounts).toEqual([]);
  });

  it('clears error on successful refresh after failure', () => {
    mockGetAllAccounts.mockImplementationOnce(() => {
      throw new Error('DB read failed');
    });
    mockGetAllAccounts.mockReturnValueOnce([sampleAccount]);

    const { result } = renderHook(() => useAccounts());
    act(() => {
      result.current.refresh();
    });
    expect(result.current.error).toBe('DB read failed');

    act(() => {
      result.current.refresh();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.accounts).toEqual([sampleAccount]);
  });

  it('deleteAccount calls service and refreshes the list', () => {
    mockGetAllAccounts.mockReturnValue([sampleAccount]);
    const { result } = renderHook(() => useAccounts());
    act(() => {
      result.current.deleteAccount('acc-1');
    });
    expect(mockDeleteAccount).toHaveBeenCalledWith('acc-1');
    expect(mockGetAllAccounts).toHaveBeenCalled();
  });

  it('sets error when deleteAccount throws', () => {
    mockDeleteAccount.mockImplementation(() => {
      throw new Error('Delete failed');
    });
    const { result } = renderHook(() => useAccounts());
    act(() => {
      result.current.deleteAccount('acc-1');
    });
    expect(result.current.error).toBe('Delete failed');
  });
});
