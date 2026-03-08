/**
 * Design System — useAccessibleTheme Hook
 *
 * Composite hook combining useTheme() + useAccessibility().
 * Returns scaled font sizes, accessible font families,
 * and high-contrast color overrides.
 */
import { useMemo } from 'react';

import { useAccessibility } from '@/ctx/AccessibilityContext';
import { useTheme, type Theme } from '../ThemeProvider';
import { palette, type ThemeColors } from '../tokens/colors';
import {
  textStyles,
  getAccessibleFontFamily,
  type TextVariant,
  type TypeStyle,
} from '../tokens/typography';

export interface AccessibleTheme extends Theme {
  /** Font family resolved for current accessibility preferences */
  fontFamily: (jakartaFamily: string) => string;
  /** Text styles with scaled font sizes and accessible font family */
  scaledTextStyles: Record<TextVariant, TypeStyle>;
}

/** High-contrast overrides applied when highContrast preference is on */
function getHighContrastColors(base: ThemeColors, isDark: boolean): ThemeColors {
  if (isDark) {
    return {
      ...base,
      text: '#FFFFFF',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      border: '#4B5563',
      primary: palette.primary[300],
    };
  }
  return {
    ...base,
    text: '#000000',
    textSecondary: '#374151',
    textTertiary: '#4B5563',
    border: '#6B7280',
    primary: palette.primary[700],
  };
}

export function useAccessibleTheme(): AccessibleTheme {
  const theme = useTheme();
  const { preferences, getScaledFontSize } = useAccessibility();

  const colors = useMemo(() => {
    if (preferences.highContrast) {
      return getHighContrastColors(theme.colors, theme.isDark);
    }
    return theme.colors;
  }, [theme.colors, theme.isDark, preferences.highContrast]);

  const fontFamily = useMemo(() => {
    if (preferences.preferAccessibleFont) {
      return getAccessibleFontFamily;
    }
    return (family: string) => family;
  }, [preferences.preferAccessibleFont]);

  const scaledTextStyles = useMemo(() => {
    const result = {} as Record<TextVariant, TypeStyle>;
    for (const [key, style] of Object.entries(textStyles)) {
      result[key as TextVariant] = {
        ...style,
        fontSize: getScaledFontSize(style.fontSize),
        lineHeight: getScaledFontSize(style.lineHeight),
        fontFamily: fontFamily(style.fontFamily),
      };
    }
    return result;
  }, [getScaledFontSize, fontFamily]);

  return {
    ...theme,
    colors,
    fontFamily,
    scaledTextStyles,
  };
}
