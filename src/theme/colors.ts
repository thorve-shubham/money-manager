const lightColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF2F7',
  primary: '#208AEF',
  primaryDark: '#1670CC',
  textPrimary: '#0D1B2A',
  textSecondary: '#5A6A7A',
  textDisabled: '#A8B5C2',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  border: '#DDE3EA',
  tabBar: '#FFFFFF',
  tabBarActive: '#208AEF',
  tabBarInactive: '#8A99A8',
};

const darkColors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceSecondary: '#1C2128',
  primary: '#3B9EF0',
  primaryDark: '#208AEF',
  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textDisabled: '#484F58',
  success: '#3FB950',
  danger: '#F85149',
  warning: '#E3B341',
  border: '#21262D',
  tabBar: '#161B22',
  tabBarActive: '#3B9EF0',
  tabBarInactive: '#8B949E',
};

export type ColorScheme = typeof lightColors;

export const colors = {
  light: lightColors,
  dark: darkColors,
};
