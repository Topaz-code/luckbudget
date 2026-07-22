import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Icon,
  Portal,
  SegmentedButtons,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { CurrencyInput } from '../components/forms/CurrencyInput';
import { nairaInputToKobo } from '../features/budget/calculations';
import { calculateEmergencyFundMetrics } from '../features/emergency/calculations';
import type { EmergencyOverview } from '../features/emergency/types';
import type {
  MonnifyWalletDetails,
  NigerianBank,
  ResolvedBankAccount,
} from '../features/wallet/types';
import {
  configureEmergencyPin,
  fetchEmergencyOverview,
  saveEmergencyWithdrawalLimit,
  submitEmergencyWithdrawal,
} from '../services/firebase/emergencyRepository';
import { isCloudBackendEnabled } from '../services/firebase/client';
import {
  getMonnifyBanks,
  getMonnifyWalletDetails,
  resolveMonnifyBankAccount,
} from '../services/firebase/monnifyRepository';
import {
  hasLocalEmergencyPin,
  setLocalEmergencyPin,
  verifyLocalEmergencyPin,
} from '../services/emergency/pinVault';
import { useBudgetStore } from '../store/budgetStore';
import {
  getEmergencyAdjustmentKobo,
  useEmergencyStore,
} from '../store/emergencyStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';
import { getMonthKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencyWithdrawal'>;

export function EmergencyWithdrawalScreen({ navigation }: Props) {
  const budget = useBudgetStore((state) => state.budget);
  const budgetHydrated = useBudgetStore((state) => state.hasHydrated);
  const withdrawals = useEmergencyStore((state) => state.withdrawals);
  const emergencyHydrated = useEmergencyStore((state) => state.hasHydrated);
  const storedMaximum = useEmergencyStore((state) => state.maxWithdrawals);
  const setStoredMaximum = useEmergencyStore((state) => state.setMaxWithdrawals);
  const setStoredOverview = useEmergencyStore((state) => state.setOverview);
  const recordWithdrawal = useEmergencyStore((state) => state.recordWithdrawal);
  const createLocalWithdrawal = useEmergencyStore((state) => state.createLocalWithdrawal);
  const [overview, setOverview] = useState<EmergencyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [successAmount, setSuccessAmount] = useState<number | null>(null);
  const [transferStatus, setTransferStatus] = useState<'pending_transfer' | 'completed' | null>(null);
  const [walletDetails, setWalletDetails] = useState<MonnifyWalletDetails | null>(null);
  const [banks, setBanks] = useState<NigerianBank[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<NigerianBank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccount, setResolvedAccount] = useState<ResolvedBankAccount | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const amountKobo = nairaInputToKobo(amount);

  const loadOverview = useCallback(async () => {
    if (!budget) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      let nextOverview: EmergencyOverview;
      if (isCloudBackendEnabled) {
        const [cloudOverview, monnifyWallet, supportedBanks] = await Promise.all([
          fetchEmergencyOverview(),
          getMonnifyWalletDetails(),
          getMonnifyBanks(),
        ]);
        nextOverview = cloudOverview;
        setWalletDetails(monnifyWallet);
        setBanks(supportedBanks);
      } else {
        const month = getMonthKey();
        const metrics = calculateEmergencyFundMetrics(
          budget.emergencySavings,
          withdrawals,
          storedMaximum,
          month,
        );
        const adjustment = getEmergencyAdjustmentKobo(withdrawals, month);
        nextOverview = {
          hasPin: await hasLocalEmergencyPin(),
          balanceKobo: metrics.balanceKobo,
          usedCount: metrics.usedCount,
          maxWithdrawals: storedMaximum,
          month,
          adjustedRemainingKobo: budget.remaining + adjustment,
        };
      }
      setOverview(nextOverview);
      setStoredOverview(nextOverview);
    } catch (reasonValue) {
      setError(
        reasonValue instanceof Error
          ? reasonValue.message
          : 'We could not load your emergency fund.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [budget, setStoredOverview, storedMaximum, withdrawals]);

  useFocusEffect(
    useCallback(() => {
      void loadOverview();
    }, [loadOverview]),
  );

  const handlePinSetup = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4 || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      if (isCloudBackendEnabled) await configureEmergencyPin(newPin, confirmPin);
      else await setLocalEmergencyPin(newPin, confirmPin);
      setNewPin('');
      setConfirmPin('');
      await loadOverview();
    } catch (reasonValue) {
      setError(reasonValue instanceof Error ? reasonValue.message : 'We could not set your PIN.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLimitChange = async (value: string) => {
    const maximum = value === '1' ? 1 : 2;
    setStoredMaximum(maximum);
    setOverview((current) => (current ? { ...current, maxWithdrawals: maximum } : current));
    setIsUpdatingLimit(true);
    setError(null);
    try {
      if (isCloudBackendEnabled) await saveEmergencyWithdrawalLimit(maximum);
    } catch (reasonValue) {
      setError(
        `${reasonValue instanceof Error ? reasonValue.message : 'Cloud sync failed.'} The limit is saved on this device.`,
      );
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  const verifyDestinationAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10 || isVerifyingAccount) return;
    setIsVerifyingAccount(true);
    setError(null);
    try {
      setResolvedAccount(
        await resolveMonnifyBankAccount(accountNumber, selectedBank.code),
      );
    } catch (reasonValue) {
      setResolvedAccount(null);
      setError(
        reasonValue instanceof Error
          ? reasonValue.message
          : 'The bank account could not be verified.',
      );
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!budget || !overview || isSaving) return;
    if (
      amountKobo <= 0 ||
      amountKobo > overview.balanceKobo ||
      reason.trim().length < 5 ||
      pin.length !== 4 ||
      overview.usedCount >= overview.maxWithdrawals ||
      (isCloudBackendEnabled && (!selectedBank || !resolvedAccount))
    ) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const result = isCloudBackendEnabled
        ? await submitEmergencyWithdrawal({
            amountKobo,
            reason: reason.trim(),
            pin,
            destinationBankCode: selectedBank!.code,
            destinationAccountNumber: resolvedAccount!.accountNumber,
          })
        : await (async () => {
            await verifyLocalEmergencyPin(pin);
            return createLocalWithdrawal({
              amountKobo,
              reason: reason.trim(),
              initialBalanceKobo: budget.emergencySavings,
              baseRemainingKobo: budget.remaining,
            });
          })();

      if (isCloudBackendEnabled) {
        recordWithdrawal({
          id: result.requestId,
          amountKobo,
          reason: reason.trim(),
          month: overview.month,
          createdAt: new Date().toISOString(),
          status: result.transferStatus ?? 'pending_transfer',
        });
      }

      const nextOverview: EmergencyOverview = {
        ...overview,
        balanceKobo: result.balanceKobo,
        usedCount: result.usedCount,
        maxWithdrawals: result.maxWithdrawals,
        adjustedRemainingKobo: result.adjustedRemainingKobo,
      };
      setOverview(nextOverview);
      setStoredOverview(nextOverview);
      setPin('');
      setTransferStatus(result.transferStatus ?? 'completed');
      setSuccessAmount(amountKobo);
    } catch (reasonValue) {
      setPin('');
      setError(
        reasonValue instanceof Error ? reasonValue.message : 'The withdrawal could not be completed.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!budgetHydrated || !emergencyHydrated || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Unlocking your fund details…</Text>
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>Create a budget first</Text>
        <Button mode="contained" onPress={() => navigation.replace('BudgetSetup')}>Create Budget</Button>
      </View>
    );
  }

  if (error && !overview) {
    return (
      <View style={styles.centered}>
        <Icon source="alert-circle-outline" size={42} color={colors.danger} />
        <Text variant="titleMedium" style={styles.errorTitle}>Emergency fund unavailable</Text>
        <Text variant="bodyMedium" style={styles.centeredCopy}>{error}</Text>
        <Button mode="contained" onPress={() => void loadOverview()}>Try Again</Button>
      </View>
    );
  }

  if (!overview) return null;

  if (!overview.hasPin) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.pinHero}>
          <View style={styles.heroIcon}><Icon source="shield-lock-outline" size={34} color={colors.primary} /></View>
          <Text variant="headlineSmall" style={styles.heading}>Secure your emergency fund</Text>
          <Text variant="bodyMedium" style={styles.centeredCopy}>
            Create a 4-digit PIN. You will need it for every withdrawal.
          </Text>
        </View>
        <TextInput
          mode="outlined"
          label="Create PIN"
          value={newPin}
          onChangeText={(value) => setNewPin(value.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Confirm PIN"
          value={confirmPin}
          onChangeText={(value) => setConfirmPin(value.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
        />
        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
        <Button
          mode="contained"
          onPress={() => void handlePinSetup()}
          loading={isSaving}
          disabled={isSaving || newPin.length !== 4 || confirmPin.length !== 4}
          contentStyle={styles.buttonContent}
        >
          Set Secure PIN
        </Button>
      </ScrollView>
    );
  }

  if (isCloudBackendEnabled && walletDetails && !walletDetails.isReady) {
    return (
      <View style={styles.centered}>
        <View style={styles.heroIcon}>
          <Icon source="bank-plus" size={34} color={colors.primary} />
        </View>
        <Text variant="titleLarge" style={styles.walletRequiredTitle}>
          Fund your Emergency Wallet
        </Text>
        <Text variant="bodyMedium" style={styles.centeredCopy}>
          Create a Monnify reserved account and transfer your emergency savings into it before withdrawing.
        </Text>
        <Button mode="contained" icon="bank-plus" onPress={() => navigation.navigate('Wallet')}>
          Create Funding Account
        </Button>
      </View>
    );
  }

  const limitReached = overview.usedCount >= overview.maxWithdrawals;
  const filteredBanks = banks.filter(({ name }) =>
    name.toLowerCase().includes(bankSearch.trim().toLowerCase()),
  );

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Surface style={styles.balanceCard} elevation={2}>
          <View style={styles.balanceHeader}>
            <View>
              <Text variant="labelLarge" style={styles.goldLabel}>LOCKED EMERGENCY FUND</Text>
              <Text variant="headlineMedium" style={styles.balanceAmount}>
                {formatNairaFromKobo(overview.balanceKobo)}
              </Text>
            </View>
            <View style={styles.darkIcon}><Icon source="lock" size={26} color={colors.gold} /></View>
          </View>
          <Text variant="bodySmall" style={styles.onDarkCopy}>
            {overview.maxWithdrawals - overview.usedCount} withdrawal{overview.maxWithdrawals - overview.usedCount === 1 ? '' : 's'} left this month
          </Text>
        </Surface>

        <Text variant="titleSmall" style={styles.sectionLabel}>Monthly withdrawal limit</Text>
        <SegmentedButtons
          value={String(overview.maxWithdrawals)}
          onValueChange={(value) => void handleLimitChange(value)}
          buttons={[
            {
              value: '1',
              label: '1 withdrawal',
              disabled: isUpdatingLimit || overview.usedCount > 0,
            },
            {
              value: '2',
              label: '2 withdrawals',
              disabled: isUpdatingLimit || overview.usedCount > 0,
            },
          ]}
          style={styles.segmented}
        />
        {overview.usedCount > 0 ? (
          <Text variant="bodySmall" style={styles.muted}>The limit cannot change after this month’s first withdrawal.</Text>
        ) : null}

        {limitReached ? (
          <Surface style={styles.limitBanner} elevation={0}>
            <Icon source="calendar-lock" size={24} color={colors.danger} />
            <Text variant="bodyMedium" style={styles.limitText}>
              You have used all emergency withdrawals for this month.
            </Text>
          </Surface>
        ) : (
          <>
            <Text variant="headlineSmall" style={styles.formHeading}>Request withdrawal</Text>
            <CurrencyInput
              label="Amount"
              description="Amount to release from your locked fund"
              hint={`You can withdraw up to ${formatNairaFromKobo(overview.balanceKobo)}.`}
              value={amount}
              onChange={setAmount}
              disabled={isSaving}
            />
            {amountKobo > overview.balanceKobo ? (
              <Text variant="bodySmall" style={styles.inlineError}>This is above your emergency balance.</Text>
            ) : null}
            <TextInput
              mode="outlined"
              label="Reason for withdrawal"
              placeholder="What emergency happened?"
              value={reason}
              onChangeText={setReason}
              multiline
              maxLength={250}
              style={styles.reasonInput}
              disabled={isSaving}
            />
            <Text variant="bodySmall" style={styles.counter}>{reason.length}/250 · minimum 5 characters</Text>

            {isCloudBackendEnabled ? (
              <>
                <Text variant="titleSmall" style={styles.destinationLabel}>Destination account</Text>
                <Button
                  mode="outlined"
                  icon="bank-outline"
                  onPress={() => setShowBankPicker(true)}
                  style={styles.bankButton}
                  contentStyle={styles.bankButtonContent}
                >
                  {selectedBank?.name ?? 'Select Nigerian Bank'}
                </Button>
                <TextInput
                  mode="outlined"
                  label="Account number"
                  value={accountNumber}
                  onChangeText={(value) => {
                    setAccountNumber(value.replace(/\D/g, '').slice(0, 10));
                    setResolvedAccount(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.input}
                  disabled={isSaving}
                />
                <Button
                  mode="outlined"
                  icon="account-check-outline"
                  onPress={() => void verifyDestinationAccount()}
                  loading={isVerifyingAccount}
                  disabled={!selectedBank || accountNumber.length !== 10 || isVerifyingAccount}
                  style={styles.verifyButton}
                >
                  Verify Account
                </Button>
                {resolvedAccount ? (
                  <Surface style={styles.resolvedAccount} elevation={0}>
                    <Icon source="check-circle" size={22} color={colors.success} />
                    <View style={styles.resolvedCopy}>
                      <Text variant="labelLarge" style={styles.resolvedName}>
                        {resolvedAccount.accountName}
                      </Text>
                      <Text variant="bodySmall" style={styles.muted}>
                        {selectedBank?.name} · ******{resolvedAccount.accountNumber.slice(-4)}
                      </Text>
                    </View>
                  </Surface>
                ) : null}
              </>
            ) : null}

            <TextInput
              mode="outlined"
              label="Confirm with 4-digit PIN"
              value={pin}
              onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              style={styles.input}
              disabled={isSaving}
            />
            {error ? <Text style={styles.inlineError} accessibilityRole="alert">{error}</Text> : null}
            <Button
              mode="contained"
              icon="lock-open-variant-outline"
              onPress={() => void handleWithdrawal()}
              loading={isSaving}
              disabled={
                isSaving ||
                amountKobo <= 0 ||
                amountKobo > overview.balanceKobo ||
                reason.trim().length < 5 ||
                pin.length !== 4 ||
                (isCloudBackendEnabled && !resolvedAccount)
              }
              contentStyle={styles.buttonContent}
            >
              Confirm Withdrawal
            </Button>
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={showBankPicker}
          onDismiss={() => setShowBankPicker(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Select bank</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Search banks"
              value={bankSearch}
              onChangeText={setBankSearch}
              left={<TextInput.Icon icon="magnify" />}
              style={styles.bankSearch}
            />
            <ScrollView style={styles.bankList} keyboardShouldPersistTaps="handled">
              {filteredBanks.map((bank) => (
                <Button
                  key={bank.code}
                  mode={selectedBank?.code === bank.code ? 'contained-tonal' : 'text'}
                  onPress={() => {
                    setSelectedBank(bank);
                    setResolvedAccount(null);
                    setShowBankPicker(false);
                  }}
                  contentStyle={styles.bankOption}
                >
                  {bank.name}
                </Button>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBankPicker(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={successAmount !== null} dismissable={false} style={styles.dialog}>
          <Dialog.Icon icon="check-circle" color={colors.success} />
          <Dialog.Title style={styles.dialogTitle}>
            {transferStatus === 'pending_transfer' ? 'Transfer processing' : 'Emergency funds sent'}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge" style={styles.centeredCopy}>
              {transferStatus === 'pending_transfer'
                ? `${formatNairaFromKobo(successAmount ?? 0)} is being processed by Monnify. Your balance will settle automatically.`
                : `${formatNairaFromKobo(successAmount ?? 0)} was sent and added back to your flexible monthly plan.`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => navigation.navigate('Dashboard')}>Back to Dashboard</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
  errorTitle: { color: colors.danger, fontWeight: '800', marginVertical: spacing.md, textAlign: 'center' },
  centeredCopy: { color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg, textAlign: 'center' },
  pinHero: { alignItems: 'center', marginBottom: spacing.lg },
  heroIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 32, height: 64, justifyContent: 'center', marginBottom: spacing.md, width: 64 },
  heading: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  walletRequiredTitle: { color: colors.text, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  input: { backgroundColor: colors.surface, marginBottom: spacing.md },
  inlineError: { color: colors.danger, marginBottom: spacing.md },
  buttonContent: { minHeight: 48 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radii.lg, marginBottom: spacing.lg, padding: spacing.lg },
  balanceHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  goldLabel: { color: colors.gold, fontWeight: '800' },
  balanceAmount: { color: colors.surface, fontWeight: '800', marginTop: spacing.xs },
  darkIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  onDarkCopy: { color: '#C7CDD6', marginTop: spacing.md },
  sectionLabel: { color: colors.text, fontWeight: '700' },
  segmented: { marginTop: spacing.sm },
  muted: { color: colors.textMuted, marginTop: spacing.sm },
  limitBanner: { alignItems: 'center', backgroundColor: '#FDECEC', borderRadius: radii.md, flexDirection: 'row', marginTop: spacing.lg, padding: spacing.md },
  limitText: { color: colors.danger, flex: 1, marginLeft: spacing.sm },
  formHeading: { color: colors.text, fontWeight: '800', marginBottom: spacing.lg, marginTop: spacing.xl },
  reasonInput: { backgroundColor: colors.surface, minHeight: 110 },
  counter: { color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.xs, textAlign: 'right' },
  destinationLabel: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  bankButton: { marginBottom: spacing.md },
  bankButtonContent: { minHeight: 46 },
  verifyButton: { marginBottom: spacing.md },
  resolvedAccount: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radii.sm, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md },
  resolvedCopy: { flex: 1, marginLeft: spacing.sm },
  resolvedName: { color: colors.primary, fontWeight: '800' },
  bankSearch: { backgroundColor: colors.surface, marginBottom: spacing.sm },
  bankList: { maxHeight: 320 },
  bankOption: { justifyContent: 'flex-start', minHeight: 44 },
  dialog: { backgroundColor: colors.surface },
  dialogTitle: { color: colors.text, fontWeight: '800', textAlign: 'center' },
});
