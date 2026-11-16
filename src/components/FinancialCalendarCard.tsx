import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { WEEKDAY_LABELS_PT_BR } from '../lib/finance';
import { formatBRL, formatCompactBRL, formatFullDatePtBR } from '../lib/format';
import type { CalendarDayCell } from '../types/finance';
import { InfoTooltip } from './InfoTooltip';

interface FinancialCalendarCardProps {
  year: number;
  monthIndex: number;
  cells: CalendarDayCell[];
  onSelectDay: (day: CalendarDayCell) => void;
}

function getIntensityClasses(intensity: CalendarDayCell['intensity']): string {
  switch (intensity) {
    case 1:
      return 'bg-rose-500/[0.06] border-rose-500/15 hover:bg-rose-500/[0.11] dark:bg-rose-400/[0.08] dark:border-rose-400/15 dark:hover:bg-rose-400/[0.14]';
    case 2:
      return 'bg-rose-500/[0.12] border-rose-500/25 hover:bg-rose-500/[0.18] dark:bg-rose-400/[0.14] dark:border-rose-400/25 dark:hover:bg-rose-400/[0.21]';
    case 3:
      return 'bg-rose-500/[0.20] border-rose-500/35 hover:bg-rose-500/[0.26] dark:bg-rose-400/[0.22] dark:border-rose-400/35 dark:hover:bg-rose-400/[0.29]';
    case 4:
      return 'bg-rose-500/[0.28] border-rose-500/45 hover:bg-rose-500/[0.34] dark:bg-rose-500/[0.32] dark:border-rose-400/45 dark:hover:bg-rose-500/[0.38]';
    default:
      return 'bg-white/45 border-slate-900/[0.06] hover:bg-white/75 dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:bg-white/[0.07]';
  }
}

export function FinancialCalendarCard({
  year,
  monthIndex,
  cells,
  onSelectDay,
}: FinancialCalendarCardProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  return (
    <motion.section
      aria-label="Calendário financeiro mensal"
      data-testid="financial-calendar-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass flex h-full flex-col rounded-2xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Calendário financeiro
          </h2>
          <InfoTooltip
            text="Exibe o total de despesas de cada dia com escala de intensidade relativa aos gastos do próprio mês. Clique em qualquer dia para ver os detalhes."
            label="Informações sobre o calendário financeiro"
          />
        </div>

        {/* Relative intensity legend */}
        <div
          className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"
          aria-label="Escala relativa de gastos"
        >
          <span>Menor gasto</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-[4px] border border-slate-900/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]" />
            <span className="h-2.5 w-2.5 rounded-[4px] bg-rose-500/15 dark:bg-rose-400/15" />
            <span className="h-2.5 w-2.5 rounded-[4px] bg-rose-500/30 dark:bg-rose-400/30" />
            <span className="h-2.5 w-2.5 rounded-[4px] bg-rose-500/50 dark:bg-rose-400/50" />
          </span>
          <span>Maior gasto</span>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_LABELS_PT_BR.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${year}-${monthIndex}`}
          initial={{ opacity: 0.45, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.45, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid flex-1 auto-rows-fr grid-cols-7 gap-1.5 sm:gap-2"
        >
          {cells.map((cell, index) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={cell.date}
                  aria-hidden="true"
                  className="flex min-h-[58px] flex-col justify-between rounded-xl border border-transparent p-1.5 opacity-30 sm:min-h-[76px] sm:p-2"
                >
                  <span className="text-[11px] font-medium text-slate-400 tabular-nums dark:text-slate-600">
                    {String(cell.dayNumber).padStart(2, '0')}
                  </span>
                </div>
              );
            }

            const colIndex = index % 7;
            const isHovered = hoveredDate === cell.date;
            const tooltipAlignClass =
              colIndex <= 1
                ? 'left-0'
                : colIndex >= 5
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2';

            return (
              <div
                key={cell.date}
                className="relative"
                onMouseEnter={() => setHoveredDate(cell.date)}
                onMouseLeave={() => setHoveredDate((prev) => (prev === cell.date ? null : prev))}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectDay(cell)}
                  onFocus={() => setHoveredDate(cell.date)}
                  onBlur={() => setHoveredDate((prev) => (prev === cell.date ? null : prev))}
                  aria-label={`${formatFullDatePtBR(cell.date)}, despesas ${formatBRL(
                    cell.expenses,
                  )}, receitas ${formatBRL(cell.income)}`}
                  className={`group flex h-full min-h-[58px] w-full flex-col justify-between rounded-xl border p-1.5 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 sm:min-h-[76px] sm:p-2 ${getIntensityClasses(
                    cell.intensity,
                  )} ${
                    cell.isToday
                      ? 'ring-2 ring-blue-500/75 dark:ring-blue-400/75'
                      : ''
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        cell.isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {String(cell.dayNumber).padStart(2, '0')}
                    </span>

                    {cell.income > 0 && (
                      <span
                        className="text-[10px] font-semibold text-emerald-700 tabular-nums dark:text-emerald-400"
                        title={`Receitas: ${formatBRL(cell.income)}`}
                      >
                        +
                      </span>
                    )}
                  </div>

                  <div className="w-full overflow-hidden">
                    <span
                      className={`hidden truncate text-[11px] font-medium tracking-tight tabular-nums sm:block ${
                        cell.expenses > 0
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {formatBRL(cell.expenses)}
                    </span>
                    <span
                      className={`block truncate text-[10px] font-medium tabular-nums sm:hidden ${
                        cell.expenses > 0
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {cell.expenses > 0 ? formatCompactBRL(cell.expenses) : 'R$ 0'}
                    </span>
                  </div>
                </motion.button>

                {/* Hover / Focus Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      role="tooltip"
                      initial={{ opacity: 0, y: 4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 3, scale: 0.97 }}
                      transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                      className={`liquid-glass-elevated pointer-events-none absolute bottom-full z-40 mb-2 w-52 rounded-xl p-3 text-xs ${tooltipAlignClass}`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {formatFullDatePtBR(cell.date)}
                      </p>
                      <div className="mt-2 space-y-1 border-t border-slate-900/[0.06] pt-2 dark:border-white/[0.08]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Despesas</span>
                          <span className="font-medium text-rose-700 tabular-nums dark:text-rose-400">
                            {formatBRL(cell.expenses)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Receitas</span>
                          <span className="font-medium text-emerald-700 tabular-nums dark:text-emerald-400">
                            {formatBRL(cell.income)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-900/[0.06] pt-1 dark:border-white/[0.08]">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            Resultado
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${
                              cell.balance > 0
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : cell.balance < 0
                                  ? 'text-rose-700 dark:text-rose-400'
                                  : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {formatBRL(cell.balance)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
