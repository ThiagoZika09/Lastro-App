import {
  ArrowLeftRight,
  BarChart3,
  Compass,
  LayoutDashboard,
  LineChart,
  Moon,
  Pin,
  PinOff,
  Settings,
  Sun,
  Tags,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { NavigationSectionId } from '../types/finance';

export interface NavItemConfig {
  id: NavigationSectionId;
  label: string;
  description: string;
  available: boolean;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Visão geral financeira do mês e histórico consolidado.',
    available: true,
    icon: LayoutDashboard,
  },
  {
    id: 'lancamentos',
    label: 'Lançamentos',
    description: 'Registro completo, edição e conciliação de entradas e saídas.',
    available: false,
    icon: ArrowLeftRight,
  },
  {
    id: 'receitas',
    label: 'Receitas',
    description: 'Acompanhamento detalhado de fontes de renda e recebimentos.',
    available: false,
    icon: TrendingUp,
  },
  {
    id: 'despesas',
    label: 'Despesas',
    description: 'Controle granular de gastos recorrentes e eventuais.',
    available: false,
    icon: TrendingDown,
  },
  {
    id: 'planejamento',
    label: 'Planejamento',
    description: 'Projeções financeiras e cenários de médio e longo prazo.',
    available: false,
    icon: Compass,
  },
  {
    id: 'orcamentos',
    label: 'Orçamentos',
    description: 'Limites mensais por categoria com acompanhamento progressivo.',
    available: false,
    icon: Target,
  },
  {
    id: 'investimentos',
    label: 'Investimentos',
    description: 'Carteira de ativos, alocação patrimonial e rentabilidade.',
    available: false,
    icon: LineChart,
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    description: 'Análises comparativas e exportação estruturada de dados.',
    available: false,
    icon: BarChart3,
  },
  {
    id: 'categorias',
    label: 'Categorias',
    description: 'Personalização de categorias, cores e regras de classificação.',
    available: false,
    icon: Tags,
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    description: 'Preferências do sistema, moeda, contas e segurança.',
    available: false,
    icon: Settings,
  },
];

interface SidebarProps {
  activeSection: NavigationSectionId;
  onSelectSection: (section: NavigationSectionId) => void;
  isPinned: boolean;
  onTogglePin: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function LastroMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="6"
        className="fill-slate-900 dark:fill-white"
      />
      <path
        d="M8.25 7.5V15.25H15.75"
        className="stroke-white dark:stroke-slate-950"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="15.5"
        cy="8.5"
        r="1.5"
        className="fill-blue-400 dark:fill-blue-600"
      />
    </svg>
  );
}

export function Sidebar({
  activeSection,
  onSelectSection,
  isPinned,
  onTogglePin,
  theme,
  onToggleTheme,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [hovered, setHovered] = useState(false);
  const isExpanded = isPinned || hovered;

  const renderSidebarContent = (expanded: boolean, isMobile = false) => (
    <div className="flex h-full flex-col justify-between py-4">
      {/* Brand header */}
      <div className="px-3">
        <div
          className={`flex h-11 items-center ${
            expanded ? 'justify-between px-2.5' : 'justify-center px-0'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <LastroMark />
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap dark:text-slate-50"
                >
                  Lastro
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Fechar menu de navegação"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-transform hover:bg-slate-900/5 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <nav
        aria-label="Navegação principal"
        className="mt-4 flex-1 overflow-y-auto px-3"
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onSelectSection(item.id);
                    if (isMobile) onCloseMobile();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  title={!expanded ? item.label : undefined}
                  className={`group relative flex h-10 w-full items-center rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    expanded ? 'gap-3 px-3 justify-start' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'text-slate-950 dark:text-white'
                      : item.available
                        ? 'text-slate-600 hover:bg-slate-900/[0.045] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100'
                        : 'text-slate-500/85 hover:bg-slate-900/[0.04] hover:text-slate-800 dark:text-slate-400/80 dark:hover:bg-white/[0.05] dark:hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId={isMobile ? 'sidebar-active-mobile' : 'sidebar-active-desktop'}
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-xl bg-white/85 shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-white/[0.11] dark:ring-white/[0.12]"
                      aria-hidden="true"
                    />
                  )}

                  <span className="relative z-10 flex items-center justify-center">
                    <Icon
                      className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-current'
                      }`}
                      strokeWidth={isActive ? 2.1 : 1.75}
                      aria-hidden="true"
                    />
                  </span>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 flex flex-1 items-center justify-between overflow-hidden"
                      >
                        <span className="truncate whitespace-nowrap">
                          {item.label}
                        </span>
                        {!item.available && (
                          <span className="ml-2 text-[11px] font-normal text-slate-400 dark:text-slate-500">
                            Em breve
                          </span>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer controls: Theme & Pin */}
      <div className="mt-4 border-t border-slate-900/[0.06] px-3 pt-3 dark:border-white/[0.07]">
        <div className="space-y-1">
          {/* Theme toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'
            }
            title={
              !expanded
                ? theme === 'dark'
                  ? 'Modo claro'
                  : 'Modo escuro'
                : undefined
            }
            className={`group flex h-10 w-full items-center rounded-xl text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-900/[0.045] hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white ${
              expanded ? 'gap-3 px-3 justify-start' : 'justify-center px-0'
            }`}
          >
            <span className="relative flex h-[18px] w-[18px] items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -65, scale: 0.65, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 65, scale: 0.65, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex text-amber-400"
                  >
                    <Sun className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 65, scale: 0.65, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -65, scale: 0.65, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex text-slate-700"
                  >
                    <Moon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="truncate whitespace-nowrap"
                >
                  {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pin toggle (desktop) */}
          {!isMobile && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onTogglePin}
              aria-pressed={isPinned}
              aria-label={isPinned ? 'Desafixar barra lateral' : 'Fixar barra lateral'}
              title={
                !expanded
                  ? isPinned
                    ? 'Desafixar barra lateral'
                    : 'Fixar barra lateral'
                  : undefined
              }
              className={`group flex h-10 w-full items-center rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                expanded ? 'gap-3 px-3 justify-start' : 'justify-center px-0'
              } ${
                isPinned
                  ? 'bg-blue-600/10 text-blue-700 hover:bg-blue-600/15 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-900/[0.045] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
              }`}
            >
              <motion.span
                animate={{ rotate: isPinned ? -25 : 0, scale: isPinned ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="inline-flex h-[18px] w-[18px] items-center justify-center"
              >
                {isPinned ? (
                  <PinOff className="h-[18px] w-[18px]" strokeWidth={1.85} aria-hidden="true" />
                ) : (
                  <Pin className="h-[18px] w-[18px]" strokeWidth={1.85} aria-hidden="true" />
                )}
              </motion.span>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="truncate whitespace-nowrap"
                  >
                    {isPinned ? 'Desafixar barra' : 'Fixar barra'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <div
        className="hidden shrink-0 lg:block"
        style={{ width: isPinned ? 244 : 76 }}
      >
        <motion.aside
          aria-label="Barra lateral de navegação"
          data-testid="desktop-sidebar"
          data-expanded={isExpanded ? 'true' : 'false'}
          data-pinned={isPinned ? 'true' : 'false'}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          animate={{ width: isExpanded ? 244 : 76 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass fixed top-3 bottom-3 left-3 z-30 overflow-hidden rounded-2xl"
        >
          {renderSidebarContent(isExpanded, false)}
        </motion.aside>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              aria-label="Menu de navegação móvel"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass-elevated fixed top-2 bottom-2 left-2 w-[264px] rounded-2xl"
            >
              {renderSidebarContent(true, true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
