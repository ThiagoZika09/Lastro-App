export type TransactionType = 'income' | 'expense';

export type ExpenseCategoryId =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'assinaturas'
  | 'contas'
  | 'educacao';

export type IncomeCategoryId = 'salario' | 'rendimentos' | 'extras';

export type CategoryId = ExpenseCategoryId | IncomeCategoryId;

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD (local date)
  description: string;
  amount: number; // positive BRL value
  type: TransactionType;
  categoryId: CategoryId;
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

export interface CategoryExpenseSlice {
  categoryId: CategoryId;
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
