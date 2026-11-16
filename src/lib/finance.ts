import { EXPENSE_CATEGORY_ORDER, getCategoryMeta } from '../data/categories';
import { getTagMeta } from '../data/tags';
import type {
  CalendarDayCell,
  CategoryGoalConfig,
  CategoryGoalProgress,
  CategoryGoalStatus,
  ExpenseCategoryId,
  HistoryPoint,
  HistoryRangeMonths,
  MonthlySummary,
  RollingPeriodSummary,
  TagExpenseSlice,
  TagId,
  Transaction,
} from '../types/finance';
import {
  addDaysToIso,
  formatMonthYearPtBR,
  formatShortMonthPtBR,
  toIsoDate,
} from './format';

export const WEEKDAY_LABELS_PT_BR = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
] as const;

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isMonthInFuture(
  year: number,
  monthIndex: number,
  referenceDate: Date = new Date(),
): boolean {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  return year > refYear || (year === refYear && monthIndex > refMonth);
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  deltaMonths: number,
): { year: number; monthIndex: number } {
  const date = new Date(year, monthIndex + deltaMonths, 1);
  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
  };
}

export function getMonthPrefix(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function filterTransactionsByMonth(
  transactions: readonly Transaction[],
  year: number,
  monthIndex: number,
): Transaction[] {
  const prefix = getMonthPrefix(year, monthIndex);
  return transactions.filter((tx) => tx.date.startsWith(prefix));
}

export function getMonthlySummary(
  transactions: readonly Transaction[],
  year: number,
  monthIndex: number,
  referenceDate: Date = new Date(),
): MonthlySummary {
  const isFutureMonth = isMonthInFuture(year, monthIndex, referenceDate);
  const monthly = filterTransactionsByMonth(transactions, year, monthIndex);

  let income = 0;
  let expenses = 0;

  for (const tx of monthly) {
    if (tx.type === 'income') {
      income += tx.amount;
    } else {
      expenses += tx.amount;
    }
  }

  const roundedIncome = roundCurrency(income);
  const roundedExpenses = roundCurrency(expenses);

  return {
    year,
    monthIndex,
    income: roundedIncome,
    expenses: roundedExpenses,
    balance: roundCurrency(roundedIncome - roundedExpenses),
    transactionCount: monthly.length,
    isFutureMonth,
  };
}

export function getRolling30DaysSummary(
  transactions: readonly Transaction[],
  referenceDate: Date = new Date(),
): RollingPeriodSummary {
  const endDate = toIsoDate(referenceDate);
  const startDate = addDaysToIso(endDate, -29);

  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    if (tx.date >= startDate && tx.date <= endDate) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expenses += tx.amount;
      }
    }
  }

  const roundedIncome = roundCurrency(income);
  const roundedExpenses = roundCurrency(expenses);

  return {
    income: roundedIncome,
    expenses: roundedExpenses,
    balance: roundCurrency(roundedIncome - roundedExpenses),
    startDate,
    endDate,
  };
}

export function computeRelativeIntensity(
  dayExpenses: number,
  maxMonthExpense: number,
): 0 | 1 | 2 | 3 | 4 {
  if (dayExpenses <= 0 || maxMonthExpense <= 0) return 0;
  const ratio = dayExpenses / maxMonthExpense;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.78) return 3;
  return 4;
}

