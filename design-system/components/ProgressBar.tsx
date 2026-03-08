/**
 * Design System — ProgressBar Component
 *
 * Animated fill with reduced-motion support.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAccessibility } from '@/ctx/AccessibilityContext';
import { useTheme } from '../ThemeProvider';
import { duration } from '../tokens/animation';

export interface ProgressBarProps {
  /** 0–1 */
  progress: number;
  /** Fill color — defaults to theme primary */
  color?: string;
  /** Track color — defaults to theme borderLight */
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 8,
  style,
}: ProgressBarProps) {
  const { colors, radius } = useTheme();
  const { shouldAnimate } = useAccessibility();
  const fillWidth = useSharedValue(0);

  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    if (shouldAnimate()) {
      fillWidth.value = withTiming(clamped, { duration: duration.normal });
    } else {
      fillWidth.value = clamped;
    }
  }, [clamped, shouldAnimate]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped * 100),
      }}
      style={[
        styles.track,
        {
          height,
          borderRadius: radius.pill,
          backgroundColor: trackColor ?? colors.borderLight,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            borderRadius: radius.pill,
            backgroundColor: color ?? colors.primary,
          },
          animatedFill,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
