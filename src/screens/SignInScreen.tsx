import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Divider, Icon, Text, TextInput } from 'react-native-paper';
import { sendPasswordReset, signInWithEmail } from '../services/firebase/authService';
import { useAuthOnboardingStore } from '../store/authOnboardingStore';
import { colors, fonts, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const chooseGuest = useAuthOnboardingStore((state) => state.chooseGuest);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const valid = email.includes('@') && password.length >= 6;

  const submit = async () => {
    if (!valid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      if (navigation.canGoBack()) navigation.goBack();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    setNotice(null);
    try {
      await sendPasswordReset(email);
      setNotice('Password reset email sent. Check your inbox.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not send reset email.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="displaySmall" style={styles.title}>Welcome Back</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Sign in to restore your limits, wallet, and progress across devices.
        </Text>

        <View style={styles.form}>
          <Text variant="labelLarge" style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          <TextInput mode="outlined" placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} outlineStyle={styles.inputOutline} />

          <Text variant="labelLarge" style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            mode="outlined"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} onPress={() => setShowPassword((value) => !value)} />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
          />
          <Button mode="text" compact textColor={colors.bronze} onPress={() => void resetPassword()} style={styles.forgotButton}>
            Forgot password?
          </Button>

          {notice ? <Text variant="bodyMedium" style={styles.notice}>{notice}</Text> : null}
          {error ? <Text variant="bodyMedium" style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <Button mode="contained" onPress={() => void submit()} loading={isLoading} disabled={!valid || isLoading} contentStyle={styles.primaryButton} labelStyle={styles.primaryLabel}>
            Sign In
          </Button>
        </View>

        <View style={styles.orRow}>
          <Divider style={styles.divider} />
          <Text variant="labelLarge" style={styles.orText}>OR</Text>
          <Divider style={styles.divider} />
        </View>
        <Button mode="text" icon="account-off-outline" textColor={colors.text} onPress={chooseGuest} labelStyle={styles.guestLabel}>
          Continue Anonymously
        </Button>
        <View style={styles.infoBox}>
          <Icon source="cloud-check-outline" size={20} color={colors.bronze} />
          <Text variant="bodyMedium" style={styles.infoText}>Your signed-in budget is isolated by your Firebase account.</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text variant="bodyLarge" style={styles.bottomText}>New to LockBudget? </Text>
          <Text variant="bodyLarge" style={styles.bottomLink} onPress={() => navigation.replace('SignUp')}>Create Account</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xl },
  title: { color: colors.text, fontFamily: fonts.black, letterSpacing: -1 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.regular, lineHeight: 25, marginTop: spacing.sm },
  form: { marginTop: spacing.xl },
  fieldLabel: { color: colors.text, fontFamily: fonts.semibold, letterSpacing: 1.2, marginBottom: spacing.sm, marginLeft: spacing.xs },
  input: { backgroundColor: colors.surface, fontSize: 17, marginBottom: spacing.lg },
  inputOutline: { borderColor: colors.border, borderRadius: radii.md, borderWidth: 1.2 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: spacing.md, marginTop: -spacing.md },
  notice: { color: colors.success, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  primaryButton: { minHeight: 58 },
  primaryLabel: { fontFamily: fonts.bold, fontSize: 18 },
  orRow: { alignItems: 'center', flexDirection: 'row', marginVertical: spacing.xl, paddingHorizontal: spacing.md },
  divider: { backgroundColor: colors.border, flex: 1 },
  orText: { color: colors.textMuted, marginHorizontal: spacing.md },
  guestLabel: { fontFamily: fonts.bold, fontSize: 18 },
  infoBox: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderColor: '#E2E5EA', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', marginTop: spacing.md, padding: spacing.md },
  infoText: { color: colors.textMuted, flex: 1, lineHeight: 21, marginLeft: spacing.sm, textAlign: 'center' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
  bottomText: { color: colors.textMuted },
  bottomLink: { color: colors.bronze, fontWeight: '900' },
});
