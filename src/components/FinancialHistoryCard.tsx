import { BarChart3 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { formatBRL, formatCompactBRL } from '../lib/format';
import type { HistoryPoint, HistoryRangeMonths } from '../types/finance';
import { InfoTooltip } from './InfoTooltip';

interface FinancialHistoryCardProps {
  points: HistoryPoint[];
  rangeMonths: HistoryRangeMonths;
  onChangeRange: (range: HistoryRangeMonths) => void;
}

const RANGE_OPTIONS: Array<{ value: HistoryRangeMonths; label: string }> = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '1 ano' },
];

function computeNiceMax(rawMax: number): number {
  if (rawMax <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  let step = 1;
  if (normalized <= 1.2) step = 1.2;
  else if (normalized <= 1.5) step = 1.5;
  else if (normalized <= 2) step = 2;
  else if (normalized <= 2.5) step = 2.5;
  else if (normalized <= 3) step = 3;
  else if (normalized <= 4) step = 4;
  else if (normalized <= 5) step = 5;
  else if (normalized <= 6) step = 6;
  else if (normalized <= 8) step = 8;
  else step = 10;
  return step * magnitude;
}

export function FinancialHistoryCard({
  points,
  rangeMonths,
  onChangeRange,
}: FinancialHistoryCardProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const hasAnyData = points.some((p) => p.income > 0 || p.expenses > 0);
  const rawMax = points.reduce(
    (max, p) => Math.max(max, p.income, p.expenses),
    0,
  );
  const axisMax = computeNiceMax(rawMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => axisMax * ratio);

  return (
    <motion.section
      aria-label="Histórico financeiro"
      data-testid="financial-history-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-2xl p-5 sm:p-6"
    >
      {/* Header + Series Legend + Range Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Histórico financeiro
            </h2>
            <InfoTooltip
              text="Comparativo mensal entre receitas e despesas reais registradas no intervalo selecionado."
              label="Informações sobre o histórico financeiro"
            />
          </div>

          {/* Series legend */}
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500 dark:bg-emerald-400"
                aria-hidden="true"
              />
              <span>Receitas</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-[3px] bg-rose-500 dark:bg-rose-400"
                aria-hidden="true"
              />
              <span>Despesas</span>
            </span>
          </div>
        </div>

        {/* Period Filter Segmented Control */}
        <div
          role="group"
          aria-label="Filtro de intervalo do histórico"
          className="inline-flex items-center gap-1 rounded-xl bg-slate-900/[0.045] p-1 dark:bg-white/[0.06]"
        >
          {RANGE_OPTIONS.map((opt) => {
            const active = rangeMonths === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChangeRange(opt.value)}
                className={`relative rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  active
                    ? 'text-slate-950 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="history-range-pill"
                    transition={{ type: 'spring', stiffness: 430, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-white/[0.12] dark:ring-white/[0.12]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      {!hasAnyData ? (
        <div
          data-testid="history-empty-state"
          className="flex flex-col items-center justify-center py-14 text-center"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/[0.045] text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Sem movimentações no período selecionado
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Não há receitas ou despesas registradas nos meses deste intervalo.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div className="relative flex h-[240px] gap-3 sm:h-[260px] sm:gap-4">
            {/* Y-Axis Labels */}
            <div
              aria-hidden="true"
              className="flex h-full shrink-0 flex-col-reverse justify-between pb-7 text-right text-[11px] text-slate-400 tabular-nums dark:text-slate-500"
            >
              {ticks.map((val, idx) => (
                <span key={idx} className="leading-none">
                  {formatCompactBRL(val)}
                </span>
              ))}
            </div>

            {/* Plot Area */}
            <div className="relative flex-1 pb-7">
              {/* Horizontal gridlines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 bottom-7 flex flex-col-reverse justify-between"
              >
                {ticks.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-full border-t ${
                      idx === 0
                        ? 'border-slate-900/12 dark:border-white/15'
                        : 'border-dashed border-slate-900/[0.06] dark:border-white/[0.07]'
                    }`}
                  />
                ))}
              </div>

              {/* Grouped Bars */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`bars-${rangeMonths}-${points[points.length - 1]?.key}`}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.35 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 grid h-full items-end gap-1.5 sm:gap-2.5"
                  style={{
                    gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
                  }}
                >
                  {points.map((point, idx) => {
                    const incomePct = axisMax > 0 ? (point.income / axisMax) * 100 : 0;
                    const expensePct = axisMax > 0 ? (point.expenses / axisMax) * 100 : 0;
                    const isHovered = hoveredKey === point.key;
                    const tooltipAlign =
                      idx <= 1
                        ? 'left-0'
                        : idx >= points.length - 2
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2';

                    return (
                      <div
                        key={point.key}
                        className="relative flex h-full flex-col justify-end"
                        onMouseEnter={() => setHoveredKey(point.key)}
                        onMouseLeave={() =>
                          setHoveredKey((prev) => (prev === point.key ? null : prev))
                        }
                      >
                        <button
                          type="button"
                          onFocus={() => setHoveredKey(point.key)}
                          onBlur={() =>
                            setHoveredKey((prev) => (prev === point.key ? null : prev))
                          }
                          aria-label={`${point.fullLabel}: Receitas ${formatBRL(
                            point.income,
                          )}, Despesas ${formatBRL(point.expenses)}`}
                          className={`group relative flex h-full w-full items-end justify-center gap-1 rounded-t-xl px-1 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 sm:gap-1.5 ${
                            isHovered
                              ? 'bg-slate-900/[0.035] dark:bg-white/[0.045]'
                              : ''
                          }`}
                        >
                          {/* Receitas bar */}
                          <div className="flex h-full w-full max-w-[18px] items-end">
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{
                                duration: 0.42,
                                delay: idx * 0.025,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              style={{
                                height: `${Math.max(incomePct, point.income > 0 ? 2 : 0)}%`,
                                transformOrigin: 'bottom',
                              }}
                              className="w-full rounded-t-md bg-emerald-500/88 transition-opacity group-hover:opacity-100 dark:bg-emerald-400/85"
                            />
                          </div>

                          {/* Despesas bar */}
                          <div className="flex h-full w-full max-w-[18px] items-end">
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{
                                duration: 0.42,
                                delay: idx * 0.025 + 0.04,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              style={{
                                height: `${Math.max(expensePct, point.expenses > 0 ? 2 : 0)}%`,
                                transformOrigin: 'bottom',
                              }}
                              className="w-full rounded-t-md bg-rose-500/85 transition-opacity group-hover:opacity-100 dark:bg-rose-400/85"
                            />
                          </div>
                        </button>

                        {/* X-Axis month label */}
                        <span
                          className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap transition-colors sm:text-[11px] ${
                            isHovered
                              ? 'font-semibold text-slate-900 dark:text-slate-100'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {point.shortLabel}
                        </span>

                        {/* Floating Tooltip */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              role="tooltip"
                              initial={{ opacity: 0, y: 4, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 3, scale: 0.97 }}
                              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                              className={`liquid-glass-elevated pointer-events-none absolute top-1 z-30 w-48 rounded-xl p-3 text-xs ${tooltipAlign}`}
                            >
                              <p className="font-semibold text-slate-900 dark:text-slate-50">
                                {point.fullLabel}
                              </p>
                              <div className="mt-2 space-y-1 border-t border-slate-900/[0.06] pt-2 dark:border-white/[0.08]">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Receitas
                                  </span>
                                  <span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">
                                    {formatBRL(point.income)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Despesas
                                  </span>
                                  <span className="font-semibold text-rose-700 tabular-nums dark:text-rose-400">
                                    {formatBRL(point.expenses)}
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
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
