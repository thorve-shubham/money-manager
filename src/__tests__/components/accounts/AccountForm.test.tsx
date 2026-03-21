import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { AccountForm } from '@/components/accounts';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
}));

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('AccountForm', () => {
  it('renders all form fields', () => {
    const { getByPlaceholderText } = wrap(
      <AccountForm onSubmit={jest.fn()} submitLabel="Save" isSubmitting={false} />
    );
    expect(getByPlaceholderText('e.g. Barclays')).toBeTruthy();
    expect(getByPlaceholderText('12-34-56')).toBeTruthy();
    expect(getByPlaceholderText('12345678')).toBeTruthy();
    expect(getByPlaceholderText('GBP')).toBeTruthy();
  });

  it('renders the submit button with the given label', () => {
    const { getByLabelText } = wrap(
      <AccountForm onSubmit={jest.fn()} submitLabel="Add Account" isSubmitting={false} />
    );
    expect(getByLabelText('Add Account')).toBeTruthy();
  });

  it('does not call onSubmit when fields are empty', () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = wrap(
      <AccountForm onSubmit={onSubmit} submitLabel="Save" isSubmitting={false} />
    );
    fireEvent.press(getByLabelText('Save'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation errors after submitting an empty form', async () => {
    const { getByLabelText, getByText } = wrap(
      <AccountForm onSubmit={jest.fn()} submitLabel="Save" isSubmitting={false} />
    );
    fireEvent.press(getByLabelText('Save'));
    await waitFor(() => {
      expect(getByText('Bank name is required')).toBeTruthy();
      expect(getByText('Sort code is required')).toBeTruthy();
      expect(getByText('Account number is required')).toBeTruthy();
    });
  });

  it('calls onSubmit with correct values when form is valid', () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByLabelText } = wrap(
      <AccountForm onSubmit={onSubmit} submitLabel="Save" isSubmitting={false} />
    );

    fireEvent.changeText(getByPlaceholderText('e.g. Barclays'), 'NatWest');
    fireEvent.changeText(getByPlaceholderText('12-34-56'), '60-00-04');
    fireEvent.changeText(getByPlaceholderText('12345678'), '31926819');
    fireEvent.changeText(getByPlaceholderText('GBP'), 'GBP');
    fireEvent.press(getByLabelText('Save'));

    expect(onSubmit).toHaveBeenCalledWith({
      bankName: 'NatWest',
      sortCode: '60-00-04',
      accountNumber: '31926819',
      currency: 'GBP',
    });
  });

  it('pre-populates fields with initialValues in edit mode', () => {
    const initialValues = {
      bankName: 'HSBC',
      sortCode: '40-47-84',
      accountNumber: '12345678',
      currency: 'GBP',
    };
    const { getByDisplayValue } = wrap(
      <AccountForm
        initialValues={initialValues}
        onSubmit={jest.fn()}
        submitLabel="Save Changes"
        isSubmitting={false}
      />
    );
    expect(getByDisplayValue('HSBC')).toBeTruthy();
    expect(getByDisplayValue('40-47-84')).toBeTruthy();
    expect(getByDisplayValue('12345678')).toBeTruthy();
  });

  it('disables the submit button when isSubmitting is true', () => {
    const { getByLabelText } = wrap(
      <AccountForm onSubmit={jest.fn()} submitLabel="Save" isSubmitting={true} />
    );
    expect(getByLabelText('Save').props.accessibilityState?.disabled).toBe(true);
  });
});
