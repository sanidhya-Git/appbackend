import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { Photo } from '../../types';
import { ms } from '../../utils/responsive';

interface PhotoCardProps {
  photo: Photo;
  onPress: () => void;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  showSimilarity?: boolean;
  size?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PhotoCard({
  photo, onPress, isFavorited, onFavoriteToggle, showSimilarity, size,
}: PhotoCardProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const cellSize = size ?? Math.floor((width - 4) / 3);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 20, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
      style={[{ width: cellSize, height: cellSize, margin: 1 }, animStyle]}
    >
      <View style={StyleSheet.absoluteFill}>
        <FastImage
          source={{ uri: photo.thumbnailUrl || photo.url, priority: FastImage.priority.normal }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Similarity badge */}
        {showSimilarity && photo.similarity != null && (
          <View style={styles.simBadge}>
            <Text style={styles.simText}>
              {Math.round(photo.similarity * 100)}%
            </Text>
          </View>
        )}

        {/* Favorite */}
        {onFavoriteToggle && (
          <TouchableOpacity onPress={onFavoriteToggle} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon
              name="Heart"
              size={ms(16)}
              color={isFavorited ? '#EF4444' : 'rgba(255,255,255,0.9)'}
              strokeWidth={isFavorited ? 0 : 2}
            />
          </TouchableOpacity>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  simBadge: {
    position: 'absolute', bottom: 5, left: 5,
    backgroundColor: 'rgba(99,102,241,0.85)',
    borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
  },
  simText: {
    fontSize: ms(9), fontWeight: '700', color: '#FFF',
    includeFontPadding: false,
  },
  favBtn: {
    position: 'absolute', top: 5, right: 5,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
});
