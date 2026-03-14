import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { ThemeProvider, useTheme } from '@/theme';

// Expose theme via a test component
function ThemeConsumer({
  onTheme,
}: {
  onTheme: (theme: ReturnType<typeof useTheme>) => void;
}) {
  const theme = useTheme();
  onTheme(theme);
  return (
    <Pressable testID="toggle" onPress={theme.toggleTheme}>
      <Text testID="mode">{theme.isDark ? 'dark' : 'light'}</Text>
    </Pressable>
  );
}

const mockUseColorScheme = jest.fn(() => 'light' as 'light' | 'dark' | null);

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => mockUseColorScheme(),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('renders children without crashing', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer onTheme={() => {}} />
      </ThemeProvider>
    );
    expect(getByTestId('mode')).toBeTruthy();
  });

  it('returns isDark: false when OS is light', () => {
    mockUseColorScheme.mockReturnValue('light');
    let captured: ReturnType<typeof useTheme> | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onTheme={(t) => { captured = t; }} />
      </ThemeProvider>
    );
    expect(captured!.isDark).toBe(false);
  });

  it('returns isDark: true when OS is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');
    let captured: ReturnType<typeof useTheme> | null = null;
    render(
      <ThemeProvider>
        <ThemeConsumer onTheme={(t) => { captured = t; }} />
      </ThemeProvider>
    );
    expect(captured!.isDark).toBe(true);
  });

  it('toggleTheme switches from light to dark', () => {
    mockUseColorScheme.mockReturnValue('light');
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer onTheme={() => {}} />
      </ThemeProvider>
    );
    expect(getByTestId('mode').props.children).toBe('light');
    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('mode').props.children).toBe('dark');
  });

  it('toggleTheme switches from dark back to light', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer onTheme={() => {}} />
      </ThemeProvider>
    );
    expect(getByTestId('mode').props.children).toBe('dark');
    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('mode').props.children).toBe('light');
  });

  it('throws when useTheme is called outside ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    function Bare() {
      useTheme();
      return null;
    }
    expect(() => render(<Bare />)).toThrow('useTheme must be used within a ThemeProvider');
    spy.mockRestore();
  });
});
