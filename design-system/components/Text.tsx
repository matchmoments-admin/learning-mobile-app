/**
 * Design System — Text Component
 *
 * Drop-in replacement for ThemedText with design token integration.
 * Supports both legacy `type` prop and new `variant` prop.
 */
import React, { useMemo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useAccessibility } from '@/ctx/AccessibilityContext';
import { useTheme } from '../ThemeProvider';
import {
  textStyles,
  getAccessibleFontFamily,
  type TextVariant,
} from '../tokens/typography';

/** Map legacy ThemedText type names → new variants */
const legacyTypeMap: Record<string, TextVariant> = {
  default: 'body',
  title: 'display',
  defaultSemiBold: 'body',
  subtitle: 'h3',
  link: 'body',
};

export interface TextComponentProps extends RNTextProps {
  /** New variant prop — preferred */
  variant?: TextVariant;
  /** Legacy compat with ThemedText */
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  /** Override color — theme token name or raw string */
  color?: string;
}

export function Text({
  variant,
  type,
  color,
  style,
  ...rest
}: TextComponentProps) {
  const { colors } = useTheme();
  const { getScaledFontSize } = useAccessibility();

  const resolvedVariant = variant ?? legacyTypeMap[type ?? 'default'] ?? 'body';
  const baseStyle = textStyles[resolvedVariant];

  const computedStyle = useMemo(() => {
    const style = baseStyle as Record<string, unknown>;
    const scaled = {
      fontSize: getScaledFontSize(baseStyle.fontSize),
      lineHeight: getScaledFontSize(baseStyle.lineHeight),
      fontFamily: baseStyle.fontFamily,
      fontWeight: baseStyle.fontWeight,
      ...(style.letterSpacing != null
        ? { letterSpacing: style.letterSpacing as number }
        : {}),
      ...(style.textTransform != null
        ? { textTransform: style.textTransform as 'uppercase' }
        : {}),
    };

    // Legacy weight overrides
    if (type === 'defaultSemiBold') {
      (scaled as Record<string, unknown>).fontWeight = '600';
    }

    return scaled;
  }, [resolvedVariant, type, getScaledFontSize]);

  const resolvedColor = color ?? (type === 'link' ? colors.info : colors.text);

  return (
    <RNText
      style={[{ color: resolvedColor }, computedStyle, style]}
      {...rest}
    />
  );
}
