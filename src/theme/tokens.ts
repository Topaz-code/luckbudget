/** LockBudget visual tokens derived from the supplied brand kit. */
export const colors = {
  primary: '#111827',
  primaryDark: '#0B1220',
  primaryLight: '#EEF2F7',
  brandRed: '#F11B1B',
  bronze: '#F11B1B',
  gold: '#F11B1B',
  goldDark: '#D41414',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FA',
  text: '#111827',
  textMuted: '#667085',
  success: '#16794B',
  danger: '#D31313',
  warning: '#B45309',
  border: '#E2E5EA',
  disabled: '#A8AFBA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const fonts = {
  regular: 'ZalandoSans-Regular',
  medium: 'ZalandoSans-Medium',
  semibold: 'ZalandoSans-SemiBold',
  bold: 'ZalandoSans-Bold',
  black: 'ZalandoSans-Black',
} as const;
