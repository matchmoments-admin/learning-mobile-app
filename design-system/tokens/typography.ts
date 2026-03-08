/**
 * Design System — Typography Tokens
 *
 * Plus Jakarta Sans as primary, Lexend as accessible alternative,
 * SpaceMono for code/monospace.
 */
import { Platform, type TextStyle } from 'react-native';

// ── Font Families ──────────────────────────────────────────────────

export const fontFamilies = {
  jakarta: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
  },
  lexend: {
    regular: 'Lexend_400Regular',
    medium: 'Lexend_500Medium',
    bold: 'Lexend_700Bold',
  },
  mono: {
    regular: 'SpaceMono',
  },
} as const;

// ── Type Scale ─────────────────────────────────────────────────────

export interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
  textTransform?: TextStyle['textTransform'];
}

export const textStyles = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fontFamilies.jakarta.bold,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fontFamilies.jakarta.bold,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fontFamilies.jakarta.semiBold,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fontFamilies.jakarta.semiBold,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: fontFamilies.jakarta.regular,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamilies.jakarta.regular,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilies.jakarta.regular,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.jakarta.medium,
    fontWeight: '500' as const,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fontFamilies.jakarta.semiBold,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Variant names for the Text component */
export type TextVariant = keyof typeof textStyles;

// ── Accessible Font Mapping ────────────────────────────────────────

/** Returns the Lexend equivalent for a Jakarta family key */
export function getAccessibleFontFamily(jakartaFamily: string): string {
  if (jakartaFamily.includes('Bold')) return fontFamilies.lexend.bold;
  if (jakartaFamily.includes('SemiBold') || jakartaFamily.includes('Medium'))
    return fontFamilies.lexend.medium;
  return fontFamilies.lexend.regular;
}
