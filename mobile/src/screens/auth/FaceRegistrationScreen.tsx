import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera, useCameraDevice, useCameraPermission,
} from 'react-native-vision-camera';
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
  withRepeat, withSequence, interpolateColor,
} from 'react-native-reanimated';

import { useTheme } from '../../theme/useTheme';
import { ms } from '../../utils/responsive';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { useRegisterFace, useVerifyFaceQuality } from '../../hooks/useUser';
import { useUIStore } from '../../store/slices/uiStore';
import { extractError } from '../../api/client';

const { width: SW } = Dimensions.get('window');
const OVAL_W = SW * 0.65;
const OVAL_H = OVAL_W * 1.35;

type FaceState = 'idle' | 'detecting' | 'quality_check' | 'good' | 'capturing' | 'processing' | 'success' | 'error';

const INSTRUCTIONS: Record<FaceState, string> = {
  idle: 'Position your face in the oval',
  detecting: 'Detecting face...',
  quality_check: 'Checking quality...',
  good: 'Hold still! Capturing...',
  capturing: 'Capturing...',
  processing: 'Processing your face data...',
  success: 'Face registered successfully!',
  error: 'Please try again',
};

export function FaceRegistrationScreen({ navigation }: any) {
  const { colors } = useTheme();
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);

  const [faceState, setFaceState] = useState<FaceState>('idle');

  const pulseAnim = useSharedValue(0);
  const ovalColor = useSharedValue(0);

  const registerFaceMutation = useRegisterFace();
  const verifyQualityMutation = useVerifyFaceQuality();
  const showToast = useUIStore((s) => s.showToast);

  React.useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  React.useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })),
      -1, false,
    );
  }, []);

  React.useEffect(() => {
    ovalColor.value = withTiming(
      faceState === 'good' || faceState === 'success' ? 1 : 0, { duration: 300 },
    );
  }, [faceState]);

  const ovalAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(ovalColor.value, [0, 1], [colors.primary, colors.success]),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulseAnim.value * 0.4,
    transform: [{ scale: 1 + pulseAnim.value * 0.03 }],
  }));

  const handleCapture = async () => {
    if (!camera.current || faceState === 'processing' || faceState === 'capturing') return;
    setFaceState('capturing');
    try {
      const photo = await camera.current.takePhoto({ qualityPrioritization: 'quality', flash: 'off' });
      const base64 = await readFileAsBase64(photo.path);

      setFaceState('quality_check');
      const qualityResult = await verifyQualityMutation.mutateAsync(base64);
      if (!(qualityResult as any)?.data?.isAcceptable) {
        setFaceState('error');
        showToast('Poor face quality. Ensure good lighting and face the camera.', 'error');
        setTimeout(() => setFaceState('idle'), 2000);
        return;
      }

      setFaceState('processing');
      await registerFaceMutation.mutateAsync(base64);

      setFaceState('success');
      showToast('Face registered successfully!', 'success');
      setTimeout(() => {
        navigation.replace('Main', { screen: 'HomeTab', params: { screen: 'Dashboard' } } as any);
      }, 1500);
    } catch (error) {
      setFaceState('error');
      showToast(extractError(error), 'error');
      setTimeout(() => setFaceState('idle'), 2000);
    }
  };

  async function readFileAsBase64(path: string): Promise<string> {
    const response = await fetch(`file://${path}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <View style={[styles.permIcon, { backgroundColor: colors.primarySurface }]}>
            <Icon name="Camera" size={ms(32)} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text variant="h3" align="center" style={{ marginTop: 20, marginBottom: 8 }}>
            Camera Access Required
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginBottom: 24 }}>
            We need camera access to register your face for AI photo search
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text variant="body" color={colors.error}>Front camera not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isProcessing = ['quality_check', 'capturing', 'processing'].includes(faceState);
  const isSuccess = faceState === 'success';

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isSuccess}
        photo
        enableZoomGesture={false}
      />

      {/* Dark overlay */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        {/* Oval */}
        <View style={styles.ovalWrapper}>
          <Animated.View style={[styles.ovalOuter, { borderColor: `${colors.primary}40` }, pulseStyle]} />
          <Animated.View style={[styles.oval, ovalAnimStyle]} />
        </View>

        {/* Top bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <Icon name="X" size={ms(18)} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text variant="h4" color="#FFF">Register Face</Text>
          <View style={{ width: ms(36) }} />
        </SafeAreaView>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          {isSuccess ? (
            <Badge label="Registered" variant="success" style={{ alignSelf: 'center', marginBottom: 16 }} />
          ) : isProcessing ? (
            <Badge label="Processing..." variant="primary" style={{ alignSelf: 'center', marginBottom: 16 }} />
          ) : null}

          <Text variant="bodyLarge" color="#FFF" align="center" style={{ marginBottom: 20 }}>
            {INSTRUCTIONS[faceState]}
          </Text>

          <View style={styles.tips}>
            {['Face the camera directly', 'Ensure good lighting', 'Remove glasses if possible'].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Icon name="Check" size={ms(14)} color="rgba(255,255,255,0.6)" strokeWidth={2} />
                <Text variant="bodySmall" color="rgba(255,255,255,0.7)" style={{ marginLeft: 8 }}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          {!isSuccess && (
            <Button
              title={isProcessing ? 'Processing...' : 'Capture & Register'}
              onPress={handleCapture}
              fullWidth
              size="lg"
              loading={isProcessing}
              style={{ marginTop: 20 }}
            />
          )}

          <Button
            title="Skip for now"
            variant="ghost"
            onPress={() =>
              navigation.replace('Main', { screen: 'HomeTab', params: { screen: 'Dashboard' } } as any)
            }
            fullWidth
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  ovalWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    top: -50,
  },
  ovalOuter: {
    position: 'absolute',
    width: OVAL_W + 20, height: OVAL_H + 20,
    borderRadius: (OVAL_W + 20) / 2,
    borderWidth: 2,
  },
  oval: {
    width: OVAL_W, height: OVAL_H,
    borderWidth: 3, borderStyle: 'dashed',
    borderRadius: OVAL_W / 2,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8,
  },
  closeBtn: {
    width: ms(36), height: ms(36), borderRadius: ms(10),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  bottomSection: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 48,
  },
  tips: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16, padding: 16, gap: 10,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permIcon: { width: ms(72), height: ms(72), borderRadius: ms(22), alignItems: 'center', justifyContent: 'center' },
});
