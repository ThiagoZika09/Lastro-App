import { ArrowDownRight, ArrowUpRight, Calendar, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { getCategoryMeta } from '../data/categories';
import { getTagMeta } from '../data/tags';
import { formatBRL, formatFullDatePtBR } from '../lib/format';
import type { CalendarDayCell } from '../types/finance';

interface DayTransactionsModalProps {
  day: CalendarDayCell | null;
  onClose: () => void;
}

export function DayTransactionsModal({ day, onClose }: DayTransactionsModalProps) {
  useEffect(() => {
    if (!day) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [day, onClose]);

  return (
    <AnimatePresence>
      {day && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="day-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            data-testid="day-transactions-modal"
            className="liquid-glass-elevated relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/12 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-400/15 dark:text-blue-400 dark:ring-blue-400/25">
                  <Calendar className="h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="day-modal-title"
                    className="text-base font-semibold text-slate-900 dark:text-slate-50"
                  >
                    {formatFullDatePtBR(day.date)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {day.transactions.length === 0
                      ? 'Nenhum lançamento registrado'
                      : `${day.transactions.length} ${
                          day.transactions.length === 1
                            ? 'lançamento registrado'
                            : 'lançamentos registrados'
                        }`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar detalhes do dia"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-900/[0.06] hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Daily summary strip */}
            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-slate-900/[0.07] py-3.5 dark:border-white/[0.08]">
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Receitas</p>
                <p className="mt-0.5 tabular-nums text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatBRL(day.income)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Despesas</p>
                <p className="mt-0.5 tabular-nums text-sm font-semibold text-rose-700 dark:text-rose-400">
                  {formatBRL(day.expenses)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Resultado</p>
                <p
                  className={`mt-0.5 tabular-nums text-sm font-semibold ${
                    day.balance > 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : day.balance < 0
                        ? 'text-rose-700 dark:text-rose-400'
                        : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {formatBRL(day.balance)}
                </p>
              </div>
            </div>

            {/* Transactions list */}
            <div className="mt-4 max-h-64 overflow-y-auto pr-1">
              {day.transactions.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Sem movimentações nesta data
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Os lançamentos adicionados neste dia aparecerão aqui assim que o módulo de Lançamentos estiver ativo.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-900/[0.06] dark:divide-white/[0.07]">
                  {day.transactions.map((tx) => {
                    const cat = getCategoryMeta(tx.categoryId);
                    const isIncome = tx.type === 'income';
                    const tagLabels =
                      tx.tagIds && tx.tagIds.length > 0
                        ? tx.tagIds.map((id) => getTagMeta(id).name).join(', ')
                        : 'Sem tag';
                    return (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              isIncome
                                ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
                                : 'bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                              {tx.description}
                            </p>
                            <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: cat.color }}
                                aria-hidden="true"
                              />
                              <span>{cat.name}</span>
                              {!isIncome && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate text-slate-400 dark:text-slate-500">
                                    Tags: {tagLabels}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 tabular-nums text-sm font-semibold ${
                            isIncome
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {isIncome ? `+${formatBRL(tx.amount)}` : `-${formatBRL(tx.amount)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-900/[0.06] pt-4 dark:border-white/[0.07]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900/5 px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-900/10 active:scale-95 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
