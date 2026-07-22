import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Divider, Icon, Text, TextInput } from 'react-native-paper';
import { registerWithEmail } from '../services/firebase/authService';
import { useAuthOnboardingStore } from '../store/authOnboardingStore';
import { colors, fonts, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

function FieldLabel({ children }: { children: string }) {
  return <Text variant="labelLarge" style={styles.fieldLabel}>{children}</Text>;
}

export function SignUpScreen({ navigation }: Props) {
  const chooseGuest = useAuthOnboardingStore((state) => state.chooseGuest);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    name.trim().length >= 2 &&
    email.includes('@') &&
    password.length >= 8 &&
    password === confirmPassword;

  const submit = async () => {
    if (!valid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await registerWithEmail(email, password, name);
      if (navigation.canGoBack()) navigation.goBack();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create your account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="displaySmall" style={styles.title}>Join LockBudget</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Start securing your financial future today with tactile wealth management.
        </Text>

        <View style={styles.form}>
          <FieldLabel>FULL NAME</FieldLabel>
          <TextInput mode="outlined" placeholder="John Doe" value={name} onChangeText={setName} autoCapitalize="words" style={styles.input} outlineStyle={styles.inputOutline} />

          <FieldLabel>EMAIL ADDRESS</FieldLabel>
          <TextInput mode="outlined" placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} outlineStyle={styles.inputOutline} />

          <FieldLabel>PASSWORD</FieldLabel>
          <TextInput
            mode="outlined"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPassword((value) => !value)} />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
          />

          <FieldLabel>CONFIRM PASSWORD</FieldLabel>
          <TextInput
            mode="outlined"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPassword((value) => !value)} />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
          />

          {confirmPassword.length > 0 && password !== confirmPassword ? (
            <Text variant="bodySmall" style={styles.error}>Passwords do not match.</Text>
          ) : null}
          {error ? <Text variant="bodyMedium" style={styles.error} accessibilityRole="alert">{error}</Text> : null}

          <Button mode="contained" onPress={() => void submit()} loading={isLoading} disabled={!valid || isLoading} contentStyle={styles.primaryButton} labelStyle={styles.primaryLabel}>
            Create Account
          </Button>
        </View>

        <View style={styles.orRow}>
          <Divider style={styles.divider} />
          <Text variant="labelLarge" style={styles.orText}>OR</Text>
          <Divider style={styles.divider} />
        </View>

        <Button mode="text" icon="account-off-outline" textColor={colors.text} onPress={chooseGuest} labelStyle={styles.anonymousLabel} contentStyle={styles.anonymousButton}>
          Continue Anonymously
        </Button>

        <View style={styles.infoBox}>
          <Icon source="information-outline" size={20} color={colors.textMuted} />
          <Text variant="bodyMedium" style={styles.infoText}>
            Guest data uses a temporary profile until you create an account.
          </Text>
        </View>

        <View style={styles.signInRow}>
          <Text variant="bodyLarge" style={styles.signInPrompt}>Already have an account? </Text>
          <Text variant="bodyLarge" style={styles.signInLink} onPress={() => navigation.replace('SignIn')}>Sign In</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xl },
  title: { color: colors.text, fontFamily: fonts.black, letterSpacing: -1 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.regular, lineHeight: 25, marginTop: spacing.sm, maxWidth: 480 },
  form: { marginTop: spacing.xl },
  fieldLabel: { color: colors.text, fontFamily: fonts.semibold, letterSpacing: 1.2, marginBottom: spacing.sm, marginLeft: spacing.xs },
  input: { backgroundColor: colors.surface, fontSize: 17, marginBottom: spacing.lg },
  inputOutline: { borderColor: colors.border, borderRadius: radii.md, borderWidth: 1.2 },
  error: { color: colors.danger, marginBottom: spacing.md },
  primaryButton: { minHeight: 58 },
  primaryLabel: { fontFamily: fonts.bold, fontSize: 18 },
  orRow: { alignItems: 'center', flexDirection: 'row', marginVertical: spacing.xl, paddingHorizontal: spacing.md },
  divider: { backgroundColor: colors.border, flex: 1 },
  orText: { color: colors.textMuted, marginHorizontal: spacing.md },
  anonymousButton: { minHeight: 52 },
  anonymousLabel: { fontFamily: fonts.bold, fontSize: 18 },
  infoBox: { alignItems: 'flex-start', backgroundColor: colors.surfaceMuted, borderColor: '#E2E5EA', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', marginTop: spacing.md, padding: spacing.md },
  infoText: { color: colors.textMuted, flex: 1, lineHeight: 21, marginLeft: spacing.sm, textAlign: 'center' },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
  signInPrompt: { color: colors.textMuted },
  signInLink: { color: colors.bronze, fontWeight: '900' },
});
