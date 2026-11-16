import { PieChart as PieChartIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { formatBRL, formatPercentPtBR } from '../lib/format';
import type { TagExpenseSlice, TagId } from '../types/finance';
import { InfoTooltip } from './InfoTooltip';

interface ExpensesByTagsCardProps {
  year: number;
  monthIndex: number;
  totalExpenses: number;
  slices: TagExpenseSlice[];
}

interface ArcSegment extends TagExpenseSlice {
  pathData: string;
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

function buildArcSegments(slices: TagExpenseSlice[]): ArcSegment[] {
  const cx = 105;
  const cy = 105;
  const radius = 88;
  let currentAngle = 0;

  return slices.map((slice) => {
    const angleSpan = (slice.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle = endAngle;

    return {
      ...slice,
      pathData: describePieSlice(cx, cy, radius, startAngle, endAngle),
    };
  });
}

export function ExpensesByTagsCard({
  year,
  monthIndex,
  totalExpenses,
  slices,
}: ExpensesByTagsCardProps) {
  const [hoveredId, setHoveredId] = useState<TagId | null>(null);
  const [selectedId, setSelectedId] = useState<TagId | null>(null);

  const segments = buildArcSegments(slices);
  const activeId = hoveredId ?? selectedId;
  const activeSlice = segments.find((s) => s.tagId === activeId) ?? null;

  const handleToggleSelect = (tagId: TagId) => {
    setSelectedId((prev) => (prev === tagId ? null : tagId));
  };

  return (
    <motion.section
      aria-label="Despesas por tags"
      data-testid="expenses-by-tags-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass flex h-full flex-col rounded-2xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Despesas por tags
          </h2>
          <InfoTooltip
            text="Agrupa as despesas do período exclusivamente por tags de classificação. Em lançamentos com múltiplas tags, o valor é rateado proporcionalmente para evitar duplicação do total."
            label="Informações sobre despesas por tags"
            align="right"
          />
        </div>

        {selectedId && (
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Limpar seleção
          </button>
        )}
      </div>

      {segments.length === 0 ? (
        <div
          data-testid="tags-empty-state"
          className="flex flex-1 flex-col items-center justify-center py-12 text-center"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/[0.045] text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <PieChartIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nenhuma despesa registrada
          </p>
          <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Quando houver saídas neste mês, a distribuição por tags aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-between">
          {/* LEFT REGION — 2D PIE CHART */}
          <div className="relative flex shrink-0 items-center justify-center md:w-[36%]">
            <motion.svg
              key={`tags-pie-${year}-${monthIndex}`}
              viewBox="0 0 210 210"
              className="h-[168px] w-[168px] overflow-visible sm:h-[180px] sm:w-[180px] xl:h-[164px] xl:w-[164px]"
              role="img"
              aria-label={`Gráfico de pizza das despesas por tags totalizando ${formatBRL(
                totalExpenses,
              )}`}
              initial={{ opacity: 0, scale: 0.9, rotate: -16 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            >
              {segments.map((seg, idx) => {
                const isHighlighted = activeId === seg.tagId;
                const isDimmed = activeId !== null && !isHighlighted;

                return (
                  <motion.path
                    key={seg.tagId}
                    d={seg.pathData}
                    fill={seg.color}
                    stroke="var(--lastro-pie-stroke)"
                    strokeWidth={segments.length > 1 ? 1.6 : 0}
                    strokeLinejoin="round"
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedId === seg.tagId}
                    aria-label={`${seg.name}: ${formatBRL(seg.amount)} (${formatPercentPtBR(
                      seg.percentage,
                    )})`}
                    onClick={() => handleToggleSelect(seg.tagId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleSelect(seg.tagId);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(seg.tagId)}
                    onMouseLeave={() =>
                      setHoveredId((prev) => (prev === seg.tagId ? null : prev))
                    }
                    onFocus={() => setHoveredId(seg.tagId)}
                    onBlur={() =>
                      setHoveredId((prev) => (prev === seg.tagId ? null : prev))
                    }
                    initial={{ opacity: 0, scale: 0.86 }}
                    animate={{
                      opacity: isDimmed ? 0.38 : 1,
                      scale: isHighlighted ? 1.05 : 1,
                    }}
                    transition={{
                      opacity: { duration: 0.16 },
                      scale: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                      default: { delay: idx * 0.03 },
                    }}
                    style={{ transformOrigin: '105px 105px', cursor: 'pointer', outline: 'none' }}
                  />
                );
              })}
            </motion.svg>

            {/* Animated Tooltip */}
            <AnimatePresence>
              {activeSlice && (
                <motion.div
                  key={activeSlice.tagId}
                  role="status"
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 3, scale: 0.96 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="liquid-glass-elevated pointer-events-none absolute -top-3 z-30 rounded-xl px-3 py-2 text-xs whitespace-nowrap"
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

          {/* RIGHT REGION — SYNCHRONIZED LEGEND */}
          <div className="w-full min-w-0 md:flex-1">
            <ul className="divide-y divide-slate-900/[0.06] dark:divide-white/[0.07]">
              {segments.map((slice) => {
                const isSelected = selectedId === slice.tagId;
                const isHighlighted = activeId === slice.tagId;
                const isDimmed = activeId !== null && !isHighlighted;

                return (
                  <li key={slice.tagId}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleToggleSelect(slice.tagId)}
                      onMouseEnter={() => setHoveredId(slice.tagId)}
                      onMouseLeave={() =>
                        setHoveredId((prev) => (prev === slice.tagId ? null : prev))
                      }
                      onFocus={() => setHoveredId(slice.tagId)}
                      onBlur={() =>
                        setHoveredId((prev) => (prev === slice.tagId ? null : prev))
                      }
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left text-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-500 ${
                        isSelected
                          ? 'bg-slate-900/[0.07] ring-1 ring-slate-900/10 dark:bg-white/[0.10] dark:ring-white/15'
                          : isHighlighted
                            ? 'bg-slate-900/[0.045] dark:bg-white/[0.065]'
                            : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]'
                      } ${isDimmed ? 'opacity-60' : 'opacity-100'}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: slice.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                          {slice.name}
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-2 tabular-nums">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">
                          {formatBRL(slice.amount)}
                        </span>
                        <span className="w-8 text-right text-slate-500 dark:text-slate-400">
                          {formatPercentPtBR(slice.percentage)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-slate-900/[0.08] px-2.5 pt-2.5 text-xs dark:border-white/[0.09]">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Total classificado
              </span>
              <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                {formatBRL(totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
