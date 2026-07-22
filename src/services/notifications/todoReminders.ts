import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { BudgetAmounts } from '../../features/budget/types';
import { calculateDailyLock, type DailyLockPreference } from '../../features/expenses/dailyLock';
import type { Expense } from '../../features/expenses/types';
import { getCategoryAvailableKobo, getTodoReservations } from '../../features/todos/calculations';
import type { BudgetTodo } from '../../features/todos/types';
import { formatNairaFromKobo } from '../../utils/currency';
import { getLocalDateKey } from '../../utils/date';

const dateAtReminderTime = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 8, 0, 0, 0);
};

export const cancelTodoReminder = async (notificationId: string | null): Promise<void> => {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => undefined);
};

/** Schedules only tasks that have both category and daily allowance available. */
export const scheduleTodoReminder = async (
  todo: BudgetTodo,
  hasAvailableBudget: boolean,
): Promise<string | null> => {
  await cancelTodoReminder(todo.notificationId);
  if (!hasAvailableBudget || todo.status !== 'pending') return null;

  const permissions = await Notifications.getPermissionsAsync();
  const finalPermissions =
    permissions.status === 'granted'
      ? permissions
      : await Notifications.requestPermissionsAsync();
  if (finalPermissions.status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('budget-reminders', {
      name: 'Budget reminders',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#966A00',
    });
  }

  const intendedDate = dateAtReminderTime(todo.deadlineDate);
  const triggerDate =
    intendedDate.getTime() > Date.now() ? intendedDate : new Date(Date.now() + 5_000);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Budget task due: ${todo.title}`,
      body: `${formatNairaFromKobo(todo.estimatedCostKobo)} is still available for this task.`,
      data: { todoId: todo.id, route: 'TodoEditor' },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? 'budget-reminders' : undefined,
    },
  });
};

export const reconcileTodoReminders = async (input: {
  todos: BudgetTodo[];
  budget: BudgetAmounts;
  expenses: Expense[];
  flexibleBudgetKobo: number;
  preference: DailyLockPreference;
  planStartDate?: Date;
  onUpdate: (todo: BudgetTodo) => void;
}): Promise<void> => {
  const todayKey = getLocalDateKey();

  for (const todo of input.todos) {
    const selectedDate = dateAtReminderTime(todo.scheduledDate);
    const reservations = getTodoReservations(
      input.todos.filter(({ id }) => id !== todo.id),
    );
    const dailyLock = calculateDailyLock(
      input.flexibleBudgetKobo,
      input.expenses,
      input.preference,
      selectedDate,
      reservations,
      input.planStartDate,
    );
    const categoryAvailable = getCategoryAvailableKobo(
      input.budget,
      input.expenses,
      todo.category,
      selectedDate,
    );
    const eligible =
      todo.status === 'pending' &&
      todo.deadlineDate >= todayKey &&
      todo.estimatedCostKobo <= dailyLock.remainingTodayKobo &&
      todo.estimatedCostKobo <= categoryAvailable;

    if (!eligible && todo.notificationId) {
      await cancelTodoReminder(todo.notificationId);
      input.onUpdate({ ...todo, notificationId: null });
    } else if (eligible && !todo.notificationId) {
      const notificationId = await scheduleTodoReminder(todo, true);
      if (notificationId) input.onUpdate({ ...todo, notificationId });
    }
  }
};
