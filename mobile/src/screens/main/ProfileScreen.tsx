import React from 'react';
import {
  ScrollView, View, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon, IconName } from '../../components/ui/Icon';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { ms, vs } from '../../utils/responsive';
import { useProfile } from '../../hooks/useUser';
import { useLogout } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/slices/authStore';

interface SettingsRow {
  icon: IconName;
  label: string;
  sublabel?: string;
  onPress: () => void;
  badge?: string;
  danger?: boolean;
}

export function ProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useProfile();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logoutMutation.mutate() },
    ]);
  };

  const settingsRows: SettingsRow[] = [
    {
      icon: 'UserPen',
      label: 'Edit Profile',
      sublabel: 'Update your name and avatar',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'ScanFace',
      label: 'Face Registration',
      sublabel: user?.isFaceRegistered ? 'Registered — AI ready' : 'Not registered yet',
      badge: user?.isFaceRegistered ? undefined : 'Required',
      onPress: () => navigation.navigate('FaceRegistration', { fromSettings: true }),
    },
    {
      icon: 'Image',
      label: 'My Photos',
      sublabel: `${profile?._count?.photoMatches ?? 0} photos found`,
      onPress: () => navigation.navigate('PhotosTab', { screen: 'MyPhotos' }),
    },
    {
      icon: 'Heart',
      label: 'Favorites',
      sublabel: 'Your saved photos',
      onPress: () => navigation.navigate('PhotosTab', { screen: 'Favorites' }),
    },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Text variant="h2" style={{ paddingHorizontal: 20, paddingTop: vs(12), paddingBottom: 16 }}>
          Profile
        </Text>

        {/* Identity card */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={[styles.identityCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
        >
          {isLoading ? (
            <View style={styles.identityInner}>
              <Skeleton width={ms(72)} height={ms(72)} borderRadius={ms(36)} />
              <View style={{ marginLeft: 16, gap: 8 }}>
                <Skeleton width={120} height={18} borderRadius={6} />
                <Skeleton width={160} height={14} borderRadius={6} />
              </View>
            </View>
          ) : (
            <View style={styles.identityInner}>
              <Avatar
                uri={profile?.avatarUrl}
                name={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}
                size={ms(72)}
              />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text variant="h3">{profile?.firstName} {profile?.lastName}</Text>
                <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 3 }} numberOfLines={1}>
                  {profile?.email}
                </Text>
                <View style={styles.badgeRow}>
                  {profile?.isVerified && (
                    <Badge label="Verified" variant="success" size="sm" />
                  )}
                  {profile?.isFaceRegistered && (
                    <Badge label="AI Ready" variant="primary" size="sm" />
                  )}
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="h3" color={colors.primary}>{profile?._count?.photoMatches ?? 0}</Text>
            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>Photos Found</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="h3" color={colors.warning}>{profile?._count?.notifications ?? 0}</Text>
            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>Notifs</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Icon
              name={user?.isFaceRegistered ? 'CheckCircle' : 'AlertCircle'}
              size={ms(22)}
              color={user?.isFaceRegistered ? colors.success : colors.warning}
              strokeWidth={1.75}
            />
            <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 6 }}>
              {user?.isFaceRegistered ? 'Face OK' : 'No Face'}
            </Text>
          </View>
        </Animated.View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text variant="overline" color={colors.textTertiary} style={styles.sectionLabel}>
            Account
          </Text>
          {settingsRows.map((row, i) => (
            <Animated.View key={row.label} entering={FadeInDown.delay(120 + i * 55).springify()}>
              <TouchableOpacity
                onPress={row.onPress}
                activeOpacity={0.8}
                style={[styles.settingsRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              >
                <View style={[styles.iconBox, { backgroundColor: colors.primarySurface }]}>
                  <Icon name={row.icon} size={ms(18)} color={colors.primary} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text variant="label">{row.label}</Text>
                  {row.sublabel && (
                    <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {row.sublabel}
                    </Text>
                  )}
                </View>
                {row.badge && <Badge label={row.badge} variant="warning" size="sm" style={{ marginRight: 8 }} />}
                <Icon name="ChevronRight" size={ms(16)} color={colors.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Sign out */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={{ paddingHorizontal: 20, marginTop: 8, marginBottom: 24 }}
        >
          <Button
            title="Sign Out"
            variant="danger"
            fullWidth
            onPress={handleLogout}
            loading={logoutMutation.isPending}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },
  identityCard: {
    marginHorizontal: 20, borderRadius: 20, borderWidth: 1,
    padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  identityInner: { flexDirection: 'row', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  statsRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 20, marginBottom: 28,
  },
  statCard: {
    flex: 1, borderRadius: 16, borderWidth: 1,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  settingsSection: { paddingHorizontal: 20, gap: 8 },
  sectionLabel: { marginBottom: 4 },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1,
    padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  iconBox: {
    width: ms(40), height: ms(40), borderRadius: ms(12),
    alignItems: 'center', justifyContent: 'center',
  },
});
