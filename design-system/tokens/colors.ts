/**
 * Design System — Color Tokens
 *
 * WCAG-audited palette with warm neutrals and orange brand identity.
 * Primitive scales + semantic light/dark theme objects.
 */

// ── Primitive Palette ──────────────────────────────────────────────

export const palette = {
  // Warm grays (slightly warm undertone)
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0F0E0D',
  },

  // Primary orange (refined from #ff4900)
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Success green
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },

  // Error red
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  // Warning amber
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  // Info blue
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;

// ── Semantic Theme Colors ──────────────────────────────────────────

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Borders
  border: string;
  borderLight: string;

  // Brand
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Semantic
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;

  // Interactive
  icon: string;
  iconSecondary: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tint: string;

  // Surfaces
  overlay: string;
  shadow: string;
}

export const lightTheme: ThemeColors = {
  // Backgrounds
  background: palette.white,
  backgroundSecondary: palette.neutral[50],
  card: palette.white,

  // Text
  text: palette.neutral[900],
  textSecondary: palette.neutral[500],
  textTertiary: palette.neutral[400],
  textInverse: palette.white,

  // Borders
  border: palette.neutral[200],
  borderLight: palette.neutral[100],

  // Brand
  primary: palette.primary[500],
  primaryLight: palette.primary[50],
  primaryDark: palette.primary[700],

  // Semantic
  success: palette.success[500],
  successLight: palette.success[50],
  error: palette.error[600],
  errorLight: palette.error[50],
  warning: palette.warning[500],
  warningLight: palette.warning[50],
  info: palette.info[600],
  infoLight: palette.info[50],

  // Interactive
  icon: palette.neutral[500],
  iconSecondary: palette.neutral[400],
  tabIconDefault: palette.neutral[500],
  tabIconSelected: palette.primary[500],
  tint: palette.primary[500],

  // Surfaces
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: palette.black,
};

export const darkTheme: ThemeColors = {
  // Backgrounds — Brilliant.org-inspired dark
  background: '#0F1117',
  backgroundSecondary: '#1A1B23',
  card: '#1E1F2A',

  // Text
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  textTertiary: '#6B7280',
  textInverse: palette.neutral[900],

  // Borders
  border: '#2A2B35',
  borderLight: '#22232D',

  // Brand
  primary: palette.primary[400],
  primaryLight: 'rgba(249, 115, 22, 0.15)',
  primaryDark: palette.primary[600],

  // Semantic
  success: palette.success[400],
  successLight: 'rgba(34, 197, 94, 0.15)',
  error: palette.error[400],
  errorLight: 'rgba(239, 68, 68, 0.15)',
  warning: palette.warning[400],
  warningLight: 'rgba(245, 158, 11, 0.15)',
  info: palette.info[400],
  infoLight: 'rgba(59, 130, 246, 0.15)',

  // Interactive
  icon: '#9BA1A6',
  iconSecondary: '#6B7280',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: palette.primary[400],
  tint: palette.primary[400],

  // Surfaces
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: palette.black,
};
