import React, { useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Icon } from '../../components/ui/Icon';
import { EventCard } from '../../components/cards/EventCard';
import { EventCardSkeleton } from '../../components/ui/SkeletonLoader';
import { useEvents } from '../../hooks/useEvents';
import { Event } from '../../types';
import { ms, vs } from '../../utils/responsive';

export function EventsListScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const {
    data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useEvents();

  const allEvents: Event[] = data?.pages.flatMap((p: any) => p.data ?? []) ?? [];
  const filtered = search.trim()
    ? allEvents.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase()),
      )
    : allEvents;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2">Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('JoinEvent')}
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Icon name="Key" size={ms(16)} color={colors.primary} strokeWidth={2} />
            <Text variant="label" color={colors.primary} style={{ marginLeft: 6 }}>Join</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEvent')}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Icon name="Plus" size={ms(16)} color="#FFF" strokeWidth={2} />
            <Text variant="label" color="#FFF" style={{ marginLeft: 6 }}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input
          placeholder="Search events..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Icon name="Search" size={ms(18)} color={colors.textTertiary} strokeWidth={2} />}
          rightIcon={
            search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Icon name="X" size={ms(16)} color={colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            ) : undefined
          }
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <EventCard
                event={item}
                onPress={() =>
                  navigation.navigate('EventDetails', {
                    eventId: item.id,
                    eventName: item.name,
                  })
                }
                style={{ marginBottom: 16 }}
              />
            </Animated.View>
          )}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySurface }]}>
                <Icon name="Calendar" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text variant="h4" align="center" style={{ marginTop: 16 }}>
                No events found
              </Text>
              <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 6 }}>
                {search ? 'Try a different search term' : 'Check back later for upcoming events'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: vs(12), paddingBottom: 8 },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: ms(12), borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 16 },
  skeletonWrap: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: {
    alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32,
  },
  emptyIcon: {
    width: ms(72), height: ms(72), borderRadius: ms(22),
    alignItems: 'center', justifyContent: 'center',
  },
});
