import { shiftMonth } from '../lib/finance';
import { toIsoDate } from '../lib/format';
import type { CategoryId, TagId, Transaction, TransactionType } from '../types/finance';

export interface FinanceRepository {
  getTransactions(referenceDate?: Date): Promise<Transaction[]>;
}

interface MonthlyTemplateItem {
  day: number;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  tagIds: TagId[];
}

const CURRENT_MONTH_ITEMS: MonthlyTemplateItem[] = [
  { day: 1, description: 'Aluguel e condomínio', amount: 2150.0, type: 'expense', categoryId: 'moradia', tagIds: ['necessidades', 'fixos'] },
  { day: 2, description: 'Supermercado semanal', amount: 428.5, type: 'expense', categoryId: 'alimentacao', tagIds: ['necessidades'] },
  { day: 3, description: 'Recarga transporte urbano', amount: 140.0, type: 'expense', categoryId: 'transporte', tagIds: ['necessidades'] },
  { day: 4, description: 'Energia elétrica e internet', amount: 312.4, type: 'expense', categoryId: 'contas', tagIds: ['fixos'] },
  { day: 5, description: 'Salário mensal', amount: 7850.0, type: 'income', categoryId: 'salario', tagIds: [] },
  { day: 5, description: 'Assinaturas digitais', amount: 89.9, type: 'expense', categoryId: 'contas', tagIds: ['fixos'] },
  { day: 7, description: 'Almoço executivo', amount: 76.0, type: 'expense', categoryId: 'restaurantes', tagIds: ['variaveis', 'social'] },
  { day: 8, description: 'Farmácia e consulta', amount: 245.0, type: 'expense', categoryId: 'saude', tagIds: ['bem_estar'] },
  { day: 9, description: 'Hortifrúti e padaria', amount: 164.8, type: 'expense', categoryId: 'alimentacao', tagIds: ['necessidades'] },
  { day: 10, description: 'Rendimentos CDB e Tesouro', amount: 420.0, type: 'income', categoryId: 'rendimentos', tagIds: [] },
  { day: 10, description: 'Curso de especialização', amount: 340.0, type: 'expense', categoryId: 'educacao', tagIds: ['desenvolvimento'] },
  { day: 11, description: 'Combustível e estacionamento', amount: 195.0, type: 'expense', categoryId: 'transporte', tagIds: ['variaveis'] },
  { day: 13, description: 'Cinema e jantar', amount: 285.0, type: 'expense', categoryId: 'lazer', tagIds: ['social'] },
  { day: 14, description: 'Supermercado reposição', amount: 318.2, type: 'expense', categoryId: 'alimentacao', tagIds: ['necessidades'] },
  { day: 15, description: 'Consultoria de design', amount: 950.0, type: 'income', categoryId: 'extras', tagIds: [] },
];

const HISTORICAL_MONTH_PATTERNS: Array<{
  salary: number;
  yields: number;
  extras: number;
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  health: number;
  leisure: number;
  restaurants: number;
  education: number;
}> = [
  { salary: 7850, yields: 390, extras: 600, housing: 2150, food: 1180, transport: 520, utilities: 434.9, health: 290, leisure: 410, restaurants: 200, education: 340 },
  { salary: 7850, yields: 375, extras: 0, housing: 2150, food: 1310, transport: 610, utilities: 419.9, health: 680, leisure: 540, restaurants: 210, education: 340 },
  { salary: 7600, yields: 350, extras: 1250, housing: 2100, food: 1120, transport: 490, utilities: 404.9, health: 180, leisure: 380, restaurants: 170, education: 340 },
  { salary: 7600, yields: 340, extras: 0, housing: 2100, food: 1390, transport: 740, utilities: 449.9, health: 920, leisure: 1120, restaurants: 250, education: 340 },
  { salary: 7600, yields: 325, extras: 450, housing: 2100, food: 1150, transport: 460, utilities: 399.9, health: 210, leisure: 350, restaurants: 160, education: 340 },
  { salary: 7600, yields: 310, extras: 800, housing: 2100, food: 1220, transport: 510, utilities: 414.9, health: 140, leisure: 490, restaurants: 190, education: 290 },
  { salary: 7400, yields: 295, extras: 0, housing: 2050, food: 1190, transport: 480, utilities: 384.9, health: 260, leisure: 320, restaurants: 150, education: 290 },
  { salary: 7400, yields: 280, extras: 550, housing: 2050, food: 1120, transport: 430, utilities: 374.9, health: 170, leisure: 410, restaurants: 160, education: 290 },
  { salary: 7400, yields: 265, extras: 350, housing: 2050, food: 1280, transport: 520, utilities: 389.9, health: 420, leisure: 460, restaurants: 180, education: 290 },
  { salary: 7400, yields: 250, extras: 0, housing: 2050, food: 1310, transport: 590, utilities: 419.9, health: 310, leisure: 620, restaurants: 200, education: 290 },
  { salary: 7200, yields: 240, extras: 900, housing: 2050, food: 1210, transport: 470, utilities: 394.9, health: 190, leisure: 480, restaurants: 180, education: 290 },
];

