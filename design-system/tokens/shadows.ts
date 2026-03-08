/**
 * Design System — Shadow Tokens
 *
 * Cross-platform: iOS uses shadowOffset/shadowOpacity,
 * Android uses elevation.
 */
import { Platform, type ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

function createShadow(
  ios: { offsetY: number; opacity: number; radius: number },
  elevation: number,
): ShadowStyle {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ios.offsetY },
      shadowOpacity: ios.opacity,
      shadowRadius: ios.radius,
    },
    default: {
      elevation,
    },
  }) as ShadowStyle;
}

export const shadows = {
  none: createShadow({ offsetY: 0, opacity: 0, radius: 0 }, 0),
  sm: createShadow({ offsetY: 1, opacity: 0.05, radius: 2 }, 1),
  md: createShadow({ offsetY: 2, opacity: 0.08, radius: 8 }, 4),
  lg: createShadow({ offsetY: 4, opacity: 0.12, radius: 12 }, 8),
  xl: createShadow({ offsetY: 8, opacity: 0.16, radius: 24 }, 16),
} as const;

export type ShadowKey = keyof typeof shadows;
