import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { AccountCard } from '@/components/accounts';
import type { Account } from '@/services/account-service';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
}));

const account: Account = {
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

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('AccountCard', () => {
  it('renders the bank name', () => {
    const { getByText } = wrap(
      <AccountCard account={account} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText('Barclays')).toBeTruthy();
  });

  it('renders the balance and currency', () => {
    const { getByText } = wrap(
      <AccountCard account={account} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText('5000')).toBeTruthy();
    expect(getByText('GBP')).toBeTruthy();
  });

  it('calls onEdit with the account when Edit is pressed', () => {
    const onEdit = jest.fn();
    const { getByLabelText } = wrap(
      <AccountCard account={account} onEdit={onEdit} onDelete={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Edit Barclays account'));
    expect(onEdit).toHaveBeenCalledWith(account);
  });

  it('shows a confirmation Alert when Delete is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByLabelText } = wrap(
      <AccountCard account={account} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    fireEvent.press(getByLabelText('Delete Barclays account'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Account',
      expect.stringContaining('Barclays'),
      expect.any(Array)
    );
    alertSpy.mockRestore();
  });

  it('calls onDelete with the account when deletion is confirmed', () => {
    const onDelete = jest.fn();
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const deleteButton = buttons?.find((b) => b.style === 'destructive');
      deleteButton?.onPress?.();
    });
    const { getByLabelText } = wrap(
      <AccountCard account={account} onEdit={jest.fn()} onDelete={onDelete} />
    );
    fireEvent.press(getByLabelText('Delete Barclays account'));
    expect(onDelete).toHaveBeenCalledWith(account);
    jest.restoreAllMocks();
  });
});
