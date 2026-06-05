import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useVerifyOTP, useResendOTP } from '../../hooks/useAuth';
import { useUIStore } from '../../store/slices/uiStore';
import { Icon } from '../../components/ui/Icon';
import { extractError } from '../../api/client';
import { ms } from '../../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

const OTP_LENGTH = 6;

export function OTPVerificationScreen({ navigation, route }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { email } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);
  const shakeAnim = useSharedValue(0);

  const verifyMutation = useVerifyOTP();
  const resendMutation = useResendOTP();
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const shake = () => {
    shakeAnim.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, OTP_LENGTH).split('');
      for (let i = 0; i < digits.length && i < OTP_LENGTH; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      shake();
      return;
    }

    try {
      const result = await verifyMutation.mutateAsync({ email, otp: otpString });
      if (result.data) {
        navigation.replace('FaceRegistration', { fromOnboarding: true });
      }
    } catch (error) {
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      showToast(extractError(error), 'error');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendMutation.mutateAsync(email);
      setResendCooldown(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      showToast('OTP resent successfully', 'success');
    } catch (error) {
      showToast(extractError(error), 'error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { paddingHorizontal: spacing[6] }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: spacing[8], flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
        >
          <Icon name="ArrowLeft" size={ms(18)} color={colors.primary} strokeWidth={2} />
          <Text variant="label" color={colors.primary}>Back</Text>
        </TouchableOpacity>

        <View style={[styles.headerIcon, { backgroundColor: colors.primarySurface }]}>
          <Icon name="Mail" size={ms(28)} color={colors.primary} strokeWidth={1.5} />
        </View>
        <Text variant="h1" style={{ marginBottom: spacing[2], marginTop: spacing[4] }}>
          Verify Email
        </Text>
        <Text
          variant="bodyLarge"
          color={colors.textSecondary}
          style={{ marginBottom: spacing[10] }}
        >
          Enter the 6-digit code sent to{'\n'}
          <Text variant="bodyLarge" color={colors.primary} weight="semibold">
            {email}
          </Text>
        </Text>

        {/* OTP Input */}
        <Animated.View style={[styles.otpContainer, shakeStyle]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: digit ? colors.primary : colors.border,
                  borderWidth: digit ? 2 : 1.5,
                  borderRadius: radius.lg,
                  color: colors.text,
                  fontSize: 24,
                  fontWeight: '700',
                },
              ]}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </Animated.View>

        <Button
          title="Verify"
          onPress={handleVerify}
          fullWidth
          size="lg"
          loading={verifyMutation.isPending}
          style={{ marginTop: spacing[10] }}
        />

        <View style={[styles.resend, { marginTop: spacing[6] }]}>
          <Text variant="body" color={colors.textSecondary}>
            Didn't receive it?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCooldown > 0}
          >
            <Text
              variant="body"
              color={resendCooldown > 0 ? colors.textTertiary : colors.primary}
              weight="semibold"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  headerIcon: {
    width: ms(64), height: ms(64), borderRadius: ms(18),
    alignItems: 'center', justifyContent: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  otpInput: {
    width: ms(48),
    height: ms(56),
    textAlign: 'center',
  },
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
