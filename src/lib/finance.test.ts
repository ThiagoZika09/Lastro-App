import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CATEGORY_GOALS } from '../data/categories';
import {
  getCalendarMonthGrid,
  getCategoryGoalsProgress,
  getExpensesByTag,
  getFinancialHistory,
  getGoalStatus,
  getMonthlySummary,
  getRolling30DaysSummary,
  isMonthInFuture,
  resolveGoalLimit,
} from './finance';
import { formatBRL, formatMonthYearPtBR } from './format';
import type { CategoryGoalConfig, ExpenseCategoryId, Transaction } from '../types/finance';

const SAMPLE_TXS: Transaction[] = [
  { id: '1', date: '2026-10-16', description: 'Antiga fora 30d', amount: 999, type: 'expense', categoryId: 'moradia', tagIds: ['necessidades'] },
  { id: '2', date: '2026-10-17', description: 'Limite exato 30d', amount: 1000, type: 'expense', categoryId: 'moradia', tagIds: ['necessidades'] },
  { id: '3', date: '2026-10-20', description: 'Salário Out', amount: 4000, type: 'income', categoryId: 'salario', tagIds: [] },
  { id: '4', date: '2026-11-01', description: 'Aluguel Nov', amount: 2500, type: 'expense', categoryId: 'moradia', tagIds: ['necessidades', 'fixos'] },
  { id: '5', date: '2026-11-05', description: 'Mercado Nov', amount: 1500, type: 'expense', categoryId: 'alimentacao', tagIds: ['necessidades'] },
];

test('formatBRL formats positive, negative and zero values in pt-BR currency', () => {
  assert.equal(formatBRL(5250), 'R$ 5.250,00');
  assert.equal(formatBRL(-1000), '-R$ 1.000,00');
  assert.equal(formatBRL(0), 'R$ 0,00');
});

test('formatMonthYearPtBR formats Portuguese month and year cleanly', () => {
  assert.equal(formatMonthYearPtBR(2026, 10), 'Novembro de 2026');
  assert.equal(formatMonthYearPtBR(2026, 0), 'Janeiro de 2026');
});

test('getRolling30DaysSummary uses exact 30-day rolling window and handles negative balance', () => {
  const ref = new Date(2026, 10, 15);
  const rolling = getRolling30DaysSummary(SAMPLE_TXS, ref);
  assert.equal(rolling.startDate, '2026-10-17');
  assert.equal(rolling.endDate, '2026-11-15');
  assert.equal(rolling.income, 4000);
  assert.equal(rolling.expenses, 5000);
  assert.equal(rolling.balance, -1000);
});

test('getMonthlySummary computes income, expenses and balance accurately', () => {
  const ref = new Date(2026, 10, 15);
  const nov = getMonthlySummary(SAMPLE_TXS, 2026, 10, ref);
  assert.equal(nov.income, 0);
  assert.equal(nov.expenses, 4000);
  assert.equal(nov.balance, -4000);
  assert.equal(nov.isFutureMonth, false);

  const dec = getMonthlySummary(SAMPLE_TXS, 2026, 11, ref);
  assert.equal(dec.isFutureMonth, true);
  assert.equal(dec.income, 0);
  assert.equal(dec.expenses, 0);
});

test('getCalendarMonthGrid aligns real weekdays and normalizes monthly intensity', () => {
  const ref = new Date(2026, 10, 15);
  const grid = getCalendarMonthGrid(SAMPLE_TXS, 2026, 10, ref);
  const currentDays = grid.filter((c) => c.isCurrentMonth);
  assert.equal(currentDays.length, 30);
  assert.equal(grid[0].dayNumber, 1);
  assert.equal(grid[0].expenses, 2500);
  assert.equal(grid[0].intensity, 4);
  assert.equal(grid[4].dayNumber, 5);
  assert.equal(grid[4].expenses, 1500);
  assert.equal(grid[4].intensity, 3);
  assert.equal(grid[1].expenses, 0);
  assert.equal(grid[1].intensity, 0);
});

