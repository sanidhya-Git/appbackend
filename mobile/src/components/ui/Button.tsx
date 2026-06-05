import React from 'react';
import {
  TouchableOpacity, ActivityIndicator, ViewStyle,
  StyleSheet, View,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { ms } from '../../utils/responsive';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  leftIcon, rightIcon, style,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const sizeMap: Record<Size, ViewStyle> = {
    sm: { height: ms(36), paddingHorizontal: ms(14), borderRadius: ms(10) },
    md: { height: ms(44), paddingHorizontal: ms(20), borderRadius: ms(12) },
    lg: { height: ms(52), paddingHorizontal: ms(24), borderRadius: ms(16) },
    xl: { height: ms(56), paddingHorizontal: ms(28), borderRadius: ms(18) },
  };

  const fontMap: Record<Size, number> = { sm: ms(13), md: ms(15), lg: ms(16), xl: ms(17) };

  type StylePair = { bg: string; fg: string; border?: string };
  const variantMap: Record<Variant, StylePair> = {
    primary:   { bg: disabled ? colors.primaryMuted : colors.primary, fg: '#FFF' },
    secondary: { bg: colors.primaryMuted, fg: colors.primary },
    outline:   { bg: 'transparent', fg: colors.text, border: colors.border },
    ghost:     { bg: 'transparent', fg: colors.primary },
    danger:    { bg: disabled ? colors.errorMuted : colors.error, fg: '#FFF' },
  };

  const v = variantMap[variant];
  const spinnerColor = variant === 'primary' || variant === 'danger' ? '#FFF' : colors.primary;

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 22, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 22, stiffness: 300 }); }}
      disabled={disabled || loading}
      style={[
        styles.base,
        sizeMap[size],
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1.5, borderColor: v.border } : null,
        fullWidth && styles.full,
        (disabled || loading) && styles.disabled,
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.row}>
          {leftIcon}
          <Text
            style={{
              fontSize: fontMap[size],
              fontWeight: '600',
              color: v.fg,
              includeFontPadding: false,
            }}
          >
            {title}
          </Text>
          {rightIcon}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  full: { width: '100%' },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
