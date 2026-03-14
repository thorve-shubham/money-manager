import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/theme';

type Variant = 'background' | 'surface' | 'surfaceSecondary';

type ThemedViewProps = ViewProps & {
  variant?: Variant;
};

export function ThemedView({ variant = 'background', style, ...rest }: ThemedViewProps) {
  const { colors } = useTheme();

  const colorMap: Record<Variant, string> = {
    background: colors.background,
    surface: colors.surface,
    surfaceSecondary: colors.surfaceSecondary,
  };

  return <View style={[{ backgroundColor: colorMap[variant] }, style]} {...rest} />;
}
