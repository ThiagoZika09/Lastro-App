import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatMonthYearPtBR } from '../lib/format';
import type { DashboardViewMode } from '../types/finance';

interface DashboardHeaderProps {
  year: number;
  monthIndex: number;
  direction: number;
  isCurrentMonth: boolean;
  isFutureMonth: boolean;
  viewMode: DashboardViewMode;
  onChangeViewMode: (mode: DashboardViewMode) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetCurrentMonth: () => void;
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({
  year,
  monthIndex,
  direction,
  isCurrentMonth,
  isFutureMonth,
  viewMode,
  onChangeViewMode,
  onPrevMonth,
  onNextMonth,
  onResetCurrentMonth,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const periodLabel = formatMonthYearPtBR(year, monthIndex);

  return (
    <header className="mb-6 flex flex-col gap-4">
      {/* Top row: Mobile trigger + Title + Centered Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu lateral"
            className="liquid-glass inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-transform active:scale-95 lg:hidden dark:text-slate-200"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controle financeiro pessoal
            </p>
          </div>
        </div>

        {/* Center-aligned period selector */}
        <div className="flex w-full flex-col items-center sm:w-auto md:mx-auto md:pt-11">
          <div className="liquid-glass-elevated inline-flex w-full items-center justify-between gap-1 rounded-2xl p-1 sm:w-[276px] md:fixed md:top-6 md:left-1/2 md:z-30 md:-translate-x-1/2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9, x: -1.5 }}
              onClick={onPrevMonth}
              aria-label="Mês anterior"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-900/[0.05] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </motion.button>

            <div className="relative flex h-9 flex-1 items-center justify-center overflow-hidden px-2">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.span
                  key={`${year}-${monthIndex}`}
                  custom={direction}
                  initial={{ opacity: 0, y: direction >= 0 ? 7 : -7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: direction >= 0 ? -7 : 7 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  data-testid="selected-period-label"
                  className="text-sm font-semibold tracking-tight text-slate-900 whitespace-nowrap dark:text-slate-50"
                >
                  {periodLabel}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9, x: 1.5 }}
              onClick={onNextMonth}
              aria-label="Próximo mês"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-900/[0.05] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          </div>

          <div className="mt-1.5 flex min-h-[20px] items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {isFutureMonth && (
              <span>Período futuro · sem lançamentos realizados</span>
            )}
            {isFutureMonth && !isCurrentMonth && <span aria-hidden="true">·</span>}
            {!isCurrentMonth && (
              <button
                type="button"
                onClick={onResetCurrentMonth}
                className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Voltar ao mês atual
              </button>
            )}
          </div>
        </div>

        {/* Right spacer to visually balance period selector on wide desktop */}
        <div className="hidden w-[164px] md:block" aria-hidden="true" />
      </div>

      {/* Segmented Control: Mensal / Anual (top-left below header) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Modo de visualização financeira"
          className="liquid-glass inline-flex items-center gap-1 rounded-xl p-1"
        >
          {(
            [
              { id: 'mensal', label: 'Mensal' },
              { id: 'anual', label: 'Anual' },
            ] as const
          ).map((option) => {
            const active = viewMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeViewMode(option.id)}
                className={`relative rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  active
                    ? 'text-slate-950 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-view-mode-indicator"
                    transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-white/[0.12] dark:ring-white/[0.12]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>{option.label}</span>
                  {option.id === 'anual' && (
                    <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                      Em breve
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
