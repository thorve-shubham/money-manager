import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { typography } from '@/theme/typography';

type Variant = 'primary' | 'secondary' | 'disabled';
type FontSize = keyof typeof typography.fontSize;
type FontWeight = keyof typeof typography.fontWeight;

type ThemedTextProps = TextProps & {
  variant?: Variant;
  size?: FontSize;
  weight?: FontWeight;
};

export function ThemedText({
  variant = 'primary',
  size = 'md',
  weight = 'regular',
  style,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();

  const colorMap: Record<Variant, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    disabled: colors.textDisabled,
  };

  return (
    <Text
      style={[
        {
          color: colorMap[variant],
          fontSize: typography.fontSize[size],
          fontWeight: typography.fontWeight[weight],
          lineHeight: typography.lineHeight[size],
        },
        style,
      ]}
      {...rest}
    />
  );
}
