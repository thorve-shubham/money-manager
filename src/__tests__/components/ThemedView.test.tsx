import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider } from '@/theme';
import { ThemedView } from '@/components';
import { colors } from '@/theme/colors';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => 'light',
}));

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ThemedView', () => {
  it('renders children', () => {
    const { getByText } = wrap(
      <ThemedView>
        <Text>Child</Text>
      </ThemedView>
    );
    expect(getByText('Child')).toBeTruthy();
  });

  it('applies background color by default', () => {
    const { getByTestId } = wrap(<ThemedView testID="view" />);
    expect(getByTestId('view').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.light.background })])
    );
  });

  it('applies surface color when variant="surface"', () => {
    const { getByTestId } = wrap(<ThemedView testID="view" variant="surface" />);
    expect(getByTestId('view').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.light.surface })])
    );
  });

  it('applies surfaceSecondary color when variant="surfaceSecondary"', () => {
    const { getByTestId } = wrap(<ThemedView testID="view" variant="surfaceSecondary" />);
    expect(getByTestId('view').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.light.surfaceSecondary }),
      ])
    );
  });
});
