/**
 * Design System — Theme Provider
 *
 * Provides the full token system via React Context.
 * Reads system color scheme and integrates with AccessibilityContext.
 */
import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

import { lightTheme, type ThemeColors } from './tokens/colors';
import { textStyles } from './tokens/typography';
import { spacing, spacingAliases } from './tokens/spacing';
import { radius } from './tokens/radius';
import { shadows } from './tokens/shadows';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof spacing;
  spacingAliases: typeof spacingAliases;
  radius: typeof radius;
  shadows: typeof shadows;
  typography: typeof textStyles;
}

const ThemeContext = createContext<Theme | null>(null);

export function DesignSystemProvider({ children }: PropsWithChildren) {
  const theme = useMemo<Theme>(
    () => ({
      colors: lightTheme,
      isDark: false,
      spacing,
      spacingAliases,
      radius,
      shadows,
      typography: textStyles,
    }),
    [],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

/**
 * Access the full design system theme.
 *
 * ```ts
 * const { colors, spacing, typography, isDark } = useTheme();
 * ```
 */
export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a DesignSystemProvider');
  }
  return ctx;
}
