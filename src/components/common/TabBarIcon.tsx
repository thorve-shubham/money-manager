import React from 'react';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

type TabBarIconProps = {
  iosName: SymbolViewProps['name'];
  color: string;
  size?: number;
};

export function TabBarIcon({ iosName, color, size = 24 }: TabBarIconProps) {
  return (
    <SymbolView
      name={iosName}
      size={size}
      tintColor={color}
      resizeMode="scaleAspectFit"
    />
  );
}
