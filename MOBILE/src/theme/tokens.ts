/**
 * Design Tokens — WCFinder Mobile "Soft Glass" (light)
 *
 * Single source of truth for color, spacing, radius, typography, shadow and
 * motion. Brand cyan (#0891b2) is preserved; neutrals are a single cool slate
 * family. Structured so a `dark` variant can be added later without touching
 * component code (see useTheme).
 *
 * References: ui-ux-pro-max/pro-rules.md (4/8dp rhythm, ≥44pt targets,
 * 150–300ms motion, tinted shadows) and high-end-visual-design (soft diffuse
 * shadows, spring physics, glass surfaces).
 */

// ── Palette (raw values — do not consume directly in screens, use `colors`) ──
const palette = {
  cyan50: '#f0f9ff',
  cyan100: '#e0f2fe',
  cyan500: '#0891b2',
  cyan600: '#0e7490',
  cyan700: '#155e75',

  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  white: '#ffffff',

  green600: '#16a34a',
  green50: '#f0fdf4',
  red500: '#ef4444',
  red50: '#fee2e2',
  amber500: '#f59e0b',
} as const;

// ── Semantic colors ──
export const colors = {
  // Brand
  primary: palette.cyan500,
  primaryDark: palette.cyan600,
  primaryDarker: palette.cyan700,
  primaryTint: palette.cyan50,
  primaryTint2: palette.cyan100,
  onPrimary: palette.white,

  // Text
  textPrimary: palette.slate900,
  textStrong: palette.slate700,
  textSecondary: palette.slate500,
  textTertiary: palette.slate400,
  onDark: palette.white,

  // Surfaces
  background: palette.slate50,
  surface: palette.white,
  surfaceAlt: palette.slate100,
  surfaceSunken: '#eef2f6',

  // Borders / dividers
  border: palette.slate200,
  borderStrong: palette.slate300,
  hairline: 'rgba(15,23,42,0.06)',

  // Glass (Soft Glass surfaces over gradients/imagery)
  glassFill: 'rgba(255,255,255,0.72)',
  glassFillStrong: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(255,255,255,0.6)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  // States
  success: palette.green600,
  successTint: palette.green50,
  error: palette.red500,
  errorTint: palette.red50,
  warning: palette.amber500,

  // Overlay / scrim (modals, sheets) — 40–60% per pro-rules
  scrim: 'rgba(15,23,42,0.5)',
} as const;

// Brand gradient (headers/heroes) — matches CLIENT design language
export const gradients = {
  brand: [palette.cyan500, palette.cyan600] as const,
  brandDeep: [palette.cyan600, palette.cyan700] as const,
  success: ['#22c55e', '#16a34a'] as const,
} as const;

// ── Spacing — strict 4/8dp rhythm ──
export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ── Radius — one scale, consistent shapes ──
export const radius = {
  xs: 8,
  sm: 10,
  md: 12, // inputs / buttons
  lg: 16, // cards
  xl: 20, // panels
  '2xl': 24, // sheets / hero
  full: 999, // pills / avatars
} as const;

// ── Typography (Plus Jakarta Sans) ──
// Family keys map to @expo-google-fonts/plus-jakarta-sans exports.
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
};

export const typography: Record<
  | 'display'
  | 'h1'
  | 'h2'
  | 'title'
  | 'bodyLg'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'eyebrow',
  TextStyleToken
> = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  bodyLg: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.5 },
};

// ── Shadows — soft, diffuse, tinted (never generic black) ──
// iOS uses shadow*, Android uses elevation. Cards get a cool slate tint;
// primary CTAs get a cyan glow.
export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: palette.slate700,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: palette.slate700,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: palette.slate900,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  brandGlow: {
    shadowColor: palette.cyan500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

// ── Motion — durations, springs, easing (150–300ms micro-interactions) ──
export const motion = {
  duration: { fast: 150, base: 220, slow: 320 },
  // reanimated withSpring configs
  spring: {
    default: { damping: 18, stiffness: 180, mass: 1 },
    press: { damping: 20, stiffness: 300, mass: 0.9 },
    gentle: { damping: 22, stiffness: 120, mass: 1 },
  },
  // reanimated Easing bezier args
  easing: [0.16, 1, 0.3, 1] as const,
  pressScale: 0.97,
} as const;

// Minimum interactive target (pro-rules: ≥44pt)
export const hitTarget = 44;

export const tokens = {
  colors,
  gradients,
  space,
  radius,
  fonts,
  typography,
  shadow,
  motion,
  hitTarget,
} as const;

export type Tokens = typeof tokens;
