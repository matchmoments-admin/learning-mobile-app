/**
 * Design System — Icon Component
 *
 * Standardized wrapper around Ionicons with theme-aware colors.
 */
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { useTheme } from '../ThemeProvider';
import type { ThemeColors } from '../tokens/colors';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

/** Color token keys that can be passed as shorthand */
type ColorToken = keyof ThemeColors;

export interface IconProps {
  name: IoniconsName;
  /** Preset size or custom number */
  size?: IconSize | number;
  /** Theme color token name (e.g. "primary") or raw color string */
  color?: ColorToken | string;
  style?: ComponentProps<typeof Ionicons>['style'];
}

export function Icon({ name, size = 'lg', color = 'icon', style }: IconProps) {
  const { colors } = useTheme();

  const resolvedSize = typeof size === 'number' ? size : sizeMap[size];
  const resolvedColor =
    color in colors
      ? colors[color as ColorToken]
      : color;

  return (
    <Ionicons
      name={name}
      size={resolvedSize}
      color={resolvedColor}
      style={style}
    />
  );
}
