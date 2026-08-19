"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  Pencil,
  Send,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { siteContent } from "@/content/landing-page";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import {
  elementTransition,
  microTransition,
  motionDistance,
} from "@/lib/motion";
import {
  type AnalysisHorizon,
  formatBRL,
  parseBRLCurrency,
} from "@/lib/savings-calculator";

const content = siteContent.chat;
const companyWhatsapp = "5561993561108";

export type ChatSimulationContext = {
  monthlyBill: number;
  analysisHorizon: AnalysisHorizon;
  estimatedSpendWithoutSolar: number;
  fromCalculator: boolean;
};

export type ConversationalLeadChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulation: ChatSimulationContext;
};

type ChatStep =
  | "welcome"
  | "bill"
  | "customerType"
  | "company"
  | "location"
  | "name"
  | "whatsapp"
  | "email"
  | "summary"
  | "consent"
  | "success";

type CustomerType = "residential" | "business" | "rural";

type ChatField =
  | "monthlyBill"
  | "customerType"
  | "company"
  | "city"
  | "state"
  | "name"
  | "whatsapp"
  | "email"
  | "consent";

type ChatAnswers = {
  monthlyBill: string;
  customerType: CustomerType | null;
  company: string;
  city: string;
  state: string;
  name: string;
  whatsapp: string;
  email: string;
  website: string;
};

type SubmitStatus = {
  kind: "success" | "error";
  message: string;
} | null;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function toCustomerType(value: CustomerType) {
  return value;
}

function initialAnswers(simulation: ChatSimulationContext): ChatAnswers {
  return {
    monthlyBill:
      simulation.fromCalculator && simulation.monthlyBill > 0
        ? formatBRL(simulation.monthlyBill)
        : "",
    customerType: null,
    company: "",
    city: "",
    state: "",
    name: "",
    whatsapp: "",
    email: "",
    website: "",
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      className="chat-field-error"
      role={message ? "alert" : undefined}
      aria-live="polite"
    >
      {message ?? ""}
    </p>
  );
}

function TypingIndicator({ reduced }: { reduced: boolean }) {
  return (
    <div
      className="chat-typing-indicator"
      role="status"
      aria-label={content.typingLabel}
    >
      <span className="chat-avatar" aria-hidden="true">
        <Zap />
      </span>
      <span className="chat-typing-bubble" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            animate={
              reduced ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }
            }
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              repeat: Infinity,
            }}
          />
        ))}
      </span>
      <span className="sr-only">{content.typingLabel}</span>
    </div>
  );
}