function buildMonthIso(year: number, monthIndex: number, day: number): string {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, day), daysInMonth);
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

export function buildSeedTransactions(referenceDate: Date = new Date()): Transaction[] {
  const todayIso = toIsoDate(referenceDate);
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();

  const transactions: Transaction[] = [];
  let seq = 1;

  const pushTx = (
    dateIso: string,
    description: string,
    amount: number,
    type: TransactionType,
    categoryId: CategoryId,
    tagIds: TagId[],
  ) => {
    if (dateIso > todayIso || amount <= 0) return;
    transactions.push({
      id: `tx-${seq++}`,
      date: dateIso,
      description,
      amount,
      type,
      categoryId,
      tagIds,
    });
  };

  for (const item of CURRENT_MONTH_ITEMS) {
    const dayToUse = item.day <= currentDay ? item.day : null;
    if (dayToUse !== null) {
      pushTx(
        buildMonthIso(currentYear, currentMonth, dayToUse),
        item.description,
        item.amount,
        item.type,
        item.categoryId,
        item.tagIds,
      );
    }
  }

  if (currentDay < 5) {
    pushTx(
      buildMonthIso(currentYear, currentMonth, 1),
      'Salário mensal',
      7850.0,
      'income',
      'salario',
      [],
    );
  }

  HISTORICAL_MONTH_PATTERNS.forEach((pattern, idx) => {
    const offset = -(idx + 1);
    const { year, monthIndex } = shiftMonth(currentYear, currentMonth, offset);

    pushTx(buildMonthIso(year, monthIndex, 1), 'Aluguel e condomínio', pattern.housing, 'expense', 'moradia', ['necessidades', 'fixos']);
    pushTx(buildMonthIso(year, monthIndex, 4), 'Energia, internet e assinaturas', pattern.utilities, 'expense', 'contas', ['fixos']);
    pushTx(buildMonthIso(year, monthIndex, 5), 'Salário mensal', pattern.salary, 'income', 'salario', []);
    pushTx(buildMonthIso(year, monthIndex, 8), 'Supermercado quinzena 1', Math.round(pattern.food * 0.48 * 100) / 100, 'expense', 'alimentacao', ['necessidades']);
    pushTx(buildMonthIso(year, monthIndex, 10), 'Rendimentos financeiros', pattern.yields, 'income', 'rendimentos', []);
    pushTx(buildMonthIso(year, monthIndex, 12), 'Curso e livros', pattern.education, 'expense', 'educacao', ['desenvolvimento']);
    pushTx(buildMonthIso(year, monthIndex, 15), 'Almoços e cafés', pattern.restaurants, 'expense', 'restaurantes', ['variaveis', 'social']);
    pushTx(buildMonthIso(year, monthIndex, 16), 'Mobilidade e combustível', Math.round(pattern.transport * 0.55 * 100) / 100, 'expense', 'transporte', ['necessidades']);
    pushTx(buildMonthIso(year, monthIndex, 19), 'Farmácia e exames', pattern.health, 'expense', 'saude', ['bem_estar']);
    pushTx(buildMonthIso(year, monthIndex, 22), 'Supermercado quinzena 2', Math.round(pattern.food * 0.52 * 100) / 100, 'expense', 'alimentacao', ['necessidades']);
    pushTx(buildMonthIso(year, monthIndex, 24), 'Projetos extras', pattern.extras, 'income', 'extras', []);
    pushTx(buildMonthIso(year, monthIndex, 25), 'Lazer e entretenimento', pattern.leisure, 'expense', 'lazer', ['social']);
    pushTx(buildMonthIso(year, monthIndex, 27), 'Transporte aplicativo', Math.round(pattern.transport * 0.45 * 100) / 100, 'expense', 'transporte', ['variaveis']);
  });

  return transactions.sort((a, b) => a.date.localeCompare(b.date));
}

export const localFinanceRepository: FinanceRepository = {
  async getTransactions(referenceDate: Date = new Date()): Promise<Transaction[]> {
    return buildSeedTransactions(referenceDate);
  },
};
