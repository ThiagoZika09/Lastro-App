import { CalendarClock } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { DayTransactionsModal } from './components/DayTransactionsModal';
import { ExpensesByTagsCard } from './components/ExpensesByTagsCard';
import { FinancialCalendarCard } from './components/FinancialCalendarCard';
import { FinancialGoalsSection } from './components/FinancialGoalsSection';
import { FinancialHistoryCard } from './components/FinancialHistoryCard';
import { GoalConfigModal } from './components/GoalConfigModal';
import { ModulePlaceholderView } from './components/ModulePlaceholderView';
import { PrimaryMetricsRow } from './components/PrimaryMetricsRow';
import { Rolling30DaysCard } from './components/Rolling30DaysCard';
import { NAV_ITEMS, Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import {
  DEFAULT_CATEGORY_GOALS,
  DEFAULT_PLANNING_INCOME,
  EXPENSE_CATEGORY_ORDER,
} from './data/categories';
import { buildSeedTransactions } from './data/financeRepository';
import {
  getCalendarMonthGrid,
  getCategoryGoalsProgress,
  getExpensesByTag,
  getFinancialHistory,
  getMonthlySummary,
  getRolling30DaysSummary,
  isMonthInFuture,
  shiftMonth,
} from './lib/finance';
import type {
  CalendarDayCell,
  CategoryGoalConfig,
  DashboardViewMode,
  ExpenseCategoryId,
  HistoryRangeMonths,
  NavigationSectionId,
} from './types/finance';

type ThemeMode = 'light' | 'dark';

const GOALS_STORAGE_KEY = 'lastro_category_goals';
const PLANNING_INCOME_STORAGE_KEY = 'lastro_planning_income';

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

function readInitialCategoryGoals(): Record<ExpenseCategoryId, CategoryGoalConfig> {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORY_GOALS;
    const parsed = JSON.parse(raw) as Partial<
      Record<ExpenseCategoryId, CategoryGoalConfig>
    >;
    const merged = { ...DEFAULT_CATEGORY_GOALS };
    for (const catId of EXPENSE_CATEGORY_ORDER) {
      const candidate = parsed[catId];
      if (
        candidate &&
        (candidate.mode === 'none' ||
          candidate.mode === 'fixed' ||
          candidate.mode === 'percentage') &&
        typeof candidate.value === 'number' &&
        Number.isFinite(candidate.value)
      ) {
        merged[catId] = {
          categoryId: catId,
          mode: candidate.mode,
          value: Math.max(0, candidate.value),
        };
      }
    }
    return merged;
  } catch {
    return DEFAULT_CATEGORY_GOALS;
  }
}

function readInitialPlanningIncome(): number {
  try {
    const raw = localStorage.getItem(PLANNING_INCOME_STORAGE_KEY);
    if (!raw) return DEFAULT_PLANNING_INCOME;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PLANNING_INCOME;
  } catch {
    return DEFAULT_PLANNING_INCOME;
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

  // Independent Category Goals & Planning Income state
  const [categoryGoals, setCategoryGoals] = useState<
    Record<ExpenseCategoryId, CategoryGoalConfig>
  >(readInitialCategoryGoals);
  const [planningIncome, setPlanningIncome] = useState<number>(
    readInitialPlanningIncome,
  );
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalFocusCategory, setGoalModalFocusCategory] =
    useState<ExpenseCategoryId | null>(null);
  const [goalsSavedNotice, setGoalsSavedNotice] = useState(false);
  const savedNoticeTimerRef = useRef<number | null>(null);

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

  // Cleanup save notice timer on unmount
  useEffect(() => {
    return () => {
      if (savedNoticeTimerRef.current !== null) {
        window.clearTimeout(savedNoticeTimerRef.current);
      }
    };
  }, []);

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

  const tagBreakdown = useMemo(
    () => getExpensesByTag(transactions, period.year, period.monthIndex),
    [transactions, period.year, period.monthIndex],
  );

  const categoryGoalsProgress = useMemo(
    () =>
      getCategoryGoalsProgress(
        transactions,
        period.year,
        period.monthIndex,
        categoryGoals,
        planningIncome,
      ),
    [transactions, period.year, period.monthIndex, categoryGoals, planningIncome],
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

  const handleOpenGoalModal = (focusCategoryId?: ExpenseCategoryId) => {
    setGoalModalFocusCategory(focusCategoryId ?? null);
    setGoalModalOpen(true);
  };

  const handleSaveGoals = (
    nextGoals: Record<ExpenseCategoryId, CategoryGoalConfig>,
    nextPlanningIncome: number,
  ) => {
    setCategoryGoals(nextGoals);
    setPlanningIncome(nextPlanningIncome);
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(nextGoals));
      localStorage.setItem(
        PLANNING_INCOME_STORAGE_KEY,
        String(nextPlanningIncome),
      );
    } catch {
      // Ignore storage write failure
    }
    setGoalModalOpen(false);
    setGoalModalFocusCategory(null);
    setGoalsSavedNotice(true);
    if (savedNoticeTimerRef.current !== null) {
      window.clearTimeout(savedNoticeTimerRef.current);
    }
    savedNoticeTimerRef.current = window.setTimeout(() => {
      setGoalsSavedNotice(false);
    }, 3500);
  };

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activeSection);
  const topBarTitle =
    activeSection === 'dashboard'
      ? 'Dashboard'
      : (activeNavMeta?.label ?? 'Lastro');

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

          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar
              pageTitle={topBarTitle}
              showPeriodSelector={
                activeSection === 'dashboard' && viewMode === 'mensal'
              }
              year={period.year}
              monthIndex={period.monthIndex}
              direction={periodDirection}
              isCurrentMonth={isCurrentMonth}
              onPrevMonth={() => handleShiftMonth(-1)}
              onNextMonth={() => handleShiftMonth(1)}
              onResetCurrentMonth={handleResetCurrentMonth}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />

            <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
              <div className="mx-auto w-full max-w-[1384px]">
                <AnimatePresence mode="wait">
                  {activeSection !== 'dashboard' && activeNavMeta ? (
                    <div key={`placeholder-${activeSection}`}>
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
                        isFutureMonth={futureMonth}
                        viewMode={viewMode}
                        onChangeViewMode={setViewMode}
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

                            {/* 3. Main Bento Composition: Calendar (7 cols) + Expenses by Tags (5 cols) */}
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
                                <ExpensesByTagsCard
                                  year={period.year}
                                  monthIndex={period.monthIndex}
                                  totalExpenses={tagBreakdown.totalExpenses}
                                  slices={tagBreakdown.slices}
                                />
                              </div>
                            </div>

                            {/* 4. Full-width Financial History Grouped Bar Chart */}
                            <FinancialHistoryCard
                              points={historyPoints}
                              rangeMonths={historyRange}
                              onChangeRange={setHistoryRange}
                            />

                            {/* 5. Category-based Financial Goals Section */}
                            <FinancialGoalsSection
                              goals={categoryGoalsProgress}
                              planningIncome={planningIncome}
                              savedNoticeVisible={goalsSavedNotice}
                              onOpenConfig={handleOpenGoalModal}
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
        </div>

        <DayTransactionsModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
        />

        <GoalConfigModal
          isOpen={goalModalOpen}
          goals={categoryGoals}
          planningIncome={planningIncome}
          focusCategoryId={goalModalFocusCategory}
          onClose={() => {
            setGoalModalOpen(false);
            setGoalModalFocusCategory(null);
          }}
          onSave={handleSaveGoals}
        />
      </div>
    </MotionConfig>
  );
}