export function ConversationalLeadChat({
  open,
  onOpenChange,
  simulation,
}: ConversationalLeadChatProps) {
  const reduced = useAccessibleMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);
  const previousSimulationRef = useRef("");
  const [step, setStep] = useState<ChatStep>("welcome");
  const [readyStep, setReadyStep] = useState<ChatStep | null>(null);
  const [answers, setAnswers] = useState<ChatAnswers>(() =>
    initialAnswers(simulation),
  );
  const [errors, setErrors] = useState<Partial<Record<ChatField, string>>>({});
  const [consent, setConsent] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const monthlyBill = parseBRLCurrency(answers.monthlyBill);
  const customerTypeOption = content.customerTypes.find(
    (option) => toCustomerType(option.value) === answers.customerType,
  );
  const estimatedSpend =
    simulation.fromCalculator &&
    Number.isFinite(simulation.estimatedSpendWithoutSolar) &&
    simulation.estimatedSpendWithoutSolar >= 0 &&
    Math.abs(monthlyBill - simulation.monthlyBill) < 0.005
      ? simulation.estimatedSpendWithoutSolar
      : monthlyBill * 12 * simulation.analysisHorizon;

  const activeSteps = useMemo<ChatStep[]>(
    () => [
      "bill",
      "customerType",
      ...(answers.customerType === "business"
        ? (["company"] as ChatStep[])
        : []),
      "location",
      "name",
      "whatsapp",
      "email",
      "summary",
      "consent",
    ],
    [answers.customerType],
  );
  const progress =
    step === "welcome"
      ? 0
      : step === "success"
        ? 100
        : Math.max(
            0,
            ((activeSteps.indexOf(step) + 1) / activeSteps.length) * 100,
          );
  const typing = open && step !== "success" && readyStep !== step;

  useEffect(() => {
    if (!simulation.fromCalculator) return;
    const simulationKey = `${simulation.monthlyBill}:${simulation.analysisHorizon}:${simulation.estimatedSpendWithoutSolar}`;
    if (previousSimulationRef.current === simulationKey) return;
    previousSimulationRef.current = simulationKey;
    setAnswers(initialAnswers(simulation));
    setErrors({});
    setConsent(false);
    setSubmitStatus(null);
    setStep("welcome");
  }, [simulation]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setReadyStep(open ? step : null),
      open && step !== "success" && !reduced ? content.typingDelay : 0,
    );
    return () => window.clearTimeout(timer);
  }, [open, reduced, step]);

  useEffect(() => {
    let focusFrame = 0;
    if (open) {
      wasOpenRef.current = true;
      focusFrame = window.requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      focusFrame = window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  useEffect(() => {
    if (!open || typing) return;
    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("[data-chat-autofocus]")
        ?.focus();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [open, step, typing]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true",
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (
        event.shiftKey &&
        (current === first || current === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      } else if (current && !dialogRef.current.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(
        window.getComputedStyle(body).paddingRight,
      );
      body.style.paddingRight = `${(Number.isFinite(currentPadding) ? currentPadding : 0) + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  const updateAnswer = <Key extends keyof ChatAnswers>(
    field: Key,
    value: ChatAnswers[Key],
  ) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    const errorField = field === "company" ? "company" : field;
    setErrors((current) => {
      if (!current[errorField as ChatField]) return current;
      const next = { ...current };
      delete next[errorField as ChatField];
      return next;
    });
    setSubmitStatus(null);
  };

  const moveTo = (nextStep: ChatStep) => {
    setErrors({});
    setSubmitStatus(null);
    setStep(nextStep);
  };

  const moveBack = () => {
    const previous: Partial<Record<ChatStep, ChatStep>> = {
      bill: "welcome",
      customerType: "bill",
      company: "customerType",
      location:
        answers.customerType === "business" ? "company" : "customerType",
      name: "location",
      whatsapp: "name",
      email: "whatsapp",
      summary: "email",
      consent: "summary",
    };
    const previousStep = previous[step];
    if (previousStep) moveTo(previousStep);
  };

  const validateCurrentStep = () => {
    const nextErrors: Partial<Record<ChatField, string>> = {};
    if (step === "bill" && !(monthlyBill > 0))
      nextErrors.monthlyBill = content.errors.monthlyBill;
    if (step === "customerType" && !answers.customerType)
      nextErrors.customerType = content.errors.customerType;
    if (step === "company" && answers.company.trim().length < 2)
      nextErrors.company = content.errors.companyName;
    if (step === "location") {
      if (answers.city.trim().length < 2) nextErrors.city = content.errors.city;
      if (!/^[A-Za-z]{2}$/.test(answers.state.trim()))
        nextErrors.state = content.errors.state;
    }
    if (step === "name" && answers.name.trim().length < 2)
      nextErrors.name = content.errors.name;
    if (step === "whatsapp" && !isValidWhatsapp(answers.whatsapp))
      nextErrors.whatsapp = content.errors.whatsapp;
    if (step === "email" && !isValidEmail(answers.email))
      nextErrors.email = content.errors.email;
    if (step === "consent" && !consent)
      nextErrors.consent = content.consent.error;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const selectCustomerType = (
    value: (typeof content.customerTypes)[number]["value"],
  ) => {
    const selected = toCustomerType(value);
    setAnswers((current) => ({
      ...current,
      customerType: selected,
      company: selected === "business" ? current.company : "",
    }));
    setErrors({});
    setSubmitStatus(null);
    setStep(selected === "business" ? "company" : "location");
  };

  const handleBillInput = (value: string) => {
    updateAnswer("monthlyBill", value);
  };

  const handleStepSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    if (step === "bill")
      setAnswers((current) => ({
        ...current,
        monthlyBill: formatBRL(monthlyBill),
      }));

    const next: Partial<Record<ChatStep, ChatStep>> = {
      welcome: "bill",
      bill: "customerType",
      company: "location",
      location: "name",
      name: "whatsapp",
      whatsapp: "email",
      email: "summary",
      summary: "consent",
    };
    const nextStep = next[step];
    if (nextStep) moveTo(nextStep);
  };

  const validateAllAnswers = () => {
    if (!(monthlyBill > 0)) return "bill" as const;
    if (!answers.customerType) return "customerType" as const;
    if (
      answers.customerType === "business" &&
      answers.company.trim().length < 2
    )
      return "company" as const;
    if (
      answers.city.trim().length < 2 ||
      !/^[A-Za-z]{2}$/.test(answers.state.trim())
    )
      return "location" as const;
    if (answers.name.trim().length < 2) return "name" as const;
    if (!isValidWhatsapp(answers.whatsapp)) return "whatsapp" as const;
    if (!isValidEmail(answers.email)) return "email" as const;
    return null;
  };

  const submitLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    const invalidStep = validateAllAnswers();
    if (invalidStep) {
      moveTo(invalidStep);
      return;
    }
    if (!answers.customerType) return;

    const message = [
      "Olá! Fiz uma simulação no site da ENERGY e gostaria de falar com um especialista.",
      "",
      `Nome: ${answers.name.trim()}`,
      `Tipo de projeto: ${customerTypeOption?.label ?? "Projeto solar"}`,
      ...(answers.customerType === "business"
        ? [`Empresa: ${answers.company.trim()}`]
        : []),
      `Local: ${answers.city.trim()}/${answers.state.trim().toUpperCase()}`,
      `Conta mensal: ${formatBRL(monthlyBill)}`,
      `Período da simulação: ${simulation.analysisHorizon} anos`,
      `Gasto estimado sem energia solar: ${formatBRL(estimatedSpend)}`,
      `Meu WhatsApp: ${answers.whatsapp.trim()}`,
      `E-mail: ${answers.email.trim()}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${companyWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const resetConversation = () => {
    setAnswers(initialAnswers(simulation));
    setErrors({});
    setConsent(false);
    setSubmitStatus(null);
    setStep("welcome");
  };

  const prompt = (() => {
    if (step === "welcome") return [content.welcome];
    if (step === "bill")
      return [
        content.prompts.monthlyBill,
        ...(simulation.fromCalculator
          ? [content.prompts.prefilledMonthlyBill]
          : []),
      ];
    if (step === "customerType") return [content.prompts.customerType];
    if (step === "company") return [content.prompts.companyName];
    if (step === "location") return [content.prompts.location];
    if (step === "name") return [content.prompts.name];
    if (step === "whatsapp") return [content.prompts.whatsapp];
    if (step === "email") return [content.prompts.email];
    if (step === "summary") return [content.prompts.summary];
    if (step === "consent") return [content.prompts.consent];
    return [];
  })();

  const summaryItems = [
    {
      label: content.summary.monthlyBillLabel,
      value: formatBRL(monthlyBill),
    },
    {
      label: content.summary.customerTypeLabel,
      value: customerTypeOption?.label ?? "—",
    },
    ...(answers.customerType === "business"
      ? [
          {
            label: content.summary.companyNameLabel,
            value: answers.company.trim(),
          },
        ]
      : []),
    {
      label: content.summary.locationLabel,
      value: `${answers.city.trim()}/${answers.state.trim().toUpperCase()}`,
    },
    { label: content.summary.nameLabel, value: answers.name.trim() },
    { label: content.summary.whatsappLabel, value: answers.whatsapp.trim() },
    { label: content.summary.emailLabel, value: answers.email.trim() },
    {
      label: content.summary.horizonLabel,
      value: `${simulation.analysisHorizon} ${simulation.analysisHorizon === 1 ? "ano" : "anos"}`,
    },
    {
      label: content.summary.estimatedSpendLabel,
      value: formatBRL(estimatedSpend),
    },
  ];

  const renderControls = () => {
    if (step === "success") {
      return (
        <div className="chat-success" role="status" aria-live="polite">
          <span className="chat-success-icon" aria-hidden="true">
            <Check />
          </span>
          <p>{submitStatus?.message ?? content.status.success}</p>
          <button
            type="button"
            className="chat-primary-action"
            data-chat-autofocus=""
            onClick={resetConversation}
          >
            <Zap aria-hidden="true" />
            {content.actions.restart}
          </button>
        </div>
      );
    }

    if (step === "customerType") {
      return (
        <div
          className="chat-quick-replies"
          role="group"
          aria-label={content.prompts.customerType}
        >
          {content.customerTypes.map((option, index) => {
            const value = toCustomerType(option.value);
            return (
              <motion.button
                key={option.value}
                type="button"
                className="chat-chip"
                data-chat-autofocus={index === 0 ? "" : undefined}
                aria-pressed={answers.customerType === value}
                onClick={() => selectCustomerType(option.value)}
                whileHover={reduced ? undefined : { y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                transition={microTransition}
              >
                {option.label}
              </motion.button>
            );
          })}
          <FieldError
            id="chat-customer-type-error"
            message={errors.customerType}
          />
          <button
            type="button"
            className="chat-secondary-action"
            onClick={moveBack}
          >
            <ArrowLeft aria-hidden="true" />
            {content.quickReplies.back}
          </button>
        </div>
      );
    }

    if (step === "summary") {
      return (
        <form className="chat-step-form" onSubmit={handleStepSubmit}>
          <div className="chat-summary">
            <h3>{content.summary.title}</h3>
            <dl>
              {summaryItems.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="chat-step-actions chat-step-actions-wrap">
            <button
              type="button"
              className="chat-secondary-action"
              data-chat-autofocus=""
              onClick={() => moveTo("bill")}
            >
              <Pencil aria-hidden="true" />
              {content.quickReplies.correct}
            </button>
            <button type="submit" className="chat-primary-action">
              {content.quickReplies.continue}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </form>
      );
    }

    if (step === "consent") {
      return (
        <form
          className="chat-step-form"
          onSubmit={submitLead}
        >
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="chat-website">{content.fields.honeypot}</label>
            <input
              id="chat-website"
              tabIndex={-1}
              autoComplete="off"
              value={answers.website}
              onChange={(event) => updateAnswer("website", event.target.value)}
            />
          </div>
          <div
            className="chat-consent"
            data-invalid={errors.consent ? "true" : "false"}
          >
            <input
              id="chat-consent"
              type="checkbox"
              data-chat-autofocus=""
              checked={consent}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby="chat-consent-error"
              onChange={(event) => {
                setConsent(event.target.checked);
                setErrors((current) => ({ ...current, consent: undefined }));
                setSubmitStatus(null);
              }}
            />
            <label htmlFor="chat-consent">
              <ShieldCheck aria-hidden="true" />
              <span>
                {content.consent.labelBeforeLink}{" "}
                <Link href="/privacidade">
                  {content.consent.privacyLinkLabel}
                </Link>
                {content.consent.labelAfterLink}
              </span>
            </label>
            <FieldError id="chat-consent-error" message={errors.consent} />
          </div>
          <div className="chat-step-actions">
            <button
              type="button"
              className="chat-secondary-action"
              onClick={moveBack}
            >
              <ArrowLeft aria-hidden="true" />
              {content.quickReplies.back}
            </button>
            <motion.button
              type="submit"
              className="chat-primary-action chat-send-action"
              whileHover={reduced ? undefined : { scale: 1.015, y: -1 }}
              whileTap={reduced ? undefined : { scale: 0.985 }}
              transition={microTransition}
            >
              <Send aria-hidden="true" />
              {content.actions.send}
            </motion.button>
          </div>
          {submitStatus?.kind === "error" && (
            <p
              className="chat-submit-status error"
              role="alert"
              aria-live="polite"
            >
              {submitStatus.message}
            </p>
          )}
        </form>
      );
    }

    return (
      <form className="chat-step-form" onSubmit={handleStepSubmit} noValidate>
        {step === "bill" && (
          <div
            className="chat-field"
            data-invalid={errors.monthlyBill ? "true" : "false"}
          >
            <label htmlFor="chat-monthly-bill">
              {content.fields.monthlyBill.label}
            </label>
            <input
              id="chat-monthly-bill"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              data-chat-autofocus=""
              value={answers.monthlyBill}
              placeholder={content.fields.monthlyBill.placeholder}
              aria-invalid={Boolean(errors.monthlyBill)}
              aria-describedby="chat-monthly-bill-error"
              onChange={(event) => handleBillInput(event.target.value)}
              onFocus={(event) => {
                const input = event.currentTarget;
                window.requestAnimationFrame(() => input.select());
              }}
              onBlur={() => {
                if (answers.monthlyBill.trim())
                  updateAnswer("monthlyBill", formatBRL(monthlyBill));
              }}
            />
            <FieldError
              id="chat-monthly-bill-error"
              message={errors.monthlyBill}
            />
          </div>
        )}

        {step === "company" && (
          <div
            className="chat-field"
            data-invalid={errors.company ? "true" : "false"}
          >
            <label htmlFor="chat-company">
              {content.fields.companyName.label}
            </label>
            <input
              id="chat-company"
              type="text"
              autoComplete="organization"
              data-chat-autofocus=""
              maxLength={100}
              value={answers.company}
              placeholder={content.fields.companyName.placeholder}
              aria-invalid={Boolean(errors.company)}
              aria-describedby="chat-company-error"
              onChange={(event) => updateAnswer("company", event.target.value)}
            />
            <FieldError id="chat-company-error" message={errors.company} />
          </div>
        )}

        {step === "location" && (
          <div className="chat-location-fields">
            <div
              className="chat-field"
              data-invalid={errors.city ? "true" : "false"}
            >
              <label htmlFor="chat-city">{content.fields.city.label}</label>
              <input
                id="chat-city"
                type="text"
                autoComplete="address-level2"
                data-chat-autofocus=""
                maxLength={80}
                value={answers.city}
                placeholder={content.fields.city.placeholder}
                aria-invalid={Boolean(errors.city)}
                aria-describedby="chat-city-error"
                onChange={(event) => updateAnswer("city", event.target.value)}
              />
              <FieldError id="chat-city-error" message={errors.city} />
            </div>
            <div
              className="chat-field chat-state-field"
              data-invalid={errors.state ? "true" : "false"}
            >
              <label htmlFor="chat-state">{content.fields.state.label}</label>
              <input
                id="chat-state"
                type="text"
                autoComplete="address-level1"
                maxLength={2}
                value={answers.state}
                placeholder={content.fields.state.placeholder}
                aria-invalid={Boolean(errors.state)}
                aria-describedby="chat-state-error"
                onChange={(event) =>
                  updateAnswer(
                    "state",
                    event.target.value.replace(/[^A-Za-z]/g, "").toUpperCase(),
                  )
                }
              />
              <FieldError id="chat-state-error" message={errors.state} />
            </div>
          </div>
        )}

        {step === "name" && (
          <div
            className="chat-field"
            data-invalid={errors.name ? "true" : "false"}
          >
            <label htmlFor="chat-name">{content.fields.name.label}</label>
            <input
              id="chat-name"
              type="text"
              autoComplete="name"
              data-chat-autofocus=""
              maxLength={80}
              value={answers.name}
              placeholder={content.fields.name.placeholder}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="chat-name-error"
              onChange={(event) => updateAnswer("name", event.target.value)}
            />
            <FieldError id="chat-name-error" message={errors.name} />
          </div>
        )}

        {step === "whatsapp" && (
          <div
            className="chat-field"
            data-invalid={errors.whatsapp ? "true" : "false"}
          >
            <label htmlFor="chat-whatsapp">
              {content.fields.whatsapp.label}
            </label>
            <input
              id="chat-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              data-chat-autofocus=""
              maxLength={30}
              value={answers.whatsapp}
              placeholder={content.fields.whatsapp.placeholder}
              aria-invalid={Boolean(errors.whatsapp)}
              aria-describedby="chat-whatsapp-error"
              onChange={(event) => updateAnswer("whatsapp", event.target.value)}
            />
            <FieldError id="chat-whatsapp-error" message={errors.whatsapp} />
          </div>
        )}

        {step === "email" && (
          <div
            className="chat-field"
            data-invalid={errors.email ? "true" : "false"}
          >
            <label htmlFor="chat-email">{content.fields.email.label}</label>
            <input
              id="chat-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              data-chat-autofocus=""
              maxLength={254}
              value={answers.email}
              placeholder={content.fields.email.placeholder}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="chat-email-error"
              onChange={(event) => updateAnswer("email", event.target.value)}
            />
            <FieldError id="chat-email-error" message={errors.email} />
          </div>
        )}

        <div className="chat-step-actions">
          {step !== "welcome" && (
            <button
              type="button"
              className="chat-secondary-action"
              onClick={moveBack}
            >
              <ArrowLeft aria-hidden="true" />
              {content.quickReplies.back}
            </button>
          )}
          <motion.button
            type="submit"
            className="chat-primary-action"
            data-chat-autofocus={step === "welcome" ? "" : undefined}
            whileHover={reduced ? undefined : { scale: 1.015, y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.985 }}
            transition={microTransition}
          >
            {step === "bill" && simulation.fromCalculator
              ? content.quickReplies.confirm
              : content.quickReplies.continue}
            <ArrowRight aria-hidden="true" />
          </motion.button>
        </div>
      </form>
    );
  };

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        className="conversational-chat-trigger"
        aria-label={content.trigger.ariaLabel}
        aria-haspopup="dialog"
        aria-controls="energy-conversational-chat"
        aria-expanded={open}
        initial={reduced ? false : { opacity: 0, y: 14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={reduced ? undefined : { y: -3, scale: 1.02 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        transition={reduced ? { duration: 0 } : elementTransition}
        onClick={() => onOpenChange(true)}
      >
        <span className="chat-trigger-icon" aria-hidden="true">
          <MessageCircle />
          <Zap className="chat-trigger-bolt" />
        </span>
        <span className="chat-trigger-label">{content.trigger.label}</span>
        <motion.span
          className="chat-trigger-pulse"
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0.55, scale: 0.82 }}
          animate={
            reduced ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 1.45 }
          }
          transition={{
            duration: reduced ? 0 : 0.9,
            delay: reduced ? 0 : 0.7,
          }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="conversational-chat-layer"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={reduced ? { duration: 0 } : microTransition}
          >
            <div
              className="conversational-chat-backdrop"
              aria-hidden="true"
              onPointerDown={() => onOpenChange(false)}
            />
            <motion.section
              ref={dialogRef}
              id="energy-conversational-chat"
              className="conversational-chat-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={content.dialog.ariaLabel}
              aria-describedby="energy-chat-subtitle"
              tabIndex={-1}
              data-motion={reduced ? "reduced" : "enabled"}
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      y: motionDistance.element,
                      scale: 0.97,
                    }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduced
                  ? undefined
                  : {
                      opacity: 0,
                      y: motionDistance.element,
                      scale: 0.98,
                    }
              }
              transition={reduced ? { duration: 0 } : elementTransition}
            >
              <header className="chat-dialog-header">
                <span className="chat-dialog-brand" aria-hidden="true">
                  <Zap />
                </span>
                <div>
                  <h2>{content.dialog.title}</h2>
                  <p id="energy-chat-subtitle">{content.dialog.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="chat-close-button"
                  aria-label={content.dialog.closeAriaLabel}
                  onClick={() => onOpenChange(false)}
                >
                  <X aria-hidden="true" />
                </button>
              </header>

              <div className="chat-progress-wrap">
                <div className="chat-progress-copy">
                  <span>{content.progressLabel}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div
                  className="chat-progress"
                  role="progressbar"
                  aria-label={content.progressLabel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <motion.span
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={reduced ? { duration: 0 } : elementTransition}
                  />
                </div>
              </div>

              <div className="chat-dialog-body">
                <div
                  className="chat-message-log"
                  role="log"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-relevant="additions text"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {typing ? (
                      <motion.div
                        key={`typing-${step}`}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduced ? undefined : { opacity: 0 }}
                        transition={reduced ? { duration: 0 } : microTransition}
                      >
                        <TypingIndicator reduced={reduced} />
                      </motion.div>
                    ) : step !== "success" ? (
                      <motion.div
                        key={`prompt-${step}`}
                        className="chat-assistant-message"
                        initial={
                          reduced
                            ? false
                            : { opacity: 0, y: motionDistance.micro }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduced
                            ? undefined
                            : { opacity: 0, y: -motionDistance.micro }
                        }
                        transition={reduced ? { duration: 0 } : microTransition}
                      >
                        <span className="chat-avatar" aria-hidden="true">
                          <Zap />
                        </span>
                        <div className="chat-message-bubble">
                          {prompt.map((message) => (
                            <p key={message}>{message}</p>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {!typing && (
                    <motion.div
                      key={`controls-${step}`}
                      className="chat-controls"
                      initial={
                        reduced
                          ? false
                          : { opacity: 0, y: motionDistance.micro }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduced
                          ? undefined
                          : { opacity: 0, y: -motionDistance.micro }
                      }
                      transition={reduced ? { duration: 0 } : microTransition}
                    >
                      {renderControls()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