export function getCalendarMonthGrid(
  transactions: readonly Transaction[],
  year: number,
  monthIndex: number,
  referenceDate: Date = new Date(),
): CalendarDayCell[] {
  const todayIso = toIsoDate(referenceDate);
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();

  const monthly = filterTransactionsByMonth(transactions, year, monthIndex);
  const byDate = new Map<string, Transaction[]>();

  for (const tx of monthly) {
    const existing = byDate.get(tx.date);
    if (existing) {
      existing.push(tx);
    } else {
      byDate.set(tx.date, [tx]);
    }
  }

  const dailyTotals = new Map<
    string,
    { income: number; expenses: number; transactions: Transaction[] }
  >();
  let maxMonthExpense = 0;
  const prefix = getMonthPrefix(year, monthIndex);

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${prefix}-${String(day).padStart(2, '0')}`;
    const dayTxs = byDate.get(iso) ?? [];
    let income = 0;
    let expenses = 0;
    for (const tx of dayTxs) {
      if (tx.type === 'income') income += tx.amount;
      else expenses += tx.amount;
    }
    const rIncome = roundCurrency(income);
    const rExpenses = roundCurrency(expenses);
    if (rExpenses > maxMonthExpense) {
      maxMonthExpense = rExpenses;
    }
    dailyTotals.set(iso, {
      income: rIncome,
      expenses: rExpenses,
      transactions: dayTxs,
    });
  }

  const cells: CalendarDayCell[] = [];

  for (let i = leadingEmptyDays; i > 0; i--) {
    const dt = new Date(year, monthIndex, 1 - i);
    const iso = toIsoDate(dt);
    cells.push({
      date: iso,
      dayNumber: dt.getDate(),
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isFutureDay: iso > todayIso,
      income: 0,
      expenses: 0,
      balance: 0,
      intensity: 0,
      transactions: [],
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${prefix}-${String(day).padStart(2, '0')}`;
    const data = dailyTotals.get(iso)!;
    cells.push({
      date: iso,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      isFutureDay: iso > todayIso,
      income: data.income,
      expenses: data.expenses,
      balance: roundCurrency(data.income - data.expenses),
      intensity: computeRelativeIntensity(data.expenses, maxMonthExpense),
      transactions: data.transactions,
    });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const trailingCount = 7 - remainder;
    for (let i = 1; i <= trailingCount; i++) {
      const dt = new Date(year, monthIndex + 1, i);
      const iso = toIsoDate(dt);
      cells.push({
        date: iso,
        dayNumber: dt.getDate(),
        isCurrentMonth: false,
        isToday: iso === todayIso,
        isFutureDay: iso > todayIso,
        income: 0,
        expenses: 0,
        balance: 0,
        intensity: 0,
        transactions: [],
      });
    }
  }

  return cells;
}

/**
 * Computes expense distribution grouped exclusively by independent Tags.
 * Anti-duplication rule: if a transaction carries multiple tags, its amount
 * is divided equally in integer cents across those unique tags so the sum of
 * all slices always equals exact total monthly expenses.
 */
