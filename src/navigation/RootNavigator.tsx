import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text } from 'react-native-paper';
import { AuthWelcomeScreen } from '../screens/AuthWelcomeScreen';
import { BudgetSetupScreen } from '../screens/BudgetSetupScreen';
import { DailyPlanScreen } from '../screens/DailyPlanScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DailyLockSettingsScreen } from '../screens/DailyLockSettingsScreen';
import { EmergencyWithdrawalScreen } from '../screens/EmergencyWithdrawalScreen';
import { LogExpenseScreen } from '../screens/LogExpenseScreen';
import { MonthlyReportScreen } from '../screens/MonthlyReportScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { TodoEditorScreen } from '../screens/TodoEditorScreen';
import { TodoListScreen } from '../screens/TodoListScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { useFirebase } from '../services/firebase/FirebaseProvider';
import { useAuthOnboardingStore } from '../store/authOnboardingStore';
import { useBudgetStore } from '../store/budgetStore';
import { colors, fonts, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  contentStyle: { backgroundColor: colors.background },
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.bold, fontWeight: '700' as const },
  headerBackTitleVisible: false,
};

export function RootNavigator() {
  const budget = useBudgetStore((state) => state.budget);
  const budgetHydrated = useBudgetStore((state) => state.hasHydrated);
  const continueAsGuest = useAuthOnboardingStore((state) => state.continueAsGuest);
  const hasSeenOnboarding = useAuthOnboardingStore((state) => state.hasSeenOnboarding);
  const authChoiceHydrated = useAuthOnboardingStore((state) => state.hasHydrated);
  const { user } = useFirebase();

  if (!budgetHydrated || !authChoiceHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Opening LockBudget…</Text>
      </View>
    );
  }

  const needsAccountChoice = user?.isAnonymous !== false && !continueAsGuest;
  if (needsAccountChoice) {
    return (
      <Stack.Navigator initialRouteName={hasSeenOnboarding ? 'SignUp' : 'AuthWelcome'} screenOptions={screenOptions}>
        <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName={budget ? 'Dashboard' : 'BudgetSetup'} screenOptions={screenOptions}>
      <Stack.Screen name="BudgetSetup" component={BudgetSetupScreen} options={{ title: 'Monthly Budget' }} />
      <Stack.Screen name="DailyPlan" component={DailyPlanScreen} options={{ title: 'Daily Plan' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'LockBudget', headerBackVisible: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account & Sync' }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Protect My Budget' }} />
      <Stack.Screen name="LogExpense" component={LogExpenseScreen} options={{ title: 'Log Expense', presentation: 'modal' }} />
      <Stack.Screen name="DailyLockSettings" component={DailyLockSettingsScreen} options={{ title: 'Daily Lock Settings' }} />
      <Stack.Screen name="EmergencyWithdrawal" component={EmergencyWithdrawalScreen} options={{ title: 'Emergency Fund' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Wallet & Locked Savings' }} />
      <Stack.Screen name="TodoList" component={TodoListScreen} options={{ title: 'Budget To-Dos' }} />
      <Stack.Screen
        name="TodoEditor"
        component={TodoEditorScreen}
        options={({ route }) => ({ title: route.params?.todoId ? 'Edit Task' : 'New Budget Task' })}
      />
      <Stack.Screen name="MonthlyReport" component={MonthlyReportScreen} options={{ title: 'Monthly Report' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
});
