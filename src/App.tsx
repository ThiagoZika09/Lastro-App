import { CalendarClock } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { DayTransactionsModal } from './components/DayTransactionsModal';
import { ExpensesByCategoryCard } from './components/ExpensesByCategoryCard';
import { FinancialCalendarCard } from './components/FinancialCalendarCard';
import { FinancialHistoryCard } from './components/FinancialHistoryCard';
import { ModulePlaceholderView } from './components/ModulePlaceholderView';
import { PrimaryMetricsRow } from './components/PrimaryMetricsRow';
import { Rolling30DaysCard } from './components/Rolling30DaysCard';
import { NAV_ITEMS, Sidebar } from './components/Sidebar';
import { buildSeedTransactions } from './data/financeRepository';
import {
  getCalendarMonthGrid,
  getExpensesByCategory,
  getFinancialHistory,
  getMonthlySummary,
  getRolling30DaysSummary,
  isMonthInFuture,
  shiftMonth,
} from './lib/finance';
import type {
  CalendarDayCell,
  DashboardViewMode,
  HistoryRangeMonths,
  NavigationSectionId,
} from './types/finance';

type ThemeMode = 'light' | 'dark';

function readInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem('lastro_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // Ignore storage read failure
  }
  return 'light';
}

function readInitialSidebarPinned(): boolean {
  try {
    return localStorage.getItem('lastro_sidebar_pinned') === 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [referenceDate] = useState<Date>(() => new Date());
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [isPinned, setIsPinned] = useState<boolean>(readInitialSidebarPinned);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeSection, setActiveSection] =
    useState<NavigationSectionId>('dashboard');
  const [viewMode, setViewMode] = useState<DashboardViewMode>('mensal');

  const [period, setPeriod] = useState<{ year: number; monthIndex: number }>(() => ({
    year: referenceDate.getFullYear(),
    monthIndex: referenceDate.getMonth(),
  }));
  const [periodDirection, setPeriodDirection] = useState(0);
  const [historyRange, setHistoryRange] = useState<HistoryRangeMonths>(6);
  const [selectedDay, setSelectedDay] = useState<CalendarDayCell | null>(null);

  // Sync theme class on <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('lastro_theme', theme);
    } catch {
      // Ignore storage write failure
    }
  }, [theme]);

  // Persist sidebar pin preference
  useEffect(() => {
    try {
      localStorage.setItem('lastro_sidebar_pinned', String(isPinned));
    } catch {
      // Ignore storage write failure
    }
  }, [isPinned]);

  // Centralized financial transactions & derived metrics
  const transactions = useMemo(
    () => buildSeedTransactions(referenceDate),
    [referenceDate],
  );

  const monthlySummary = useMemo(
    () =>
      getMonthlySummary(
        transactions,
        period.year,
        period.monthIndex,
        referenceDate,
      ),
    [transactions, period.year, period.monthIndex, referenceDate],
  );

  const rolling30Days = useMemo(
    () => getRolling30DaysSummary(transactions, referenceDate),
    [transactions, referenceDate],
  );

  const calendarCells = useMemo(
    () =>
      getCalendarMonthGrid(
        transactions,
        period.year,
        period.monthIndex,
        referenceDate,
      ),
    [transactions, period.year, period.monthIndex, referenceDate],
  );

  const categoryBreakdown = useMemo(
    () => getExpensesByCategory(transactions, period.year, period.monthIndex),
    [transactions, period.year, period.monthIndex],
  );

  const historyPoints = useMemo(
    () =>
      getFinancialHistory(
        transactions,
        period.year,
        period.monthIndex,
        historyRange,
        referenceDate,
      ),
    [transactions, period.year, period.monthIndex, historyRange, referenceDate],
  );

  const isCurrentMonth =
    period.year === referenceDate.getFullYear() &&
    period.monthIndex === referenceDate.getMonth();

  const futureMonth = isMonthInFuture(
    period.year,
    period.monthIndex,
    referenceDate,
  );

  const handleShiftMonth = (delta: number) => {
    setPeriodDirection(delta);
    setSelectedDay(null);
    setPeriod((prev) => shiftMonth(prev.year, prev.monthIndex, delta));
  };

  const handleResetCurrentMonth = () => {
    setPeriodDirection(0);
    setSelectedDay(null);
    setPeriod({
      year: referenceDate.getFullYear(),
      monthIndex: referenceDate.getMonth(),
    });
  };

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen w-full text-slate-900 transition-colors duration-300 dark:text-slate-100">
        {/* Subtle ambient Liquid Glass backdrop depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/4 h-[460px] w-[620px] rounded-full bg-blue-200/35 blur-[110px] transition-colors duration-500 dark:bg-blue-950/30" />
          <div className="absolute right-0 bottom-0 h-[420px] w-[520px] rounded-full bg-slate-200/50 blur-[120px] transition-colors duration-500 dark:bg-slate-900/40" />
        </div>

        <div className="flex min-h-screen w-full">
          <Sidebar
            activeSection={activeSection}
            onSelectSection={(section) => setActiveSection(section)}
            isPinned={isPinned}
            onTogglePin={() => setIsPinned((prev) => !prev)}
            theme={theme}
            onToggleTheme={() =>
              setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
            }
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mx-auto w-full max-w-[1320px]">
              <AnimatePresence mode="wait">
                {activeSection !== 'dashboard' && activeNavMeta ? (
                  <div key={`placeholder-${activeSection}`}>
                    {/* Mobile trigger when outside dashboard */}
                    <div className="mb-4 flex items-center lg:hidden">
                      <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Abrir menu lateral"
                        className="liquid-glass inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span>Menu · {activeNavMeta.label}</span>
                      </button>
                    </div>
                    <ModulePlaceholderView
                      title={activeNavMeta.label}
                      description={activeNavMeta.description}
                      icon={activeNavMeta.icon}
                      onReturnToDashboard={() => setActiveSection('dashboard')}
                    />
                  </div>
                ) : (
                  <motion.div
                    key="dashboard-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DashboardHeader
                      year={period.year}
                      monthIndex={period.monthIndex}
                      direction={periodDirection}
                      isCurrentMonth={isCurrentMonth}
                      isFutureMonth={futureMonth}
                      viewMode={viewMode}
                      onChangeViewMode={setViewMode}
                      onPrevMonth={() => handleShiftMonth(-1)}
                      onNextMonth={() => handleShiftMonth(1)}
                      onResetCurrentMonth={handleResetCurrentMonth}
                      onOpenMobileMenu={() => setMobileMenuOpen(true)}
                    />

                    <AnimatePresence mode="wait">
                      {viewMode === 'anual' ? (
                        <ModulePlaceholderView
                          key="annual-placeholder"
                          title="Visão Anual Consolidada"
                          description="O modo anual reunirá comparativos de longo prazo, evolução patrimonial e médias anuais. Utilize a visão mensal para acompanhar o período atual."
                          icon={CalendarClock}
                          contextLabel="Visualização disponível nas próximas etapas"
                          onReturnToDashboard={() => setViewMode('mensal')}
                        />
                      ) : (
                        <motion.div
                          key="monthly-dashboard"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="space-y-5"
                        >
                          {/* 1. Primary 3 KPI Cards */}
                          <PrimaryMetricsRow summary={monthlySummary} />

                          {/* 2. Rolling 30 Days Result */}
                          <Rolling30DaysCard rolling={rolling30Days} />

                          {/* 3. Main Bento Composition: Calendar (7 cols) + Category Pie (5 cols) */}
                          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
                            <div className="xl:col-span-7">
                              <FinancialCalendarCard
                                year={period.year}
                                monthIndex={period.monthIndex}
                                cells={calendarCells}
                                onSelectDay={(day) => setSelectedDay(day)}
                              />
                            </div>

                            <div className="xl:col-span-5">
                              <ExpensesByCategoryCard
                                year={period.year}
                                monthIndex={period.monthIndex}
                                totalExpenses={categoryBreakdown.totalExpenses}
                                slices={categoryBreakdown.slices}
                              />
                            </div>
                          </div>

                          {/* 4. Full-width Financial History Grouped Bar Chart */}
                          <FinancialHistoryCard
                            points={historyPoints}
                            rangeMonths={historyRange}
                            onChangeRange={setHistoryRange}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        <DayTransactionsModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      </div>
    </MotionConfig>
  );
}
