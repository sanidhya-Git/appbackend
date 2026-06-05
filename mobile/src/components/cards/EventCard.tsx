import React from 'react';
import {
  View, TouchableOpacity, StyleSheet, ViewStyle, useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Event } from '../../types';
import { ms, vs } from '../../utils/responsive';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function EventCard({ event, onPress, style, compact = false }: EventCardProps) {
  const { colors, radius } = useTheme();
  const { width } = useWindowDimensions();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const imageHeight = compact ? vs(160) : vs(210);

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 18, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 200 }); }}
      style={[animStyle, style]}
    >
      <View
        style={[
          styles.card,
          {
            borderRadius: radius['2xl'],
            backgroundColor: colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 3,
          },
        ]}
      >
        {/* Hero image */}
        <View style={[styles.imageWrap, { height: imageHeight }]}>
          {event.coverImageUrl ? (
            <FastImage
              source={{ uri: event.coverImageUrl, priority: FastImage.priority.normal }}
              style={StyleSheet.absoluteFill}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primarySurface }]} />
          )}

          {/* Bottom gradient for text legibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={[StyleSheet.absoluteFill, { borderRadius: radius['2xl'] }]}
          />

          {/* Top row badges */}
          <View style={styles.topRow}>
            {!event.isProcessed && (
              <Badge label="Processing" variant="warning" size="sm" />
            )}
          </View>

          {/* Photo count chip */}
          <View style={styles.photoChip}>
            <Icon name="Image" size={ms(12)} color="rgba(255,255,255,0.9)" strokeWidth={2} />
            <Text style={styles.photoCount}>{event.totalPhotos} photos</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text variant="h4" numberOfLines={1} style={{ letterSpacing: -0.2 }}>
            {event.name}
          </Text>

          <View style={styles.meta}>
            {event.location && (
              <View style={styles.metaItem}>
                <Icon name="MapPin" size={ms(13)} color={colors.textTertiary} strokeWidth={2} />
                <Text variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                  {event.location}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Icon name="Calendar" size={ms(13)} color={colors.textTertiary} strokeWidth={2} />
              <Text variant="caption" color={colors.textSecondary}>
                {formatEventDate(event.eventDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  imageWrap: { width: '100%', position: 'relative' },
  topRow: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', gap: 6,
  },
  photoChip: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  photoCount: {
    fontSize: ms(11), fontWeight: '600', color: 'rgba(255,255,255,0.95)',
    includeFontPadding: false,
  },
  info: { padding: 16, gap: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
