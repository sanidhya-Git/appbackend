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
import LinearGradient from 'react-native-linear-gradient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useLogin, useGoogleAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/slices/uiStore';
import { extractError } from '../../api/client';
import axios from 'axios';
import { Icon } from '../../components/ui/Icon';
import { ms } from '../../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const { colors, spacing, radius } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const loginMutation = useLogin();
  const googleAuthMutation = useGoogleAuth();
  const showToast = useUIStore((s) => s.showToast);
  const [slowWarning, setSlowWarning] = useState(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loginMutation.isPending || googleAuthMutation.isPending) {
      slowTimer.current = setTimeout(() => setSlowWarning(true), 8000);
    } else {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      setSlowWarning(false);
    }
    return () => { if (slowTimer.current) clearTimeout(slowTimer.current); };
  }, [loginMutation.isPending, googleAuthMutation.isPending]);

  const validate = () => {
    const newErrors = { email: '', password: '' };
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        // Account exists but email not verified — take them to OTP screen
        showToast('Please verify your email first', 'info');
        navigation.navigate('OTPVerification', { email: email.trim() });
      } else {
        showToast(extractError(error), 'error');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) return;
      await googleAuthMutation.mutateAsync(idToken);
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
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing[6] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginTop: spacing[8], marginBottom: spacing[10] }}>
            <Text variant="h1" style={{ marginBottom: spacing[2] }}>
              Welcome back
            </Text>
            <Text variant="bodyLarge" color={colors.textSecondary}>
              Sign in to find your event photos
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: spacing[4] }}>
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={ms(18)} color={colors.textTertiary} strokeWidth={1.75} />
                </TouchableOpacity>
              }
            />
          </View>

          {/* Sign In button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            fullWidth
            size="lg"
            loading={loginMutation.isPending}
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

          {/* Divider */}
          <View style={[styles.divider, { marginVertical: spacing[6] }]}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text
              variant="caption"
              color={colors.textTertiary}
              style={{ marginHorizontal: spacing[3] }}
            >
              OR
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google */}
          <Button
            title="Continue with Google"
            variant="outline"
            fullWidth
            size="lg"
            onPress={handleGoogleLogin}
            loading={googleAuthMutation.isPending}
            style={{ marginBottom: spacing[4] }}
          />

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text variant="body" color={colors.textSecondary}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text variant="body" color={colors.primary} weight="semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
});
