import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  SlidersHorizontal,
  Target,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getCategoryMeta } from '../data/categories';
import { formatBRL } from '../lib/format';
import type {
  CategoryGoalProgress,
  CategoryGoalStatus,
  ExpenseCategoryId,
} from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { InfoTooltip } from './InfoTooltip';

interface FinancialGoalsSectionProps {
  goals: CategoryGoalProgress[];
  planningIncome: number;
  savedNoticeVisible: boolean;
  onOpenConfig: (focusCategoryId?: ExpenseCategoryId) => void;
}

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatGoalPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`;
}

function getStatusPresentation(status: CategoryGoalStatus) {
  switch (status) {
    case 'positive':
      return {
        label: 'Situação positiva',
        Icon: CheckCircle2,
        textClass: 'text-emerald-700 dark:text-emerald-400',
        badgeClass:
          'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/12 dark:text-emerald-300 dark:ring-emerald-400/25',
        barClass: 'bg-emerald-500 dark:bg-emerald-400',
      };
    case 'attention':
      return {
        label: 'Atenção moderada',
        Icon: AlertCircle,
        textClass: 'text-amber-700 dark:text-amber-400',
        badgeClass:
          'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:bg-amber-400/12 dark:text-amber-300 dark:ring-amber-400/25',
        barClass: 'bg-amber-500 dark:bg-amber-400',
      };
    case 'warning':
      return {
        label: 'Alerta evidente',
        Icon: AlertTriangle,
        textClass: 'text-orange-700 dark:text-orange-400',
        badgeClass:
          'bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:bg-orange-400/12 dark:text-orange-300 dark:ring-orange-400/25',
        barClass: 'bg-orange-500 dark:bg-orange-400',
      };
    case 'reached':
      return {
        label: 'Meta atingida',
        Icon: Target,
        textClass: 'text-blue-700 dark:text-blue-400',
        badgeClass:
          'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:bg-blue-400/12 dark:text-blue-300 dark:ring-blue-400/25',
        barClass: 'bg-blue-500 dark:bg-blue-400',
      };
    case 'exceeded':
      return {
        label: 'Meta ultrapassada',
        Icon: AlertOctagon,
        textClass: 'text-rose-700 dark:text-rose-400',
        badgeClass:
          'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:bg-rose-400/12 dark:text-rose-300 dark:ring-rose-400/25',
        barClass: 'bg-rose-500 dark:bg-rose-400',
      };
    default:
      return {
        label: 'Não definida',
        Icon: SlidersHorizontal,
        textClass: 'text-slate-600 dark:text-slate-400',
        badgeClass:
          'bg-slate-900/[0.05] text-slate-600 ring-slate-900/10 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/12',
        barClass: 'bg-slate-400',
      };
  }
}

export function FinancialGoalsSection({
  goals,
  planningIncome,
  savedNoticeVisible,
  onOpenConfig,
}: FinancialGoalsSectionProps) {
  const configuredCount = goals.filter((g) => g.status !== 'unconfigured').length;

  return (
    <motion.section
      aria-label="Metas Financeiras"
      data-testid="financial-goals-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-2xl p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Metas Financeiras
            </h2>
            <InfoTooltip
              text="As metas utilizam exclusivamente as categorias das despesas para acompanhar o planejamento mensal. Receitas não consomem metas."
              label="Informações sobre metas financeiras"
            />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Acompanhe seus gastos por categoria e mantenha seu planejamento financeiro dentro dos limites estabelecidos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden text-right text-[11px] text-slate-500 sm:block dark:text-slate-400">
            <p className="tabular-nums">
              Renda planejada: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBRL(planningIncome)}</span>
            </p>
            <p className="tabular-nums">
              {configuredCount} de {goals.length} categorias com meta
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            data-testid="configure-goals-button"
            onClick={() => onOpenConfig()}
            className="liquid-glass-elevated inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-100 dark:hover:text-blue-400"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Configurar metas</span>
          </motion.button>
        </div>
      </div>

      {/* Save Feedback */}
      <AnimatePresence>
        {savedNoticeVisible && (
          <motion.div
            data-testid="goals-saved-banner"
            role="status"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/12 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Metas financeiras atualizadas e salvas com sucesso.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Goals Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map((goal) => {
          const meta = getCategoryMeta(goal.categoryId);
          const statusUI = getStatusPresentation(goal.status);
          const StatusIcon = statusUI.Icon;
          const isUnconfigured = goal.status === 'unconfigured';

          return (
            <article
              key={goal.categoryId}
              data-testid={`goal-card-${goal.categoryId}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-900/[0.07] bg-white/50 p-4 transition-all duration-200 hover:bg-white/75 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.055]"
            >
              {/* Card Top: Icon + Name + Edit */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset"
                      style={{
                        backgroundColor: `${meta.color}16`,
                        color: meta.color,
                        borderColor: `${meta.color}28`,
                      }}
                    >
                      <CategoryIcon categoryId={goal.categoryId} className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        {goal.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {goal.mode === 'percentage'
                          ? `${formatGoalPercentage(goal.configuredValue)} da renda`
                          : goal.mode === 'fixed'
                            ? 'Valor fixo mensal'
                            : 'Meta pendente'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenConfig(goal.categoryId)}
                    aria-label={`Configurar meta de ${goal.name}`}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Status Indicator (Icon + Label) */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    data-testid={`goal-status-${goal.categoryId}`}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${statusUI.badgeClass}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{statusUI.label}</span>
                  </span>

                  {!isUnconfigured && goal.percentage !== null && (
                    <span
                      data-testid={`goal-percent-${goal.categoryId}`}
                      className={`text-xs font-semibold tabular-nums ${statusUI.textClass}`}
                    >
                      {formatGoalPercentage(goal.percentage)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body: Configured Progress OR Unconfigured Call-to-action */}
              {isUnconfigured ? (
                <div className="mt-4 flex flex-1 flex-col justify-between gap-3 border-t border-slate-900/[0.06] pt-3 dark:border-white/[0.07]">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Gasto no mês</span>
                      <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {formatBRL(goal.spent)}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Esta categoria ainda precisa de um limite mensal definido.
                    </p>
                  </div>

                  <button
                    type="button"
                    data-testid={`define-goal-${goal.categoryId}`}
                    onClick={() => onOpenConfig(goal.categoryId)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-white hover:text-blue-600 active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 dark:hover:bg-white/[0.12] dark:hover:text-blue-400"
                  >
                    <span>Definir meta</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 border-t border-slate-900/[0.06] pt-3 dark:border-white/[0.07]">
                  {/* Spent vs Limit */}
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <div>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Gasto
                      </span>
                      <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-50">
                        {formatBRL(goal.spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Limite
                      </span>
                      <span className="font-medium text-slate-700 tabular-nums dark:text-slate-300">
                        {formatBRL(goal.limit ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar — strictly capped at 100% */}
                  <div
                    className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-900/[0.08] dark:bg-white/[0.08]"
                    role="progressbar"
                    aria-label={`Progresso da meta de ${goal.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(goal.visualFillPercentage)}
                  >
                    <motion.div
                      data-testid={`goal-bar-${goal.categoryId}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.visualFillPercentage}%` }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full transition-colors duration-300 ${statusUI.barClass}`}
                    />
                  </div>

                  {/* Remaining or Exceeded highlight */}
                  {goal.status === 'exceeded' ? (
                    <div
                      data-testid={`goal-exceeded-${goal.categoryId}`}
                      className="mt-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-2.5 py-2 text-[11px] leading-snug text-rose-800 dark:border-rose-400/25 dark:bg-rose-500/[0.12] dark:text-rose-200"
                    >
                      <p className="font-semibold tabular-nums">
                        Excedente: {formatBRL(goal.exceeded)}
                      </p>
                      <p className="mt-0.5 text-[10px] opacity-90">
                        Gastos acima do limite mensal estipulado.
                      </p>
                    </div>
                  ) : goal.status === 'reached' ? (
                    <p className="mt-2.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                      Limite mensal atingido integralmente.
                    </p>
                  ) : (
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Restante</span>
                      <span className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                        {formatBRL(goal.remaining ?? 0)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </motion.section>
  );
}
