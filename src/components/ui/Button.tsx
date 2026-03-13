import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    variant === 'primary' && styles.variant_primary,
    variant === 'secondary' && { backgroundColor: theme.backgroundElement },
    variant === 'ghost' && styles.variant_ghost,
    variant === 'danger' && styles.variant_danger,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textColor = getTextColor(variant, theme.text);

  return (
    <Pressable
      style={({ pressed }) => [containerStyle, pressed && !isDisabled && styles.pressed]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#208AEF'}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${size}`], { color: textColor }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function getTextColor(variant: ButtonVariant, themeText: string): string {
  switch (variant) {
    case 'primary':
      return '#FFFFFF';
    case 'danger':
      return '#FFFFFF';
    case 'ghost':
      return '#208AEF';
    case 'secondary':
    default:
      return themeText;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },

  // Size variants
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  size_md: {
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  size_lg: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
  },

  // Color variants
  variant_primary: {
    backgroundColor: '#208AEF',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: '#EF4444',
  },

  // Label
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  label_sm: {
    fontSize: 13,
  },
  label_md: {
    fontSize: 15,
  },
  label_lg: {
    fontSize: 17,
  },
});
