import {
  type AnalysisHorizon,
  calculateProjectedSpend,
} from "@/lib/savings-calculator";

export const CALCULATOR_HANDOFF_EVENT = "energy:calculator-handoff";
export const CALCULATOR_HANDOFF_STORAGE_KEY = "energy-calculator-snapshot";

export type CalculatorSnapshot = {
  monthlyBill: number;
  analysisHorizon: AnalysisHorizon;
  includeAdjustment: boolean;
  adjustmentRate: number;
  annualAdjustmentRate: number;
  estimatedSpendWithoutSolar: number;
  showResult: boolean;
};

const horizons: AnalysisHorizon[] = [1, 5, 10, 25];

function normalizeSnapshot(value: unknown): CalculatorSnapshot | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<CalculatorSnapshot>;
  if (
    typeof candidate.monthlyBill !== "number" ||
    !Number.isFinite(candidate.monthlyBill) ||
    candidate.monthlyBill < 0 ||
    !horizons.includes(candidate.analysisHorizon as AnalysisHorizon) ||
    typeof candidate.includeAdjustment !== "boolean" ||
    typeof candidate.adjustmentRate !== "number" ||
    !Number.isFinite(candidate.adjustmentRate) ||
    candidate.adjustmentRate < 0 ||
    candidate.adjustmentRate > 30 ||
    typeof candidate.showResult !== "boolean"
  ) {
    return null;
  }

  const analysisHorizon = candidate.analysisHorizon as AnalysisHorizon;
  const annualAdjustmentRate = candidate.includeAdjustment
    ? candidate.adjustmentRate
    : 0;

  return {
    monthlyBill: candidate.monthlyBill,
    analysisHorizon,
    includeAdjustment: candidate.includeAdjustment,
    adjustmentRate: candidate.adjustmentRate,
    annualAdjustmentRate,
    estimatedSpendWithoutSolar: calculateProjectedSpend({
      monthlyBill: candidate.monthlyBill,
      years: analysisHorizon,
      annualAdjustmentRate,
    }),
    showResult: candidate.showResult && candidate.monthlyBill > 0,
  };
}

export function publishCalculatorSnapshot(snapshot: CalculatorSnapshot) {
  const normalized = normalizeSnapshot(snapshot);
  if (!normalized) return;

  try {
    sessionStorage.setItem(
      CALCULATOR_HANDOFF_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    // The in-page handoff still works when Storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent<CalculatorSnapshot>(CALCULATOR_HANDOFF_EVENT, {
      detail: normalized,
    }),
  );
}

export function readCalculatorSnapshot() {
  try {
    const serialized = sessionStorage.getItem(CALCULATOR_HANDOFF_STORAGE_KEY);
    return serialized ? normalizeSnapshot(JSON.parse(serialized)) : null;
  } catch {
    return null;
  }
}
