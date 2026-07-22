import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetSection } from '../components/forms/BudgetSection';
import { BudgetSummaryBar } from '../components/forms/BudgetSummaryBar';
import { CurrencyInput } from '../components/forms/CurrencyInput';
import {
  allBudgetFields,
  emptyBudgetInputs,
  fixedExpenseFields,
  incomeFields,
  variableExpenseFields,
} from '../features/budget/budgetFields';
import {
  calculateBudgetTotals,
  inputsToAmounts,
  koboToNairaInput,
} from '../features/budget/calculations';
import type { BudgetFieldKey, BudgetInputValues, SavedBudget } from '../features/budget/types';
import { saveMonthlyBudget } from '../services/firebase/budgetRepository';
import { useBudgetStore } from '../store/budgetStore';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetSetup'>;
type SectionKey = 'income' | 'fixed' | 'variable';

const savedBudgetToInputs = (budget: SavedBudget | null): BudgetInputValues => {
  if (!budget) return emptyBudgetInputs();
  return Object.fromEntries(
    allBudgetFields.map(({ key }) => [key, koboToNairaInput(budget[key])]),
  ) as BudgetInputValues;
};

function BudgetSetupForm({ navigation, budget }: Props & { budget: SavedBudget | null }) {
  const saveBudget = useBudgetStore((state) => state.saveBudget);
  const [inputs, setInputs] = useState<BudgetInputValues>(() => savedBudgetToInputs(budget));
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    income: true,
    fixed: true,
    variable: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const amounts = useMemo(() => inputsToAmounts(inputs), [inputs]);
  const totals = useMemo(() => calculateBudgetTotals(amounts), [amounts]);

  const updateField = (key: BudgetFieldKey, value: string) => {
    setSaveError(null);
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const toggleSection = (section: SectionKey) =>
    setExpanded((current) => ({ ...current, [section]: !current[section] }));

  const handleContinue = async () => {
    if (totals.remaining < 0 || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      saveBudget(amounts, totals);
      await saveMonthlyBudget(amounts, totals);
      navigation.navigate('DailyPlan');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'We could not save your budget. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text variant="headlineSmall" style={styles.heading}>
            Build your monthly plan
          </Text>
          <Text variant="bodyMedium" style={styles.introCopy}>
            Tell us where your money should go. Your totals update instantly as you type.
          </Text>
        </View>

        <BudgetSection
          title="Income"
          subtitle="Money coming in this month"
          totalLabel="Total income"
          totalKobo={totals.totalIncome}
          expanded={expanded.income}
          onToggle={() => toggleSection('income')}
        >
          {incomeFields.map(({ key, ...field }) => (
            <CurrencyInput
              key={key}
              {...field}
              value={inputs[key]}
              onChange={(value) => updateField(key, value)}
            />
          ))}
        </BudgetSection>

        <BudgetSection
          title="Fixed Expenses"
          subtitle="Your regular commitments"
          totalLabel="Total fixed"
          totalKobo={totals.totalFixedExpenses}
          expanded={expanded.fixed}
          onToggle={() => toggleSection('fixed')}
        >
          {fixedExpenseFields.map(({ key, ...field }) => (
            <CurrencyInput
              key={key}
              {...field}
              value={inputs[key]}
              onChange={(value) => updateField(key, value)}
            />
          ))}
        </BudgetSection>

        <BudgetSection
          title="Variable Expenses"
          subtitle="Flexible spending for the month"
          totalLabel="Total variable"
          totalKobo={totals.totalVariableExpenses}
          expanded={expanded.variable}
          onToggle={() => toggleSection('variable')}
        >
          {variableExpenseFields.map(({ key, ...field }) => (
            <CurrencyInput
              key={key}
              {...field}
              value={inputs[key]}
              onChange={(value) => updateField(key, value)}
            />
          ))}
        </BudgetSection>
      </ScrollView>

      <BudgetSummaryBar
        totals={totals}
        onContinue={handleContinue}
        isSaving={isSaving}
        error={saveError}
      />
    </KeyboardAvoidingView>
  );
}

export function BudgetSetupScreen(props: Props) {
  const budget = useBudgetStore((state) => state.budget);
  const hasHydrated = useBudgetStore((state) => state.hasHydrated);
  const hydrationError = useBudgetStore((state) => state.hydrationError);

  if (!hasHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading your budget…
        </Text>
      </View>
    );
  }

  if (hydrationError) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>
          We couldn't load your saved plan
        </Text>
        <Text variant="bodyMedium" style={styles.errorCopy}>
          Check your device storage and try again.
        </Text>
        <Button mode="contained" onPress={() => void useBudgetStore.persist.rehydrate()}>
          Try again
        </Button>
      </View>
    );
  }

  return <BudgetSetupForm {...props} budget={budget} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.sm },
  intro: { marginBottom: spacing.lg, paddingTop: spacing.sm },
  heading: { color: colors.text, fontWeight: '800' },
  introCopy: { color: colors.textMuted, lineHeight: 21, marginTop: spacing.sm },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
  errorTitle: { color: colors.danger, fontWeight: '700', textAlign: 'center' },
  errorCopy: { color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.sm, textAlign: 'center' },
});
