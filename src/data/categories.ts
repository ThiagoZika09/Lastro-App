import type { CategoryId, CategoryMeta } from '../types/finance';

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
  transporte: {
    id: 'transporte',
    name: 'Transporte',
    color: '#D97706',
    type: 'expense',
  },
  saude: {
    id: 'saude',
    name: 'Saúde',
    color: '#E11D48',
    type: 'expense',
  },
  lazer: {
    id: 'lazer',
    name: 'Lazer',
    color: '#4F46E5',
    type: 'expense',
  },
  assinaturas: {
    id: 'assinaturas',
    name: 'Assinaturas',
    color: '#0284C7',
    type: 'expense',
  },
  contas: {
    id: 'contas',
    name: 'Contas e Serviços',
    color: '#64748B',
    type: 'expense',
  },
  educacao: {
    id: 'educacao',
    name: 'Educação',
    color: '#059669',
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

export function getCategoryMeta(categoryId: CategoryId): CategoryMeta {
  return CATEGORIES[categoryId];
}