test('getExpensesByTag groups exclusively by tags and prevents multi-tag duplication', () => {
  // Nov 2026: Aluguel (2500 -> split 1250 Necessidades + 1250 Fixos) + Mercado (1500 -> Necessidades)
  const breakdown = getExpensesByTag(SAMPLE_TXS, 2026, 10);
  assert.equal(breakdown.totalExpenses, 4000);
  const sumSlices = breakdown.slices.reduce((acc, s) => acc + s.amount, 0);
  assert.equal(sumSlices, 4000);
  const nec = breakdown.slices.find((s) => s.tagId === 'necessidades');
  const fix = breakdown.slices.find((s) => s.tagId === 'fixos');
  assert.equal(nec?.amount, 2750);
  assert.equal(fix?.amount, 1250);
});

test('Separation invariant: R$ 500 Moradia + Necessidades reflects cleanly in both category goal and tag chart without duplication', () => {
  const txs: Transaction[] = [
    { id: 't1', date: '2026-11-01', description: 'Aluguel', amount: 500, type: 'expense', categoryId: 'moradia', tagIds: ['necessidades'] },
    { id: 't2', date: '2026-11-05', description: 'Salário', amount: 5000, type: 'income', categoryId: 'salario', tagIds: [] },
  ];
  const goals: Record<ExpenseCategoryId, CategoryGoalConfig> = {
    ...DEFAULT_CATEGORY_GOALS,
    moradia: { categoryId: 'moradia', mode: 'percentage', value: 30 }, // 30% of 5000 = 1500
  };
  const tagChart = getExpensesByTag(txs, 2026, 10);
  const progress = getCategoryGoalsProgress(txs, 2026, 10, goals, 5000);
  const moradia = progress.find((g) => g.categoryId === 'moradia')!;

  assert.equal(tagChart.totalExpenses, 500);
  assert.equal(tagChart.slices.length, 1);
  assert.equal(tagChart.slices[0].tagId, 'necessidades');
  assert.equal(tagChart.slices[0].amount, 500);

  assert.equal(moradia.spent, 500);
  assert.equal(moradia.limit, 1500);
  assert.equal(moradia.remaining, 1000);
});

test('Category goals compute all status thresholds and exceeded overflow cleanly', () => {
  assert.equal(resolveGoalLimit({ categoryId: 'moradia', mode: 'percentage', value: 30 }, 5000), 1500);
  assert.equal(resolveGoalLimit({ categoryId: 'moradia', mode: 'none', value: 100 }, 5000), null);

  assert.equal(getGoalStatus(500, null), 'unconfigured');
  assert.equal(getGoalStatus(690, 1000), 'positive'); // 69%
  assert.equal(getGoalStatus(700, 1000), 'attention'); // 70%
  assert.equal(getGoalStatus(890, 1000), 'attention'); // 89%
  assert.equal(getGoalStatus(900, 1000), 'warning'); // 90%
  assert.equal(getGoalStatus(1000, 1000), 'reached'); // 100%
  assert.equal(getGoalStatus(950, 800), 'exceeded'); // 118.75%

  const txs: Transaction[] = [
    { id: 'a1', date: '2026-11-02', description: 'Supermercado', amount: 950, type: 'expense', categoryId: 'alimentacao', tagIds: ['necessidades'] },
  ];
  const goals: Record<ExpenseCategoryId, CategoryGoalConfig> = {
    ...DEFAULT_CATEGORY_GOALS,
    alimentacao: { categoryId: 'alimentacao', mode: 'fixed', value: 800 },
  };
  const progress = getCategoryGoalsProgress(txs, 2026, 10, goals, 5000);
  const food = progress.find((g) => g.categoryId === 'alimentacao')!;
  assert.equal(food.spent, 950);
  assert.equal(food.limit, 800);
  assert.equal(food.percentage, 118.75);
  assert.equal(food.visualFillPercentage, 100);
  assert.equal(food.remaining, 0);
  assert.equal(food.exceeded, 150);
  assert.equal(food.status, 'exceeded');
});

test('getFinancialHistory matches monthly summaries across 3, 6 and 12 months', () => {
  const ref = new Date(2026, 10, 15);
  const history3 = getFinancialHistory(SAMPLE_TXS, 2026, 10, 3, ref);
  assert.equal(history3.length, 3);
  assert.equal(history3[1].income, 4000);
  assert.equal(history3[1].expenses, 1999);
  assert.equal(history3[2].expenses, 4000);

  const history12 = getFinancialHistory(SAMPLE_TXS, 2026, 10, 12, ref);
  assert.equal(history12.length, 12);
  assert.equal(isMonthInFuture(2026, 11, ref), true);
  assert.equal(isMonthInFuture(2026, 10, ref), false);
});
