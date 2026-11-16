import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCalendarMonthGrid,
  getExpensesByCategory,
  getFinancialHistory,
  getMonthlySummary,
  getRolling30DaysSummary,
  isMonthInFuture,
} from './finance';
import { formatBRL, formatMonthYearPtBR } from './format';
import type { Transaction } from '../types/finance';

const SAMPLE_TXS: Transaction[] = [
  { id: '1', date: '2026-10-16', description: 'Antiga fora 30d', amount: 999, type: 'expense', categoryId: 'moradia' },
  { id: '2', date: '2026-10-17', description: 'Limite exato 30d', amount: 1000, type: 'expense', categoryId: 'moradia' },
  { id: '3', date: '2026-10-20', description: 'Salário Out', amount: 4000, type: 'income', categoryId: 'salario' },
  { id: '4', date: '2026-11-01', description: 'Aluguel Nov', amount: 2500, type: 'expense', categoryId: 'moradia' },
  { id: '5', date: '2026-11-05', description: 'Mercado Nov', amount: 1500, type: 'expense', categoryId: 'alimentacao' },
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
  const ref = new Date(2026, 10, 15); // 2026-11-15 -> start is 2026-10-17 (30 days inclusive)
  const rolling = getRolling30DaysSummary(SAMPLE_TXS, ref);
  assert.equal(rolling.startDate, '2026-10-17');
  assert.equal(rolling.endDate, '2026-11-15');
  assert.equal(rolling.income, 4000);
  assert.equal(rolling.expenses, 5000); // 1000 + 2500 + 1500 (excludes 2026-10-16)
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
  const ref = new Date(2026, 10, 15); // Nov 2026 starts on Sunday (0) and has 30 days
  const grid = getCalendarMonthGrid(SAMPLE_TXS, 2026, 10, ref);
  const currentDays = grid.filter((c) => c.isCurrentMonth);
  assert.equal(currentDays.length, 30);
  assert.equal(grid[0].dayNumber, 1);
  assert.equal(grid[0].expenses, 2500);
  assert.equal(grid[0].intensity, 4); // max expense day of Nov
  assert.equal(grid[4].dayNumber, 5);
  assert.equal(grid[4].expenses, 1500); // 1500 / 2500 = 0.6 -> tier 3
  assert.equal(grid[4].intensity, 3);
  assert.equal(grid[1].expenses, 0);
  assert.equal(grid[1].intensity, 0);
});

test('getExpensesByCategory counts only expenses and computes exact percentages', () => {
  const breakdown = getExpensesByCategory(SAMPLE_TXS, 2026, 9); // Oct 2026 has 4000 income, 1999 expense
  assert.equal(breakdown.totalExpenses, 1999);
  assert.equal(breakdown.slices.length, 1);
  assert.equal(breakdown.slices[0].categoryId, 'moradia');
  assert.equal(Math.round(breakdown.slices[0].percentage), 100);
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
