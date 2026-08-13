export type AnalysisHorizon = 1 | 5 | 10 | 25;

export type SavingsSimulation = {
  monthlyBill: number;
  analysisHorizon: AnalysisHorizon;
  annualAdjustmentRate: number;
  estimatedSpendWithoutSolar: number;
};

const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number) {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Converts either a masked BRL value or a plain numeric value into reais. */
export function parseBRLCurrency(value: string) {
  const sanitized = value.replace(/[^\d,.-]/g, "").trim();
  if (!sanitized) return 0;

  const normalized = sanitized.includes(",")
    ? sanitized.replace(/\./g, "").replace(",", ".")
    : sanitized;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function calculateAnnualSpend(monthlyBill: number) {
  return monthlyBill * MONTHS_PER_YEAR;
}

export function calculateProjectedSpend({
  monthlyBill,
  years,
  annualAdjustmentRate = 0,
}: {
  monthlyBill: number;
  years: AnalysisHorizon;
  annualAdjustmentRate?: number;
}) {
  const annualSpend = calculateAnnualSpend(monthlyBill);
  const rate = annualAdjustmentRate / 100;

  if (rate === 0) return annualSpend * years;

  return annualSpend * ((Math.pow(1 + rate, years) - 1) / rate);
}

export function calculateDailyAverage(total: number, years: AnalysisHorizon) {
  return total / (years * DAYS_PER_YEAR);
}
