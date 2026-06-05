export const Colors = {
  // Brand
  primary: '#6366F1',
  primaryDark: '#4338CA',
  primaryLight: '#818CF8',
  primaryMuted: 'rgba(99, 102, 241, 0.10)',
  primarySurface: 'rgba(99, 102, 241, 0.06)',

  // Secondary
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryMuted: 'rgba(139, 92, 246, 0.10)',

  // Backgrounds
  background: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F4F4F5',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#09090B',
  textSecondary: '#71717A',
  textTertiary: '#A1A1AA',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  divider: '#F0F0F2',

  // Semantic
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.10)',
  successDark: '#16A34A',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.10)',
  warning: '#F59E0B',
  warningMuted: 'rgba(245, 158, 11, 0.10)',
  info: '#3B82F6',
  infoMuted: 'rgba(59, 130, 246, 0.10)',

  // Utility
  white: '#FFFFFF',
  black: '#09090B',
  overlay: 'rgba(9, 9, 11, 0.60)',
  overlayLight: 'rgba(9, 9, 11, 0.30)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.20)',
  scrim: 'rgba(0, 0, 0, 0.45)',

  // Dark mode (for backwards compat with useTheme)
  darkBackground: '#09090B',
  darkSurface: '#18181B',
  darkSurfaceSecondary: '#27272A',
  darkBorder: '#3F3F46',
  darkBorderLight: '#27272A',
  darkText: '#FAFAFA',
  darkTextSecondary: '#A1A1AA',
  darkTextTertiary: '#71717A',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.8,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

// 8-point grid
export const Spacing: Record<string | number, number> = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
};

export const BorderRadius = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const Shadows = {
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 5,
  },
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export const Animation = {
  duration: {
    instant: 80,
    fast: 160,
    normal: 280,
    slow: 460,
    slower: 640,
  },
  spring: {
    gentle: { damping: 20, stiffness: 180 },
    snappy: { damping: 22, stiffness: 260 },
    bouncy: { damping: 14, stiffness: 200 },
  },
} as const;

export type ThemeColors = typeof Colors;
export type Theme = {
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radius: typeof BorderRadius;
  shadows: typeof Shadows;
};
