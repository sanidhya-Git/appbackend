import React, { useEffect } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon, IconName } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { ms, vs } from '../../utils/responsive';
import { useNotifications, useMarkNotificationsRead } from '../../hooks/useUser';
import { Notification } from '../../types';

const NOTIF_ICONS: Record<Notification['type'], IconName> = {
  PHOTOS_FOUND: 'Image',
  EVENT_ADDED:  'Calendar',
  SYSTEM:       'Bell',
};

export function NotificationsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const { data, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationsRead();

  useEffect(() => {
    return () => { markReadMutation.mutate(undefined); };
  }, []);

  const notifications: Notification[] = (data as any)?.notifications ?? [];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
        >
          <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text variant="h3">Notifications</Text>
        <View style={{ width: ms(40) }} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={ms(80)} borderRadius={16} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySurface }]}>
            <Icon name="Bell" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text variant="h4" align="center" style={{ marginTop: 20 }}>All caught up</Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
            You have no notifications right now
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
              <View style={[
                styles.notifCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: item.isRead ? colors.borderLight : colors.primary,
                  borderWidth: item.isRead ? 1 : 1.5,
                },
              ]}>
                <View style={[styles.iconBox, { backgroundColor: colors.primarySurface }]}>
                  <Icon
                    name={NOTIF_ICONS[item.type]}
                    size={ms(20)}
                    color={colors.primary}
                    strokeWidth={1.75}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.notifHeader}>
                    <Text variant="label" style={{ flex: 1 }}>{item.title}</Text>
                    {!item.isRead && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    {item.body}
                  </Text>
                  <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 4 }}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
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
  skeletonWrap: { padding: 20, gap: 12 },
  list: { padding: 20, gap: 10, paddingBottom: 40 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  iconBox: {
    width: ms(44), height: ms(44), borderRadius: ms(12),
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: {
    width: ms(72), height: ms(72), borderRadius: ms(22),
    alignItems: 'center', justifyContent: 'center',
  },
});
