/**
 * Design System — Border Radius Tokens
 */

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  pill: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
