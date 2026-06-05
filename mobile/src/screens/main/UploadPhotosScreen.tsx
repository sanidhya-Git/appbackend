import React, { useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, FlatList,
  Alert, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { launchImageLibrary } from 'react-native-image-picker';
import Animated, { FadeIn } from 'react-native-reanimated';

import { EventsStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useUploadPhoto } from '../../hooks/useEvents';
import { ms, vs } from '../../utils/responsive';

type Props = { route: RouteProp<EventsStackParamList, 'UploadPhotos'> };

interface PendingPhoto {
  uri: string;
  base64: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export function UploadPhotosScreen({ route }: Props) {
  const { eventId, eventName } = route.params;
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const uploadMutation = useUploadPhoto(eventId);

  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const thumbSize = (width - 40 - 8) / 3;

  const pickPhotos = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
      includeBase64: true,
      quality: 0.8,
    });

    if (result.assets) {
      const newPhotos: PendingPhoto[] = result.assets
        .filter((a) => a.base64 && a.uri)
        .map((a) => ({ uri: a.uri!, base64: a.base64!, status: 'pending' }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const uploadAll = async () => {
    const pending = photos.filter((p) => p.status === 'pending');
    if (pending.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < photos.length; i++) {
      if (photos[i].status !== 'pending') continue;

      setPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, status: 'uploading' } : p));

      try {
        await uploadMutation.mutateAsync(photos[i].base64);
        setPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
        successCount++;
      } catch {
        setPhotos((prev) => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
      }
    }

    setIsUploading(false);
    Alert.alert('Done!', `${successCount} photo${successCount !== 1 ? 's' : ''} uploaded successfully.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const pendingCount = photos.filter((p) => p.status === 'pending').length;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text variant="h3">Upload Photos</Text>
          <Text variant="caption" color={colors.textSecondary}>{eventName}</Text>
        </View>
      </View>

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySurface }]}>
            <Icon name="ImagePlus" size={ms(36)} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text variant="h4" align="center" style={{ marginTop: 20 }}>No photos selected</Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8, maxWidth: 260 }}>
            Pick photos from your gallery to upload to this event
          </Text>
          <Button title="Select Photos" size="lg" onPress={pickPhotos} style={{ marginTop: 24 }} />
        </View>
      ) : (
        <>
          <FlatList
            data={photos}
            keyExtractor={(_, i) => String(i)}
            numColumns={3}
            contentContainerStyle={{ padding: 20, gap: 4, paddingBottom: 120 }}
            columnWrapperStyle={{ gap: 4 }}
            ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeIn} style={{ width: thumbSize, height: thumbSize }}>
                <FastImage
                  source={{ uri: item.uri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {/* Status overlay */}
                {item.status !== 'pending' && (
                  <View style={[StyleSheet.absoluteFill, styles.overlay]}>
                    {item.status === 'uploading' && <ActivityIndicator color="#FFF" />}
                    {item.status === 'done' && <Icon name="CheckCircle" size={ms(28)} color="#4ADE80" strokeWidth={2} />}
                    {item.status === 'error' && <Icon name="XCircle" size={ms(28)} color="#F87171" strokeWidth={2} />}
                  </View>
                )}
                {/* Remove button (only for pending) */}
                {item.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={styles.removeBtn}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Icon name="X" size={ms(12)} color="#FFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          />

          <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={pickPhotos} style={[styles.addMoreBtn, { borderColor: colors.border }]}>
              <Icon name="Plus" size={ms(20)} color={colors.primary} strokeWidth={2} />
              <Text variant="label" color={colors.primary} style={{ marginLeft: 6 }}>Add More</Text>
            </TouchableOpacity>
            <Button
              title={isUploading ? 'Uploading...' : `Upload ${pendingCount} Photo${pendingCount !== 1 ? 's' : ''}`}
              size="md"
              loading={isUploading}
              disabled={pendingCount === 0}
              onPress={uploadAll}
              style={{ flex: 1, marginLeft: 12 }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
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
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: {
    width: ms(80), height: ms(80), borderRadius: ms(24),
    alignItems: 'center', justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    width: ms(20), height: ms(20), borderRadius: ms(10),
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1,
  },
  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: ms(12),
    paddingHorizontal: 14, paddingVertical: 10,
  },
});
