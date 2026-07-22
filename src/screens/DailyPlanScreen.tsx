import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Icon, Surface, Text } from 'react-native-paper';
import { useBudgetStore } from '../store/budgetStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyPlan'>;

export function DailyPlanScreen({ navigation }: Props) {
  const budget = useBudgetStore((state) => state.budget);

  if (!budget) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>
          No saved budget found
        </Text>
        <Text variant="bodyMedium" style={styles.bodyCopy}>
          Complete your monthly budget before creating a daily plan.
        </Text>
        <Button mode="contained" onPress={() => navigation.replace('BudgetSetup')}>
          Set up budget
        </Button>
      </View>
    );
  }

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyAmount = Math.floor(budget.remaining / daysInMonth);

  return (
    <View style={styles.container}>
      <Surface style={styles.successCard} elevation={1}>
        <View style={styles.iconCircle}>
          <Icon source="check" size={30} color={colors.surface} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          Your budget is saved!
        </Text>
        <Text variant="bodyMedium" style={styles.bodyCopy}>
          Nice work. You have given every Naira a clear job for this month.
        </Text>
      </Surface>

      <Surface style={styles.planCard} elevation={1}>
        <Text variant="labelLarge" style={styles.eyebrow}>
          FLEXIBLE MONEY
        </Text>
        <Text variant="displaySmall" style={styles.amount}>
          {formatNairaFromKobo(budget.remaining)}
        </Text>
        <Text variant="bodyMedium" style={styles.bodyCopy}>
          Available after fixed and variable expenses
        </Text>
        <View style={styles.divider} />
        <View style={styles.planRow}>
          <Text variant="bodyMedium" style={styles.bodyCopy}>
            Starting daily allowance
          </Text>
          <Text variant="titleMedium" style={styles.dailyAmount}>
            {formatNairaFromKobo(dailyAmount)}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.note}>
          Based on {daysInMonth} days. Rollover preferences are configured in the Daily Lock step.
        </Text>
      </Surface>

      <Button
        mode="outlined"
        icon="cog-outline"
        onPress={() => navigation.navigate('DailyLockSettings')}
        style={styles.preferenceButton}
      >
        Choose Rollover Preference
      </Button>
      <Button
        mode="contained"
        icon="view-dashboard-outline"
        onPress={() => navigation.replace('Dashboard')}
        contentStyle={styles.primaryButton}
      >
        Open Dashboard
      </Button>
      <Button
        mode="outlined"
        icon="pencil-outline"
        onPress={() => navigation.goBack()}
        style={styles.editButton}
      >
        Edit monthly budget
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1, padding: spacing.md },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56,
  },
  title: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  bodyCopy: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginVertical: spacing.md,
    padding: spacing.lg,
  },
  eyebrow: { color: colors.primary, fontWeight: '800', textAlign: 'center' },
  amount: { color: colors.primary, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' },
  divider: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth, marginVertical: spacing.lg },
  planRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  dailyAmount: { color: colors.success, fontWeight: '800' },
  note: { color: colors.textMuted, lineHeight: 18, marginTop: spacing.md },
  errorTitle: { color: colors.danger, fontWeight: '700' },
  preferenceButton: { marginBottom: spacing.sm },
  primaryButton: { minHeight: 48 },
  editButton: { marginTop: spacing.sm },
});
