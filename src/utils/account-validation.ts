export type AccountFormValues = {
  bankName: string;
  sortCode: string;
  accountNumber: string;
  currency: string;
};

export type AccountFormErrors = Partial<Record<keyof AccountFormValues, string>>;

export function validateAccountForm(values: AccountFormValues): AccountFormErrors {
  const errors: AccountFormErrors = {};

  if (!values.bankName.trim()) {
    errors.bankName = 'Bank name is required';
  }

  const sortDigits = values.sortCode.replace(/-/g, '');
  if (!values.sortCode.trim()) {
    errors.sortCode = 'Sort code is required';
  } else if (!/^\d{6}$/.test(sortDigits)) {
    errors.sortCode = 'Sort code must be 6 digits (e.g. 12-34-56)';
  }

  const accountDigits = values.accountNumber.replace(/\s/g, '');
  if (!values.accountNumber.trim()) {
    errors.accountNumber = 'Account number is required';
  } else if (!/^\d{8}$/.test(accountDigits)) {
    errors.accountNumber = 'Account number must be 8 digits';
  }

  if (!values.currency.trim()) {
    errors.currency = 'Currency is required';
  } else if (values.currency.trim().length !== 3) {
    errors.currency = 'Enter a 3-letter currency code (e.g. GBP)';
  }

  return errors;
}

export function isFormValid(errors: AccountFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
