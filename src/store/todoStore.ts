import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BudgetTodo } from '../features/todos/types';

interface TodoState {
  todos: BudgetTodo[];
  hasHydrated: boolean;
  hydrationError: string | null;
  upsertTodo: (todo: BudgetTodo) => void;
  upsertTodos: (todos: BudgetTodo[]) => void;
  removeTodo: (id: string) => void;
  markSynced: (id: string) => void;
  clearTodos: () => void;
  finishHydration: (error?: unknown) => void;
}

const mergeTodos = (current: BudgetTodo[], incoming: BudgetTodo[]): BudgetTodo[] => {
  const byId = new Map(current.map((todo) => [todo.id, todo]));
  incoming.forEach((todo) => {
    const local = byId.get(todo.id);
    if (local?.syncStatus === 'pending') return;
    byId.set(todo.id, {
      ...todo,
      notificationId: local?.notificationId ?? todo.notificationId,
    });
  });
  return [...byId.values()].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return a.deadlineDate.localeCompare(b.deadlineDate);
  });
};

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      todos: [],
      hasHydrated: false,
      hydrationError: null,
      upsertTodo: (todo) => set((state) => ({ todos: mergeTodos(state.todos, [todo]) })),
      upsertTodos: (todos) => set((state) => ({ todos: mergeTodos(state.todos, todos) })),
      removeTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) })),
      markSynced: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, syncStatus: 'synced' } : todo,
          ),
        })),
      clearTodos: () => set({ todos: [] }),
      finishHydration: (error) =>
        set({
          hasHydrated: true,
          hydrationError: error instanceof Error ? error.message : error ? String(error) : null,
        }),
    }),
    {
      name: 'lockbudget-todos-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ todos }) => ({ todos }),
      onRehydrateStorage: () => (state, error) => state?.finishHydration(error),
    },
  ),
);
