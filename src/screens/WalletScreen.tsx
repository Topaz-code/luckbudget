import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Icon,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import type { MonnifyWalletDetails } from '../features/wallet/types';
import { isCloudBackendEnabled } from '../services/firebase/client';
import {
  createMonnifyWallet,
  getMonnifyWalletDetails,
} from '../services/firebase/monnifyRepository';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

export function WalletScreen({ navigation }: Props) {
  const [wallet, setWallet] = useState<MonnifyWalletDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [kycType, setKycType] = useState<'bvn' | 'nin'>('nin');
  const [kycValue, setKycValue] = useState('');

  const loadWallet = useCallback(async (refresh = false) => {
    if (!isCloudBackendEnabled) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      setWallet(await getMonnifyWalletDetails());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load your virtual account.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadWallet();
    }, [loadWallet]),
  );

  const handleCreate = async () => {
    if (
      isCreating ||
      customerName.trim().length < 3 ||
      !customerEmail.includes('@') ||
      kycValue.length !== 11
    ) {
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const created = await createMonnifyWallet({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        kycType,
        kycValue,
      });
      setKycValue('');
      setWallet(created);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create your virtual account.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyAccountNumber = async () => {
    if (!wallet?.accountNumber) return;
    await Clipboard.setStringAsync(wallet.accountNumber);
    setCopied(true);
  };

  if (!isCloudBackendEnabled) {
    return (
      <View style={styles.centeredWithPadding}>
        <View style={styles.heroIcon}>
          <Icon source="bank-off-outline" size={34} color={colors.primary} />
        </View>
        <Text variant="titleLarge" style={styles.sparkTitle}>Wallet backend is off</Text>
        <Text variant="bodyMedium" style={styles.centeredCopy}>
          The budgeting, expense, to-do, report, and local Emergency Fund features work on Firebase Spark. Real Monnify deposits and bank transfers need a secure server backend.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Back</Button>
      </View>
    );
  }

  if (isLoading && !wallet) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Connecting securely to Monnify…</Text>
      </View>
    );
  }

  if (!wallet?.isReady) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Icon source="bank-plus" size={34} color={colors.primary} /></View>
          <Text variant="headlineSmall" style={styles.heading}>
            {wallet?.environment === 'sandbox' ? 'Create a sandbox test account' : 'Create your funding account'}
          </Text>
          <Text variant="bodyMedium" style={styles.centeredCopy}>
            {wallet?.environment === 'sandbox'
              ? 'This test account accepts simulated Monnify payments only. Never send real money to it.'
              : 'Monnify will assign a dedicated Nigerian bank account for funding your locked savings.'}
          </Text>
        </View>

        <Surface style={styles.kycNotice} elevation={0}>
          <Icon source="shield-check-outline" size={22} color={colors.primary} />
          <Text variant="bodySmall" style={styles.kycCopy}>
            BVN or NIN is required by Monnify for compliance. LockBudget sends it directly to Monnify and never stores it.
          </Text>
        </Surface>

        <TextInput
          mode="outlined"
          label="Full legal name"
          value={customerName}
          onChangeText={setCustomerName}
          maxLength={80}
          style={styles.input}
          disabled={isCreating}
        />
        <TextInput
          mode="outlined"
          label="Email address"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={120}
          style={styles.input}
          disabled={isCreating}
        />
        <SegmentedButtons
          value={kycType}
          onValueChange={(value) => setKycType(value as 'bvn' | 'nin')}
          buttons={[
            { value: 'nin', label: 'NIN' },
            { value: 'bvn', label: 'BVN' },
          ]}
          style={styles.segmented}
        />
        <TextInput
          mode="outlined"
          label={`${kycType.toUpperCase()} (11 digits)`}
          value={kycValue}
          onChangeText={(value) => setKycValue(value.replace(/\D/g, '').slice(0, 11))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={11}
          style={styles.input}
          disabled={isCreating}
        />
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <Button
          mode="contained"
          icon="bank-plus"
          onPress={() => void handleCreate()}
          loading={isCreating}
          disabled={
            isCreating ||
            customerName.trim().length < 3 ||
            !customerEmail.includes('@') ||
            kycValue.length !== 11
          }
          contentStyle={styles.buttonContent}
        >
          Create Secure Account
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadWallet(true)}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {wallet.environment === 'sandbox' ? (
        <Surface style={styles.sandboxBanner} elevation={0} accessibilityRole="alert">
          <Icon source="flask-outline" size={22} color={colors.warning} />
          <View style={styles.sandboxCopy}>
            <Text variant="labelLarge" style={styles.sandboxTitle}>SANDBOX TEST ACCOUNT</Text>
            <Text variant="bodySmall" style={styles.sandboxText}>
              Do not send real money. Fund this account only with Monnify's Payment Simulator.
            </Text>
          </View>
        </Surface>
      ) : null}
      <Surface style={styles.accountCard} elevation={2}>
        <View style={styles.accountHeader}>
          <Text variant="labelLarge" style={styles.goldText}>YOUR LOCKBUDGET ACCOUNT</Text>
          <Icon source="shield-lock" size={25} color={colors.gold} />
        </View>
        <Text variant="headlineMedium" style={styles.accountNumber}>{wallet.accountNumber}</Text>
        <Text variant="bodyMedium" style={styles.accountName}>{wallet.accountName}</Text>
        <Text variant="bodySmall" style={styles.bankName}>{wallet.bankName}</Text>
        <Button
          mode="outlined"
          icon={copied ? 'check' : 'content-copy'}
          textColor={colors.gold}
          onPress={() => void copyAccountNumber()}
          style={styles.copyButton}
        >
          {copied ? 'Copied' : 'Copy Account Number'}
        </Button>
      </Surface>

      <Surface style={styles.infoCard} elevation={0}>
        <Icon source="information-outline" size={22} color={colors.primary} />
        <Text variant="bodySmall" style={styles.infoCopy}>
          Transfer money to this account. Deposits automatically fill your Emergency Fund first, then Fixed Savings, then your available wallet balance.
        </Text>
      </Surface>

      <View style={styles.balanceGrid}>
        <Surface style={[styles.balanceCard, styles.cardGap]} elevation={1}>
          <Text variant="labelSmall" style={styles.muted}>EMERGENCY LOCKED</Text>
          <Text variant="titleMedium" style={styles.balanceAmount}>
            {formatNairaFromKobo(wallet.emergencyBalanceKobo)}
          </Text>
        </Surface>
        <Surface style={styles.balanceCard} elevation={1}>
          <Text variant="labelSmall" style={styles.muted}>FIXED SAVINGS</Text>
          <Text variant="titleMedium" style={styles.balanceAmount}>
            {formatNairaFromKobo(wallet.fixedSavingsBalanceKobo)}
          </Text>
        </Surface>
      </View>
      <Surface style={styles.availableCard} elevation={1}>
        <View>
          <Text variant="labelSmall" style={styles.muted}>AVAILABLE WALLET BALANCE</Text>
          <Text variant="titleLarge" style={styles.availableAmount}>
            {formatNairaFromKobo(wallet.availableBalanceKobo)}
          </Text>
        </View>
        <Icon source="wallet-outline" size={30} color={colors.primary} />
      </Surface>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        icon="shield-lock-outline"
        onPress={() => navigation.navigate('EmergencyWithdrawal')}
        contentStyle={styles.buttonContent}
      >
        Manage Emergency Fund
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  centeredWithPadding: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xl },
  sparkTitle: { color: colors.text, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  heroIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 32, height: 64, justifyContent: 'center', marginBottom: spacing.md, width: 64 },
  heading: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  centeredCopy: { color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' },
  kycNotice: { alignItems: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radii.md, flexDirection: 'row', marginBottom: spacing.lg, padding: spacing.md },
  kycCopy: { color: colors.primaryDark, flex: 1, lineHeight: 19, marginLeft: spacing.sm },
  input: { backgroundColor: colors.surface, marginBottom: spacing.md },
  segmented: { marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  buttonContent: { minHeight: 48 },
  sandboxBanner: { alignItems: 'flex-start', backgroundColor: '#FFF4D6', borderColor: '#E6A700', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md },
  sandboxCopy: { flex: 1, marginLeft: spacing.sm },
  sandboxTitle: { color: colors.warning, fontWeight: '900' },
  sandboxText: { color: colors.text, lineHeight: 19, marginTop: 2 },
  accountCard: { backgroundColor: colors.primary, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  accountHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  goldText: { color: colors.gold, fontWeight: '800' },
  accountNumber: { color: colors.surface, fontWeight: '800', letterSpacing: 2, marginTop: spacing.md },
  accountName: { color: colors.surface, marginTop: spacing.sm },
  bankName: { color: '#C7CDD6', marginTop: 2 },
  copyButton: { borderColor: colors.gold, marginTop: spacing.lg },
  infoCard: { alignItems: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radii.md, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md },
  infoCopy: { color: colors.primaryDark, flex: 1, lineHeight: 19, marginLeft: spacing.sm },
  balanceGrid: { flexDirection: 'row', marginBottom: spacing.sm },
  balanceCard: { backgroundColor: colors.surface, borderRadius: radii.md, flex: 1, padding: spacing.md },
  cardGap: { marginRight: spacing.sm },
  muted: { color: colors.textMuted },
  balanceAmount: { color: colors.text, fontWeight: '800', marginTop: spacing.xs },
  availableCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg, padding: spacing.md },
  availableAmount: { color: colors.primary, fontWeight: '800', marginTop: spacing.xs },
});
