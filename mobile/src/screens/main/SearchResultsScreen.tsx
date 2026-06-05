import React, { useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { EventsStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { useEventSearchResult } from '../../hooks/useEvents';
import { useToggleFavorite } from '../../hooks/useUser';
import { Photo } from '../../types';
import { ms, vs } from '../../utils/responsive';

type Props = { route: RouteProp<EventsStackParamList, 'SearchResults'> };

function PhotoItem({
  photo, onPress, onFavorite, isFav, colWidth,
}: {
  photo: Photo; onPress: () => void; onFavorite: () => void;
  isFav: boolean; colWidth: number;
}) {
  const { colors } = useTheme();
  const sim = photo.similarity ? Math.round(photo.similarity * 100) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[styles.photoItem, { width: colWidth, height: colWidth }]}
    >
      <FastImage
        source={{ uri: photo.thumbnailUrl || photo.url }}
        style={StyleSheet.absoluteFill}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.photoOverlay}>
        {sim !== null && (
          <View style={[styles.simBadge, { backgroundColor: colors.primary }]}>
            <Text style={{ fontSize: ms(9), color: '#FFF', fontWeight: '700' }}>{sim}%</Text>
          </View>
        )}
        <TouchableOpacity onPress={onFavorite} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon
            name="Heart"
            size={ms(16)}
            color={isFav ? '#FF4D6D' : '#FFF'}
            strokeWidth={isFav ? 0 : 2}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function SearchResultsScreen({ route }: Props) {
  const { eventId, eventName } = route.params;
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const toggleFav = useToggleFavorite();

  const { data: photos } = useEventSearchResult(eventId);
  const photoList: Photo[] = Array.isArray(photos) ? photos : [];

  const GAP = 2;
  const COLS = 3;
  const colWidth = (width - GAP * (COLS + 1)) / COLS;

  const handleFavorite = async (photoId: string) => {
    try {
      const res = await toggleFav.mutateAsync(photoId);
      setFavorites((prev) => {
        const next = new Set(prev);
        (res as any)?.data?.favorited ? next.add(photoId) : next.delete(photoId);
        return next;
      });
    } catch {}
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text variant="h3">Your Photos</Text>
            <Text variant="caption" color={colors.textSecondary}>{eventName}</Text>
          </View>
          <Badge
            label={`${photoList.length} found`}
            variant="primary"
            size="sm"
          />
        </View>
      </SafeAreaView>

      {photoList.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySurface }]}>
            <Icon name="SearchX" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text variant="h4" align="center" style={{ marginTop: 20 }}>No matches found</Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
            We couldn't find you in this event's photos. Try re-registering your face.
          </Text>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.summaryBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <Icon name="Sparkles" size={ms(16)} color={colors.primary} strokeWidth={1.75} />
            <Text variant="label" color={colors.primary} style={{ marginLeft: 8 }}>
              AI found {photoList.length} photo{photoList.length !== 1 ? 's' : ''} of you
            </Text>
          </Animated.View>

          <FlatList
            data={photoList}
            keyExtractor={(item) => item.id}
            numColumns={COLS}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: GAP, paddingBottom: insets.bottom + 20 }}
            columnWrapperStyle={{ gap: GAP }}
            ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeIn.delay(index * 40)}>
                <PhotoItem
                  photo={item}
                  colWidth={colWidth}
                  isFav={favorites.has(item.id)}
                  onFavorite={() => handleFavorite(item.id)}
                  onPress={() => navigation.navigate('PhotoViewer', { photos: photoList, initialIndex: index })}
                />
              </Animated.View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: vs(12),
  },
  backBtn: {
    width: ms(40), height: ms(40), borderRadius: ms(12),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  summaryBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  photoItem: { overflow: 'hidden' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 6,
  },
  simBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 6,
  },
  favBtn: {
    alignSelf: 'flex-end',
    width: ms(28), height: ms(28),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderRadius: ms(8),
  },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  emptyIcon: {
    width: ms(72), height: ms(72), borderRadius: ms(22),
    alignItems: 'center', justifyContent: 'center',
  },
});
