/**
 * Design System — Input Component
 *
 * Theme-aware TextInput with label, helper text, and error state.
 */
import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useAccessibility } from '@/ctx/AccessibilityContext';
import { useTheme } from '../ThemeProvider';
import { Text } from './Text';
import { fontFamilies } from '../tokens/typography';

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  helperText,
  error,
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const { colors, spacing, radius } = useTheme();
  const { getScaledFontSize } = useAccessibility();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          variant="bodySm"
          color={colors.textSecondary}
          style={{ marginBottom: spacing[1] }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor,
            borderRadius: radius.lg,
            paddingHorizontal: spacing[4],
            fontSize: getScaledFontSize(16),
            fontFamily: fontFamilies.jakarta.regular,
          },
          style,
        ]}
        {...rest}
      />
      {(error || helperText) && (
        <Text
          variant="caption"
          color={error ? colors.error : colors.textTertiary}
          style={{ marginTop: spacing[1] }}
        >
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderWidth: 1,
  },
});
