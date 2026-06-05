import { useColorScheme } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './index';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    ...Colors,
    // Override with dark-mode values
    background: isDark ? Colors.darkBackground : Colors.background,
    surface: isDark ? Colors.darkSurface : Colors.surface,
    surfaceSecondary: isDark ? Colors.darkSurfaceSecondary : Colors.surfaceSecondary,
    border: isDark ? Colors.darkBorder : Colors.border,
    borderLight: isDark ? Colors.darkBorderLight : Colors.borderLight,
    text: isDark ? Colors.darkText : Colors.text,
    textSecondary: isDark ? Colors.darkTextSecondary : Colors.textSecondary,
    textTertiary: isDark ? Colors.darkTextTertiary : Colors.textTertiary,
  };

  return {
    isDark,
    colors,
    typography: Typography,
    spacing: Spacing,
    radius: BorderRadius,
    shadows: Shadows,
  };
}

export type Theme = ReturnType<typeof useTheme>;
