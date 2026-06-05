import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  StyleSheet, ViewStyle, TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';
import { ms } from '../../utils/responsive';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label, error, hint, leftIcon, rightIcon,
  containerStyle, style, onFocus, onBlur, ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderProgress = useSharedValue(0);

  const animBorder = useAnimatedStyle(() => ({
    borderColor: borderProgress.value === 1
      ? colors.primary
      : error
        ? colors.error
        : colors.border,
  }));

  const handleFocus = (e: any) => {
    setFocused(true);
    borderProgress.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    borderProgress.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="label"
          color={error ? colors.error : colors.textSecondary}
          style={styles.label}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.field,
          {
            backgroundColor: focused ? colors.surface : colors.background,
            borderColor: error ? colors.error : colors.border,
          },
          animBorder,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            leftIcon ? { paddingLeft: 4 } : null,
            rightIcon ? { paddingRight: 4 } : null,
            style as any,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>

      {(error || hint) && (
        <Text
          variant="caption"
          color={error ? colors.error : colors.textTertiary}
          style={styles.helper}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { marginBottom: 2 },
  field: {
    height: ms(52),
    borderWidth: 1.5,
    borderRadius: ms(14),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(16),
  },
  input: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: '400',
    includeFontPadding: false,
  },
  iconLeft: { marginRight: ms(10) },
  iconRight: { marginLeft: ms(10) },
  helper: { marginTop: 4, marginLeft: 4 },
});
