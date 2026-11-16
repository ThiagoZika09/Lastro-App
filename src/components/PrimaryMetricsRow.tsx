import { ArrowDownRight, ArrowUpRight, Minus, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatBRL } from '../lib/format';
import type { MonthlySummary } from '../types/finance';
import { InfoTooltip } from './InfoTooltip';

interface PrimaryMetricsRowProps {
  summary: MonthlySummary;
}

export function PrimaryMetricsRow({ summary }: PrimaryMetricsRowProps) {
  const balanceState =
    summary.balance > 0 ? 'positive' : summary.balance < 0 ? 'negative' : 'neutral';

  const balanceTextColor =
    balanceState === 'positive'
      ? 'text-emerald-700 dark:text-emerald-400'
      : balanceState === 'negative'
        ? 'text-rose-700 dark:text-rose-400'
        : 'text-slate-900 dark:text-slate-100';

  const balanceBadgeColor =
    balanceState === 'positive'
      ? 'text-emerald-700 dark:text-emerald-400'
      : balanceState === 'negative'
        ? 'text-rose-700 dark:text-rose-400'
        : 'text-slate-500 dark:text-slate-400';

  const balanceLabel =
    balanceState === 'positive'
      ? 'Resultado positivo'
      : balanceState === 'negative'
        ? 'Resultado negativo'
        : 'Saldo neutro';

  const BalanceStateIcon =
    balanceState === 'positive'
      ? TrendingUp
      : balanceState === 'negative'
        ? TrendingDown
        : Minus;

  const cards = [
    {
      id: 'income',
      title: 'Receitas',
      value: summary.income,
      description: 'Entradas registradas no período',
      tooltip:
        'Representa a soma de todas as entradas financeiras registradas durante o período selecionado.',
      icon: ArrowUpRight,
      iconWrapperClass:
        'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/25',
      valueClass: 'text-slate-900 dark:text-slate-50',
      subElement: null as React.ReactNode,
    },
    {
      id: 'expenses',
      title: 'Despesas',
      value: summary.expenses,
      description: 'Saídas registradas no período',
      tooltip:
        'Representa a soma de todas as saídas financeiras registradas durante o período selecionado.',
      icon: ArrowDownRight,
      iconWrapperClass:
        'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/25',
      valueClass: 'text-slate-900 dark:text-slate-50',
      subElement: null as React.ReactNode,
    },
    {
      id: 'balance',
      title: 'Saldo disponível',
      value: summary.balance,
      description: 'Receitas menos despesas do mês',
      tooltip:
        'Representa a diferença entre todas as receitas e despesas registradas no período selecionado.',
      icon: Scale,
      iconWrapperClass:
        balanceState === 'positive'
          ? 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/25'
          : balanceState === 'negative'
            ? 'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/25'
            : 'bg-slate-500/12 text-slate-600 ring-1 ring-slate-500/20 dark:bg-slate-400/15 dark:text-slate-300 dark:ring-slate-400/25',
      valueClass: balanceTextColor,
      subElement: (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${balanceBadgeColor}`}>
          <BalanceStateIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{balanceLabel}</span>
        </span>
      ),
    },
  ];

  return (
    <section
      aria-label="Indicadores financeiros principais"
      className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.id}
            data-testid={`metric-card-${card.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{
              duration: 0.28,
              delay: index * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="liquid-glass relative rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.iconWrapperClass}`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1">
                  <h2 className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {card.title}
                  </h2>
                  <InfoTooltip
                    text={card.tooltip}
                    label={`Informações sobre ${card.title}`}
                    align="center"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${card.id}-${summary.year}-${summary.monthIndex}-${card.value}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`tabular-nums text-2xl font-semibold tracking-tight lg:text-[26px] ${card.valueClass}`}
                >
                  {formatBRL(card.value)}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {card.description}
              </p>
              {card.subElement}
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
