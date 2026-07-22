import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Button, FAB, Icon, ProgressBar, Surface, Text } from 'react-native-paper';
import { calculateDashboardMetrics, clampRatio } from '../features/dashboard/calculations';
import { calculateDailyLock } from '../features/expenses/dailyLock';
import type { MonnifyWalletDetails } from '../features/wallet/types';
import { getExpenseCategoryLabel } from '../features/expenses/categories';
import { getEligibleTodoReminders, getTodoReservations } from '../features/todos/calculations';
import { getMonnifyWalletDetails } from '../services/firebase/monnifyRepository';
import { getExpensesForMonth, saveExpenseToCloud } from '../services/firebase/expenseRepository';
import { getTodosFromCloud } from '../services/firebase/todoRepository';
import { reconcileTodoReminders } from '../services/notifications/todoReminders';
import {
  isCloudBackendEnabled,
  isFirebaseConfigured,
} from '../services/firebase/client';
import { getDailyLockPreference } from '../services/firebase/dailyLockRepository';
import { fetchEmergencyOverview } from '../services/firebase/emergencyRepository';
import { useFirebase } from '../services/firebase/FirebaseProvider';
import { useBudgetStore } from '../store/budgetStore';
import { useDailyLockStore } from '../store/dailyLockStore';
import { getEmergencyAdjustmentKobo, useEmergencyStore } from '../store/emergencyStore';
import { useExpenseStore } from '../store/expenseStore';
import { useTodoStore } from '../store/todoStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';
import { getMonthKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const getGreeting = (date: Date): string => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export function DashboardScreen({ navigation }: Props) {
  const budget = useBudgetStore((state) => state.budget);
  const budgetHydrated = useBudgetStore((state) => state.hasHydrated);
  const expenses = useExpenseStore((state) => state.expenses);
  const expensesHydrated = useExpenseStore((state) => state.hasHydrated);
  const lockPreference = useDailyLockStore((state) => state.preference);
  const lockHydrated = useDailyLockStore((state) => state.hasHydrated);
  const setLockPreference = useDailyLockStore((state) => state.setPreference);
  const emergencyOverview = useEmergencyStore((state) => state.overview);
  const emergencyWithdrawals = useEmergencyStore((state) => state.withdrawals);
  const emergencyHydrated = useEmergencyStore((state) => state.hasHydrated);
  const setEmergencyOverview = useEmergencyStore((state) => state.setOverview);
  const upsertExpenses = useExpenseStore((state) => state.upsertExpenses);
  const markSynced = useExpenseStore((state) => state.markSynced);
  const todos = useTodoStore((state) => state.todos);
  const todosHydrated = useTodoStore((state) => state.hasHydrated);
  const upsertTodo = useTodoStore((state) => state.upsertTodo);
  const upsertTodos = useTodoStore((state) => state.upsertTodos);
  const { user } = useFirebase();
  const [wallet, setWallet] = useState<MonnifyWalletDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError(null);
    const monthKey = getMonthKey();

    try {
      if (isFirebaseConfigured) {
        const pendingExpenses = useExpenseStore
          .getState()
          .expenses.filter((expense) => expense.syncStatus === 'pending');
        const syncResults = await Promise.allSettled(
          pendingExpenses.map((expense) => saveExpenseToCloud(expense)),
        );
        syncResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.status === 'synced') {
            const expense = pendingExpenses[index];
            if (expense) markSynced(expense.id);
          }
        });
      }

      const [
        cloudExpenses,
        cloudTodos,
        walletSnapshot,
        cloudPreference,
        cloudEmergencyOverview,
      ] = await Promise.all([
        getExpensesForMonth(monthKey),
        getTodosFromCloud(),
        isCloudBackendEnabled ? getMonnifyWalletDetails() : Promise.resolve(null),
        getDailyLockPreference(),
        isCloudBackendEnabled ? fetchEmergencyOverview() : Promise.resolve(null),
      ]);
      upsertExpenses(cloudExpenses);
      upsertTodos(cloudTodos);
      setWallet(walletSnapshot);
      if (cloudPreference) setLockPreference(cloudPreference);
      if (cloudEmergencyOverview) setEmergencyOverview(cloudEmergencyOverview);

      if (budget) {
        const currentTodos = useTodoStore.getState().todos;
        const currentExpenses = useExpenseStore.getState().expenses;
        const currentEmergency =
          cloudEmergencyOverview ?? useEmergencyStore.getState().overview;
        const localAdjustment = getEmergencyAdjustmentKobo(
          useEmergencyStore.getState().withdrawals,
        );
        const flexibleBudget =
          currentEmergency?.month === monthKey
            ? currentEmergency.adjustedRemainingKobo
            : budget.remaining + localAdjustment;
        await reconcileTodoReminders({
          todos: currentTodos,
          budget,
          expenses: currentExpenses,
          flexibleBudgetKobo: flexibleBudget,
          preference: cloudPreference ?? lockPreference,
          planStartDate: new Date(budget.updatedAt),
          onUpdate: upsertTodo,
        }).catch(() => undefined);
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not refresh your dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    budget,
    lockPreference,
    markSynced,
    setEmergencyOverview,
    setLockPreference,
    upsertExpenses,
    upsertTodo,
    upsertTodos,
  ]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const now = new Date();

  if (
    !budgetHydrated ||
    !expensesHydrated ||
    !lockHydrated ||
    !emergencyHydrated ||
    !todosHydrated ||
    (isLoading && !budget)
  ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.mutedTop}>
          Preparing your dashboard…
        </Text>
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.centered}>
        <Icon source="chart-donut" size={48} color={colors.primary} />
        <Text variant="titleLarge" style={styles.emptyTitle}>
          Your dashboard needs a budget
        </Text>
        <Text variant="bodyMedium" style={styles.emptyCopy}>
          Create this month's plan to unlock your daily allowance and savings view.
        </Text>
        <Button mode="contained" onPress={() => navigation.replace('BudgetSetup')}>
          Create budget
        </Button>
      </View>
    );
  }

  const localEmergencyAdjustment = getEmergencyAdjustmentKobo(emergencyWithdrawals);
  const flexibleBudgetKobo =
    emergencyOverview?.month === getMonthKey(now)
      ? emergencyOverview.adjustedRemainingKobo
      : budget.remaining + localEmergencyAdjustment;
  const reservations = getTodoReservations(todos);
  const metrics = calculateDashboardMetrics(flexibleBudgetKobo, expenses, now);
  const dailyLock = calculateDailyLock(
    flexibleBudgetKobo,
    expenses,
    lockPreference,
    now,
    reservations,
    new Date(budget.updatedAt),
  );
  const reminders = getEligibleTodoReminders({
    todos,
    budget,
    expenses,
    availableDailyKobo: dailyLock.remainingTodayKobo + dailyLock.reservedTodayKobo,
    date: now,
  });
  const dailySpentRatio =
    dailyLock.effectiveAllowanceKobo > 0
      ? clampRatio(
          (dailyLock.spentTodayKobo + dailyLock.reservedTodayKobo) /
            dailyLock.effectiveAllowanceKobo,
        )
      : 0;
  const dailyColor =
    dailySpentRatio >= 1
      ? colors.danger
      : dailySpentRatio >= 0.75
        ? colors.warning
        : colors.success;
  const emergencyBalance =
    emergencyOverview?.month === getMonthKey(now)
      ? emergencyOverview.balanceKobo
      : (wallet?.emergencyBalanceKobo ??
        Math.max(0, budget.emergencySavings - localEmergencyAdjustment));
  const fixedSavingsBalance = wallet?.fixedSavingsBalanceKobo ?? budget.fixedSavings;
  const firstName = user?.displayName?.trim().split(/\s+/)[0];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadDashboard(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.greetingRow}>
          <View style={styles.flexOne}>
            <Text variant="headlineSmall" style={styles.greeting}>
              {getGreeting(now)}{firstName ? `, ${firstName}` : ''} 👋
            </Text>
            <Text variant="bodyMedium" style={styles.date}>
              {new Intl.DateTimeFormat('en-NG', { dateStyle: 'full' }).format(now)}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Open account and sync settings"
            style={({ pressed }) => [styles.avatar, pressed && styles.pressedCard]}
          >
            <Text variant="titleMedium" style={styles.avatarText}>
              {firstName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'G'}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.syncPill}>
          <Icon
            source={user?.isAnonymous ? 'cloud-alert-outline' : 'cloud-check-outline'}
            size={17}
            color={user?.isAnonymous ? colors.warning : colors.success}
          />
          <Text variant="labelMedium" style={styles.syncText}>
            {user?.isAnonymous
              ? 'Guest mode · Tap to protect your budget'
              : `Synced securely · ${user?.email ?? 'Firebase account'}`}
          </Text>
        </Pressable>

        {isLoading ? (
          <Surface style={styles.loadingBanner} elevation={0}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text variant="bodySmall" style={styles.loadingBannerText}>
              Refreshing your secure data…
            </Text>
          </Surface>
        ) : null}

        {loadError ? (
          <Surface style={styles.errorBanner} elevation={0}>
            <Icon source="cloud-alert-outline" size={20} color={colors.warning} />
            <Text variant="bodySmall" style={styles.errorText}>
              {loadError} Showing your saved device data.
            </Text>
          </Surface>
        ) : null}

        <Surface style={styles.dailyCard} elevation={2}>
          <View style={styles.cardHeader}>
            <View>
              <Text variant="labelLarge" style={styles.dailyEyebrow}>
                TODAY'S ALLOWANCE
              </Text>
              <Text variant="headlineMedium" style={styles.dailyAmount}>
                {formatNairaFromKobo(dailyLock.remainingTodayKobo)}
              </Text>
              <Text variant="bodySmall" style={styles.onDarkMuted}>
                remaining of {formatNairaFromKobo(dailyLock.effectiveAllowanceKobo)}
              </Text>
            </View>
            <View style={styles.allowanceIcon}>
              <Icon source="wallet-outline" size={28} color={colors.gold} />
            </View>
          </View>
          <ProgressBar progress={dailySpentRatio} color={dailyColor} style={styles.progressOnDark} />
          <View style={styles.betweenRow}>
            <Text variant="bodySmall" style={styles.onDarkMuted}>
              Spent {formatNairaFromKobo(dailyLock.spentTodayKobo)} · Reserved{' '}
              {formatNairaFromKobo(dailyLock.reservedTodayKobo)}
            </Text>
            <Text variant="labelMedium" style={{ color: dailyColor }}>
              {Math.round(dailySpentRatio * 100)}%
            </Text>
          </View>
          <Button
            mode="text"
            compact
            icon={lockPreference === 'rollover' ? 'refresh' : 'calendar-today'}
            textColor={colors.gold}
            onPress={() => navigation.navigate('DailyLockSettings')}
            style={styles.preferenceButton}
          >
            {lockPreference === 'rollover'
              ? `Rollover on${dailyLock.rolledOverKobo > 0 ? ` · ${formatNairaFromKobo(dailyLock.rolledOverKobo)} carried` : ''}`
              : 'Daily reset on'}
          </Button>
        </Surface>

        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardTitleRow}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Monthly progress
            </Text>
            <Text variant="labelMedium" style={styles.primaryLabel}>
              Day {metrics.dayOfMonth} of {metrics.daysInMonth}
            </Text>
          </View>
          <View style={styles.metricHeader}>
            <Text variant="bodySmall" style={styles.muted}>Month elapsed</Text>
            <Text variant="bodySmall" style={styles.valueLabel}>
              {Math.round(metrics.daysElapsedRatio * 100)}%
            </Text>
          </View>
          <ProgressBar progress={metrics.daysElapsedRatio} color={colors.goldDark} style={styles.progress} />
          <View style={styles.metricHeader}>
            <Text variant="bodySmall" style={styles.muted}>Flexible budget remaining</Text>
            <Text variant="bodySmall" style={styles.valueLabel}>
              {formatNairaFromKobo(metrics.monthlyRemainingKobo)}
            </Text>
          </View>
          <ProgressBar progress={metrics.budgetRemainingRatio} color={colors.primary} style={styles.progress} />
          <Button
            compact
            icon="chart-box-outline"
            onPress={() => navigation.navigate('MonthlyReport')}
            style={styles.reportButton}
          >
            View Monthly Report
          </Button>
        </Surface>

        <View style={styles.savingsRow}>
          <Surface style={[styles.smallCard, styles.smallCardGap]} elevation={1}>
            <Pressable
              onPress={() => navigation.navigate('EmergencyWithdrawal')}
              accessibilityRole="button"
              accessibilityLabel="Open Emergency Fund"
              style={({ pressed }) => pressed && styles.pressedCard}
            >
              <View style={styles.lockCircle}>
                <Icon source="lock" size={20} color={colors.primary} />
              </View>
              <Text variant="labelMedium" style={styles.muted}>Emergency Fund</Text>
              <Text variant="titleMedium" style={styles.savingsAmount} numberOfLines={1}>
                {formatNairaFromKobo(emergencyBalance)}
              </Text>
              <Text variant="bodySmall" style={styles.lockedText}>Tap to manage</Text>
            </Pressable>
          </Surface>
          <Surface style={styles.smallCard} elevation={1}>
            <View style={styles.lockCircle}>
              <Icon source="target" size={20} color={colors.primary} />
            </View>
            <Text variant="labelMedium" style={styles.muted}>Fixed Savings</Text>
            <Text variant="titleMedium" style={styles.savingsAmount} numberOfLines={1}>
              {formatNairaFromKobo(fixedSavingsBalance)}
            </Text>
            <ProgressBar
              progress={budget.fixedSavings > 0 ? clampRatio(fixedSavingsBalance / budget.fixedSavings) : 0}
              color={colors.goldDark}
              style={styles.miniProgress}
            />
          </Surface>
        </View>

        <Pressable onPress={() => navigation.navigate('Wallet')} style={({ pressed }) => pressed && styles.pressedCard}>
          <Surface style={styles.walletCard} elevation={1}>
            <View style={styles.walletIconLarge}>
              <Icon source="shield-lock-outline" size={28} color={colors.gold} />
            </View>
            <View style={styles.walletCopy}>
              <Text variant="titleMedium" style={styles.walletTitle}>Lock & Save Wallet</Text>
              <Text variant="bodySmall" style={styles.walletDescription}>
                {wallet?.isReady
                  ? `Monnify account ready · ${wallet.maskedAccountNumber ?? 'secure account'}`
                  : 'Create a secure funding account and lock real money behind your budget.'}
              </Text>
              <Text variant="labelMedium" style={styles.walletAction}>
                {wallet?.isReady ? 'View account & fund savings' : 'Set up wallet'} →
              </Text>
            </View>
          </Surface>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View>
            <Text variant="titleMedium" style={styles.cardTitle}>To-do reminders</Text>
            <Text variant="labelSmall" style={styles.primaryLabel}>Eligible in the next 2 days</Text>
          </View>
          <Button compact onPress={() => navigation.navigate('TodoList')}>View all</Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.remindersStrip}>
          {reminders.length > 0 ? (
            reminders.map((reminder) => (
              <Surface key={reminder.id} style={styles.reminderCard} elevation={1}>
                <View style={styles.reminderIcon}>
                  <Icon source="checkbox-marked-circle-outline" size={20} color={colors.primary} />
                </View>
                <Text variant="titleSmall" style={styles.reminderTitle} numberOfLines={2}>
                  {reminder.title}
                </Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {getExpenseCategoryLabel(reminder.category)} · {formatNairaFromKobo(reminder.estimatedCostKobo)}
                </Text>
                <Text variant="labelSmall" style={styles.dueDate}>Due {reminder.deadlineDate}</Text>
              </Surface>
            ))
          ) : (
            <Surface style={styles.emptyReminder} elevation={0}>
              <Icon source="calendar-check-outline" size={24} color={colors.success} />
              <Text variant="bodyMedium" style={styles.emptyReminderText}>
                No budget tasks due soon. You're all clear!
              </Text>
            </Surface>
          )}
        </ScrollView>
      </ScrollView>

      <FAB
        icon="plus"
        label="Log Expense"
        onPress={() => navigation.navigate('LogExpense')}
        disabled={isLoading}
        color={colors.surface}
        style={styles.fab}
        accessibilityLabel="Log a new expense"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: 104 },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xl },
  flexOne: { flex: 1 },
  mutedTop: { color: colors.textMuted, marginTop: spacing.md },
  greetingRow: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.lg },
  greeting: { color: colors.text, fontWeight: '800' },
  date: { color: colors.textMuted, marginTop: 3 },
  avatar: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: 22, height: 44, justifyContent: 'center', marginLeft: spacing.md, width: 44 },
  avatarText: { color: colors.primaryDark, fontWeight: '800' },
  syncPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 999, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  syncText: { color: colors.textMuted, marginLeft: spacing.sm },
  loadingBanner: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radii.sm, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.sm },
  loadingBannerText: { color: colors.primaryDark, marginLeft: spacing.sm },
  errorBanner: { alignItems: 'center', backgroundColor: '#FFF5E5', borderRadius: radii.sm, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.sm },
  errorText: { color: colors.warning, flex: 1, marginLeft: spacing.sm },
  dailyCard: { backgroundColor: colors.primary, borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  dailyEyebrow: { color: colors.gold, fontWeight: '800' },
  dailyAmount: { color: colors.surface, fontWeight: '800', marginTop: spacing.xs },
  onDarkMuted: { color: '#C7CDD6' },
  allowanceIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  progressOnDark: { backgroundColor: '#374151', borderRadius: 6, height: 9, marginTop: spacing.lg },
  betweenRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  preferenceButton: { alignSelf: 'flex-start', marginLeft: -spacing.sm, marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, marginBottom: spacing.md, padding: spacing.md },
  cardTitleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '800' },
  primaryLabel: { color: colors.primary, fontWeight: '700' },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  muted: { color: colors.textMuted },
  valueLabel: { color: colors.text, fontWeight: '700' },
  progress: { backgroundColor: colors.primaryLight, borderRadius: 5, height: 7, marginBottom: spacing.sm, marginTop: spacing.xs },
  reportButton: { alignSelf: 'flex-start', marginLeft: -spacing.sm, marginTop: spacing.xs },
  savingsRow: { flexDirection: 'row', marginBottom: spacing.lg },
  smallCard: { backgroundColor: colors.surface, borderRadius: radii.md, flex: 1, minWidth: 0, padding: spacing.md },
  smallCardGap: { marginRight: spacing.sm },
  pressedCard: { opacity: 0.7 },
  lockCircle: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 18, height: 36, justifyContent: 'center', marginBottom: spacing.sm, width: 36 },
  savingsAmount: { color: colors.text, fontWeight: '800', marginTop: spacing.xs },
  lockedText: { color: colors.success, marginTop: spacing.xs },
  miniProgress: { backgroundColor: '#FDE8E8', borderRadius: 4, height: 6, marginTop: spacing.sm },
  walletCard: { alignItems: 'center', backgroundColor: colors.primaryDark, borderRadius: radii.lg, flexDirection: 'row', marginBottom: spacing.lg, padding: spacing.md },
  walletIconLarge: { alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.14)', borderRadius: 25, height: 50, justifyContent: 'center', marginRight: spacing.md, width: 50 },
  walletCopy: { flex: 1 },
  walletTitle: { color: colors.surface, fontWeight: '900' },
  walletDescription: { color: '#C7CDD6', lineHeight: 19, marginTop: 3 },
  walletAction: { color: colors.gold, marginTop: spacing.sm },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  remindersStrip: { paddingBottom: spacing.sm },
  reminderCard: { backgroundColor: colors.surface, borderRadius: radii.md, marginRight: spacing.sm, padding: spacing.md, width: 220 },
  reminderIcon: { marginBottom: spacing.sm },
  reminderTitle: { color: colors.text, fontWeight: '700', minHeight: 40 },
  dueDate: { color: colors.primary, marginTop: spacing.sm },
  emptyReminder: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radii.md, flexDirection: 'row', padding: spacing.md, width: 320 },
  emptyReminderText: { color: colors.primaryDark, flex: 1, marginLeft: spacing.sm },
  fab: { backgroundColor: colors.primary, bottom: spacing.md, position: 'absolute', right: spacing.md },
  emptyTitle: { color: colors.text, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' },
  emptyCopy: { color: colors.textMuted, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm, textAlign: 'center' },
});
