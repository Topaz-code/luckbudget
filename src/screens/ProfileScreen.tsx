import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Icon, Surface, Text } from 'react-native-paper';
import { signOutUser } from '../services/firebase/authService';
import { useFirebase } from '../services/firebase/FirebaseProvider';
import { useAuthOnboardingStore } from '../store/authOnboardingStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user } = useFirebase();
  const requireAccountChoice = useAuthOnboardingStore((state) => state.requireAccountChoice);
  const isGuest = user?.isAnonymous ?? true;

  const signOut = async () => {
    requireAccountChoice();
    await signOutUser();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.avatar}>
        <Text variant="headlineMedium" style={styles.avatarText}>
          {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'G'}
        </Text>
      </View>
      <Text variant="headlineSmall" style={styles.title}>
        {isGuest ? 'Guest account' : user?.displayName || 'LockBudget user'}
      </Text>
      <Text variant="bodyMedium" style={styles.email}>{isGuest ? 'Not signed up yet' : user?.email}</Text>

      <Surface style={styles.statusCard} elevation={0}>
        <Icon source={isGuest ? 'cloud-alert-outline' : 'cloud-check-outline'} size={26} color={isGuest ? colors.warning : colors.success} />
        <View style={styles.statusCopy}>
          <Text variant="titleSmall" style={styles.statusTitle}>
            {isGuest ? 'Guest data is temporary' : 'Cloud sync is active'}
          </Text>
          <Text variant="bodySmall" style={styles.statusText}>
            {isGuest
              ? 'Create an account to keep this budget securely across devices.'
              : 'Budgets, expenses, and tasks sync privately to your Firebase account.'}
          </Text>
        </View>
      </Surface>

      {isGuest ? (
        <Button mode="contained" icon="account-plus-outline" onPress={() => navigation.navigate('SignUp')} contentStyle={styles.button}>
          Protect My Budget
        </Button>
      ) : null}
      <Button mode="outlined" icon="wallet-outline" onPress={() => navigation.navigate('Wallet')} contentStyle={styles.button} style={styles.action}>
        Wallet & Locked Savings
      </Button>
      <Button mode="outlined" icon="pencil-outline" onPress={() => navigation.navigate('BudgetSetup')} contentStyle={styles.button} style={styles.action}>
        Edit Monthly Budget
      </Button>
      <View style={styles.spacer} />
      <Button mode="text" textColor={colors.danger} icon="logout" onPress={() => void signOut()}>
        {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, padding: spacing.lg },
  avatar: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.gold, borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  avatarText: { color: colors.primaryDark, fontWeight: '900' },
  title: { color: colors.text, fontWeight: '900', marginTop: spacing.md, textAlign: 'center' },
  email: { color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  statusCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', marginVertical: spacing.xl, padding: spacing.md },
  statusCopy: { flex: 1, marginLeft: spacing.md },
  statusTitle: { color: colors.text, fontWeight: '800' },
  statusText: { color: colors.textMuted, lineHeight: 19, marginTop: 3 },
  button: { minHeight: 48 },
  action: { marginTop: spacing.sm },
  spacer: { flex: 1 },
});
