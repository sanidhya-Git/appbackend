import React, { useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { ms, vs } from '../../utils/responsive';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { PhotoGridSkeleton } from '../../components/ui/SkeletonLoader';
import { useFavorites } from '../../hooks/useUser';
import { Photo } from '../../types';

export function FavoritesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { data, isLoading } = useFavorites();
  const photos: Photo[] = (data as any)?.data ?? [];

  const GAP = 2;
  const COLS = 3;
  const tileSize = (width - GAP * (COLS + 1)) / COLS;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
        >
          <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text variant="h3">Favorites</Text>
        <View style={{ width: ms(40) }} />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <PhotoGridSkeleton />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySurface }]}>
            <Icon name="Heart" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text variant="h4" align="center" style={{ marginTop: 20 }}>No favorites yet</Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
            Tap the heart icon on any photo to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: GAP, paddingBottom: insets.bottom + 40 }}
          columnWrapperStyle={{ gap: GAP }}
          ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 30)}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{ width: tileSize, height: tileSize }}
                onPress={() => navigation.navigate('PhotoViewer', { photos, initialIndex: index })}
              >
                <FastImage
                  source={{ uri: item.thumbnailUrl || item.url }}
                  style={StyleSheet.absoluteFill}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.heartBadge}>
                  <Icon name="Heart" size={ms(12)} color="#FF4D6D" strokeWidth={0} />
                </View>
              </TouchableOpacity>
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
    paddingHorizontal: 20, paddingVertical: vs(12), borderBottomWidth: 1,
  },
  backBtn: {
    width: ms(40), height: ms(40), borderRadius: ms(12),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  heartBadge: {
    position: 'absolute', bottom: 6, right: 6,
    width: ms(22), height: ms(22),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: ms(6),
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: {
    width: ms(72), height: ms(72), borderRadius: ms(22),
    alignItems: 'center', justifyContent: 'center',
  },
});
