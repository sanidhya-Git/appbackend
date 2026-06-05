import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useUIStore } from '../../store/slices/uiStore';
import { Text } from './Text';

export function Toast() {
  const { colors, spacing, radius, shadows } = useTheme();
  const { toastMessage, clearToast } = useUIStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toastMessage) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(-100, { duration: 200 }, () => {
          runOnJS(clearToast)();
        });
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [toastMessage]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toastMessage) return null;

  const bgColors = {
    success: colors.success,
    error: colors.error,
    info: colors.primary,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing[4],
          backgroundColor: bgColors[toastMessage.type],
          borderRadius: radius.xl,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
          ...shadows.lg,
        },
        animatedStyle,
      ]}
    >
      <Text variant="label" color={colors.white} weight="semibold">
        {toastMessage.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    maxWidth: '90%',
  },
});
