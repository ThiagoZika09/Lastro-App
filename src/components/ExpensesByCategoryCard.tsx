import { PieChart as PieChartIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { formatBRL, formatPercentPtBR } from '../lib/format';
import type { CategoryExpenseSlice } from '../types/finance';
import { InfoTooltip } from './InfoTooltip';

interface ExpensesByCategoryCardProps {
  year: number;
  monthIndex: number;
  totalExpenses: number;
  slices: CategoryExpenseSlice[];
}

interface ArcSegment extends CategoryExpenseSlice {
  pathData: string;
  midAngleDeg: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describePieSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.99) {
    // Full circle as two semi-circles so SVG arc renders reliably
    return [
      `M ${cx} ${cy - r}`,
      `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
      `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`,
      'Z',
    ].join(' ');
  }
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = sweep <= 180 ? '0' : '1';
  return [
    `M ${cx} ${cy}`,
    `L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function buildArcSegments(slices: CategoryExpenseSlice[]): ArcSegment[] {
  const cx = 110;
  const cy = 110;
  const radius = 92;
  let currentAngle = 0;

  return slices.map((slice) => {
    const angleSpan = (slice.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngleDeg = startAngle + angleSpan / 2;
    currentAngle = endAngle;

    return {
      ...slice,
      pathData: describePieSlice(cx, cy, radius, startAngle, endAngle),
      midAngleDeg,
    };
  });
}

export function ExpensesByCategoryCard({
  year,
  monthIndex,
  totalExpenses,
  slices,
}: ExpensesByCategoryCardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const segments = buildArcSegments(slices);
  const activeSlice = segments.find((s) => s.categoryId === hoveredId) ?? null;

  return (
    <motion.section
      aria-label="Despesas por categoria"
      data-testid="expenses-by-category-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass flex h-full flex-col rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Despesas por categoria
          </h2>
          <InfoTooltip
            text="Distribuição percentual e em reais das despesas registradas no mês selecionado."
            label="Informações sobre despesas por categoria"
            align="right"
          />
        </div>
      </div>

      {segments.length === 0 ? (
        <div
          data-testid="category-empty-state"
          className="flex flex-1 flex-col items-center justify-center py-10 text-center"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/[0.045] text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <PieChartIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nenhuma despesa registrada
          </p>
          <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Quando houver saídas neste mês, a distribuição por categoria aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center justify-between">
          {/* 2D Pie Chart */}
          <div className="relative flex items-center justify-center">
            <motion.svg
              key={`pie-${year}-${monthIndex}`}
              viewBox="0 0 220 220"
              className="h-[196px] w-[196px] overflow-visible"
              role="img"
              aria-label={`Gráfico de pizza das despesas por categoria totalizando ${formatBRL(
                totalExpenses,
              )}`}
              initial={{ opacity: 0, scale: 0.9, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {segments.map((seg, idx) => {
                const isHovered = hoveredId === seg.categoryId;
                const isDimmed = hoveredId !== null && !isHovered;

                return (
                  <motion.path
                    key={seg.categoryId}
                    d={seg.pathData}
                    fill={seg.color}
                    stroke="var(--lastro-pie-stroke)"
                    strokeWidth={segments.length > 1 ? 1.5 : 0}
                    strokeLinejoin="round"
                    tabIndex={0}
                    role="button"
                    aria-label={`${seg.name}: ${formatBRL(seg.amount)} (${formatPercentPtBR(
                      seg.percentage,
                    )})`}
                    onMouseEnter={() => setHoveredId(seg.categoryId)}
                    onMouseLeave={() =>
                      setHoveredId((prev) => (prev === seg.categoryId ? null : prev))
                    }
                    onFocus={() => setHoveredId(seg.categoryId)}
                    onBlur={() =>
                      setHoveredId((prev) => (prev === seg.categoryId ? null : prev))
                    }
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{
                      opacity: isDimmed ? 0.42 : 1,
                      scale: isHovered ? 1.04 : 1,
                    }}
                    transition={{
                      opacity: { duration: 0.16 },
                      scale: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                      default: { delay: idx * 0.03 },
                    }}
                    style={{ transformOrigin: '110px 110px', cursor: 'pointer', outline: 'none' }}
                  />
                );
              })}
            </motion.svg>

            {/* Floating tooltip for hovered slice */}
            <AnimatePresence>
              {activeSlice && (
                <motion.div
                  key={activeSlice.categoryId}
                  role="status"
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 3, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="liquid-glass-elevated pointer-events-none absolute -top-2 z-30 rounded-xl px-3 py-2 text-xs whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: activeSlice.color }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                      {activeSlice.name}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 tabular-nums dark:text-slate-300">
                    {formatBRL(activeSlice.amount)}{' '}
                    <span className="text-slate-400 dark:text-slate-500">·</span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatPercentPtBR(activeSlice.percentage)}
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Legend */}
          <ul className="mt-4 w-full divide-y divide-slate-900/[0.05] dark:divide-white/[0.06]">
            {segments.map((slice) => {
              const isHovered = hoveredId === slice.categoryId;
              return (
                <li key={slice.categoryId}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredId(slice.categoryId)}
                    onMouseLeave={() =>
                      setHoveredId((prev) => (prev === slice.categoryId ? null : prev))
                    }
                    onFocus={() => setHoveredId(slice.categoryId)}
                    onBlur={() =>
                      setHoveredId((prev) => (prev === slice.categoryId ? null : prev))
                    }
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      isHovered
                        ? 'bg-slate-900/[0.045] dark:bg-white/[0.07]'
                        : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: slice.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {slice.name}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2 tabular-nums">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatBRL(slice.amount)}
                      </span>
                      <span className="w-9 text-right text-slate-500 dark:text-slate-400">
                        {formatPercentPtBR(slice.percentage)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </motion.section>
  );
}
