/**
 * Design System — Button Component
 *
 * Primary (filled), secondary (outlined), ghost (text-only).
 * Sizes: sm (36px), md (44px WCAG target), lg (48px).
 */
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAccessibility } from '@/ctx/AccessibilityContext';
import { useTheme } from '../ThemeProvider';
import { Text } from './Text';
import { duration } from '../tokens/animation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 14 as const },
  md: { height: 44, paddingHorizontal: 16, fontSize: 16 as const },
  lg: { height: 48, paddingHorizontal: 20, fontSize: 18 as const },
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  icon,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors, radius } = useTheme();
  const { shouldAnimate } = useAccessibility();
  const scale = useSharedValue(1);

  const sizeConfig = sizeMap[size];
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    if (shouldAnimate()) {
      scale.value = withTiming(0.98, { duration: duration.instant });
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [shouldAnimate]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: duration.fast });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const textColor =
    variant === 'primary' ? colors.textInverse : colors.primary;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.base,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: radius.lg,
          opacity: isDisabled ? 0.4 : 1,
        },
        variantStyles(),
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text
            variant="body"
            color={textColor}
            style={[
              styles.label,
              { fontSize: sizeConfig.fontSize },
              icon ? { marginLeft: 8 } : undefined,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
