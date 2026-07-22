import * as Crypto from 'expo-crypto';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { BudgetTodo, NewBudgetTodo, TodoStatus } from '../../features/todos/types';
import { ensureAnonymousSession } from './authService';
import type { CloudWriteResult } from './budgetRepository';
import { getFirebaseServices } from './client';
import { toAppServiceError } from './errors';

export const createBudgetTodo = (input: NewBudgetTodo): BudgetTodo => {
  const now = new Date().toISOString();
  return {
    id: Crypto.randomUUID(),
    ...input,
    title: input.title.trim(),
    notes: input.notes.trim(),
    status: 'pending',
    notificationId: null,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };
};

export const saveTodoToCloud = async (todo: BudgetTodo): Promise<CloudWriteResult> => {
  const services = getFirebaseServices();
  if (!services) return { status: 'not-configured' };

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    await setDoc(
      doc(services.db, 'users', user.uid, 'todos', todo.id),
      {
        title: todo.title,
        notes: todo.notes,
        estimatedCostKobo: todo.estimatedCostKobo,
        category: todo.category,
        scheduledDate: todo.scheduledDate,
        deadlineDate: todo.deadlineDate,
        status: todo.status,
        currency: 'NGN',
        clientCreatedAt: todo.createdAt,
        clientUpdatedAt: todo.updatedAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { status: 'synced' };
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const getTodosFromCloud = async (): Promise<BudgetTodo[]> => {
  const services = getFirebaseServices();
  if (!services) return [];

  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    const snapshot = await getDocs(
      query(collection(services.db, 'users', user.uid, 'todos'), limit(100)),
    );
    return snapshot.docs.map((todoDoc) => {
      const data = todoDoc.data();
      return {
        id: todoDoc.id,
        title: data.title as string,
        notes: (data.notes as string | undefined) ?? '',
        estimatedCostKobo: data.estimatedCostKobo as number,
        category: data.category as BudgetTodo['category'],
        scheduledDate: data.scheduledDate as string,
        deadlineDate: data.deadlineDate as string,
        status: data.status as TodoStatus,
        notificationId: null,
        createdAt: (data.clientCreatedAt as string | undefined) ?? new Date().toISOString(),
        updatedAt: (data.clientUpdatedAt as string | undefined) ?? new Date().toISOString(),
        syncStatus: 'synced' as const,
      };
    });
  } catch (error) {
    throw toAppServiceError(error);
  }
};

export const deleteTodoFromCloud = async (id: string): Promise<void> => {
  const services = getFirebaseServices();
  if (!services) return;
  try {
    const user = services.auth.currentUser ?? (await ensureAnonymousSession());
    await deleteDoc(doc(services.db, 'users', user.uid, 'todos', id));
  } catch (error) {
    throw toAppServiceError(error);
  }
};
