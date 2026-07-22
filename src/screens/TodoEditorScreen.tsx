import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Chip, Icon, Surface, Text, TextInput } from 'react-native-paper';
import { CurrencyInput } from '../components/forms/CurrencyInput';
import { nairaInputToKobo, koboToNairaInput } from '../features/budget/calculations';
import { expenseCategories } from '../features/expenses/categories';
import { calculateDailyLock } from '../features/expenses/dailyLock';
import type { ExpenseCategory } from '../features/expenses/types';
import { getCategoryAvailableKobo, getTodoReservations } from '../features/todos/calculations';
import { createBudgetTodo } from '../services/firebase/todoRepository';
import { saveTodoToCloud } from '../services/firebase/todoRepository';
import { scheduleTodoReminder } from '../services/notifications/todoReminders';
import { useBudgetStore } from '../store/budgetStore';
import { useDailyLockStore } from '../store/dailyLockStore';
import { getEmergencyAdjustmentKobo, useEmergencyStore } from '../store/emergencyStore';
import { useExpenseStore } from '../store/expenseStore';
import { useTodoStore } from '../store/todoStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';
import { getLocalDateKey, getMonthKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoEditor'>;
type DateField = 'scheduled' | 'deadline';

const parseDateKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12);
};

const formatDisplayDate = (key: string): string =>
  new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(parseDateKey(key));

