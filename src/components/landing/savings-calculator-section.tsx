"use client";

import {
  type FormEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowRight,
  Bolt,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { Container } from "@/components/ui/container";
import {
  EyebrowReveal,
  LineReveal,
  Reveal,
  TextReveal,
} from "@/components/motion/motion-primitives";
import { siteContent as c } from "@/content/landing-page";
import {
  useAccessibleMotion,
  useFinePointer,
} from "@/hooks/use-accessible-motion";
import {
  calculatorAmbientTransition,
  calculatorResultVariants,
  calculatorSelectionTransition,
  microTransition,
  motionDuration,
  motionEase,
} from "@/lib/motion";
import {
  type AnalysisHorizon,
  type SavingsSimulation,
  calculateAnnualSpend,
  calculateDailyAverage,
  calculateProjectedSpend,
  formatBRL,
  parseBRLCurrency,
} from "@/lib/savings-calculator";
import type { CalculatorSnapshot } from "@/lib/calculator-handoff";

type SavingsCalculatorSectionProps = {
  monthlyBill: number;
  horizon: AnalysisHorizon;
  onMonthlyBillChange: (value: number) => void;
  onHorizonChange: (value: AnalysisHorizon) => void;
  onCalculation: (simulation: SavingsSimulation) => void;
  onOpenChat: () => void;
  transferredSnapshot?: CalculatorSnapshot | null;
};

function AnimatedCurrency({ value }: { value: number }) {
  const reduced = useAccessibleMotion();
  const animatedValue = useMotionValue(reduced ? value : 0);
  const [visibleValue, setVisibleValue] = useState(reduced ? value : 0);

  useMotionValueEvent(animatedValue, "change", (latest) => {
    setVisibleValue(latest);
  });

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

  return (
    <motion.span aria-hidden="true">{formatBRL(visibleValue)}</motion.span>
  );
}

function yearLabel(years: AnalysisHorizon) {
  return `${years} ${
    years === 1
      ? c.calculator.horizon.yearSingular
      : c.calculator.horizon.yearPlural
  }`;
}

export function SavingsCalculatorSection({
  monthlyBill,
  horizon,
  onMonthlyBillChange,
  onHorizonChange,
  onCalculation,
  onOpenChat,
  transferredSnapshot,
}: SavingsCalculatorSectionProps) {
  const reduced = useAccessibleMotion();
  const finePointer = useFinePointer();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(formatBRL(monthlyBill));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [includeAdjustment, setIncludeAdjustment] = useState(false);
  const [adjustmentRate, setAdjustmentRate] = useState<number>(
    c.calculator.annualAdjustment.default,
  );
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const lastTransferredSnapshot = useRef<CalculatorSnapshot | null>(null);
  const shouldFocusTransferredResult = useRef(false);

  const effectiveRate = includeAdjustment ? adjustmentRate : 0;
  const annualSpend = calculateAnnualSpend(monthlyBill);
  const projectedSpend = calculateProjectedSpend({
    monthlyBill,
    years: horizon,
    annualAdjustmentRate: effectiveRate,
  });
  const dailyAverage = calculateDailyAverage(projectedSpend, horizon);
  const validValue = monthlyBill > 0;
  const sliderValue = Math.min(
    c.calculator.slider.max,
    Math.max(c.calculator.slider.min, monthlyBill || c.calculator.slider.min),
  );
  const sliderProgress =
    ((sliderValue - c.calculator.slider.min) /
      (c.calculator.slider.max - c.calculator.slider.min)) *
    100;

  useEffect(() => {
    if (
      !transferredSnapshot ||
      lastTransferredSnapshot.current === transferredSnapshot
    ) {
      return;
    }

    lastTransferredSnapshot.current = transferredSnapshot;
    setInputValue(formatBRL(transferredSnapshot.monthlyBill));
    setIncludeAdjustment(transferredSnapshot.includeAdjustment);
    setAdjustmentRate(transferredSnapshot.adjustmentRate);
    setAdvancedOpen(transferredSnapshot.includeAdjustment);
    setAttempted(transferredSnapshot.showResult);
    setHasCalculated(transferredSnapshot.showResult);
    shouldFocusTransferredResult.current = transferredSnapshot.showResult;
    setShowResult(transferredSnapshot.showResult);
    setActiveStage(transferredSnapshot.showResult ? 2 : 0);
    setAnnouncement(
      transferredSnapshot.showResult
        ? `${c.calculator.result.heading}: ${formatBRL(transferredSnapshot.estimatedSpendWithoutSolar)} em ${yearLabel(transferredSnapshot.analysisHorizon)}.`
        : "",
    );
  }, [transferredSnapshot]);

  useEffect(() => {
    if (hasCalculated && validValue)
      onCalculation({
        monthlyBill,
        analysisHorizon: horizon,
        annualAdjustmentRate: effectiveRate,
        estimatedSpendWithoutSolar: projectedSpend,
      });
  }, [
    effectiveRate,
    hasCalculated,
    horizon,
    monthlyBill,
    onCalculation,
    projectedSpend,
    validValue,
  ]);

  useEffect(() => {
    if (!showResult) return;
    resultRef.current?.focus({ preventScroll: true });
    if (shouldFocusTransferredResult.current) {
      shouldFocusTransferredResult.current = false;
      return;
    }
    resultRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [reduced, showResult]);

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (!validValue) {
      inputRef.current?.focus();
      return;
    }
    setHasCalculated(true);
    setShowResult(true);
    setActiveStage(2);
    setAnnouncement(
      `${c.calculator.result.heading}: ${formatBRL(projectedSpend)} em ${yearLabel(horizon)}.`,
    );
  };

  const updateInput = (value: string) => {
    const editableValue = value.replace(/^R\$\s?/, "");
    setInputValue(editableValue ? `R$ ${editableValue}` : "R$ ");
    onMonthlyBillChange(parseBRLCurrency(editableValue));
    if (!hasCalculated) setActiveStage(0);
  };

  const finishEditing = () => {
    setInputValue(formatBRL(parseBRLCurrency(inputValue)));
  };

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

  const highlightIcons = [TimerReset, Activity, ShieldCheck] as const;
  const visibleStage = showResult ? 2 : activeStage;

  const editSimulation = () => {
    setShowResult(false);
    setActiveStage(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <section
      id={c.calculator.id}
      className="section savings-calculator-section"
      aria-labelledby="calculator-title"
      data-calculator-state={showResult ? "result" : "input"}
    >
      <div className="savings-calculator-ambient" aria-hidden="true">
        <motion.span
          animate={
            reduced ? undefined : { rotate: [0, 8, 0], scale: [1, 1.04, 1] }
          }
          transition={reduced ? undefined : calculatorAmbientTransition}
        />
        <span />
      </div>
      <Container className="savings-calculator-layout">
        <div className="savings-calculator-copy">
          <div className="section-heading motion-heading">
            <EyebrowReveal>{c.calculator.eyebrow}</EyebrowReveal>
            <TextReveal
              id="calculator-title"
              lines={[{ content: c.calculator.title }]}
            />
            <p>{c.calculator.description}</p>
            <LineReveal />
          </div>
        </div>

        <Reveal className="savings-calculator-stage-wrap">
          <div
            className="savings-calculator-panel"
            onPointerMove={updateSpotlight}
            data-spotlight={finePointer && !reduced ? "enabled" : "disabled"}
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
                aria-label={`${c.calculator.experience.liveSummaryLabel}: ${formatBRL(monthlyBill)} ${c.calculator.experience.monthlyAriaSuffix}, ${yearLabel(horizon)}`}
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
              {!showResult ? (
                <motion.form
                  key="calculator-form"
                  className="savings-calculator-form"
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
                  <div className="savings-calculator-controls-grid">
                    <div
                      className="savings-calculator-field"
                      data-invalid={attempted && !validValue ? "true" : "false"}
                    >
                      <div className="savings-calculator-label-row">
                        <label htmlFor="calculator-monthly-bill">
                          {c.calculator.monthlyBill.label}
                        </label>
                        <span>{c.calculator.monthlyBill.hint}</span>
                      </div>
                      <div className="savings-calculator-money-input">
                        <CircleDollarSign aria-hidden="true" />
                        <input
                          ref={inputRef}
                          id="calculator-monthly-bill"
                          name="monthlyBill"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          value={inputValue}
                          placeholder={c.calculator.monthlyBill.placeholder}
                          aria-label={c.calculator.monthlyBill.inputAriaLabel}
                          aria-invalid={attempted && !validValue}
                          aria-describedby="calculator-monthly-bill-hint calculator-monthly-bill-error"
                          onChange={(event) => updateInput(event.target.value)}
                          onFocus={(event) => {
                            const input = event.currentTarget;
                            requestAnimationFrame(() => input.select());
                          }}
                          onBlur={finishEditing}
                        />
                      </div>
                      <span
                        id="calculator-monthly-bill-hint"
                        className="sr-only"
                      >
                        {c.calculator.monthlyBill.hint}
                      </span>
                      <span
                        id="calculator-monthly-bill-error"
                        className="savings-calculator-error"
                        role={attempted && !validValue ? "alert" : undefined}
                      >
                        {attempted && !validValue
                          ? c.calculator.monthlyBill.error
                          : ""}
                      </span>
                      <div className="savings-calculator-range-shell">
                        <span
                          aria-hidden="true"
                          style={{ width: `${sliderProgress.toFixed(3)}%` }}
                        />
                        <input
                          className="savings-calculator-range"
                          type="range"
                          min={c.calculator.slider.min}
                          max={c.calculator.slider.max}
                          step={c.calculator.slider.step}
                          value={sliderValue}
                          aria-label={c.calculator.monthlyBill.sliderAriaLabel}
                          aria-valuetext={formatBRL(sliderValue)}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setInputValue(formatBRL(value));
                            onMonthlyBillChange(value);
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
                      <div className="savings-calculator-horizon-options">
                        {c.calculator.horizons.map((years) => (
                          <motion.button
                            key={years}
                            type="button"
                            aria-pressed={horizon === years}
                            onClick={() => {
                              onHorizonChange(years);
                              setActiveStage(1);
                            }}
                            whileHover={reduced ? undefined : { y: -2 }}
                            whileTap={reduced ? undefined : { scale: 0.97 }}
                            transition={microTransition}
                          >
                            {horizon === years && (
                              <motion.span
                                className="savings-calculator-horizon-active"
                                layoutId="calculator-horizon-active"
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
                      <div
                        className="savings-calculator-period-visual"
                        aria-hidden="true"
                      >
                        <motion.span
                          animate={{
                            width: `${Math.max(8, (horizon / 25) * 100)}%`,
                          }}
                          transition={
                            reduced ? { duration: 0 } : microTransition
                          }
                        />
                      </div>
                      <p aria-hidden="true">
                        <span>{c.calculator.experience.todayLabel}</span>
                        <strong>{yearLabel(horizon)}</strong>
                      </p>
                    </fieldset>
                  </div>

                  <div className="savings-calculator-advanced">
                    <button
                      className="savings-calculator-advanced-toggle"
                      type="button"
                      aria-expanded={advancedOpen}
                      aria-controls="calculator-advanced-options"
                      onClick={() => setAdvancedOpen((current) => !current)}
                    >
                      <span>
                        <Calculator aria-hidden="true" />
                        {c.calculator.advancedOptionsLabel}
                      </span>
                      <span className="savings-calculator-advanced-state">
                        {includeAdjustment
                          ? `${adjustmentRate}${c.calculator.annualAdjustment.suffix}`
                          : c.calculator.experience.noAdjustmentLabel}
                      </span>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    <AnimatePresence initial={false}>
                      {advancedOpen && (
                        <motion.div
                          id="calculator-advanced-options"
                          className="savings-calculator-advanced-content"
                          initial={reduced ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduced ? undefined : { height: 0, opacity: 0 }}
                          transition={
                            reduced
                              ? { duration: 0 }
                              : {
                                  duration: motionDuration.element,
                                  ease: motionEase.standard,
                                }
                          }
                        >
                          <label className="savings-calculator-switch">
                            <input
                              type="checkbox"
                              checked={includeAdjustment}
                              onChange={(event) =>
                                setIncludeAdjustment(event.target.checked)
                              }
                            />
                            <span aria-hidden="true" />
                            <strong>
                              {c.calculator.annualAdjustment.toggleLabel}
                            </strong>
                          </label>
                          <p>{c.calculator.annualAdjustment.description}</p>
                          {includeAdjustment && (
                            <label className="savings-calculator-rate">
                              <span>
                                {c.calculator.annualAdjustment.rateLabel}
                              </span>
                              <span>
                                <input
                                  type="number"
                                  min={c.calculator.annualAdjustment.min}
                                  max={c.calculator.annualAdjustment.max}
                                  step={c.calculator.annualAdjustment.step}
                                  value={adjustmentRate}
                                  aria-label={
                                    c.calculator.annualAdjustment.rateAriaLabel
                                  }
                                  onChange={(event) => {
                                    const value = Number(event.target.value);
                                    setAdjustmentRate(
                                      Math.min(
                                        c.calculator.annualAdjustment.max,
                                        Math.max(
                                          c.calculator.annualAdjustment.min,
                                          Number.isFinite(value) ? value : 0,
                                        ),
                                      ),
                                    );
                                  }}
                                />
                                <small>
                                  {c.calculator.annualAdjustment.suffix}
                                </small>
                              </span>
                            </label>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                  key="calculator-result"
                  ref={resultRef}
                  className="savings-calculator-result"
                  data-calculator-result="visible"
                  role="region"
                  aria-labelledby="calculator-result-title"
                  tabIndex={-1}
                  initial={reduced ? false : "hidden"}
                  animate="visible"
                  exit={reduced ? undefined : "exit"}
                  variants={reduced ? undefined : calculatorResultVariants}
                >
                  <div className="savings-calculator-result-toolbar">
                    <span>
                    {formatBRL(monthlyBill)} {c.calculator.experience.monthlySuffix}
                      <i aria-hidden="true" />
                      {yearLabel(horizon)}
                      <i aria-hidden="true" />
                    {includeAdjustment
                      ? `${c.calculator.experience.adjustmentSummaryPrefix} ${adjustmentRate}% ${c.calculator.experience.adjustmentSummarySuffix}`
                      : c.calculator.experience.noAdjustmentLabel.toLowerCase()}
                    </span>
                    <button type="button" onClick={editSimulation}>
                      <Calculator aria-hidden="true" />
                      {c.calculator.result.editCta}
                    </button>
                  </div>
                  {includeAdjustment && (
                    <label className="savings-calculator-result-rate">
                      <span>{c.calculator.annualAdjustment.rateLabel}</span>
                      <span>
                        <input
                          type="number"
                          min={c.calculator.annualAdjustment.min}
                          max={c.calculator.annualAdjustment.max}
                          step={c.calculator.annualAdjustment.step}
                          value={adjustmentRate}
                          aria-label={
                            c.calculator.annualAdjustment.rateAriaLabel
                          }
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setAdjustmentRate(
                              Math.min(
                                c.calculator.annualAdjustment.max,
                                Math.max(
                                  c.calculator.annualAdjustment.min,
                                  Number.isFinite(value) ? value : 0,
                                ),
                              ),
                            );
                          }}
                        />
                        <small>{c.calculator.annualAdjustment.suffix}</small>
                      </span>
                    </label>
                  )}
                  <div className="savings-calculator-result-heading">
                    <span aria-hidden="true">
                      <Bolt />
                    </span>
                    <div>
                      <small>{c.calculator.result.heading}</small>
                      <p>{c.calculator.result.intro}</p>
                    </div>
                  </div>
                  <h3
                    id="calculator-result-title"
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
                          <small>
                            {c.calculator.result.ownGenerationLabel}
                          </small>
                          <strong>
                            {c.calculator.result.ownGenerationValue}
                          </strong>
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    className="savings-calculator-followup-cta"
                    onClick={onOpenChat}
                    aria-haspopup="dialog"
                    aria-controls="energy-conversational-chat"
                    whileHover={reduced ? undefined : { y: -2 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    transition={microTransition}
                  >
                    <span>{c.calculator.result.followupCta}</span>
                    <ArrowRight aria-hidden="true" />
                  </motion.button>
                  <p className="savings-calculator-disclaimer">
                    {c.calculator.result.disclaimer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <p
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {announcement}
            </p>
          </div>
        </Reveal>

        <Reveal className="savings-calculator-highlights">
          {c.calculator.experience.highlights.map((highlight, index) => {
            const Icon = highlightIcons[index];
            return (
              <motion.article
                key={highlight.title}
                whileHover={reduced ? undefined : { y: -4 }}
                transition={microTransition}
              >
                <span aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <strong>{highlight.title}</strong>
                  <p>{highlight.description}</p>
                </div>
              </motion.article>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}
