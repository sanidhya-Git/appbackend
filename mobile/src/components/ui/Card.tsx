import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

type Variant = 'default' | 'elevated' | 'outline' | 'ghost';

interface CardProps extends ViewProps {
  variant?: Variant;
  padding?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function Card({ variant = 'default', padding, style, children, ...props }: CardProps) {
  const { colors, radius } = useTheme();

  const variantStyles: Record<Variant, ViewStyle> = {
    default: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    elevated: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    outline: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return (
    <View
      style={[
        styles.base,
        { borderRadius: radius['2xl'] },
        variantStyles[variant],
        padding !== undefined ? { padding } : styles.defaultPadding,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  defaultPadding: { padding: 16 },
});