export function TodoEditorScreen({ navigation, route }: Props) {
  const existing = useTodoStore((state) =>
    route.params?.todoId ? state.todos.find(({ id }) => id === route.params?.todoId) : undefined,
  );
  const todos = useTodoStore((state) => state.todos);
  const upsertTodo = useTodoStore((state) => state.upsertTodo);
  const markSynced = useTodoStore((state) => state.markSynced);
  const budget = useBudgetStore((state) => state.budget);
  const expenses = useExpenseStore((state) => state.expenses);
  const preference = useDailyLockStore((state) => state.preference);
  const emergencyOverview = useEmergencyStore((state) => state.overview);
  const emergencyWithdrawals = useEmergencyStore((state) => state.withdrawals);
  const today = getLocalDateKey();
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [amount, setAmount] = useState(
    existing ? koboToNairaInput(existing.estimatedCostKobo) : '',
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    existing?.category ?? 'miscellaneous',
  );
  const [scheduledDate, setScheduledDate] = useState(existing?.scheduledDate ?? today);
  const [deadlineDate, setDeadlineDate] = useState(existing?.deadlineDate ?? today);
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estimatedCostKobo = nairaInputToKobo(amount);

  if (!budget) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>Create a budget first</Text>
        <Button mode="contained" onPress={() => navigation.replace('BudgetSetup')}>Create Budget</Button>
      </View>
    );
  }

  const adjustment =
    emergencyOverview?.month === getMonthKey()
      ? emergencyOverview.adjustedRemainingKobo - budget.remaining
      : getEmergencyAdjustmentKobo(emergencyWithdrawals);
  const flexibleBudgetKobo = budget.remaining + adjustment;
  const selectedDate = parseDateKey(scheduledDate);
  const reservations = getTodoReservations(todos.filter(({ id }) => id !== existing?.id));
  const dailyLock = calculateDailyLock(
    flexibleBudgetKobo,
    expenses,
    preference,
    selectedDate,
    reservations,
    new Date(budget.updatedAt),
  );
  const categoryAvailableKobo = getCategoryAvailableKobo(
    budget,
    expenses,
    category,
    selectedDate,
  );
  const hasAvailableBudget =
    estimatedCostKobo > 0 &&
    estimatedCostKobo <= dailyLock.remainingTodayKobo &&
    estimatedCostKobo <= categoryAvailableKobo;

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected || !activeDateField) {
      setActiveDateField(null);
      return;
    }
    const key = getLocalDateKey(selected);
    if (activeDateField === 'scheduled') {
      setScheduledDate(key);
      if (deadlineDate < key) setDeadlineDate(key);
    } else {
      setDeadlineDate(key < scheduledDate ? scheduledDate : key);
    }
    setActiveDateField(null);
  };

  const handleSave = async () => {
    if (savedLocally) {
      navigation.goBack();
      return;
    }
    if (!title.trim() || estimatedCostKobo <= 0 || isSaving) return;
    setIsSaving(true);
    setError(null);

    const baseTodo = existing
      ? {
          ...existing,
          title: title.trim(),
          notes: notes.trim(),
          estimatedCostKobo,
          category,
          scheduledDate,
          deadlineDate,
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending' as const,
        }
      : createBudgetTodo({
          title,
          notes,
          estimatedCostKobo,
          category,
          scheduledDate,
          deadlineDate,
        });

    let notificationId = baseTodo.notificationId;
    try {
      notificationId = await scheduleTodoReminder(baseTodo, hasAvailableBudget);
      const todo = { ...baseTodo, notificationId };
      upsertTodo(todo);
      const result = await saveTodoToCloud(todo);
      if (result.status === 'synced') markSynced(todo.id);
      navigation.goBack();
    } catch (reasonValue) {
      const todo = { ...baseTodo, notificationId };
      upsertTodo(todo);
      setSavedLocally(true);
      setError(
        `${reasonValue instanceof Error ? reasonValue.message : 'Cloud sync failed.'} The task is saved on this device.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text variant="headlineSmall" style={styles.heading}>
        {existing ? 'Edit budget task' : 'Plan a budget task'}
      </Text>
      <Text variant="bodyMedium" style={styles.intro}>
        Reserve money for something you need to get done.
      </Text>

      <TextInput
        mode="outlined"
        label="Task title"
        placeholder="e.g. Buy textbooks"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
        style={styles.input}
        disabled={isSaving || savedLocally}
      />
      <TextInput
        mode="outlined"
        label="Notes (optional)"
        placeholder="Add details you do not want to forget"
        value={notes}
        onChangeText={setNotes}
        maxLength={300}
        multiline
        style={[styles.input, styles.notesInput]}
        disabled={isSaving || savedLocally}
      />
      <CurrencyInput
        label="Estimated Cost"
        description="How much should this task reserve?"
        hint="This amount is deducted from the allowance on the scheduled day."
        value={amount}
        onChange={setAmount}
        disabled={isSaving || savedLocally}
      />

      <Text variant="titleSmall" style={styles.label}>Budget category</Text>
      <View style={styles.chips}>
        {expenseCategories.map((option) => (
          <Chip
            key={option.key}
            icon={option.icon}
            selected={category === option.key}
            onPress={() => setCategory(option.key)}
            disabled={isSaving || savedLocally}
            style={[styles.chip, category === option.key && styles.selectedChip]}
            showSelectedCheck={false}
          >
            {option.label}
          </Chip>
        ))}
      </View>

      <View style={styles.dateRow}>
        <Button
          mode="outlined"
          icon="calendar-clock"
          onPress={() => setActiveDateField('scheduled')}
          style={styles.dateButton}
        >
          Scheduled: {formatDisplayDate(scheduledDate)}
        </Button>
        <Button
          mode="outlined"
          icon="calendar-alert"
          onPress={() => setActiveDateField('deadline')}
          style={styles.dateButton}
        >
          Deadline: {formatDisplayDate(deadlineDate)}
        </Button>
      </View>

      {activeDateField ? (
        <DateTimePicker
          value={parseDateKey(activeDateField === 'scheduled' ? scheduledDate : deadlineDate)}
          mode="date"
          minimumDate={activeDateField === 'scheduled' ? parseDateKey(today) : parseDateKey(scheduledDate)}
          maximumDate={monthEnd}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
        />
      ) : null}

      <Surface
        style={[styles.availabilityCard, !hasAvailableBudget && styles.availabilityWarning]}
        elevation={0}
      >
        <Icon
          source={hasAvailableBudget ? 'check-circle-outline' : 'alert-circle-outline'}
          size={24}
          color={hasAvailableBudget ? colors.success : colors.warning}
        />
        <View style={styles.availabilityCopy}>
          <Text variant="titleSmall" style={styles.availabilityTitle}>
            {hasAvailableBudget ? 'Budget available' : 'Budget may be tight'}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Daily: {formatNairaFromKobo(dailyLock.remainingTodayKobo)} · Category: {formatNairaFromKobo(categoryAvailableKobo)}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            {hasAvailableBudget
              ? 'A reminder will be scheduled near the deadline.'
              : 'The task is saved, but no reminder is sent until enough budget is available.'}
          </Text>
        </View>
      </Surface>

      {error ? <Text style={styles.inlineError} accessibilityRole="alert">{error}</Text> : null}
      <Button
        mode="contained"
        icon={savedLocally ? 'arrow-left' : 'content-save-outline'}
        onPress={() => void handleSave()}
        loading={isSaving}
        disabled={!title.trim() || estimatedCostKobo <= 0 || isSaving}
        contentStyle={styles.saveButton}
      >
        {savedLocally ? 'Back to Tasks' : existing ? 'Save Changes' : 'Create Task'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: spacing.xl },
  errorTitle: { color: colors.danger, fontWeight: '800', marginBottom: spacing.lg },
  heading: { color: colors.text, fontWeight: '800' },
  intro: { color: colors.textMuted, marginBottom: spacing.lg, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, marginBottom: spacing.md },
  notesInput: { minHeight: 90 },
  label: { color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  chip: { backgroundColor: colors.surface, marginBottom: spacing.sm, marginRight: spacing.sm },
  selectedChip: { backgroundColor: colors.primaryLight },
  dateRow: { marginBottom: spacing.md },
  dateButton: { marginBottom: spacing.sm },
  availabilityCard: { alignItems: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radii.md, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md },
  availabilityWarning: { backgroundColor: '#FFF5E5' },
  availabilityCopy: { flex: 1, marginLeft: spacing.sm },
  availabilityTitle: { color: colors.text, fontWeight: '700' },
  muted: { color: colors.textMuted, lineHeight: 19, marginTop: 2 },
  inlineError: { color: colors.warning, marginBottom: spacing.md },
  saveButton: { minHeight: 48 },
});
