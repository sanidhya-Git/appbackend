import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, withDelay, FadeIn, FadeInDown,
} from 'react-native-reanimated';

import { EventsStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Icon } from '../../components/ui/Icon';
import { useSearchMyPhotos } from '../../hooks/useEvents';
import { useUIStore } from '../../store/slices/uiStore';
import { ms, vs } from '../../utils/responsive';

type Props = { route: RouteProp<EventsStackParamList, 'SearchProcessing'> };

const STEPS = [
  'Analyzing your face...',
  'Scanning event photos...',
  'Matching with AI...',
  'Finalizing results...',
];

function PulseDot({ delay = 0, color }: { delay?: number; color: string }) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.4, { duration: 600 })),
      -1, false,
    ));
    opacity.value = withDelay(delay, withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })),
      -1, false,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />
  );
}

export function SearchProcessingScreen({ route }: Props) {
  const { eventId, eventName } = route.params;
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const showToast = useUIStore((s) => s.showToast);

  const outerRing = useSharedValue(0.9);
  const innerRing = useSharedValue(0.8);
  const stepIndex = useSharedValue(0);
  const [currentStep, setCurrentStep] = React.useState(0);

  const { mutate: searchPhotos } = useSearchMyPhotos(eventId);
  const hasStarted = useRef(false);

  useEffect(() => {
    outerRing.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 1200 }), withTiming(0.9, { duration: 1200 })),
      -1, false,
    );
    innerRing.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(0.8, { duration: 900 })),
      -1, false,
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    searchPhotos(undefined, {
      onSuccess: (res: any) => {
        navigation.replace('SearchResults', { eventId, eventName });
      },
      onError: (err: any) => {
        showToast('Search failed. Please try again.', 'error');
        navigation.goBack();
      },
    });
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerRing.value }],
    opacity: 0.12,
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerRing.value }],
    opacity: 0.2,
  }));

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.center}>

        {/* Pulsing rings */}
        <View style={styles.ringWrap}>
          <Animated.View style={[styles.ringOuter, { backgroundColor: colors.primary }, outerStyle]} />
          <Animated.View style={[styles.ringInner, { backgroundColor: colors.primary }, innerStyle]} />
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Icon name="ScanFace" size={ms(36)} color="#FFF" strokeWidth={1.5} />
          </View>
        </View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.textWrap}>
          <Text variant="h2" align="center">Finding Your Photos</Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
            {eventName}
          </Text>
        </Animated.View>

        {/* Step indicator */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.stepWrap}>
          <Text variant="label" color={colors.primary} align="center" style={{ marginBottom: 20 }}>
            {STEPS[currentStep]}
          </Text>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i <= currentStep ? colors.primary : colors.border,
                    width: i === currentStep ? ms(24) : ms(8),
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Animated dots */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.pulseDots}>
          <PulseDot delay={0} color={colors.primary} />
          <PulseDot delay={200} color={colors.primary} />
          <PulseDot delay={400} color={colors.primary} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <Text variant="caption" color={colors.textTertiary} align="center">
            This may take a few seconds
          </Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const CIRCLE = ms(120);

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  ringWrap: { width: CIRCLE * 2, height: CIRCLE * 2, alignItems: 'center', justifyContent: 'center', marginBottom: vs(40) },
  ringOuter: {
    position: 'absolute',
    width: CIRCLE * 2, height: CIRCLE * 2, borderRadius: CIRCLE,
  },
  ringInner: {
    position: 'absolute',
    width: CIRCLE * 1.5, height: CIRCLE * 1.5, borderRadius: CIRCLE * 0.75,
  },
  iconCircle: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  textWrap: { alignItems: 'center', marginBottom: vs(32) },
  stepWrap: { alignItems: 'center', marginBottom: vs(24) },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: { height: ms(8), borderRadius: ms(4) },
  pulseDots: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  dot: { width: ms(10), height: ms(10), borderRadius: ms(5) },
});
