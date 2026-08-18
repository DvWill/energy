export type AnalysisHorizon = number;

export const ANALYSIS_HORIZON_MIN = 1;
export const ANALYSIS_HORIZON_MAX = 20;

export function isAnalysisHorizon(value: unknown): value is AnalysisHorizon {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= ANALYSIS_HORIZON_MIN &&
    value <= ANALYSIS_HORIZON_MAX
  );
}

export const FIXED_ANNUAL_ADJUSTMENT_RATE = 10;

export type SavingsSimulation = {
  monthlyBill: number;
  analysisHorizon: AnalysisHorizon;
  annualAdjustmentRate: number;
  estimatedSpendWithoutSolar: number;
};

const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = 365;

export const SAVINGS_COMPARISON_REFERENCES = {
  trips: [
    { destination: "Maceió", price: 11_900, unit: "viagem em casal" },
    { destination: "Salvador", price: 6_500, unit: "viagem em casal" },
    { destination: "Caldas Novas", price: 3_500, unit: "viagem em casal" },
    { destination: "uma viagem", price: 800, unit: "diária de viagem" },
  ],
  premiumSmartphone: 7_999,
} as const;

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

export function calculateSavingsComparisons(total: number) {
  const trip =
    SAVINGS_COMPARISON_REFERENCES.trips.find(({ price }) => total >= price) ??
    SAVINGS_COMPARISON_REFERENCES.trips.at(-1)!;
  const tripQuantity = Math.max(1, Math.floor(total / trip.price));
  const smartphoneQuantity = Math.floor(
    total / SAVINGS_COMPARISON_REFERENCES.premiumSmartphone,
  );
  const smartphonePercentage = Math.max(
    1,
    Math.min(
      99,
      Math.floor(
        (total / SAVINGS_COMPARISON_REFERENCES.premiumSmartphone) * 100,
      ),
    ),
  );
  const patrimonyThousands = Math.max(1, Math.floor(total / 1_000));
  const patrimonyPurpose =
    total >= 20_000
      ? "para começar a entrada de um imóvel"
      : total >= 8_000
        ? "para a entrada de um veículo"
        : "para construir uma reserva financeira";

  return {
    trip: { ...trip, quantity: tripQuantity },
    smartphone: {
      price: SAVINGS_COMPARISON_REFERENCES.premiumSmartphone,
      quantity: smartphoneQuantity,
      percentage: smartphonePercentage,
    },
    patrimony: {
      thousands: patrimonyThousands,
      purpose: patrimonyPurpose,
    },
  };
}
