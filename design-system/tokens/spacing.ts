/**
 * Design System — Spacing Tokens
 *
 * 4px base unit, 8px grid alignment.
 */

/** Numeric scale: spacing[n] = n * 4px */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Named aliases for common usage */
export const spacingAliases = {
  xs: spacing[1],   // 4
  sm: spacing[2],   // 8
  md: spacing[3],   // 12
  lg: spacing[4],   // 16
  xl: spacing[6],   // 24
  '2xl': spacing[8],  // 32
  '3xl': spacing[12], // 48
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingAlias = keyof typeof spacingAliases;
