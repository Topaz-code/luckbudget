import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Button, Icon, ProgressBar, Surface, Text } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import type { BudgetAmounts, BudgetTotals } from '../features/budget/types';
import { calculateMonthlyReport } from '../features/reports/calculations';
import type { MonthlyReportMetrics } from '../features/reports/types';
import { getMonthlyBudget } from '../services/firebase/budgetRepository';
import { getEmergencyWithdrawalsForMonth } from '../services/firebase/emergencyRepository';
import { getExpensesForMonth } from '../services/firebase/expenseRepository';
import { getTodosFromCloud } from '../services/firebase/todoRepository';
import {
  isCloudBackendEnabled,
  isFirebaseConfigured,
} from '../services/firebase/client';
import { useBudgetStore } from '../store/budgetStore';
import { useDailyLockStore } from '../store/dailyLockStore';
import { useEmergencyStore } from '../store/emergencyStore';
import { useExpenseStore } from '../store/expenseStore';
import { useTodoStore } from '../store/todoStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';
import { getMonthKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'MonthlyReport'>;
type ReportBudget = BudgetAmounts & BudgetTotals;

const monthDateFromKey = (key?: string): Date => {
  if (key && /^\d{4}-\d{2}$/.test(key)) {
    const [year, month] = key.split('-').map(Number);
    return new Date(year ?? new Date().getFullYear(), (month ?? 1) - 1, 1, 12);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 12);
};

const moveMonth = (date: Date, offset: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1, 12);

export function MonthlyReportScreen({ navigation, route }: Props) {
  const localBudget = useBudgetStore((state) => state.budget);
  const localExpenses = useExpenseStore((state) => state.expenses);
  const localTodos = useTodoStore((state) => state.todos);
  const localWithdrawals = useEmergencyStore((state) => state.withdrawals);
  const preference = useDailyLockStore((state) => state.preference);
  const [selectedMonth, setSelectedMonth] = useState(() => monthDateFromKey(route.params?.month));
  const [report, setReport] = useState<MonthlyReportMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    const month = getMonthKey(selectedMonth);
    const isCurrentMonth = month === getMonthKey();

    try {
      let budget: ReportBudget | null = isCurrentMonth ? localBudget : null;
      let expenses = localExpenses.filter((expense) => expense.month === month);
      let todos = localTodos.filter((todo) => todo.scheduledDate.startsWith(month));
      let withdrawals = localWithdrawals.filter((item) => item.month === month);

      if (isFirebaseConfigured) {
        const [cloudBudget, cloudExpenses, cloudTodos, cloudWithdrawals] = await Promise.all([
          getMonthlyBudget(selectedMonth),
          getExpensesForMonth(month),
          getTodosFromCloud(),
          isCloudBackendEnabled
            ? getEmergencyWithdrawalsForMonth(month)
            : Promise.resolve(withdrawals),
        ]);
        if (cloudBudget) budget = cloudBudget;
        expenses = cloudExpenses;
        todos = cloudTodos.filter((todo) => todo.scheduledDate.startsWith(month));
        withdrawals = cloudWithdrawals;
      }

      if (!budget) {
        setReport(null);
        return;
      }

      setReport(
        calculateMonthlyReport({
          budget,
          expenses,
          todos,
          withdrawals,
          preference,
          monthDate: selectedMonth,
        }),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not build this report.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [localBudget, localExpenses, localTodos, localWithdrawals, preference, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport]),
  );

  const currentMonth = getMonthKey();
  const selectedMonthKey = getMonthKey(selectedMonth);
  const canMoveForward = selectedMonthKey < currentMonth;
  const monthLabel = new Intl.DateTimeFormat('en-NG', {
    month: 'long',
    year: 'numeric',
  }).format(selectedMonth);

  if (isLoading && !report) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Building your monthly report…</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.screen}>
        <View style={styles.monthSelector}>
          <Button icon="chevron-left" compact onPress={() => setSelectedMonth(moveMonth(selectedMonth, -1))}>Previous</Button>
          <Text variant="titleMedium" style={styles.monthTitle}>{monthLabel}</Text>
          <Button compact disabled={!canMoveForward} onPress={() => setSelectedMonth(moveMonth(selectedMonth, 1))}>Next</Button>
        </View>
        <View style={styles.centeredContent}>
          <Icon source="file-chart-outline" size={52} color={colors.primary} />
          <Text variant="titleLarge" style={styles.emptyTitle}>No report for this month</Text>
          <Text variant="bodyMedium" style={styles.emptyCopy}>
            A monthly report appears after you create a budget for that month.
          </Text>
          {selectedMonthKey === currentMonth ? (
            <Button mode="contained" onPress={() => navigation.navigate('BudgetSetup')}>Create Budget</Button>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>
    );
  }

  const chartData = report.categoryReports.flatMap((category) => [
    {
      value: category.plannedKobo / 100,
      label: category.label,
      frontColor: colors.primaryLight,
      labelTextStyle: { color: colors.textMuted, fontSize: 10 },
    },
    {
      value: category.spentKobo / 100,
      frontColor: category.spentKobo > category.plannedKobo ? colors.danger : colors.primary,
    },
  ]);
  const projected = selectedMonthKey === currentMonth;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadReport(true)}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.monthSelector}>
        <Button icon="chevron-left" compact onPress={() => setSelectedMonth(moveMonth(selectedMonth, -1))}>Previous</Button>
        <Text variant="titleMedium" style={styles.monthTitle}>{monthLabel}</Text>
        <Button compact disabled={!canMoveForward} onPress={() => setSelectedMonth(moveMonth(selectedMonth, 1))}>Next</Button>
      </View>

      {error ? (
        <Surface style={styles.errorBanner} elevation={0}>
          <Icon source="cloud-alert-outline" size={20} color={colors.warning} />
          <Text variant="bodySmall" style={styles.errorBannerText}>{error} Showing saved data.</Text>
        </Surface>
      ) : null}

      <Surface style={styles.heroCard} elevation={2}>
        <Text variant="labelLarge" style={styles.goldText}>
          {projected ? 'PROJECTED SAVINGS' : 'AMOUNT SAVED'}
        </Text>
        <Text variant="displaySmall" style={styles.heroAmount}>
          {formatNairaFromKobo(report.amountSavedKobo)}
        </Text>
        <Text variant="bodySmall" style={styles.heroCopy}>
          Fixed savings, unused emergency funds, and flexible money left
        </Text>
      </Surface>

      <View style={styles.summaryRow}>
        <Surface style={[styles.summaryCard, styles.cardGap]} elevation={1}>
          <Icon source="cash-check" size={24} color={colors.primary} />
          <Text variant="labelMedium" style={styles.muted}>Spent</Text>
          <Text variant="titleMedium" style={styles.summaryAmount}>
            {formatNairaFromKobo(report.totalSpentKobo)}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Planned {formatNairaFromKobo(report.totalPlannedSpendingKobo)}
          </Text>
        </Surface>
        <Surface style={styles.summaryCard} elevation={1}>
          <Icon source="fire" size={24} color={colors.goldDark} />
          <Text variant="labelMedium" style={styles.muted}>Within-budget days</Text>
          <Text variant="titleMedium" style={styles.summaryAmount}>
            {report.withinBudgetDays}/{report.elapsedDays} 🎉
          </Text>
          <Text variant="bodySmall" style={styles.muted}>days this month</Text>
        </Surface>
      </View>

      <Surface style={styles.card} elevation={1}>
        <View style={styles.sectionTitleRow}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Spent vs planned</Text>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: colors.primaryLight }]} />
            <Text variant="labelSmall" style={styles.muted}>Planned</Text>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text variant="labelSmall" style={styles.muted}>Spent</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={chartData}
            barWidth={13}
            spacing={8}
            initialSpacing={12}
            endSpacing={12}
            height={190}
            width={Math.max(620, chartData.length * 42)}
            yAxisLabelPrefix="₦"
            yAxisTextStyle={styles.chartAxis}
            xAxisLabelTextStyle={styles.chartAxis}
            xAxisColor={colors.border}
            yAxisColor={colors.border}
            noOfSections={4}
            isAnimated
            animationDuration={500}
          />
        </ScrollView>
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Category breakdown</Text>
        {report.categoryReports.map((category) => {
          const overspent = category.spentKobo > category.plannedKobo;
          return (
            <View key={category.category} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text variant="labelLarge" style={styles.categoryName}>{category.label}</Text>
                <Text variant="bodySmall" style={overspent ? styles.negative : styles.muted}>
                  {formatNairaFromKobo(category.spentKobo)} / {formatNairaFromKobo(category.plannedKobo)}
                </Text>
              </View>
              <ProgressBar
                progress={Math.min(1, category.progress)}
                color={overspent ? colors.danger : colors.primary}
                style={styles.progress}
              />
            </View>
          );
        })}
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <View style={styles.emergencyHeader}>
          <View style={styles.emergencyIcon}><Icon source="shield-lock-outline" size={24} color={colors.primary} /></View>
          <View style={styles.flexOne}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Emergency Fund</Text>
            <Text variant="bodySmall" style={styles.muted}>
              {report.emergencyWithdrawalCount} withdrawal{report.emergencyWithdrawalCount === 1 ? '' : 's'} this month
            </Text>
          </View>
        </View>
        <View style={styles.emergencyStats}>
          <View>
            <Text variant="labelSmall" style={styles.muted}>USED</Text>
            <Text variant="titleMedium" style={styles.negative}>{formatNairaFromKobo(report.emergencyUsedKobo)}</Text>
          </View>
          <View style={styles.alignEnd}>
            <Text variant="labelSmall" style={styles.muted}>STILL LOCKED</Text>
            <Text variant="titleMedium" style={styles.positive}>{formatNairaFromKobo(report.emergencyBalanceKobo)}</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.suggestionCard} elevation={0}>
        <View style={styles.coachHeader}>
          <Icon source="lightbulb-on-outline" size={24} color={colors.goldDark} />
          <Text variant="titleMedium" style={styles.coachTitle}>Coach suggestions</Text>
        </View>
        {report.suggestions.map((suggestion, index) => (
          <View key={suggestion} style={styles.suggestionRow}>
            <Text variant="labelMedium" style={styles.suggestionNumber}>{index + 1}</Text>
            <Text variant="bodyMedium" style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  centeredContent: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: spacing.xl },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
  monthSelector: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, paddingHorizontal: spacing.sm },
  monthTitle: { color: colors.text, fontWeight: '800' },
  emptyTitle: { color: colors.text, fontWeight: '800', marginTop: spacing.md },
  emptyCopy: { color: colors.textMuted, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm, textAlign: 'center' },
  errorText: { color: colors.danger, marginTop: spacing.md },
  errorBanner: { alignItems: 'center', backgroundColor: '#FFF5E5', borderRadius: radii.sm, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.sm },
  errorBannerText: { color: colors.warning, flex: 1, marginLeft: spacing.sm },
  heroCard: { backgroundColor: colors.primary, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  goldText: { color: colors.gold, fontWeight: '800' },
  heroAmount: { color: colors.surface, fontWeight: '800', marginTop: spacing.xs },
  heroCopy: { color: '#C7CDD6', marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', marginBottom: spacing.md },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radii.md, flex: 1, padding: spacing.md },
  cardGap: { marginRight: spacing.sm },
  summaryAmount: { color: colors.text, fontWeight: '800', marginVertical: spacing.xs },
  muted: { color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, marginBottom: spacing.md, padding: spacing.md },
  sectionTitleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '800' },
  legend: { alignItems: 'center', flexDirection: 'row' },
  legendDot: { borderRadius: 4, height: 8, marginLeft: spacing.sm, marginRight: 3, width: 8 },
  chartAxis: { color: colors.textMuted, fontSize: 9 },
  categoryRow: { marginTop: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryName: { color: colors.text },
  progress: { backgroundColor: colors.primaryLight, borderRadius: 5, height: 7, marginTop: spacing.xs },
  negative: { color: colors.danger, fontWeight: '700' },
  positive: { color: colors.success, fontWeight: '700' },
  emergencyHeader: { alignItems: 'center', flexDirection: 'row' },
  emergencyIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 22, height: 44, justifyContent: 'center', marginRight: spacing.sm, width: 44 },
  flexOne: { flex: 1 },
  emergencyStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  alignEnd: { alignItems: 'flex-end' },
  suggestionCard: { backgroundColor: '#FFF9D9', borderRadius: radii.md, padding: spacing.md },
  coachHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.md },
  coachTitle: { color: colors.text, fontWeight: '800', marginLeft: spacing.sm },
  suggestionRow: { alignItems: 'flex-start', flexDirection: 'row', marginBottom: spacing.sm },
  suggestionNumber: { backgroundColor: colors.gold, borderRadius: 12, color: colors.primaryDark, height: 24, lineHeight: 24, marginRight: spacing.sm, textAlign: 'center', width: 24 },
  suggestionText: { color: colors.text, flex: 1, lineHeight: 21 },
});
