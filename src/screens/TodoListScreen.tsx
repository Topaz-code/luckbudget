import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Dialog,
  FAB,
  Icon,
  IconButton,
  Portal,
  Surface,
  Text,
} from 'react-native-paper';
import { getExpenseCategoryLabel } from '../features/expenses/categories';
import type { BudgetTodo } from '../features/todos/types';
import {
  deleteTodoFromCloud,
  getTodosFromCloud,
  saveTodoToCloud,
} from '../services/firebase/todoRepository';
import { cancelTodoReminder } from '../services/notifications/todoReminders';
import { useTodoStore } from '../store/todoStore';
import { colors, radii, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatNairaFromKobo } from '../utils/currency';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoList'>;

export function TodoListScreen({ navigation }: Props) {
  const todos = useTodoStore((state) => state.todos);
  const hasHydrated = useTodoStore((state) => state.hasHydrated);
  const upsertTodo = useTodoStore((state) => state.upsertTodo);
  const upsertTodos = useTodoStore((state) => state.upsertTodos);
  const markSynced = useTodoStore((state) => state.markSynced);
  const removeTodo = useTodoStore((state) => state.removeTodo);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetTodo | null>(null);
  const visibleTodos = todos.filter(({ status }) => status !== 'cancelled');

  const loadTodos = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const pending = useTodoStore.getState().todos.filter(({ syncStatus }) => syncStatus === 'pending');
      const syncResults = await Promise.allSettled(pending.map((todo) => saveTodoToCloud(todo)));
      syncResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.status === 'synced') {
          const todo = pending[index];
          if (todo) markSynced(todo.id);
        }
      });
      upsertTodos(await getTodosFromCloud());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not refresh your tasks.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [markSynced, upsertTodos]);

  useFocusEffect(
    useCallback(() => {
      void loadTodos();
    }, [loadTodos]),
  );

  const toggleComplete = async (todo: BudgetTodo) => {
    const updated: BudgetTodo = {
      ...todo,
      status: todo.status === 'completed' ? 'pending' : 'completed',
      notificationId: todo.status === 'completed' ? todo.notificationId : null,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };
    if (updated.status === 'completed') await cancelTodoReminder(todo.notificationId);
    upsertTodo(updated);
    try {
      const result = await saveTodoToCloud(updated);
      if (result.status === 'synced') markSynced(updated.id);
    } catch (reason) {
      setError(
        `${reason instanceof Error ? reason.message : 'Cloud sync failed.'} The change is saved on this device.`,
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    removeTodo(target.id);
    await cancelTodoReminder(target.notificationId);
    try {
      await deleteTodoFromCloud(target.id);
    } catch (reason) {
      upsertTodo({
        ...target,
        status: 'cancelled',
        notificationId: null,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      });
      setError(
        `${reason instanceof Error ? reason.message : 'The cloud copy could not be deleted.'} It is hidden and will sync later.`,
      );
    }
  };

  if (!hasHydrated || (isLoading && todos.length === 0)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Loading budget tasks…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadTodos(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <Text variant="headlineSmall" style={styles.heading}>Budget To-Dos</Text>
        <Text variant="bodyMedium" style={styles.intro}>
          Plan tasks and reserve the money before the day arrives.
        </Text>

        {error ? (
          <Surface style={styles.errorBanner} elevation={0}>
            <Icon source="cloud-alert-outline" size={20} color={colors.warning} />
            <Text variant="bodySmall" style={styles.errorText}>{error}</Text>
          </Surface>
        ) : null}

        {visibleTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Icon source="clipboard-check-outline" size={38} color={colors.primary} /></View>
            <Text variant="titleLarge" style={styles.emptyTitle}>No budget tasks yet</Text>
            <Text variant="bodyMedium" style={styles.emptyCopy}>
              Add something like “Buy textbooks – ₦5,500” and map it to your budget.
            </Text>
            <Button mode="contained" icon="plus" onPress={() => navigation.navigate('TodoEditor')}>
              Create First Task
            </Button>
          </View>
        ) : (
          visibleTodos.map((todo) => (
            <Surface key={todo.id} style={styles.todoCard} elevation={1}>
              <Checkbox
                status={todo.status === 'completed' ? 'checked' : 'unchecked'}
                onPress={() => void toggleComplete(todo)}
                color={colors.primary}
              />
              <Pressable
                style={styles.todoCopy}
                onPress={() => navigation.navigate('TodoEditor', { todoId: todo.id })}
                accessibilityRole="button"
              >
                <Text
                  variant="titleSmall"
                  style={[styles.todoTitle, todo.status === 'completed' && styles.completedText]}
                >
                  {todo.title}
                </Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {getExpenseCategoryLabel(todo.category)} · {formatNairaFromKobo(todo.estimatedCostKobo)}
                </Text>
                <Text variant="labelSmall" style={styles.dateText}>
                  Scheduled {todo.scheduledDate} · Due {todo.deadlineDate}
                </Text>
                {todo.syncStatus === 'pending' ? (
                  <Text variant="labelSmall" style={styles.pendingText}>Waiting to sync</Text>
                ) : null}
              </Pressable>
              <IconButton
                icon="delete-outline"
                iconColor={colors.danger}
                onPress={() => setDeleteTarget(todo)}
                accessibilityLabel={`Delete ${todo.title}`}
              />
            </Surface>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="Add Task"
        onPress={() => navigation.navigate('TodoEditor')}
        color={colors.surface}
        style={styles.fab}
      />

      <Portal>
        <Dialog visible={deleteTarget !== null} onDismiss={() => setDeleteTarget(null)} style={styles.dialog}>
          <Dialog.Title>Delete this task?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Its scheduled budget reservation will also be removed.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
            <Button textColor={colors.danger} onPress={() => void confirmDelete()}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.md, paddingBottom: 104 },
  centered: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: spacing.md },
  heading: { color: colors.text, fontWeight: '800' },
  intro: { color: colors.textMuted, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm },
  errorBanner: { alignItems: 'center', backgroundColor: '#FFF5E5', borderRadius: radii.sm, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.sm },
  errorText: { color: colors.warning, flex: 1, marginLeft: spacing.sm },
  emptyState: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 32, height: 64, justifyContent: 'center', width: 64 },
  emptyTitle: { color: colors.text, fontWeight: '800', marginTop: spacing.md },
  emptyCopy: { color: colors.textMuted, lineHeight: 21, marginBottom: spacing.lg, marginTop: spacing.sm, textAlign: 'center' },
  todoCard: { alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radii.md, flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.sm },
  todoCopy: { flex: 1, paddingVertical: spacing.xs },
  todoTitle: { color: colors.text, fontWeight: '700' },
  completedText: { color: colors.textMuted, textDecorationLine: 'line-through' },
  meta: { color: colors.textMuted, marginTop: spacing.xs },
  dateText: { color: colors.primary, marginTop: spacing.xs },
  pendingText: { color: colors.warning, marginTop: spacing.xs },
  fab: { backgroundColor: colors.primary, bottom: spacing.md, position: 'absolute', right: spacing.md },
  dialog: { backgroundColor: colors.surface },
});
