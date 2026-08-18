"use client";

import Image from "next/image";
import {
  type FormEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Bolt,
  Building2,
  CalendarRange,
  Check,
  CircleDollarSign,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { siteContent as c } from "@/content/landing-page";
import {
  useAccessibleMotion,
  useFinePointer,
} from "@/hooks/use-accessible-motion";
import {
  calculatorResultVariants,
  calculatorSelectionTransition,
  microTransition,
  motionDuration,
  motionEase,
} from "@/lib/motion";
import {
  type AnalysisHorizon,
  calculateAnnualSpend,
  calculateDailyAverage,
  calculateProjectedSpend,
  FIXED_ANNUAL_ADJUSTMENT_RATE,
  formatBRL,
  parseBRLCurrency,
} from "@/lib/savings-calculator";
import { withBasePath } from "@/lib/base-path";
import {
  type CalculatorSnapshot,
  publishCalculatorSnapshot,
} from "@/lib/calculator-handoff";

const STORAGE_KEY = "energy-entry-calculator-seen-v2";
const SPLASH_DURATION = 1_000;
const ID_PREFIX = "entry-calculator";

type GateStage = "hidden" | "splash" | "calculator";

function AnimatedCurrency({ value }: { value: number }) {
  const reduced = useAccessibleMotion();
  const animatedValue = useMotionValue(reduced ? value : 0);
  const [visibleValue, setVisibleValue] = useState(reduced ? value : 0);

  useMotionValueEvent(animatedValue, "change", setVisibleValue);

  useEffect(() => {
    if (reduced) {
      animatedValue.set(value);
      return;
    }

    const controls = animate(animatedValue, value, {
      duration: motionDuration.section,
      ease: motionEase.emphasized,
    });
    return () => controls.stop();
  }, [animatedValue, reduced, value]);

  return <motion.span aria-hidden="true">{formatBRL(visibleValue)}</motion.span>;
}

function yearLabel(years: AnalysisHorizon) {
  return `${years} ${
    years === 1
      ? c.calculator.horizon.yearSingular
      : c.calculator.horizon.yearPlural
  }`;
}

function EntrySplash({ onComplete }: { onComplete: () => void }) {
  const splash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.entryGate = "splash";
    splash.current?.setAttribute(
      "data-splash-started-at",
      String(performance.now()),
    );
    const timer = window.setTimeout(onComplete, SPLASH_DURATION);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      ref={splash}
      className="entry-splash"
      data-entry-stage="splash"
      aria-hidden="true"
    >
      <Image
        src={withBasePath("/brand/energy-logo-horizontal-white-orange.png")}
        alt=""
        width={1763}
        height={743}
        priority
      />
    </div>
  );
}

