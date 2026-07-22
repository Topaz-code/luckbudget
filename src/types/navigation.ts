export type RootStackParamList = {
  AuthWelcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Profile: undefined;
  BudgetSetup: undefined;
  DailyPlan: undefined;
  Dashboard: undefined;
  LogExpense: undefined;
  DailyLockSettings: undefined;
  Main: undefined;
  EmergencyWithdrawal: undefined;
  Wallet: undefined;
  TodoList: undefined;
  TodoEditor: { todoId?: string } | undefined;
  MonthlyReport: { month?: string } | undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Todos: undefined;
  Reports: undefined;
  Profile: undefined;
};
