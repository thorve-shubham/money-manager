import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { ThemedText } from '@/components';
import { colors } from '@/theme/colors';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
}));

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ThemedText', () => {
  it('renders children as text', () => {
    const { getByText } = wrap(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies textPrimary color by default', () => {
    const { getByText } = wrap(<ThemedText>Primary</ThemedText>);
    expect(getByText('Primary').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.light.textPrimary })])
    );
  });

  it('applies textSecondary color when variant="secondary"', () => {
    const { getByText } = wrap(<ThemedText variant="secondary">Secondary</ThemedText>);
    expect(getByText('Secondary').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.light.textSecondary })])
    );
  });

  it('applies textDisabled color when variant="disabled"', () => {
    const { getByText } = wrap(<ThemedText variant="disabled">Disabled</ThemedText>);
    expect(getByText('Disabled').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.light.textDisabled })])
    );
  });

  it('accepts and merges custom style prop', () => {
    const customStyle = { letterSpacing: 2 };
    const { getByText } = wrap(<ThemedText style={customStyle}>Styled</ThemedText>);
    const styles = getByText('Styled').props.style;
    const flatStyles = styles.flat ? styles.flat(Infinity) : styles;
    const hasLetterSpacing = flatStyles.some(
      (s: object) => s && typeof s === 'object' && 'letterSpacing' in s
    );
    expect(hasLetterSpacing).toBe(true);
  });
});
