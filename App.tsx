import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationContainer, DefaultTheme as NavigationTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandIcon } from './src/components/common/BrandIcon';
import { RootNavigator } from './src/navigation/RootNavigator';
import { FirebaseGate, FirebaseProvider } from './src/services/firebase/FirebaseProvider';
import { configureForegroundNotifications } from './src/services/notifications';
import { appTheme, colors, fonts } from './src/theme';
import zalandoRegular from './assets/fonts/ZalandoSans-Regular.ttf';
import zalandoMedium from './assets/fonts/ZalandoSans-Medium.ttf';
import zalandoSemiBold from './assets/fonts/ZalandoSans-SemiBold.ttf';
import zalandoBold from './assets/fonts/ZalandoSans-Bold.ttf';
import zalandoBlack from './assets/fonts/ZalandoSans-Black.ttf';

configureForegroundNotifications();

const navigationTheme = {
  ...NavigationTheme,
  colors: {
    ...NavigationTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.gold,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Feather.font,
    ...MaterialCommunityIcons.font,
    [fonts.regular]: zalandoRegular,
    [fonts.medium]: zalandoMedium,
    [fonts.semibold]: zalandoSemiBold,
    [fonts.bold]: zalandoBold,
    [fonts.black]: zalandoBlack,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme} settings={{ icon: BrandIcon }}>
        <FirebaseProvider>
          <StatusBar style="dark" />
          <FirebaseGate>
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </FirebaseGate>
        </FirebaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
