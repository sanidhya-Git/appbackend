import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { ms } from '../../utils/responsive';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline'
  | 'mono';

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...props
}: TextProps) {
  const { colors, typography } = useTheme();
  const sz = typography.size;

  const variantStyles: Record<Variant, TextStyle> = {
    display: {
      fontSize: ms(sz['4xl']),
      lineHeight: ms(sz['4xl']) * 1.15,
      fontWeight: typography.weight.extrabold,
      letterSpacing: -1,
    },
    h1: {
      fontSize: ms(sz['3xl']),
      lineHeight: ms(sz['3xl']) * 1.18,
      fontWeight: typography.weight.bold,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: ms(sz['2xl']),
      lineHeight: ms(sz['2xl']) * 1.22,
      fontWeight: typography.weight.bold,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: ms(sz.xl),
      lineHeight: ms(sz.xl) * 1.3,
      fontWeight: typography.weight.semibold,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: ms(sz.md),
      lineHeight: ms(sz.md) * 1.35,
      fontWeight: typography.weight.semibold,
    },
    bodyLarge: {
      fontSize: ms(sz.md),
      lineHeight: ms(sz.md) * 1.55,
      fontWeight: typography.weight.regular,
    },
    body: {
      fontSize: ms(sz.base),
      lineHeight: ms(sz.base) * 1.55,
      fontWeight: typography.weight.regular,
    },
    bodySmall: {
      fontSize: ms(sz.sm),
      lineHeight: ms(sz.sm) * 1.5,
      fontWeight: typography.weight.regular,
    },
    caption: {
      fontSize: ms(sz.xs),
      lineHeight: ms(sz.xs) * 1.45,
      fontWeight: typography.weight.regular,
    },
    label: {
      fontSize: ms(sz.sm),
      lineHeight: ms(sz.sm) * 1.4,
      fontWeight: typography.weight.semibold,
    },
    overline: {
      fontSize: ms(sz.xs),
      lineHeight: ms(sz.xs) * 1.4,
      fontWeight: typography.weight.semibold,
      letterSpacing: typography.letterSpacing.wider,
      textTransform: 'uppercase',
    },
    mono: {
      fontSize: ms(sz.sm),
      lineHeight: ms(sz.sm) * 1.5,
      fontWeight: typography.weight.regular,
      fontVariant: ['tabular-nums'],
    },
  };

  return (
    <RNText
      style={[
        {
          color: color ?? colors.text,
          includeFontPadding: false,
          textAlignVertical: 'center',
        },
        variantStyles[variant],
        align ? { textAlign: align } : undefined,
        weight ? { fontWeight: typography.weight[weight] } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
