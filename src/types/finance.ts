export type TransactionType = 'income' | 'expense';

export type ExpenseCategoryId =
  | 'moradia'
  | 'alimentacao'
  | 'educacao'
  | 'transporte'
  | 'contas'
  | 'lazer'
  | 'saude'
  | 'restaurantes';

export type IncomeCategoryId = 'salario' | 'rendimentos' | 'extras';

export type CategoryId = ExpenseCategoryId | IncomeCategoryId;

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  color: string;
  type: TransactionType;
}

export type TagId =
  | 'necessidades'
  | 'fixos'
  | 'variaveis'
  | 'bem_estar'
  | 'desenvolvimento'
  | 'social'
  | 'sem_tag';

export interface TagMeta {
  id: TagId;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD (local date)
  description: string;
  amount: number; // positive BRL value
  type: TransactionType;
  categoryId: CategoryId;
  tagIds: TagId[]; // Independent classification tags
}

export type GoalMode = 'none' | 'fixed' | 'percentage';

export interface CategoryGoalConfig {
  categoryId: ExpenseCategoryId;
  mode: GoalMode;
  value: number; // BRL amount when mode === 'fixed', or 0..100 percentage when mode === 'percentage'
}

export type CategoryGoalStatus =
  | 'unconfigured'
  | 'positive'
  | 'attention'
  | 'warning'
  | 'reached'
  | 'exceeded';

export interface CategoryGoalProgress {
  categoryId: ExpenseCategoryId;
  name: string;
  mode: GoalMode;
  configuredValue: number;
  spent: number;
  limit: number | null;
  percentage: number | null;
  visualFillPercentage: number;
  remaining: number | null;
  exceeded: number;
  status: CategoryGoalStatus;
}

export type NavigationSectionId =
  | 'dashboard'
  | 'lancamentos'
  | 'receitas'
  | 'despesas'
  | 'planejamento'
  | 'orcamentos'
  | 'investimentos'
  | 'relatorios'
  | 'categorias'
  | 'configuracoes';

export type DashboardViewMode = 'mensal' | 'anual';

export type HistoryRangeMonths = 3 | 6 | 12;

export interface MonthlySummary {
  year: number;
  monthIndex: number;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
  isFutureMonth: boolean;
}

export interface RollingPeriodSummary {
  income: number;
  expenses: number;
  balance: number;
  startDate: string;
  endDate: string;
}

export interface CalendarDayCell {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFutureDay: boolean;
  income: number;
  expenses: number;
  balance: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  transactions: Transaction[];
}

export interface TagExpenseSlice {
  tagId: TagId;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface HistoryPoint {
  key: string;
  year: number;
  monthIndex: number;
  shortLabel: string;
  fullLabel: string;
  income: number;
  expenses: number;
  balance: number;
}
