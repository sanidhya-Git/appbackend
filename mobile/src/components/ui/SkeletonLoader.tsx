import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, interpolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 900 }),
      ),
      -1,
    );
  }, [shimmer]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.45, 0.9]),
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#E4E4E7' },
        animStyle,
        style,
      ]}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={200} borderRadius={0} style={{ width: '100%' }} />
      <View style={styles.cardBody}>
        <Skeleton width="65%" height={20} borderRadius={6} />
        <View style={{ height: 10 }} />
        <Skeleton width="40%" height={14} borderRadius={4} />
        <View style={{ height: 6 }} />
        <Skeleton width="50%" height={14} borderRadius={4} />
      </View>
    </View>
  );
}

export function PhotoGridSkeleton() {
  const { width } = useWindowDimensions();
  const cell = (width - 6) / 3;
  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} width={cell} height={cell} borderRadius={0} style={{ margin: 1 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBody: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
