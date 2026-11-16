import type { TagId, TagMeta } from '../types/finance';

export const TAGS: Record<TagId, TagMeta> = {
  necessidades: {
    id: 'necessidades',
    name: 'Necessidades',
    color: '#2563EB',
  },
  fixos: {
    id: 'fixos',
    name: 'Compromissos Fixos',
    color: '#0D9488',
  },
  variaveis: {
    id: 'variaveis',
    name: 'Gastos Variáveis',
    color: '#D97706',
  },
  bem_estar: {
    id: 'bem_estar',
    name: 'Bem-estar',
    color: '#E11D48',
  },
  desenvolvimento: {
    id: 'desenvolvimento',
    name: 'Desenvolvimento',
    color: '#059669',
  },
  social: {
    id: 'social',
    name: 'Social e Lazer',
    color: '#4F46E5',
  },
  sem_tag: {
    id: 'sem_tag',
    name: 'Sem tag',
    color: '#64748B',
  },
};

export function getTagMeta(tagId: TagId): TagMeta {
  return TAGS[tagId] ?? TAGS.sem_tag;
}
