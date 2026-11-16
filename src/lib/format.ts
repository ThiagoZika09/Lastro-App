const PT_BR_MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const PT_BR_SHORT_MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  const normalized = Math.abs(value) < 0.005 ? 0 : value;
  const absFormatted = brlFormatter.format(Math.abs(normalized)).replace(/\u00A0/g, ' ');
  return normalized < 0 ? `-${absFormatted}` : absFormatted;
}

export function formatCompactBRL(value: number): string {
  if (Math.abs(value) === 0) return 'R$ 0';
  if (Math.abs(value) >= 1000) {
    const thousands = value / 1000;
    const formatted = Number.isInteger(thousands)
      ? thousands.toString()
      : thousands.toFixed(1).replace('.', ',');
    return `R$ ${formatted} mil`;
  }
  return `R$ ${Math.round(value)}`;
}

export function formatPercentPtBR(percentage: number): string {
  const rounded = Math.round(percentage);
  return `${rounded}%`;
}

export function formatMonthYearPtBR(year: number, monthIndex: number): string {
  const monthName = PT_BR_MONTHS[((monthIndex % 12) + 12) % 12];
  return `${monthName} de ${year}`;
}

export function formatShortMonthPtBR(
  year: number,
  monthIndex: number,
  includeYear = false,
): string {
  const monthName = PT_BR_SHORT_MONTHS[((monthIndex % 12) + 12) % 12];
  if (!includeYear) return monthName;
  return `${monthName}/${String(year).slice(-2)}`;
}

export function formatFullDatePtBR(dateIso: string): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  if (!y || !m || !d) return dateIso;
  const monthName = PT_BR_MONTHS[m - 1].toLowerCase();
  return `${String(d).padStart(2, '0')} de ${monthName} de ${y}`;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToIso(dateIso: string, deltaDays: number): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return toIsoDate(dt);
}
