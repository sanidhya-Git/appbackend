import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { storage, StorageKeys } from '../../services/storage';
import { useTheme } from '../../theme/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Icon, IconName } from '../../components/ui/Icon';
import { ms, vs } from '../../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const SLIDES: { id: string; icon: IconName; title: string; subtitle: string; gradient: [string, string]; accent: string }[] = [
  {
    id: '1',
    icon: 'Camera',
    title: 'Never miss a photo of yourself',
    subtitle: 'Find every photo of you from any event instantly using AI-powered face recognition.',
    gradient: ['#1A1A2E', '#16213E'],
    accent: '#6366F1',
  },
  {
    id: '2',
    icon: 'ScanFace',
    title: 'AI that knows your face',
    subtitle: 'Register your face once. Our AI searches through thousands of event photos in seconds.',
    gradient: ['#1A1A2E', '#0D1117'],
    accent: '#8B5CF6',
  },
  {
    id: '3',
    icon: 'Sparkles',
    title: 'All your moments, one place',
    subtitle: 'Download, share, and save your favorites. Every memory from every event.',
    gradient: ['#1A1A2E', '#16213E'],
    accent: '#EC4899',
  },
];

const ICON_CONTAINER_SIZE = ms(130);

export function OnboardingScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    storage.set(StorageKeys.ONBOARDING_SEEN, true);
    navigation.replace('Auth', { screen: 'Login' } as any);
  };

  const SLIDE_HEIGHT = height * 0.7;
  const BOTTOM_HEIGHT = height * 0.3;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient as [string, string]}
            style={{ width, height: SLIDE_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
          >
            <View style={[styles.slideContent, { paddingHorizontal: spacing[8] }]}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    width: ICON_CONTAINER_SIZE,
                    height: ICON_CONTAINER_SIZE,
                    borderRadius: ICON_CONTAINER_SIZE / 2,
                    backgroundColor: `${item.accent}20`,
                    borderColor: `${item.accent}40`,
                  },
                ]}
              >
                <Icon name={item.icon} size={ms(52)} color={item.accent} strokeWidth={1.25} />
              </View>

              <Text
                variant="h1"
                color="#FFFFFF"
                align="center"
                style={{ marginTop: spacing[8], marginBottom: spacing[4] }}
              >
                {item.title}
              </Text>

              <Text
                variant="bodyLarge"
                color="rgba(255,255,255,0.65)"
                align="center"
              >
                {item.subtitle}
              </Text>
            </View>
          </LinearGradient>
        )}
      />

      {/* Bottom controls */}
      <View
        style={[
          styles.bottomContainer,
          {
            backgroundColor: colors.darkBackground,
            paddingBottom: vs(40),
            minHeight: BOTTOM_HEIGHT,
          },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? colors.primary : 'rgba(255,255,255,0.25)',
                  width: i === activeIndex ? ms(24) : ms(8),
                },
              ]}
            />
          ))}
        </View>

        <View style={{ width: '100%', paddingHorizontal: spacing[6] }}>
          <Button
            title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
            size="lg"
          />
        </View>

        {activeIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleGetStarted} style={{ marginTop: spacing[4] }}>
            <Text
              variant="label"
              color="rgba(255,255,255,0.4)"
              align="center"
            >
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: vs(24),
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: vs(24),
  },
  dot: {
    height: ms(8),
    borderRadius: ms(4),
  },
});
