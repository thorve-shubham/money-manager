import {
  validateAccountForm,
  isFormValid,
  type AccountFormValues,
} from '@/utils/account-validation';

const validForm: AccountFormValues = {
  bankName: 'Barclays',
  sortCode: '12-34-56',
  accountNumber: '12345678',
  currency: 'GBP',
};

describe('validateAccountForm', () => {
  it('returns no errors for a valid form', () => {
    expect(validateAccountForm(validForm)).toEqual({});
  });

  it('accepts a 6-digit sort code without dashes', () => {
    expect(validateAccountForm({ ...validForm, sortCode: '123456' }).sortCode).toBeUndefined();
  });

  it('accepts a sort code in XX-XX-XX format', () => {
    expect(validateAccountForm({ ...validForm, sortCode: '12-34-56' }).sortCode).toBeUndefined();
  });

  it('requires bank name', () => {
    expect(validateAccountForm({ ...validForm, bankName: '' }).bankName).toBeDefined();
  });

  it('requires sort code', () => {
    expect(validateAccountForm({ ...validForm, sortCode: '' }).sortCode).toBeDefined();
  });

  it('requires sort code to be exactly 6 digits', () => {
    expect(validateAccountForm({ ...validForm, sortCode: '1234' }).sortCode).toBeDefined();
    expect(validateAccountForm({ ...validForm, sortCode: '1234567' }).sortCode).toBeDefined();
  });

  it('requires account number', () => {
    expect(validateAccountForm({ ...validForm, accountNumber: '' }).accountNumber).toBeDefined();
  });

  it('requires account number to be exactly 8 digits', () => {
    expect(
      validateAccountForm({ ...validForm, accountNumber: '1234567' }).accountNumber
    ).toBeDefined();
    expect(
      validateAccountForm({ ...validForm, accountNumber: '123456789' }).accountNumber
    ).toBeDefined();
  });

  it('requires currency to be exactly 3 characters', () => {
    expect(validateAccountForm({ ...validForm, currency: '' }).currency).toBeDefined();
    expect(validateAccountForm({ ...validForm, currency: 'GB' }).currency).toBeDefined();
    expect(validateAccountForm({ ...validForm, currency: 'GBPP' }).currency).toBeDefined();
  });
});

describe('isFormValid', () => {
  it('returns true when errors is empty', () => {
    expect(isFormValid({})).toBe(true);
  });

  it('returns false when errors has any keys', () => {
    expect(isFormValid({ bankName: 'Required' })).toBe(false);
  });
});
