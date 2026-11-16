import { getCategoryMeta } from '../data/categories';
import type {
  CalendarDayCell,
  CategoryExpenseSlice,
  HistoryPoint,
  HistoryRangeMonths,
  MonthlySummary,
  RollingPeriodSummary,
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
  const leadingEmptyDays = firstDay.getDay(); // 0 (Dom) .. 6 (Sáb)

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

  // Compute daily totals first to find the relative max expense within this month
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

  // Leading padding cells (previous month placeholders, non-current)
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

  // Current month days
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

  // Trailing padding cells to complete the last week row (multiples of 7)
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

export function getExpensesByCategory(
  transactions: readonly Transaction[],
  year: number,
  monthIndex: number,
): { totalExpenses: number; slices: CategoryExpenseSlice[] } {
  const monthlyExpenses = filterTransactionsByMonth(
    transactions,
    year,
    monthIndex,
  ).filter((tx) => tx.type === 'expense');

  if (monthlyExpenses.length === 0) {
    return { totalExpenses: 0, slices: [] };
  }

  const totalsByCat = new Map<string, number>();
  let totalExpenses = 0;

  for (const tx of monthlyExpenses) {
    totalExpenses += tx.amount;
    totalsByCat.set(
      tx.categoryId,
      (totalsByCat.get(tx.categoryId) ?? 0) + tx.amount,
    );
  }

  const roundedTotal = roundCurrency(totalExpenses);

  const slices: CategoryExpenseSlice[] = Array.from(totalsByCat.entries())
    .map(([catId, amount]) => {
      const meta = getCategoryMeta(catId as Transaction['categoryId']);
      const roundedAmount = roundCurrency(amount);
      return {
        categoryId: meta.id,
        name: meta.name,
        color: meta.color,
        amount: roundedAmount,
        percentage: roundedTotal > 0 ? (roundedAmount / roundedTotal) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    totalExpenses: roundedTotal,
    slices,
  };
}

export function getFinancialHistory(
  transactions: readonly Transaction[],
  anchorYear: number,
  anchorMonthIndex: number,
  rangeMonths: HistoryRangeMonths,
  referenceDate: Date = new Date(),
): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const spansMultipleYears = rangeMonths === 12 || anchorMonthIndex - (rangeMonths - 1) < 0;

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
