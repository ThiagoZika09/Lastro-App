import { Check, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { EXPENSE_CATEGORY_ORDER, getCategoryMeta } from '../data/categories';
import { resolveGoalLimit } from '../lib/finance';
import { formatBRL } from '../lib/format';
import type {
  CategoryGoalConfig,
  ExpenseCategoryId,
  GoalMode,
} from '../types/finance';
import { CategoryIcon } from './CategoryIcon';

interface GoalConfigModalProps {
  isOpen: boolean;
  goals: Record<ExpenseCategoryId, CategoryGoalConfig>;
  planningIncome: number;
  focusCategoryId: ExpenseCategoryId | null;
  onClose: () => void;
  onSave: (
    nextGoals: Record<ExpenseCategoryId, CategoryGoalConfig>,
    nextPlanningIncome: number,
  ) => void;
}

export function GoalConfigModal({
  isOpen,
  goals,
  planningIncome,
  focusCategoryId,
  onClose,
  onSave,
}: GoalConfigModalProps) {
  const [draftGoals, setDraftGoals] = useState<
    Record<ExpenseCategoryId, CategoryGoalConfig>
  >(goals);
  const [draftIncome, setDraftIncome] = useState<string>(String(planningIncome));
  const rowRefs = useRef<Partial<Record<ExpenseCategoryId, HTMLDivElement | null>>>(
    {},
  );

  // Sync draft state whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDraftGoals(goals);
    setDraftIncome(String(planningIncome));
  }, [isOpen, goals, planningIncome]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Scroll focused category row into view when opened from a category card
  useEffect(() => {
    if (!isOpen || !focusCategoryId) return;
    const timer = window.setTimeout(() => {
      rowRefs.current[focusCategoryId]?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isOpen, focusCategoryId]);

  const parsedIncome = Math.max(0, Number(draftIncome.replace(',', '.')) || 0);

  const handleModeChange = (categoryId: ExpenseCategoryId, mode: GoalMode) => {
    setDraftGoals((prev) => {
      const current = prev[categoryId];
      let nextValue = current.value;
      if (mode === 'none') {
        nextValue = 0;
      } else if (mode === 'percentage' && (current.mode !== 'percentage' || current.value <= 0)) {
        nextValue = 10;
      } else if (mode === 'fixed' && (current.mode !== 'fixed' || current.value <= 0)) {
        nextValue = 500;
      }
      return {
        ...prev,
        [categoryId]: { categoryId, mode, value: nextValue },
      };
    });
  };

  const handleValueChange = (categoryId: ExpenseCategoryId, rawValue: string) => {
    const normalized = Number(rawValue.replace(',', '.'));
    const safeNumber = Number.isFinite(normalized) ? Math.max(0, normalized) : 0;
    setDraftGoals((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        value:
          prev[categoryId].mode === 'percentage'
            ? Math.min(100, safeNumber)
            : safeNumber,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedGoals = { ...draftGoals };
    for (const catId of EXPENSE_CATEGORY_ORDER) {
      const item = cleanedGoals[catId];
      if (item.mode !== 'none' && item.value <= 0) {
        cleanedGoals[catId] = { categoryId: catId, mode: 'none', value: 0 };
      }
    }
    onSave(cleanedGoals, parsedIncome);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-config-modal-title"
          data-testid="goal-config-modal"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="liquid-glass-elevated relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-900/[0.07] px-6 py-5 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-400/15 dark:text-blue-400 dark:ring-blue-400/25">
                  <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="goal-config-modal-title"
                    className="text-base font-semibold text-slate-900 dark:text-slate-50"
                  >
                    Configurar Metas Financeiras
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina o limite mensal de gastos por categoria usando valor fixo ou percentual da renda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar configuração de metas"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {/* Planned Monthly Income */}
              <div className="rounded-2xl border border-slate-900/[0.07] bg-slate-900/[0.025] p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <label
                      htmlFor="planning-income-field"
                      className="block text-xs font-semibold text-slate-900 dark:text-slate-50"
                    >
                      Renda mensal considerada no planejamento (R$)
                    </label>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      Base utilizada para calcular metas definidas em percentual da renda.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-44">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      R$
                    </span>
                    <input
                      id="planning-income-field"
                      data-testid="planning-income-input"
                      type="number"
                      min={0}
                      step="50"
                      value={draftIncome}
                      onChange={(e) => setDraftIncome(e.target.value)}
                      className="w-full rounded-xl border border-slate-900/12 bg-white/85 py-2 pr-3 pl-9 text-right text-sm font-semibold text-slate-900 tabular-nums focus:border-blue-500 focus:outline-none dark:border-white/15 dark:bg-white/[0.07] dark:text-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Per-category configurations */}
              <div className="space-y-3">
                {EXPENSE_CATEGORY_ORDER.map((categoryId) => {
                  const meta = getCategoryMeta(categoryId);
                  const item = draftGoals[categoryId];
                  const computedLimit = resolveGoalLimit(item, parsedIncome);
                  const isFocused = focusCategoryId === categoryId;

                  return (
                    <div
                      key={categoryId}
                      ref={(el) => {
                        rowRefs.current[categoryId] = el;
                      }}
                      className={`rounded-2xl border p-4 transition-colors ${
                        isFocused
                          ? 'border-blue-500/45 bg-blue-500/[0.05] dark:border-blue-400/45 dark:bg-blue-400/[0.07]'
                          : 'border-slate-900/[0.07] bg-white/45 dark:border-white/[0.08] dark:bg-white/[0.025]'
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset"
                            style={{
                              backgroundColor: `${meta.color}16`,
                              color: meta.color,
                              borderColor: `${meta.color}28`,
                            }}
                          >
                            <CategoryIcon categoryId={categoryId} className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {meta.name}
                            </p>
                            <p className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                              {computedLimit !== null
                                ? `Limite calculado: ${formatBRL(computedLimit)}`
                                : 'Sem limite mensal definido'}
                            </p>
                          </div>
                        </div>

                        {/* Mode segmented control + numeric input */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div
                            className="inline-flex rounded-xl border border-slate-900/[0.08] bg-slate-900/[0.04] p-0.5 dark:border-white/[0.09] dark:bg-white/[0.04]"
                            role="group"
                            aria-label={`Tipo de meta para ${meta.name}`}
                          >
                            {(
                              [
                                { id: 'none', label: 'Sem meta' },
                                { id: 'fixed', label: 'Valor fixo' },
                                { id: 'percentage', label: '% renda' },
                              ] as const
                            ).map((modeOpt) => {
                              const active = item.mode === modeOpt.id;
                              return (
                                <button
                                  key={modeOpt.id}
                                  type="button"
                                  data-testid={`goal-mode-${categoryId}-${modeOpt.id}`}
                                  onClick={() => handleModeChange(categoryId, modeOpt.id)}
                                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                                    active
                                      ? 'bg-white text-slate-950 shadow-sm dark:bg-white/[0.14] dark:text-white'
                                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                  }`}
                                >
                                  {modeOpt.label}
                                </button>
                              );
                            })}
                          </div>

                          {item.mode !== 'none' && (
                            <div className="relative w-28">
                              <input
                                type="number"
                                min={0}
                                max={item.mode === 'percentage' ? 100 : undefined}
                                step={item.mode === 'percentage' ? '1' : '10'}
                                data-testid={`goal-input-${categoryId}`}
                                aria-label={`Valor da meta para ${meta.name}`}
                                value={item.value || ''}
                                onChange={(e) =>
                                  handleValueChange(categoryId, e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-900/12 bg-white/85 py-1.5 pr-7 pl-2.5 text-right text-xs font-semibold text-slate-900 tabular-nums focus:border-blue-500 focus:outline-none dark:border-white/15 dark:bg-white/[0.07] dark:text-slate-50"
                              />
                              <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {item.mode === 'percentage' ? '%' : 'R$'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-slate-900/[0.07] px-6 py-4 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900/[0.05] px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-900/[0.1] active:scale-95 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.14]"
              >
                Cancelar
              </button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                data-testid="save-goals-button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Salvar metas</span>
              </motion.button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
