import { MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';
import { colors, fonts } from './tokens';

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 3,
  fonts: configureFonts({ config: { fontFamily: fonts.regular } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.surface,
    primaryContainer: colors.primaryLight,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.brandRed,
    secondaryContainer: '#FDE8E8',
    onSecondaryContainer: colors.text,
    background: colors.background,
    surface: colors.surface,
    error: colors.danger,
    outline: colors.border,
  },
};

export * from './tokens';
