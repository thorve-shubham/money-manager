import React from 'react';
import { render } from '@testing-library/react-native';
import { TabBarIcon } from '@/components';

jest.mock('expo-symbols', () => {
  const { View } = require('react-native');
  return {
    SymbolView: ({ name, tintColor, size, testID }: any) => (
      <View testID={testID ?? `symbol-${name}`} accessibilityLabel={`${name}-${tintColor}-${size}`} />
    ),
  };
});

describe('TabBarIcon', () => {
  it('renders without crash', () => {
    const { getByTestId } = render(
      <TabBarIcon iosName="chart.bar.fill" color="#208AEF" />
    );
    expect(getByTestId('symbol-chart.bar.fill')).toBeTruthy();
  });

  it('passes the correct symbol name and color', () => {
    const { getByTestId } = render(
      <TabBarIcon iosName="creditcard.fill" color="#DC2626" size={28} />
    );
    const icon = getByTestId('symbol-creditcard.fill');
    expect(icon.props.accessibilityLabel).toBe('creditcard.fill-#DC2626-28');
  });

  it('uses default size of 24 when size is not specified', () => {
    const { getByTestId } = render(
      <TabBarIcon iosName="gearshape.fill" color="#5A6A7A" />
    );
    expect(getByTestId('symbol-gearshape.fill').props.accessibilityLabel).toContain('-24');
  });
});
