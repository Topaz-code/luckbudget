import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  HelperText,
  Icon,
  Portal,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { CurrencyInput } from '../components/forms/CurrencyInput';
import { nairaInputToKobo } from '../features/budget/calculations';
import { expenseCategories } from '../features/expenses/categories';
import { calculateDailyLock } from '../features/expenses/dailyLock';
import type { ExpenseCategory } from '../features/expenses/types';
import { getTodoReservations } from '../features/todos/calculations';
import { createExpense, saveExpenseToCloud } from '../services/firebase/expenseRepository';
import { useBudgetStore } from '../store/budgetStore';
import { useDailyLockStore } from '../store/dailyLockStore';
import { getEmergencyAdjustmentKobo, useEmergencyStore } from '../store/emergencyStore';
import { useExpenseStore } from '../store/expenseStore';
import { useTodoStore } from '../store/todoStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';
import { getMonthKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'LogExpense'>;

export function LogExpenseScreen({ navigation }: Props) {
  const budget = useBudgetStore((state) => state.budget);
  const budgetHydrated = useBudgetStore((state) => state.hasHydrated);
  const expenses = useExpenseStore((state) => state.expenses);
  const expensesHydrated = useExpenseStore((state) => state.hasHydrated);
  const upsertExpense = useExpenseStore((state) => state.upsertExpense);
  const markSynced = useExpenseStore((state) => state.markSynced);
  const lockPreference = useDailyLockStore((state) => state.preference);
  const lockHydrated = useDailyLockStore((state) => state.hasHydrated);
  const emergencyOverview = useEmergencyStore((state) => state.overview);
  const emergencyWithdrawals = useEmergencyStore((state) => state.withdrawals);
  const emergencyHydrated = useEmergencyStore((state) => state.hasHydrated);
  const todos = useTodoStore((state) => state.todos);
  const todosHydrated = useTodoStore((state) => state.hasHydrated);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('miscellaneous');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [expenseCommitted, setExpenseCommitted] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountKobo = nairaInputToKobo(amount);

  if (
    !budgetHydrated ||
    !expensesHydrated ||
    !lockHydrated ||
    !emergencyHydrated ||
    !todosHydrated
  ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingCopy}>Checking today's allowance…</Text>
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>No active budget found</Text>
        <Button mode="contained" onPress={() => navigation.replace('BudgetSetup')}>Create Budget</Button>
      </View>
    );
  }

  const flexibleBudgetKobo =
    emergencyOverview?.month === getMonthKey()
      ? emergencyOverview.adjustedRemainingKobo
      : budget.remaining + getEmergencyAdjustmentKobo(emergencyWithdrawals);
  const dailyLock = calculateDailyLock(
    flexibleBudgetKobo,
    expenses,
    lockPreference,
    new Date(),
    getTodoReservations(todos),
    new Date(budget.updatedAt),
  );
  const lockModalVisible = showLockModal || dailyLock.isLocked;

  const handleSave = async () => {
    if (savedLocally) {
      navigation.goBack();
      return;
    }
    if (amountKobo <= 0 || isSaving) return;
    if (dailyLock.isLocked || amountKobo > dailyLock.remainingTodayKobo) {
      setShowLockModal(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    const reachesLimit = amountKobo === dailyLock.remainingTodayKobo;
    const expense = createExpense({ amountKobo, category, note });
    upsertExpense(expense);
    setExpenseCommitted(true);

    try {
      const result = await saveExpenseToCloud(expense);
      if (result.status === 'synced') markSynced(expense.id);
      if (reachesLimit) setShowLockModal(true);
      else navigation.goBack();
    } catch {
      setSavedLocally(true);
      setError('Saved on this device. We’ll sync it securely when your connection returns.');
      if (reachesLimit) setShowLockModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.allowanceCard} elevation={1}>
          <View style={styles.allowanceRow}>
            <View style={styles.flexOne}>
              <Text variant="labelMedium" style={styles.allowanceLabel}>AVAILABLE TODAY</Text>
              <Text variant="headlineSmall" style={styles.allowanceAmount}>
                {formatNairaFromKobo(dailyLock.remainingTodayKobo)}
              </Text>
              <Text variant="bodySmall" style={styles.muted}>
                {lockPreference === 'rollover'
                  ? `${formatNairaFromKobo(dailyLock.rolledOverKobo)} rolled over`
                  : 'Resets at midnight'}
              </Text>
            </View>
            <View style={styles.lockIcon}>
              <Icon
                source={dailyLock.isLocked ? 'lock' : 'lock-open-outline'}
                size={26}
                color={dailyLock.isLocked ? colors.danger : colors.primary}
              />
            </View>
          </View>
        </Surface>

        <Text variant="headlineSmall" style={styles.heading}>What did you spend?</Text>
        <Text variant="bodyMedium" style={styles.intro}>
          Log it now so your daily allowance stays honest and helpful.
        </Text>

        <CurrencyInput
          label="Amount"
          description="How much did you spend?"
          hint="Enter the exact amount paid in Nigerian Naira."
          value={amount}
          onChange={setAmount}
          disabled={isSaving || savedLocally || expenseCommitted}
        />
        <HelperText type="error" visible={amount.length > 0 && amountKobo <= 0}>
          Enter an amount greater than ₦0.
        </HelperText>
        <HelperText
          type="error"
          visible={amountKobo > dailyLock.remainingTodayKobo && dailyLock.remainingTodayKobo > 0}
        >
          This is above today's available allowance.
        </HelperText>

        <Text variant="titleSmall" style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {expenseCategories.map((option) => (
            <Chip
              key={option.key}
              icon={option.icon}
              selected={category === option.key}
              onPress={() => setCategory(option.key)}
              disabled={isSaving || savedLocally || expenseCommitted}
              style={[styles.chip, category === option.key && styles.selectedChip]}
              showSelectedCheck={false}
            >
              {option.label}
            </Chip>
          ))}
        </View>

        <TextInput
          mode="outlined"
          label="Note (optional)"
          placeholder="e.g. Lunch after lectures"
          value={note}
          onChangeText={setNote}
          maxLength={120}
          multiline
          disabled={isSaving || savedLocally || expenseCommitted}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          style={styles.noteInput}
        />
        <Text variant="bodySmall" style={styles.counter}>{note.length}/120</Text>

        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text variant="bodyMedium" style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          mode="contained"
          icon={savedLocally ? 'arrow-left' : 'check'}
          onPress={() => void handleSave()}
          disabled={amountKobo <= 0 || isSaving || (expenseCommitted && !savedLocally)}
          loading={isSaving}
          contentStyle={styles.buttonContent}
        >
          {savedLocally ? 'Back to Dashboard' : 'Save Expense'}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog
          visible={lockModalVisible}
          dismissable={!dailyLock.isLocked && !expenseCommitted}
          onDismiss={() => setShowLockModal(false)}
          style={styles.dialog}
        >
          <Dialog.Icon icon="lock" color={colors.danger} />
          <Dialog.Title style={styles.dialogTitle}>Daily limit reached</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge" style={styles.dialogCopy}>
              🔒 You've hit today's limit. Come back tomorrow or use your Emergency Fund.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              icon="shield-lock-outline"
              onPress={() => navigation.replace('EmergencyWithdrawal')}
            >
              Use Emergency Fund
            </Button>
            <Button onPress={() => navigation.goBack()}>
              {expenseCommitted ? 'Back to Dashboard' : 'Come Back Tomorrow'}
            </Button>
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
  loadingCopy: { color: colors.textMuted, marginTop: spacing.md },
  errorTitle: { color: colors.danger, fontWeight: '700', marginBottom: spacing.lg },
  allowanceCard: { backgroundColor: colors.surface, borderRadius: radii.md, marginBottom: spacing.lg, padding: spacing.md },
  allowanceRow: { alignItems: 'center', flexDirection: 'row' },
  flexOne: { flex: 1 },
  allowanceLabel: { color: colors.primary, fontWeight: '800' },
  allowanceAmount: { color: colors.text, fontWeight: '800', marginTop: spacing.xs },
  lockIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  muted: { color: colors.textMuted, marginTop: spacing.xs },
  heading: { color: colors.text, fontWeight: '800' },
  intro: { color: colors.textMuted, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  chip: { backgroundColor: colors.surface, marginBottom: spacing.sm, marginRight: spacing.sm },
  selectedChip: { backgroundColor: colors.primaryLight },
  noteInput: { backgroundColor: colors.surface, minHeight: 96 },
  counter: { color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.xs, textAlign: 'right' },
  errorBox: { backgroundColor: '#FFF5E5', borderRadius: 8, marginBottom: spacing.md, padding: spacing.md },
  errorText: { color: colors.warning },
  buttonContent: { minHeight: 48 },
  dialog: { backgroundColor: colors.surface },
  dialogTitle: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  dialogCopy: { color: colors.textMuted, lineHeight: 24, textAlign: 'center' },
});
