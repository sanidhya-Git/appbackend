import React, { useState } from 'react';
import {
  View, StyleSheet, Dimensions, TouchableOpacity, Share, StatusBar,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotosStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { ms } from '../../utils/responsive';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { Photo } from '../../types';

type Props = { route: RouteProp<PhotosStackParamList, 'PhotoViewer'> };

export function PhotoViewerScreen({ route }: Props) {
  const { photos, initialIndex } = route.params;
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showOverlay, setShowOverlay] = useState(true);

  const currentPhoto: Photo = photos[currentIndex];

  const handleShare = async () => {
    try {
      await Share.share({ url: currentPhoto.url, message: 'Check out this photo!' });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Main image */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowOverlay((p) => !p)}
        style={StyleSheet.absoluteFill}
      >
        <FastImage
          source={{ uri: currentPhoto.url, priority: FastImage.priority.high }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>

      {/* Prev / Next */}
      {currentIndex > 0 && (
        <TouchableOpacity
          onPress={() => setCurrentIndex(currentIndex - 1)}
          style={[styles.navBtn, { left: 16 }]}
        >
          <Icon name="ChevronLeft" size={ms(22)} color="#FFF" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
      {currentIndex < photos.length - 1 && (
        <TouchableOpacity
          onPress={() => setCurrentIndex(currentIndex + 1)}
          style={[styles.navBtn, { right: 16 }]}
        >
          <Icon name="ChevronRight" size={ms(22)} color="#FFF" strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {/* Overlay */}
      {showOverlay && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Icon name="X" size={ms(18)} color="#FFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text variant="label" color="#FFF">
              {currentIndex + 1} / {photos.length}
            </Text>
            <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
              <Icon name="Share2" size={ms(18)} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Similarity badge */}
          {currentPhoto.similarity && (
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
              <View style={[styles.simChip, { backgroundColor: `${colors.primary}CC` }]}>
                <Icon name="Sparkles" size={ms(13)} color="#FFF" strokeWidth={1.75} />
                <Text variant="caption" color="#FFF" style={{ marginLeft: 5 }}>
                  {Math.round(currentPhoto.similarity * 100)}% match
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  navBtn: {
    position: 'absolute', top: '50%', marginTop: -ms(22),
    width: ms(44), height: ms(44), borderRadius: ms(22),
    backgroundColor: 'rgba(0,0,0,0.50)',
    alignItems: 'center', justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  iconBtn: {
    width: ms(36), height: ms(36), borderRadius: ms(10),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 12, paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.50)',
    alignItems: 'flex-start',
  },
  simChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
});
