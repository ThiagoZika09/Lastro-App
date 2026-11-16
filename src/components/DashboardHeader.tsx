import { motion } from 'motion/react';
import type { DashboardViewMode } from '../types/finance';

interface DashboardHeaderProps {
  isFutureMonth: boolean;
  viewMode: DashboardViewMode;
  onChangeViewMode: (mode: DashboardViewMode) => void;
}

export function DashboardHeader({
  isFutureMonth,
  viewMode,
  onChangeViewMode,
}: DashboardHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Modo de visualização financeira"
          className="liquid-glass inline-flex items-center gap-1 rounded-xl p-1"
        >
          {(
            [
              { id: 'mensal', label: 'Mensal' },
              { id: 'anual', label: 'Anual' },
            ] as const
          ).map((option) => {
            const active = viewMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeViewMode(option.id)}
                className={`relative rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  active
                    ? 'text-slate-950 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-view-mode-indicator"
                    transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                    className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-white/[0.12] dark:ring-white/[0.12]"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>{option.label}</span>
                  {option.id === 'anual' && (
                    <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                      Em breve
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
          Visão consolidada do seu controle financeiro pessoal
        </p>
      </div>

      {isFutureMonth && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Período futuro · sem lançamentos realizados
        </span>
      )}
    </div>
  );
}
