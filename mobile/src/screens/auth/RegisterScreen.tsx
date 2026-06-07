import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegister } from '../../hooks/useAuth';
import { useUIStore } from '../../store/slices/uiStore';
import { Icon } from '../../components/ui/Icon';
import { extractError } from '../../api/client';
import { ms } from '../../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegister();
  const showToast = useUIStore((s) => s.showToast);
  const [slowWarning, setSlowWarning] = useState(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (registerMutation.isPending) {
      slowTimer.current = setTimeout(() => setSlowWarning(true), 8000);
    } else {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSlowWarning(false);
    }
    return () => { if (slowTimer.current) clearTimeout(slowTimer.current); };
  }, [registerMutation.isPending]);

  const setField = (key: keyof typeof form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim()) e.firstName = 'First name required';
    if (!form.lastName.trim()) e.lastName = 'Last name required';
    if (!form.email.trim()) e.email = 'Email required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await registerMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigation.navigate('OTPVerification', { email: form.email.trim() });
    } catch (error) {
      showToast(extractError(error), 'error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing[6], paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing[4], marginBottom: spacing[8], flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
          >
            <Icon name="ArrowLeft" size={ms(18)} color={colors.primary} strokeWidth={2} />
            <Text variant="label" color={colors.primary}>Back</Text>
          </TouchableOpacity>

          <Text variant="h1" style={{ marginBottom: spacing[2] }}>
            Create account
          </Text>
          <Text
            variant="bodyLarge"
            color={colors.textSecondary}
            style={{ marginBottom: spacing[8] }}
          >
            Join to find your photos in events
          </Text>

          {/* Form */}
          <View style={{ gap: spacing[4] }}>
            <View style={{ flexDirection: 'row', gap: spacing[3] }}>
              <Input
                label="First Name"
                placeholder="John"
                value={form.firstName}
                onChangeText={setField('firstName')}
                error={errors.firstName}
                containerStyle={{ flex: 1 }}
                autoCapitalize="words"
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={form.lastName}
                onChangeText={setField('lastName')}
                error={errors.lastName}
                containerStyle={{ flex: 1 }}
                autoCapitalize="words"
              />
            </View>

            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={setField('email')}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Min. 8 characters"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={setField('password')}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={ms(18)} color={colors.textTertiary} strokeWidth={1.75} />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              secureTextEntry={!showPassword}
              value={form.confirmPassword}
              onChangeText={setField('confirmPassword')}
              error={errors.confirmPassword}
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            fullWidth
            size="lg"
            loading={registerMutation.isPending}
            style={{ marginTop: spacing[8] }}
          />
          {slowWarning && (
            <Text
              variant="caption"
              color={colors.textTertiary}
              style={{ textAlign: 'center', marginTop: spacing[3] }}
            >
              Server is starting up, please wait a moment...
            </Text>
          )}

          <View style={styles.footer}>
            <Text variant="body" color={colors.textSecondary}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text variant="body" color={colors.primary} weight="semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
