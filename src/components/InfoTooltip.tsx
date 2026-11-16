import { Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';

interface InfoTooltipProps {
  text: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export function InfoTooltip({ text, label, align = 'center' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const alignClass =
    align === 'right'
      ? 'right-0'
      : align === 'left'
        ? 'left-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-transform duration-150 hover:bg-slate-900/5 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-90 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`liquid-glass-elevated pointer-events-none absolute bottom-full z-40 mb-2 w-60 rounded-xl px-3.5 py-2.5 text-left text-xs leading-relaxed text-slate-700 dark:text-slate-200 ${alignClass}`}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
