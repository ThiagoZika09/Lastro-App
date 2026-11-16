import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ModulePlaceholderViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
  contextLabel?: string;
  onReturnToDashboard: () => void;
}

export function ModulePlaceholderView({
  title,
  description,
  icon: Icon,
  contextLabel = 'Módulo planejado para as próximas etapas',
  onReturnToDashboard,
}: ModulePlaceholderViewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass mx-auto mt-8 flex max-w-xl flex-col items-center rounded-3xl px-8 py-14 text-center"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/[0.05] text-slate-700 ring-1 ring-slate-900/[0.08] dark:bg-white/[0.07] dark:text-slate-200 dark:ring-white/[0.1]">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {contextLabel}
      </p>

      <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {title}
      </h2>

      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {description}
      </p>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onReturnToDashboard}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Voltar ao Dashboard</span>
      </motion.button>
    </motion.section>
  );
}
