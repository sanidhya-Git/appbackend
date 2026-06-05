import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useJoinEvent } from '../../hooks/useEvents';
import { ms, vs } from '../../utils/responsive';
import { TouchableOpacity } from 'react-native';

export function JoinEventScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const joinMutation = useJoinEvent();
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 8) {
      Alert.alert('Invalid Code', 'Invite codes are 8 characters long');
      return;
    }
    try {
      const res = await joinMutation.mutateAsync(trimmed);
      const event = res.data!;
      navigation.replace('EventDetails', { eventId: event.id, eventName: event.name });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to join event';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text variant="h3">Join Event</Text>
        <View style={{ width: ms(40) }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySurface }]}>
              <Icon name="Key" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
            </View>

            <Text variant="h3" align="center" style={{ marginTop: 20 }}>Enter Invite Code</Text>
            <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8, marginBottom: 28 }}>
              Ask the event organizer for the 8-character code
            </Text>

            <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
              <TextInput
                ref={inputRef}
                style={[styles.codeInput, { color: colors.text, borderColor: code.length === 8 ? colors.primary : colors.border }]}
                placeholder="e.g. XKZQ8M2P"
                placeholderTextColor={colors.textTertiary}
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                autoCapitalize="characters"
                maxLength={8}
                autoFocus
              />
            </TouchableOpacity>

            <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: 8, marginBottom: 24 }}>
              {code.length}/8 characters
            </Text>

            <Button
              title="Join Event"
              size="lg"
              fullWidth
              loading={joinMutation.isPending}
              onPress={handleJoin}
              disabled={code.length !== 8}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: vs(12),
  },
  backBtn: {
    width: ms(40), height: ms(40), borderRadius: ms(12),
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { alignItems: 'center' },
  iconWrap: {
    width: ms(80), height: ms(80), borderRadius: ms(24),
    alignItems: 'center', justifyContent: 'center',
  },
  codeInput: {
    borderWidth: 2, borderRadius: ms(16),
    paddingHorizontal: 20, paddingVertical: 16,
    fontSize: ms(24), letterSpacing: 6,
    textAlign: 'center', fontWeight: '700',
    minWidth: 240,
  },
});
