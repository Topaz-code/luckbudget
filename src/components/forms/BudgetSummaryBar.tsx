import { StyleSheet, View } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';
import type { BudgetTotals } from '../../features/budget/types';
import { colors, spacing } from '../../theme';
import { formatNairaFromKobo } from '../../utils/currency';

interface BudgetSummaryBarProps {
  totals: BudgetTotals;
  onContinue: () => void;
  isSaving: boolean;
  error: string | null;
}

function SummaryItem({
  label,
  value,
  valueColor = colors.text,
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text variant="labelSmall" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text variant="titleSmall" style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {formatNairaFromKobo(value)}
      </Text>
    </View>
  );
}

export function BudgetSummaryBar({
  totals,
  onContinue,
  isSaving,
  error,
}: BudgetSummaryBarProps) {
  const isNegative = totals.remaining < 0;

  return (
    <Surface style={styles.container} elevation={5}>
      {isNegative ? (
        <View style={styles.warning} accessibilityRole="alert">
          <Icon source="alert-circle-outline" size={19} color={colors.danger} />
          <Text variant="bodySmall" style={styles.warningText}>
            You've exceeded your income. Please adjust your expenses.
          </Text>
        </View>
      ) : null}
      {error ? (
        <Text variant="bodySmall" style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <View style={styles.summaryRow}>
        <SummaryItem label="Total Income" value={totals.totalIncome} />
        <SummaryItem label="Total Expenses" value={totals.totalExpenses} />
        <SummaryItem
          label="Remaining"
          value={totals.remaining}
          valueColor={isNegative ? colors.danger : colors.success}
        />
      </View>
      <Button
        mode="contained"
        onPress={onContinue}
        disabled={isNegative || isSaving}
        loading={isSaving}
        icon="arrow-right"
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        accessibilityHint={
          isNegative ? 'Reduce expenses before continuing' : 'Save this budget and open your daily plan'
        }
      >
        Save & Continue
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  warning: {
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    flexDirection: 'row',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: { color: colors.danger, flex: 1, fontWeight: '600', marginLeft: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', marginBottom: spacing.sm },
  summaryItem: { flex: 1, minWidth: 0 },
  label: { color: colors.textMuted },
  value: { fontWeight: '800', marginTop: 2, fontSize: 14 },
  buttonContent: { minHeight: 46, flexDirection: 'row-reverse' },
  buttonLabel: { fontWeight: '800' },
});
