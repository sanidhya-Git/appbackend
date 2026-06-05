import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { ms } from '../../utils/responsive';

type Variant = 'primary' | 'success' | 'error' | 'warning' | 'neutral' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', size = 'md', style }: BadgeProps) {
  const { colors } = useTheme();

  type StylePair = { bg: string; fg: string; border?: string };
  const variantMap: Record<Variant, StylePair> = {
    primary:  { bg: colors.primaryMuted,   fg: colors.primary },
    success:  { bg: colors.successMuted,   fg: colors.successDark },
    error:    { bg: colors.errorMuted,     fg: colors.error },
    warning:  { bg: colors.warningMuted,   fg: colors.warning },
    neutral:  { bg: colors.surfaceSecondary, fg: colors.textSecondary },
    outline:  { bg: 'transparent', fg: colors.textSecondary, border: colors.border },
  };

  const sizeMap: Record<Size, { height: number; px: number; fontSize: number }> = {
    sm: { height: ms(20), px: ms(7), fontSize: ms(10) },
    md: { height: ms(24), px: ms(9), fontSize: ms(11) },
    lg: { height: ms(28), px: ms(11), fontSize: ms(12) },
  };

  const v = variantMap[variant];
  const s = sizeMap[size];

  return (
    <View
      style={[
        styles.badge,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: v.bg,
        },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        style,
      ]}
    >
      <Text
        style={{
          fontSize: s.fontSize,
          fontWeight: '600',
          color: v.fg,
          includeFontPadding: false,
          lineHeight: s.fontSize * 1.4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
