import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEvents } from '../../hooks/useEvents';
import { useAuthStore } from '../../store/slices/authStore';
import { Event } from '../../types';
import { ms, vs } from '../../utils/responsive';

function EventPickerItem({
  event, selected, onPress,
}: { event: Event; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.eventItem,
        {
          backgroundColor: selected ? colors.primarySurface : colors.surface,
          borderColor: selected ? colors.primary : colors.borderLight,
          borderWidth: selected ? 1.5 : 1,
        },
      ]}
    >
      <View style={[styles.eventDot, { backgroundColor: selected ? colors.primary : colors.border }]} />
      <View style={{ flex: 1 }}>
        <Text variant="label" color={selected ? colors.primary : colors.text}>{event.name}</Text>
        {event.location && (
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
            {event.location}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text variant="caption" color={colors.textTertiary}>{event.totalPhotos} photos</Text>
        {!event.isProcessed && <Badge label="Processing" variant="warning" size="sm" />}
      </View>
    </TouchableOpacity>
  );
}

export function SearchHubScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data, isLoading } = useEvents();
  const allEvents: Event[] = data?.pages.flatMap((p: any) => p.data ?? []) ?? [];
  const selectedEvent = allEvents.find((e) => e.id === selectedEventId);

  const handleSearch = () => {
    if (!selectedEvent) return;
    if (!user?.isFaceRegistered) {
      navigation.navigate('ProfileTab', {
        screen: 'FaceRegistration',
        params: { fromSettings: true },
      });
      return;
    }
    navigation.navigate('SearchProcessing', {
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text variant="h2">Search</Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 4 }}>
            Find yourself in event photos using AI
          </Text>
        </Animated.View>

        {/* Face status card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <TouchableOpacity
            activeOpacity={user?.isFaceRegistered ? 1 : 0.85}
            onPress={() =>
              !user?.isFaceRegistered &&
              navigation.navigate('ProfileTab', {
                screen: 'FaceRegistration',
                params: { fromSettings: true },
              })
            }
            style={[
              styles.faceCard,
              {
                backgroundColor: user?.isFaceRegistered ? colors.surface : colors.primarySurface,
                borderColor: user?.isFaceRegistered ? colors.borderLight : colors.primary,
                borderWidth: user?.isFaceRegistered ? 1 : 1.5,
              },
            ]}
          >
            <View style={[
              styles.faceIconWrap,
              { backgroundColor: user?.isFaceRegistered ? colors.primarySurface : colors.primary },
            ]}>
              <Icon
                name={user?.isFaceRegistered ? 'ShieldCheck' : 'ScanFace'}
                size={ms(22)}
                color={user?.isFaceRegistered ? colors.primary : '#FFF'}
                strokeWidth={1.75}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text variant="label" color={user?.isFaceRegistered ? colors.text : colors.primary}>
                {user?.isFaceRegistered ? 'Face Registered' : 'Register Your Face'}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {user?.isFaceRegistered
                  ? 'AI is ready to find you in photos'
                  : 'Required before searching events'}
              </Text>
            </View>
            {user?.isFaceRegistered ? (
              <Icon name="CheckCircle" size={ms(20)} color={colors.success} strokeWidth={1.75} />
            ) : (
              <Icon name="ChevronRight" size={ms(18)} color={colors.primary} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Event picker */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text variant="h4" style={{ marginBottom: 12 }}>Select an Event</Text>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} />
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 12 }}>
                Loading events...
              </Text>
            </View>
          ) : allEvents.length === 0 ? (
            <View style={[styles.emptyEvents, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Icon name="Calendar" size={ms(28)} color={colors.textTertiary} strokeWidth={1.5} />
              <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 12 }}>
                No events available yet
              </Text>
            </View>
          ) : (
            <View style={styles.eventList}>
              {allEvents.map((event) => (
                <EventPickerItem
                  key={event.id}
                  event={event}
                  selected={selectedEventId === event.id}
                  onPress={() => setSelectedEventId(event.id)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Search button */}
        {selectedEvent && (
          <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.searchBtnWrap}>
            <View style={[styles.selectedSummary, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Icon name="Image" size={ms(16)} color={colors.primary} strokeWidth={1.75} />
              <Text variant="label" color={colors.text} style={{ flex: 1, marginLeft: 8 }}>
                {selectedEvent.name}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {selectedEvent.totalPhotos} photos
              </Text>
            </View>
            <Button
              title={user?.isFaceRegistered ? 'Find My Photos' : 'Register Face First'}
              size="lg"
              fullWidth
              onPress={handleSearch}
              style={{ marginTop: 12 }}
            />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, gap: 24, paddingBottom: 60 },
  faceCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, padding: 16,
  },
  faceIconWrap: {
    width: ms(46), height: ms(46), borderRadius: ms(13),
    alignItems: 'center', justifyContent: 'center',
  },
  eventList: { gap: 10 },
  eventItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, gap: 12,
  },
  eventDot: {
    width: ms(10), height: ms(10), borderRadius: ms(5),
  },
  loadingWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyEvents: {
    borderRadius: 16, borderWidth: 1,
    padding: 40, alignItems: 'center',
  },
  selectedSummary: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  searchBtnWrap: { gap: 0 },
});
