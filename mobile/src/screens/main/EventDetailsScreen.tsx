import React, { useMemo } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  useWindowDimensions, FlatList, ActivityIndicator, Clipboard, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { EventsStackParamList } from '../../types/navigation';
import { Photo } from '../../types';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { useEvent, useEventPhotos } from '../../hooks/useEvents';
import { useAuthStore } from '../../store/slices/authStore';
import { useUIStore } from '../../store/slices/uiStore';
import { ms, vs } from '../../utils/responsive';

type Props = { route: RouteProp<EventsStackParamList, 'EventDetails'> };

export function EventDetailsScreen({ route }: Props) {
  const { eventId, eventName } = route.params;
  const { colors, radius } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);

  const { data: event, isLoading } = useEvent(eventId);
  const {
    data: photosData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEventPhotos(eventId);

  const allPhotos: Photo[] = useMemo(
    () => photosData?.pages.flatMap((p) => p.data) ?? [],
    [photosData]
  );

  const heroHeight = vs(300);
  const thumbSize = (width - 40 - 8) / 3;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const handleCopyInviteCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copied!', `Invite code "${code}" copied to clipboard. Share it with friends to let them join.`);
  };

  const handleFindPhotos = () => {
    if (!user?.isFaceRegistered) {
      showToast('Please register your face first', 'error');
      navigation.navigate('ProfileTab', {
        screen: 'FaceRegistration',
        params: { fromSettings: true },
      });
      return;
    }
    navigation.navigate('SearchProcessing', { eventId, eventName: event?.name ?? eventName });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={{ height: heroHeight }}>
          {isLoading ? (
            <Skeleton height={heroHeight} borderRadius={0} />
          ) : event?.coverImageUrl ? (
            <FastImage
              source={{ uri: event.coverImageUrl, priority: FastImage.priority.high }}
              style={StyleSheet.absoluteFill}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primaryMuted }]} />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.65)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Back */}
          <SafeAreaView style={[styles.backWrap, { top: 0 }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon name="ArrowLeft" size={ms(20)} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Event name overlay */}
          {!isLoading && event && (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={[styles.heroOverlay, { paddingHorizontal: 20, paddingBottom: 24 }]}
            >
              {!event.isProcessed && (
                <Badge label="Processing" variant="warning" size="sm" style={{ marginBottom: 8 }} />
              )}
              <Text variant="h2" color="#FFF" style={{ letterSpacing: -0.4 }}>
                {event.name}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* ── Content card ── */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>

          {/* Meta row */}
          {!isLoading && event && (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.metaRow}>
              {event.location && (
                <View style={styles.metaItem}>
                  <Icon name="MapPin" size={ms(15)} color={colors.textSecondary} strokeWidth={1.75} />
                  <Text variant="bodySmall" color={colors.textSecondary}>{event.location}</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Icon name="Calendar" size={ms(15)} color={colors.textSecondary} strokeWidth={1.75} />
                <Text variant="bodySmall" color={colors.textSecondary}>
                  {formatDate(event.eventDate)}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Stats row */}
          {!isLoading && event && (
            <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Text variant="h3" color={colors.primary}>{event.totalPhotos}</Text>
                <Text variant="caption" color={colors.textSecondary}>Total Photos</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <Icon
                  name={event.isProcessed ? 'CheckCircle' : 'Clock'}
                  size={ms(22)}
                  color={event.isProcessed ? colors.success : colors.warning}
                  strokeWidth={1.75}
                />
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 6 }}>
                  {event.isProcessed ? 'Ready' : 'Processing'}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Description */}
          {!isLoading && event?.description && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Text variant="body" color={colors.textSecondary} style={styles.desc}>
                {event.description}
              </Text>
            </Animated.View>
          )}

          {/* Invite code (shown if event has one) */}
          {!isLoading && event?.inviteCode && (
            <Animated.View entering={FadeInDown.delay(240).springify()} style={{ marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => handleCopyInviteCode(event.inviteCode!)}
                style={[styles.inviteCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                activeOpacity={0.75}
              >
                <Icon name="Key" size={ms(18)} color={colors.primary} strokeWidth={1.75} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="label" color={colors.primary}>Invite Code</Text>
                  <Text variant="mono" style={{ letterSpacing: 4, marginTop: 2 }}>{event.inviteCode}</Text>
                </View>
                <Icon name="Copy" size={ms(16)} color={colors.textTertiary} strokeWidth={1.75} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Upload photos button */}
          {!isLoading && (
            <Animated.View entering={FadeInDown.delay(250).springify()} style={{ marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UploadPhotos', { eventId, eventName: event?.name ?? eventName })}
                style={[styles.uploadBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <Icon name="Upload" size={ms(18)} color={colors.primary} strokeWidth={1.75} />
                <Text variant="label" color={colors.primary} style={{ marginLeft: 10 }}>Upload Photos</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* CTA */}
          {!isLoading && (
            <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.cta}>
              <View style={[styles.ctaCard, { backgroundColor: colors.primary }]}>
                <View style={styles.ctaTop}>
                  <View style={styles.ctaIconWrap}>
                    <Icon name="Sparkles" size={ms(24)} color="#FFF" strokeWidth={1.75} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text variant="h4" color="#FFF">Find Your Photos</Text>
                    <Text variant="caption" color="rgba(255,255,255,0.75)" style={{ marginTop: 3 }}>
                      AI scans {event?.totalPhotos ?? 0} photos to find you
                    </Text>
                  </View>
                </View>
                <Button
                  title="Find My Photos"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={handleFindPhotos}
                  style={{
                    marginTop: 18,
                    borderColor: 'rgba(255,255,255,0.50)',
                    borderRadius: 14,
                  }}
                />
              </View>
            </Animated.View>
          )}
        </View>

        {/* ── All Photos Grid ── */}
        {allPhotos.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.gallerySection}>
            <Text variant="h4" style={{ marginBottom: 14 }}>All Photos</Text>
            <View style={styles.grid}>
              {allPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => navigation.navigate('PhotoViewer', { photos: allPhotos, initialIndex: index })}
                  activeOpacity={0.85}
                >
                  <FastImage
                    source={{ uri: photo.thumbnailUrl, priority: FastImage.priority.normal }}
                    style={[styles.thumb, { width: thumbSize, height: thumbSize }]}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {hasNextPage && (
              <TouchableOpacity
                style={[styles.loadMore, { borderColor: colors.border }]}
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Text variant="body" color={colors.primary}>Load more photos</Text>
                }
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backWrap: { position: 'absolute', left: 0, right: 0 },
  backBtn: {
    margin: 16,
    width: ms(40), height: ms(40), borderRadius: ms(12),
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  content: { padding: 20, gap: 0 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  desc: { marginBottom: 24, lineHeight: 24 },
  inviteCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, borderWidth: 1,
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 16, borderWidth: 1,
  },
  cta: { marginBottom: 8 },
  ctaCard: { borderRadius: 24, padding: 20 },
  ctaTop: { flexDirection: 'row', alignItems: 'center' },
  ctaIconWrap: {
    width: ms(48), height: ms(48), borderRadius: ms(14),
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  gallerySection: { paddingHorizontal: 20, paddingTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  thumb: { borderRadius: 6, backgroundColor: '#E5E7EB' },
  loadMore: {
    marginTop: 16, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, alignItems: 'center',
  },
});