export function getExpensesByTag(
  transactions: readonly Transaction[],
  year: number,
  monthIndex: number,
): { totalExpenses: number; slices: TagExpenseSlice[] } {
  const monthlyExpenses = filterTransactionsByMonth(
    transactions,
    year,
    monthIndex,
  ).filter((tx) => tx.type === 'expense');

  if (monthlyExpenses.length === 0) {
    return { totalExpenses: 0, slices: [] };
  }

  const centsByTag = new Map<TagId, number>();
  let totalCents = 0;

  for (const tx of monthlyExpenses) {
    const txCents = Math.round(tx.amount * 100);
    totalCents += txCents;

    const uniqueTags: TagId[] =
      tx.tagIds && tx.tagIds.length > 0
        ? Array.from(new Set(tx.tagIds))
        : ['sem_tag'];

    const count = uniqueTags.length;
    const baseShare = Math.floor(txCents / count);
    const remainder = txCents % count;

    uniqueTags.forEach((tagId, idx) => {
      const share = baseShare + (idx < remainder ? 1 : 0);
      centsByTag.set(tagId, (centsByTag.get(tagId) ?? 0) + share);
    });
  }

  const totalExpenses = roundCurrency(totalCents / 100);

  const slices: TagExpenseSlice[] = Array.from(centsByTag.entries())
    .map(([tagId, cents]) => {
      const meta = getTagMeta(tagId);
      const amount = roundCurrency(cents / 100);
      return {
        tagId: meta.id,
        name: meta.name,
        color: meta.color,
        amount,
        percentage: totalCents > 0 ? (cents / totalCents) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    totalExpenses,
    slices,
  };
}

export function resolveGoalLimit(
  config: CategoryGoalConfig | undefined,
  planningIncome: number,
): number | null {
  if (!config || config.mode === 'none' || config.value <= 0) {
    return null;
  }
  if (config.mode === 'fixed') {
    return roundCurrency(config.value);
  }
  if (planningIncome <= 0) {
    return null;
  }
  return roundCurrency((planningIncome * config.value) / 100);
}

export function getGoalStatus(
  spent: number,
  limit: number | null,
): CategoryGoalStatus {
  if (limit === null || limit <= 0) {
    return 'unconfigured';
  }
  if (Math.abs(spent - limit) < 0.01) {
    return 'reached';
  }
  if (spent > limit) {
    return 'exceeded';
  }
  const percentage = (spent / limit) * 100;
  if (percentage >= 90) {
    return 'warning';
  }
  if (percentage >= 70) {
    return 'attention';
  }
  return 'positive';
}

export function getCategoryGoalsProgress(
  transactions: readonly Transaction[],
  year: number,
  monthIndex: number,
  goals: Record<ExpenseCategoryId, CategoryGoalConfig>,
  planningIncome: number,
): CategoryGoalProgress[] {
  const monthlyExpenses = filterTransactionsByMonth(
    transactions,
    year,
    monthIndex,
  ).filter((tx) => tx.type === 'expense');

  const spentByCategory = new Map<ExpenseCategoryId, number>();
  for (const tx of monthlyExpenses) {
    const catId = tx.categoryId as ExpenseCategoryId;
    spentByCategory.set(catId, (spentByCategory.get(catId) ?? 0) + tx.amount);
  }

  return EXPENSE_CATEGORY_ORDER.map((categoryId) => {
    const meta = getCategoryMeta(categoryId);
    const config = goals[categoryId] ?? { categoryId, mode: 'none', value: 0 };
    const spent = roundCurrency(spentByCategory.get(categoryId) ?? 0);
    const limit = resolveGoalLimit(config, planningIncome);
    const status = getGoalStatus(spent, limit);
    const percentage =
      limit !== null && limit > 0
        ? Math.round(((spent / limit) * 100 + Number.EPSILON) * 100) / 100
        : null;
    const visualFillPercentage =
      percentage !== null ? Math.min(100, Math.max(0, percentage)) : 0;
    const remaining =
      limit !== null ? roundCurrency(Math.max(0, limit - spent)) : null;
    const exceeded =
      limit !== null && spent > limit ? roundCurrency(spent - limit) : 0;

    return {
      categoryId,
      name: meta.name,
      mode: config.mode,
      configuredValue: config.value,
      spent,
      limit,
      percentage,
      visualFillPercentage,
      remaining,
      exceeded,
      status,
    };
  });
}

export function getFinancialHistory(
  transactions: readonly Transaction[],
  anchorYear: number,
  anchorMonthIndex: number,
  rangeMonths: HistoryRangeMonths,
  referenceDate: Date = new Date(),
): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const spansMultipleYears =
    rangeMonths === 12 || anchorMonthIndex - (rangeMonths - 1) < 0;

  for (let offset = rangeMonths - 1; offset >= 0; offset--) {
    const { year, monthIndex } = shiftMonth(
      anchorYear,
      anchorMonthIndex,
      -offset,
    );
    const summary = getMonthlySummary(
      transactions,
      year,
      monthIndex,
      referenceDate,
    );
    points.push({
      key: getMonthPrefix(year, monthIndex),
      year,
      monthIndex,
      shortLabel: formatShortMonthPtBR(year, monthIndex, spansMultipleYears),
      fullLabel: formatMonthYearPtBR(year, monthIndex),
      income: summary.income,
      expenses: summary.expenses,
      balance: summary.balance,
    });
  }

  return points;
}
