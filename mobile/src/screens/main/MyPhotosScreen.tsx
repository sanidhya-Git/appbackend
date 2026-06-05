import React, { useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { PhotoGridSkeleton } from '../../components/ui/SkeletonLoader';
import { ms, vs } from '../../utils/responsive';
import { useMyPhotos, useToggleFavorite } from '../../hooks/useUser';
import { Photo } from '../../types';

function PhotoTile({
  photo, onPress, onFavorite, isFav, size,
}: {
  photo: Photo; onPress: () => void; onFavorite: () => void;
  isFav: boolean; size: number;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ width: size, height: size }}>
      <FastImage
        source={{ uri: photo.thumbnailUrl || photo.url }}
        style={StyleSheet.absoluteFill}
        resizeMode={FastImage.resizeMode.cover}
      />
      <TouchableOpacity
        onPress={onFavorite}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.favBtn}
      >
        <Icon
          name="Heart"
          size={ms(14)}
          color={isFav ? '#FF4D6D' : '#FFF'}
          strokeWidth={isFav ? 0 : 2}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function MyPhotosScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [page] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch, isRefetching } = useMyPhotos(page);
  const toggleFavMutation = useToggleFavorite();

  const photos: Photo[] = data?.data ?? [];

  const GAP = 2;
  const COLS = 3;
  const tileSize = (width - GAP * (COLS + 1)) / COLS;

  const handleFavorite = async (photoId: string) => {
    try {
      const res = await toggleFavMutation.mutateAsync(photoId);
      setFavorites((prev) => {
        const next = new Set(prev);
        (res as any)?.data?.favorited ? next.add(photoId) : next.delete(photoId);
        return next;
      });
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h2">My Photos</Text>
          {photos.length > 0 && (
            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
              {photos.length} photo{photos.length !== 1 ? 's' : ''} found
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Favorites')}
          style={[styles.favLink, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
        >
          <Icon name="Heart" size={ms(16)} color={colors.primary} strokeWidth={1.75} />
          <Text variant="label" color={colors.primary} style={{ marginLeft: 6 }}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <PhotoGridSkeleton />
        </View>
      ) : photos.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySurface }]}>
            <Icon name="Image" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text variant="h4" align="center" style={{ marginTop: 20 }}>No photos yet</Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8, maxWidth: 280 }}>
            Visit an event and tap "Find My Photos" to get started
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EventsTab', { screen: 'EventsList' })}
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}
          >
            <Text variant="label" color="#FFF">Browse Events</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: GAP, paddingBottom: insets.bottom + 40 }}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 25)}>
              <PhotoTile
                photo={item}
                size={tileSize}
                isFav={favorites.has(item.id)}
                onFavorite={() => handleFavorite(item.id)}
                onPress={() => navigation.navigate('PhotoViewer', { photos, initialIndex: index })}
              />
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: vs(12), paddingBottom: 12,
  },
  favLink: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: ms(12), borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  favBtn: {
    position: 'absolute', bottom: 6, right: 6,
    width: ms(26), height: ms(26),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: ms(7),
  },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  emptyIcon: {
    width: ms(72), height: ms(72), borderRadius: ms(22),
    alignItems: 'center', justifyContent: 'center',
  },
  browseBtn: {
    marginTop: 24, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: ms(14),
  },
});
