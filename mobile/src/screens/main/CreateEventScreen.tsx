import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useCreateEvent } from '../../hooks/useEvents';
import { ms, vs } from '../../utils/responsive';

export function CreateEventScreen() {
  const { colors, radius } = useTheme();
  const navigation = useNavigation<any>();
  const createMutation = useCreateEvent();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Event name is required'); return; }
    if (!eventDate.trim()) { Alert.alert('Error', 'Event date is required (YYYY-MM-DD)'); return; }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventDate)) { Alert.alert('Error', 'Date must be in YYYY-MM-DD format'); return; }

    try {
      const res = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        eventDate: new Date(eventDate).toISOString(),
      });
      const event = res.data!;
      Alert.alert(
        'Event Created!',
        `Invite code: ${event.inviteCode}\n\nShare this code with people you want to invite.`,
        [{ text: 'OK', onPress: () => navigation.navigate('EventDetails', { eventId: event.id, eventName: event.name }) }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to create event');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text variant="h3">Create Event</Text>
        <View style={{ width: ms(40) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.form}>

          <Field label="Event Name *" colors={colors}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Rahul's Birthday"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </Field>

          <Field label="Description" colors={colors}>
            <TextInput
              style={[styles.input, styles.textarea, { color: colors.text, borderColor: colors.border }]}
              placeholder="What's this event about?"
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </Field>

          <Field label="Location" colors={colors}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Delhi, India"
              placeholderTextColor={colors.textTertiary}
              value={location}
              onChangeText={setLocation}
              maxLength={100}
            />
          </Field>

          <Field label="Event Date *" colors={colors}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
              value={eventDate}
              onChangeText={setEventDate}
              keyboardType="numeric"
              maxLength={10}
            />
          </Field>

          <View style={[styles.infoBox, { backgroundColor: colors.primarySurface, borderColor: colors.primary }]}>
            <Icon name="Info" size={ms(16)} color={colors.primary} strokeWidth={1.75} />
            <Text variant="caption" color={colors.primary} style={{ flex: 1, marginLeft: 8 }}>
              After creating, you'll get a unique invite code to share with friends.
            </Text>
          </View>

          <Button
            title="Create Event"
            size="lg"
            fullWidth
            loading={createMutation.isPending}
            onPress={handleCreate}
            style={{ marginTop: 8 }}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text variant="label" style={{ marginBottom: 8 }} color={colors.text}>{label}</Text>
      {children}
    </View>
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
  scroll: { padding: 20, paddingBottom: 60 },
  form: { gap: 0 },
  input: {
    borderWidth: 1, borderRadius: ms(12),
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: ms(15),
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: ms(12),
    padding: 12, marginBottom: 20,
  },
});
