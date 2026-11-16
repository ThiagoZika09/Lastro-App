import type {
  CategoryGoalConfig,
  CategoryId,
  CategoryMeta,
  ExpenseCategoryId,
} from '../types/finance';

export const EXPENSE_CATEGORY_ORDER: ExpenseCategoryId[] = [
  'moradia',
  'alimentacao',
  'educacao',
  'transporte',
  'contas',
  'lazer',
  'saude',
  'restaurantes',
];

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  moradia: {
    id: 'moradia',
    name: 'Moradia',
    color: '#2563EB',
    type: 'expense',
  },
  alimentacao: {
    id: 'alimentacao',
    name: 'Alimentação',
    color: '#0D9488',
    type: 'expense',
  },
  educacao: {
    id: 'educacao',
    name: 'Educação',
    color: '#059669',
    type: 'expense',
  },
  transporte: {
    id: 'transporte',
    name: 'Transporte',
    color: '#D97706',
    type: 'expense',
  },
  contas: {
    id: 'contas',
    name: 'Contas e Serviços',
    color: '#64748B',
    type: 'expense',
  },
  lazer: {
    id: 'lazer',
    name: 'Lazer',
    color: '#4F46E5',
    type: 'expense',
  },
  saude: {
    id: 'saude',
    name: 'Saúde',
    color: '#E11D48',
    type: 'expense',
  },
  restaurantes: {
    id: 'restaurantes',
    name: 'Restaurantes',
    color: '#EA580C',
    type: 'expense',
  },
  salario: {
    id: 'salario',
    name: 'Salário',
    color: '#10B981',
    type: 'income',
  },
  rendimentos: {
    id: 'rendimentos',
    name: 'Rendimentos',
    color: '#14B8A6',
    type: 'income',
  },
  extras: {
    id: 'extras',
    name: 'Projetos Extras',
    color: '#3B82F6',
    type: 'income',
  },
};

export const DEFAULT_PLANNING_INCOME = 8500;

export const DEFAULT_CATEGORY_GOALS: Record<ExpenseCategoryId, CategoryGoalConfig> = {
  moradia: { categoryId: 'moradia', mode: 'percentage', value: 30 }, // 30% of 8500 = R$ 2.550,00 (84% -> Atenção moderada)
  alimentacao: { categoryId: 'alimentacao', mode: 'fixed', value: 800 }, // Spent R$ 911,50 -> >100% (Meta ultrapassada)
  educacao: { categoryId: 'educacao', mode: 'fixed', value: 340 }, // Spent R$ 340,00 -> 100% (Meta atingida)
  transporte: { categoryId: 'transporte', mode: 'fixed', value: 360 }, // Spent R$ 335,00 -> 93% (Alerta evidente)
  contas: { categoryId: 'contas', mode: 'fixed', value: 550 }, // Spent R$ 402,30 -> 73% (Atenção moderada)
  lazer: { categoryId: 'lazer', mode: 'fixed', value: 500 }, // Spent R$ 285,00 -> 57% (Situação positiva)
  saude: { categoryId: 'saude', mode: 'none', value: 0 }, // Unconfigured state example
  restaurantes: { categoryId: 'restaurantes', mode: 'none', value: 0 }, // Unconfigured state example
};

export function getCategoryMeta(categoryId: CategoryId): CategoryMeta {
  return CATEGORIES[categoryId];
}
