import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ms, vs } from '../../utils/responsive';
import { useProfile, useUpdateProfile } from '../../hooks/useUser';
import { useUIStore } from '../../store/slices/uiStore';
import { extractError } from '../../api/client';

export function EditProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const showToast = useUIStore((s) => s.showToast);

  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState({ firstName: '', lastName: '' });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
    }
  }, [profile]);

  const validate = () => {
    const e = { firstName: '', lastName: '' };
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    setErrors(e);
    return !e.firstName && !e.lastName;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await updateProfileMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      showToast('Profile updated successfully', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(extractError(error), 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surface }]}
          >
            <Icon name="ArrowLeft" size={ms(20)} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text variant="h3">Edit Profile</Text>
          <View style={{ width: ms(40) }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar
              uri={profile?.avatarUrl}
              name={`${firstName} ${lastName}`}
              size={ms(80)}
            />
            <Text variant="label" color={colors.primary} style={{ marginTop: 10 }}>
              Change Photo
            </Text>
          </View>

          <View style={styles.fields}>
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
              autoCapitalize="words"
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
              error={errors.lastName}
              autoCapitalize="words"
            />
            <Input
              label="Email"
              value={profile?.email}
              editable={false}
              containerStyle={{ opacity: 0.6 }}
            />
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={updateProfileMutation.isPending}
            style={{ marginTop: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  fields: { gap: 16 },
});