export function EntryCalculatorGate() {
  const reduced = useAccessibleMotion();
  const finePointer = useFinePointer();
  const [stage, setStage] = useState<GateStage>("hidden");
  const [bill, setBill] = useState("R$ 500,00");
  const [horizon, setHorizon] = useState<AnalysisHorizon>(10);
  const [horizonInputValue, setHorizonInputValue] = useState("10");
  const [resultVisible, setResultVisible] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const resultPanel = useRef<HTMLDivElement>(null);
  const showCalculator = useCallback(() => setStage("calculator"), []);

  const focusInput = useCallback(
    (node: HTMLInputElement | null) => {
      input.current = node;
      if (node && stage === "calculator" && !resultVisible) {
        dialog.current?.scrollTo({ top: 0 });
        node.focus({ preventScroll: true });
      }
    },
    [resultVisible, stage],
  );

  const focusResult = useCallback((node: HTMLDivElement | null) => {
    resultPanel.current = node;
    if (node) {
      dialog.current?.scrollTo({ top: 0 });
      node.focus({ preventScroll: true });
    }
  }, []);

  const close = useCallback((options?: { focusMain?: boolean }) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Closing the gate must not depend on storage access.
    }
    setStage("hidden");
    document.documentElement.dataset.entryGate = "seen";
    if (options?.focusMain !== false) {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("#conteudo")?.focus({
          preventScroll: true,
        });
      });
    }
  }, []);

  useEffect(() => {
    let hasSeenGate = false;
    try {
      hasSeenGate = sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // The experience still works when storage is unavailable.
    }
    if (hasSeenGate) return undefined;

    const splashTimer = window.setTimeout(() => setStage("splash"), 0);
    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (stage === "calculator") {
      document.documentElement.dataset.entryGate = "active";
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "hidden") return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const siteContent = document.querySelector<HTMLElement>(
      "[data-entry-site-content]",
    );
    const wasInert = siteContent?.inert ?? false;
    const previousAriaHidden = siteContent
      ? siteContent.getAttribute("aria-hidden")
      : null;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    if (siteContent) {
      siteContent.inert = true;
      siteContent.setAttribute("aria-hidden", "true");
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      if (siteContent) {
        siteContent.inert = wasInert;
        if (previousAriaHidden === null) {
          siteContent.removeAttribute("aria-hidden");
        } else {
          siteContent.setAttribute("aria-hidden", previousAriaHidden);
        }
      }
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "calculator") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = Array.from(
        dialog.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.current.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [stage]);

  const monthlyBill = parseBRLCurrency(bill);
  const annualAdjustmentRate = FIXED_ANNUAL_ADJUSTMENT_RATE;
  const projectedSpend = calculateProjectedSpend({
    monthlyBill,
    years: horizon,
    annualAdjustmentRate,
  });
  const annualSpend = calculateAnnualSpend(monthlyBill);
  const dailyAverage = calculateDailyAverage(projectedSpend, horizon);
  const sliderValue = Math.min(
    c.calculator.slider.max,
    Math.max(c.calculator.slider.min, monthlyBill || c.calculator.slider.min),
  );
  const sliderProgress =
    ((sliderValue - c.calculator.slider.min) /
      (c.calculator.slider.max - c.calculator.slider.min)) *
    100;
  const horizonProgress =
    ((horizon - c.calculator.horizon.min) /
      (c.calculator.horizon.max - c.calculator.horizon.min)) *
    100;

  const commitHorizonInput = (value: string) => {
    const parsed = value.trim() ? Number(value) : Number.NaN;
    const nextHorizon = Number.isFinite(parsed)
      ? Math.min(
          c.calculator.horizon.max,
          Math.max(c.calculator.horizon.min, Math.round(parsed)),
        )
      : horizon;
    setHorizonInputValue(String(nextHorizon));
    setHorizon(nextHorizon);
    setActiveStage(1);
  };
  const visibleStage = resultVisible ? 2 : activeStage;

  const finishExperience = () => {
    const snapshot: CalculatorSnapshot = {
      monthlyBill,
      analysisHorizon: horizon,
      includeAdjustment: true,
      adjustmentRate: FIXED_ANNUAL_ADJUSTMENT_RATE,
      annualAdjustmentRate,
      estimatedSpendWithoutSolar: projectedSpend,
      showResult: resultVisible,
    };
    publishCalculatorSnapshot(snapshot);
    close({ focusMain: !resultVisible });
  };

  useEffect(() => {
    if (stage !== "calculator") return;

    const transferWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      finishExperience();
    };

    document.addEventListener("keydown", transferWithEscape, true);
    return () =>
      document.removeEventListener("keydown", transferWithEscape, true);
  });

  const updateSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    if (!finePointer || reduced) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--calculator-spotlight-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--calculator-spotlight-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(monthlyBill > 0)) {
      setError(c.calculator.monthlyBill.error);
      input.current?.focus();
      return;
    }
    setError("");
    setBill(formatBRL(monthlyBill));
    setActiveStage(2);
    dialog.current?.scrollTo({ top: 0 });
    setResultVisible(true);
  };

  const updateBill = (value: string) => {
    const editableValue = value.replace(/^R\$\s?/, "");
    setBill(editableValue ? `R$ ${editableValue}` : "R$ ");
    setError("");
    setActiveStage(0);
  };

  const reset = () => {
    dialog.current?.scrollTo({ top: 0 });
    setResultVisible(false);
    setActiveStage(0);
    window.requestAnimationFrame(() =>
      input.current?.focus({ preventScroll: true }),
    );
  };

  if (stage === "hidden") return null;
  if (stage === "splash") {
    return <EntrySplash onComplete={showCalculator} />;
  }

  return (
    <div className="entry-calculator-backdrop" data-entry-stage="calculator">
      <div
        ref={dialog}
        className="entry-calculator-dialog savings-calculator-section"
        data-entry-calculator-state={resultVisible ? "result" : "form"}
        role="dialog"
        aria-modal="true"
        aria-label="Calculadora inicial Energy"
      >
        <button
          className="entry-calculator-close"
          type="button"
          onClick={finishExperience}
          aria-label="Entrar no site sem calcular"
        >
          <X aria-hidden="true" />
        </button>

        <div
          className="savings-calculator-panel"
          data-spotlight={finePointer && !reduced ? "enabled" : "disabled"}
          data-entry-motion={reduced ? "reduced" : "full"}
          onPointerMove={updateSpotlight}
        >
          <div className="savings-calculator-panel-head">
            <div className="savings-calculator-panel-title">
              <span aria-hidden="true">
                <Sparkles />
              </span>
              <div>
                <small>{c.calculator.experience.label}</small>
                <strong>{c.calculator.experience.title}</strong>
              </div>
            </div>
            <div
              className="savings-calculator-live-summary"
              aria-label={`${c.calculator.experience.liveSummaryLabel}: ${formatBRL(monthlyBill)} por mês, ${yearLabel(horizon)}`}
            >
              <span>{formatBRL(monthlyBill)}</span>
              <i aria-hidden="true" />
              <span>{yearLabel(horizon)}</span>
            </div>
          </div>

          <div className="savings-calculator-journey">
            <ol aria-label={c.calculator.experience.progressLabel}>
              {c.calculator.experience.steps.map((step, index) => {
                const state =
                  index < visibleStage
                    ? "complete"
                    : index === visibleStage
                      ? "active"
                      : "upcoming";
                return (
                  <li key={step} data-state={state}>
                    <span aria-hidden="true">
                      {state === "complete" ? <Check /> : index + 1}
                    </span>
                    <strong>{step}</strong>
                  </li>
                );
              })}
            </ol>
            <div aria-hidden="true">
              <motion.span
                animate={{ width: `${((visibleStage + 1) / 3) * 100}%` }}
                transition={reduced ? { duration: 0 } : microTransition}
              />
            </div>
          </div>

          <AnimatePresence initial={false} mode="wait">
          {!resultVisible ? (
            <motion.form
              key="entry-calculator-form"
              className="savings-calculator-form entry-calculator-form"
              onSubmit={calculate}
              noValidate
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      duration: motionDuration.element,
                      ease: motionEase.standard,
                    }
              }
            >
              <p className="entry-calculator-confrontation">
                Olha quanto dinheiro você está jogando fora na conta de luz.
              </p>
              <div className="savings-calculator-controls-grid">
                <div
                  className="savings-calculator-field"
                  data-invalid={Boolean(error)}
                >
                  <div className="savings-calculator-label-row">
                    <label htmlFor={`${ID_PREFIX}-monthly-bill`}>
                      {c.calculator.monthlyBill.label}
                    </label>
                    <span>{c.calculator.monthlyBill.hint}</span>
                  </div>
                  <div className="savings-calculator-money-input">
                    <CircleDollarSign aria-hidden="true" />
                    <input
                      ref={focusInput}
                      id={`${ID_PREFIX}-monthly-bill`}
                      name="entryMonthlyBill"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={bill}
                      aria-label="Qual é o valor médio da sua conta de luz?"
                      aria-invalid={Boolean(error)}
                      aria-describedby={`${ID_PREFIX}-error`}
                      onChange={(event) => updateBill(event.target.value)}
                      onFocus={(event) => event.currentTarget.select()}
                      onBlur={() => {
                        if (monthlyBill > 0) setBill(formatBRL(monthlyBill));
                      }}
                    />
                  </div>
                  <span
                    id={`${ID_PREFIX}-error`}
                    className="savings-calculator-error"
                    role={error ? "alert" : undefined}
                  >
                    {error}
                  </span>
                  <div className="savings-calculator-range-shell">
                    <span style={{ width: `${sliderProgress.toFixed(3)}%` }} />
                    <input
                      className="savings-calculator-range"
                      type="range"
                      min={c.calculator.slider.min}
                      max={c.calculator.slider.max}
                      step={c.calculator.slider.step}
                      value={sliderValue}
                      aria-label="Ajustar valor da conta no pop-up"
                      aria-valuetext={formatBRL(sliderValue)}
                      onChange={(event) => {
                        setBill(formatBRL(Number(event.target.value)));
                        setError("");
                        setActiveStage(0);
                      }}
                    />
                  </div>
                  <div
                    className="savings-calculator-range-labels"
                    aria-hidden="true"
                  >
                    <span>{formatBRL(c.calculator.slider.min)}</span>
                    <output>{formatBRL(sliderValue)}</output>
                    <span>{formatBRL(c.calculator.slider.max)}</span>
                  </div>
                </div>

                <fieldset className="savings-calculator-horizons">
                  <legend>{c.calculator.horizon.label}</legend>
                  <div
                    className="savings-calculator-money-input"
                    style={{ marginBottom: 12 }}
                  >
                    <CalendarRange aria-hidden="true" />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={c.calculator.horizon.min}
                      max={c.calculator.horizon.max}
                      step={c.calculator.horizon.step}
                      value={horizonInputValue}
                      aria-label={c.calculator.horizon.inputAriaLabel}
                      onChange={(event) => {
                        const value = event.target.value;
                        setHorizonInputValue(value);
                        const parsed = Number(value);
                        if (
                          Number.isInteger(parsed) &&
                          parsed >= c.calculator.horizon.min &&
                          parsed <= c.calculator.horizon.max
                        ) {
                          setHorizon(parsed);
                          setActiveStage(1);
                        }
                      }}
                      onBlur={(event) =>
                        commitHorizonInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </div>
                  <div className="savings-calculator-horizon-options">
                    {c.calculator.horizons.map((years) => (
                      <motion.button
                        key={years}
                        type="button"
                        aria-pressed={horizon === years}
                        onClick={() => {
                          setHorizonInputValue(String(years));
                          setHorizon(years);
                          setActiveStage(1);
                        }}
                        whileHover={reduced ? undefined : { y: -2 }}
                        whileTap={reduced ? undefined : { scale: 0.97 }}
                        transition={microTransition}
                      >
                        {horizon === years && (
                          <motion.span
                            className="savings-calculator-horizon-active"
                            layoutId="entry-calculator-horizon-active"
                            transition={
                              reduced
                                ? { duration: 0 }
                                : calculatorSelectionTransition
                            }
                            aria-hidden="true"
                          />
                        )}
                        <span>{yearLabel(years)}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="savings-calculator-range-shell">
                    <span
                      aria-hidden="true"
                      style={{ width: `${horizonProgress.toFixed(3)}%` }}
                    />
                    <input
                      className="savings-calculator-range"
                      type="range"
                      min={c.calculator.horizon.min}
                      max={c.calculator.horizon.max}
                      step={c.calculator.horizon.step}
                      value={horizon}
                      aria-label={c.calculator.horizon.sliderAriaLabel}
                      aria-valuetext={yearLabel(horizon)}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setHorizonInputValue(String(value));
                        setHorizon(value);
                        setActiveStage(1);
                      }}
                    />
                  </div>
                  <div className="savings-calculator-range-labels">
                    <span>{yearLabel(c.calculator.horizon.min)}</span>
                    <output aria-live="polite">{yearLabel(horizon)}</output>
                    <span>{yearLabel(c.calculator.horizon.max)}</span>
                  </div>
                  <p aria-hidden="true">
                    <span>{c.calculator.experience.todayLabel}</span>
                    <strong>{yearLabel(horizon)}</strong>
                  </p>
                </fieldset>
              </div>

              <div className="savings-calculator-action">
                <div aria-hidden="true">
                  <ShieldCheck />
                  <span>
                    <strong>
                      {c.calculator.experience.educationalNote.title}
                    </strong>
                    <small>
                      {c.calculator.experience.educationalNote.description}
                    </small>
                  </span>
                </div>
                <motion.button
                  type="submit"
                  className="savings-calculator-primary-cta"
                  whileHover={
                    reduced
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.008,
                          boxShadow: "0 18px 42px rgba(249, 95, 27, 0.38)",
                        }
                  }
                  whileTap={reduced ? undefined : { scale: 0.985 }}
                  transition={microTransition}
                >
                  <Bolt aria-hidden="true" />
                  <span>{c.calculator.primaryCta}</span>
                  <ArrowRight aria-hidden="true" />
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="entry-calculator-result"
              ref={focusResult}
              className="savings-calculator-result entry-calculator-result"
              data-calculator-result="visible"
              role="region"
              aria-labelledby={`${ID_PREFIX}-result-title`}
              aria-live="polite"
              tabIndex={-1}
              initial={reduced ? false : "hidden"}
              animate="visible"
              exit={reduced ? undefined : "exit"}
              variants={reduced ? undefined : calculatorResultVariants}
            >
              <div className="savings-calculator-result-toolbar">
                <span>
                  {formatBRL(monthlyBill)} / mês
                  <i aria-hidden="true" />
                  {yearLabel(horizon)}
                </span>
                <button type="button" onClick={reset}>
                  <RotateCcw aria-hidden="true" /> Ajustar simulação
                </button>
              </div>
              <div className="savings-calculator-result-heading">
                <span aria-hidden="true">
                  <Bolt />
                </span>
                <div>
                  <small>{c.calculator.result.heading}</small>
                  <p>
                    Esse é o preço de continuar dependendo da distribuidora.
                  </p>
                </div>
              </div>
              <h3
                id={`${ID_PREFIX}-result-title`}
                aria-label={`${formatBRL(projectedSpend)} em ${yearLabel(horizon)}`}
              >
                <AnimatedCurrency value={projectedSpend} />
                <small> em {yearLabel(horizon)}</small>
              </h3>
              <dl className="savings-calculator-metrics">
                <div>
                  <dt>{c.calculator.result.annualSpendLabel}</dt>
                  <dd>{formatBRL(annualSpend)}</dd>
                </div>
                <div>
                  <dt>{c.calculator.result.periodSpendLabel}</dt>
                  <dd>{formatBRL(projectedSpend)}</dd>
                </div>
                <div>
                  <dt>{c.calculator.result.dailyAverageLabel}</dt>
                  <dd>{formatBRL(dailyAverage)}</dd>
                </div>
              </dl>
              <div className="savings-calculator-comparison">
                <strong>{c.calculator.result.comparisonTitle}</strong>
                <div className="savings-calculator-destinations">
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : {
                            delay: 0.12,
                            duration: motionDuration.element,
                            ease: motionEase.standard,
                          }
                    }
                  >
                    <span className="savings-calculator-comparison-icon is-distributor">
                      <Building2 aria-hidden="true" />
                    </span>
                    <span>
                      <small>{c.calculator.result.distributorLabel}</small>
                      <strong>{formatBRL(projectedSpend)}</strong>
                    </span>
                  </motion.div>
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : {
                            delay: 0.2,
                            duration: motionDuration.element,
                            ease: motionEase.standard,
                          }
                    }
                  >
                    <span className="savings-calculator-comparison-icon is-generation">
                      <Lightbulb aria-hidden="true" />
                    </span>
                    <span>
                      <small>{c.calculator.result.ownGenerationLabel}</small>
                      <strong>{c.calculator.result.ownGenerationValue}</strong>
                    </span>
                  </motion.div>
                </div>
              </div>
              <p className="entry-calculator-punch">
                Olha o tanto de dinheiro que pode continuar saindo do seu bolso
                sem avaliar a possibilidade de gerar sua própria energia.
              </p>
              <motion.button
                className="savings-calculator-followup-cta"
                type="button"
                onClick={finishExperience}
                whileHover={reduced ? undefined : { y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
                transition={microTransition}
              >
                ENTRAR NO SITE E CONHECER A SOLUÇÃO
                <ArrowRight aria-hidden="true" />
              </motion.button>
              <p className="savings-calculator-disclaimer">
                {c.calculator.result.disclaimer}
              </p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
