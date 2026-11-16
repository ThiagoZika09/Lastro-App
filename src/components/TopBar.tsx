import { ChevronLeft, ChevronRight, Menu, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatMonthYearPtBR } from '../lib/format';

interface TopBarProps {
  pageTitle: string;
  showPeriodSelector: boolean;
  year: number;
  monthIndex: number;
  direction: number;
  isCurrentMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetCurrentMonth: () => void;
  onOpenMobileMenu: () => void;
}

export function TopBar({
  pageTitle,
  showPeriodSelector,
  year,
  monthIndex,
  direction,
  isCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onResetCurrentMonth,
  onOpenMobileMenu,
}: TopBarProps) {
  const periodLabel = formatMonthYearPtBR(year, monthIndex);

  return (
    <header
      data-testid="fixed-top-bar"
      className="liquid-glass-topbar sticky top-0 z-20 w-full transition-colors duration-300"
    >
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1384px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        {/* Left region: Mobile menu trigger + Brand / Page Title */}
        <div className="flex min-w-0 items-center gap-3 md:flex-1">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu lateral"
            className="liquid-glass inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-transform active:scale-95 lg:hidden dark:text-slate-200"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {pageTitle}
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline dark:text-slate-500" aria-hidden="true">
              /
            </span>
            <span className="hidden truncate text-xs font-medium text-slate-500 sm:inline dark:text-slate-400">
              Lastro
            </span>
          </div>
        </div>

        {/* Center region: Period selector (moved here cleanly, never duplicated) */}
        {showPeriodSelector && (
          <div className="order-3 flex w-full justify-center md:order-2 md:w-auto">
            <div className="liquid-glass inline-flex w-full items-center justify-between gap-1 rounded-2xl p-1 sm:w-[272px]">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9, x: -1.5 }}
                onClick={onPrevMonth}
                aria-label="Mês anterior"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:bg-white/[0.09] dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </motion.button>

              <div className="relative flex h-8 flex-1 items-center justify-center overflow-hidden px-2">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.span
                    key={`${year}-${monthIndex}`}
                    custom={direction}
                    initial={{ opacity: 0, y: direction >= 0 ? 6 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: direction >= 0 ? -6 : 6 }}
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
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:bg-white/[0.09] dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        )}

        {/* Right region: Reserved area for future quick actions + contextual return-to-current-month */}
        <div className="order-2 flex items-center justify-end md:order-3 md:flex-1">
          {showPeriodSelector && !isCurrentMonth && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileTap={{ scale: 0.96 }}
              onClick={onResetCurrentMonth}
              className="liquid-glass inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-blue-600 whitespace-nowrap shrink-0 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mês atual</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
