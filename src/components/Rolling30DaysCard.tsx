import { CalendarRange, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { formatBRL } from '../lib/format';
import type { RollingPeriodSummary } from '../types/finance';
import { InfoTooltip } from './InfoTooltip';

interface Rolling30DaysCardProps {
  rolling: RollingPeriodSummary;
}

function formatShortBrDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function Rolling30DaysCard({ rolling }: Rolling30DaysCardProps) {
  const state =
    rolling.balance > 0 ? 'positive' : rolling.balance < 0 ? 'negative' : 'neutral';

  const resultColor =
    state === 'positive'
      ? 'text-emerald-700 dark:text-emerald-400'
      : state === 'negative'
        ? 'text-rose-700 dark:text-rose-400'
        : 'text-slate-900 dark:text-slate-100';

  const StateIcon =
    state === 'positive' ? TrendingUp : state === 'negative' ? TrendingDown : Minus;

  const stateLabel =
    state === 'positive'
      ? 'Superávit no período'
      : state === 'negative'
        ? 'Déficit no período'
        : 'Equilibrado';

  const totalVolume = rolling.income + rolling.expenses;
  const incomeRatio = totalVolume > 0 ? (rolling.income / totalVolume) * 100 : 50;

  return (
    <motion.section
      aria-label="Resultado dos últimos 30 dias"
      data-testid="rolling-30-days-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-2xl p-5 sm:px-6"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        {/* Zone 1: Title + Rolling Window */}
        <div className="min-w-0 lg:max-w-xs">
          <div className="flex items-center gap-1.5">
            <CalendarRange
              className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Resultado dos últimos 30 dias
            </h2>
            <InfoTooltip
              text="Considera todas as receitas e despesas dos últimos 30 dias a partir da data atual, independentemente do mês selecionado no cabeçalho."
              label="Informações sobre o resultado dos últimos 30 dias"
              align="left"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
            Janela móvel contínua · {formatShortBrDate(rolling.startDate)} a{' '}
            {formatShortBrDate(rolling.endDate)}
          </p>
        </div>

        {/* Zone 2: Balance Result + Visual Ratio Bar */}
        <div className="flex flex-1 flex-col gap-2 lg:max-w-md">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={`tabular-nums text-2xl font-semibold tracking-tight ${resultColor}`}>
              {formatBRL(rolling.balance)}
            </p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${resultColor}`}>
              <StateIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{stateLabel}</span>
            </span>
          </div>

          <div
            className="h-2 w-full overflow-hidden rounded-full bg-rose-500/20 dark:bg-rose-400/20"
            aria-hidden="true"
          >
            {totalVolume > 0 ? (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${incomeRatio}%`, transformOrigin: 'left center' }}
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
              />
            ) : (
              <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
            )}
          </div>
        </div>

        {/* Zone 3: Inflows vs Outflows */}
        <div className="grid grid-cols-2 gap-6 border-t border-slate-900/[0.06] pt-3.5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-white/[0.07]">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Receitas (30d)</p>
            <p className="mt-0.5 tabular-nums text-base font-semibold text-emerald-700 dark:text-emerald-400">
              {formatBRL(rolling.income)}
            </p>
          </div>
          <div className="text-right lg:text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400">Despesas (30d)</p>
            <p className="mt-0.5 tabular-nums text-base font-semibold text-rose-700 dark:text-rose-400">
              {formatBRL(rolling.expenses)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
