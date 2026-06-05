import React from 'react';
import {
  ScrollView, View, StyleSheet, TouchableOpacity,
  RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { EventCard } from '../../components/cards/EventCard';
import { EventCardSkeleton } from '../../components/ui/SkeletonLoader';
import { useDashboard } from '../../hooks/useUser';
import { useAuthStore } from '../../store/slices/authStore';
import { ms, vs } from '../../utils/responsive';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { data: dashboard, isLoading, refetch, isRefetching } = useDashboard();

  const stats = [
    { label: 'Photos Found', value: dashboard?.totalPhotos ?? 0, icon: 'Image' as const },
    { label: 'Events',       value: dashboard?.recentEvents?.length ?? 0, icon: 'Calendar' as const },
    { label: 'Unread',       value: dashboard?.unreadNotifications ?? 0, icon: 'Bell' as const },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="bodySmall" color={colors.textTertiary}>
              {getGreeting()}
            </Text>
            <Text variant="h2" style={{ marginTop: 2 }}>
              {user?.firstName ?? 'Welcome'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('HomeTab', { screen: 'Notifications' })}
            >
              <Icon name="Bell" size={ms(20)} color={colors.text} strokeWidth={1.75} />
              {(dashboard?.unreadNotifications ?? 0) > 0 && (
                <View style={[styles.dot, { backgroundColor: colors.error }]} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
              <Avatar
                uri={user?.avatarUrl}
                name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                size={ms(40)}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Face registration nudge ── */}
        {!user?.isFaceRegistered && (
          <Animated.View entering={FadeInDown.springify()}>
            <TouchableOpacity
              style={[styles.nudge, { backgroundColor: colors.primarySurface }]}
              onPress={() =>
                navigation.navigate('ProfileTab', {
                  screen: 'FaceRegistration',
                  params: { fromSettings: true },
                })
              }
            >
              <View style={[styles.nudgeIcon, { backgroundColor: colors.primaryMuted }]}>
                <Icon name="ScanFace" size={ms(20)} color={colors.primary} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text variant="label" color={colors.primary}>Register your face</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Enable AI photo detection in events
                </Text>
              </View>
              <Icon name="ChevronRight" size={ms(18)} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(i * 60).springify()}
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.statIcon, { backgroundColor: colors.primarySurface }]}>
                <Icon name={stat.icon} size={ms(16)} color={colors.primary} strokeWidth={2} />
              </View>
              <Text variant="h3" color={colors.text} style={{ marginTop: 10 }}>
                {stat.value}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {stat.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* ── Recent Events ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent Events</Text>
            <TouchableOpacity
              style={styles.seeAll}
              onPress={() => navigation.navigate('EventsTab', { screen: 'EventsList' })}
            >
              <Text variant="label" color={colors.primary}>See all</Text>
              <Icon name="ChevronRight" size={ms(15)} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : dashboard?.recentEvents?.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <Icon name="Calendar" size={ms(32)} color={colors.textTertiary} strokeWidth={1.5} />
              <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 12 }}>
                No events yet. Check back soon.
              </Text>
            </View>
          ) : (
            dashboard?.recentEvents?.map((event, i) => (
              <Animated.View key={event.id} entering={FadeInDown.delay(180 + i * 70).springify()}>
                <EventCard
                  event={event}
                  onPress={() =>
                    navigation.navigate('EventsTab', {
                      screen: 'EventDetails',
                      params: { eventId: event.id, eventName: event.name },
                    })
                  }
                  style={{ marginBottom: 16 }}
                />
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: vs(16),
    paddingBottom: vs(20),
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: ms(40), height: ms(40), borderRadius: ms(12),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  dot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#FFF',
  },
  nudge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, marginBottom: 20,
  },
  nudgeIcon: { width: ms(40), height: ms(40), borderRadius: ms(12), alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: ms(36), height: ms(36), borderRadius: ms(10), alignItems: 'center', justifyContent: 'center' },
  section: { gap: 0 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  emptyCard: {
    borderRadius: 20, padding: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
});
