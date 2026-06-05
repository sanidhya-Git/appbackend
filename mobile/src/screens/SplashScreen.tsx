import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/slices/authStore';
import { storage, StorageKeys } from '../services/storage';
import { Text } from '../components/ui/Text';
import { Icon } from '../components/ui/Icon';
import { Colors } from '../theme';
import { ms, vs } from '../utils/responsive';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const LOGO_SIZE = ms(100);

export function SplashScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuthStore();
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineAnimStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    const navigate = () => {
      const onboardingSeen = storage.getBoolean(StorageKeys.ONBOARDING_SEEN);
      if (!onboardingSeen) {
        navigation.replace('Onboarding');
      } else if (isAuthenticated) {
        navigation.replace('Main', { screen: 'HomeTab', params: { screen: 'Dashboard' } } as any);
      } else {
        navigation.replace('Auth', { screen: 'Login' } as any);
      }
    };

    const timer = setTimeout(navigate, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[Colors.darkBackground, '#1A1A3E', Colors.darkBackground]}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
        <View style={[styles.logoCircle, { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }]}>
          <Icon name="Camera" size={ms(46)} color="#FFF" strokeWidth={1.5} />
        </View>
        <Text
          variant="h1"
          color={Colors.white}
          align="center"
          style={{ marginTop: ms(16) }}
        >
          PhotoFind
        </Text>
      </Animated.View>

      <Animated.View style={[styles.tagline, taglineAnimStyle, { bottom: vs(80) }]}>
        <Text
          variant="bodyLarge"
          color="rgba(255,255,255,0.6)"
          align="center"
        >
          Find yourself in every moment
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tagline: {
    position: 'absolute',
  },
});
