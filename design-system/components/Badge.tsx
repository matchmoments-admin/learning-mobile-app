/**
 * Design System — Badge Component
 *
 * Semantic pill badges for status indicators.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '../ThemeProvider';
import { Text } from './Text';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'premium';

export interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  icon?: React.ReactNode;
}

export function Badge({ variant = 'info', label, icon }: BadgeProps) {
  const { colors, radius, spacing } = useTheme();

  const variantColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, fg: colors.success };
      case 'warning':
        return { bg: colors.warningLight, fg: colors.warning };
      case 'error':
        return { bg: colors.errorLight, fg: colors.error };
      case 'info':
        return { bg: colors.infoLight, fg: colors.info };
      case 'premium':
        return { bg: colors.primaryLight, fg: colors.primary };
    }
  };

  const { bg, fg } = variantColors();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
          gap: spacing[1],
        },
      ]}
    >
      {icon}
      <Text variant="caption" color={fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
