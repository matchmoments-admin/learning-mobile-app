/**
 * Design System — Card Component
 *
 * Variants: elevated (shadow), outlined (border), filled (subtle bg).
 */
import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../ThemeProvider';

type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({ variant = 'elevated', style, children, ...rest }: CardProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  const variantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.backgroundSecondary,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        { padding: spacing[4], borderRadius: radius.lg },
        variantStyle(),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
