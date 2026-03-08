/**
 * Design System — Animation Tokens
 *
 * Duration, easing, and spring presets for react-native-reanimated.
 */
import { Easing } from 'react-native-reanimated';

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const easing = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
} as const;

export const springs = {
  gentle: { damping: 20, stiffness: 150, mass: 1 },
  bouncy: { damping: 12, stiffness: 200, mass: 0.8 },
  stiff: { damping: 30, stiffness: 400, mass: 1 },
} as const;

export type DurationKey = keyof typeof duration;
export type SpringPreset = keyof typeof springs;
