import type { ExpenseCategory } from '../expenses/types';

export type TodoStatus = 'pending' | 'completed' | 'cancelled';

export interface BudgetTodo {
  id: string;
  title: string;
  notes: string;
  estimatedCostKobo: number;
  category: ExpenseCategory;
  scheduledDate: string;
  deadlineDate: string;
  status: TodoStatus;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

export interface NewBudgetTodo {
  title: string;
  notes: string;
  estimatedCostKobo: number;
  category: ExpenseCategory;
  scheduledDate: string;
  deadlineDate: string;
}
