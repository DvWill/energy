"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { leadSchema, type LeadInput } from "@/lib/validations";
import { elementTransition, microTransition } from "@/lib/motion";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
const fields = [
  { name: "name", label: "Nome", type: "text", auto: "name" },
  { name: "company", label: "Empresa", type: "text", auto: "organization" },
  { name: "email", label: "E-mail", type: "email", auto: "email" },
  { name: "phone", label: "WhatsApp", type: "tel", auto: "tel" },
] as const;

function FieldError({
  id,
  message,
  reduced,
}: {
  id: string;
  message?: string;
  reduced: boolean;
}) {
  return (
    <span id={id} className="error" aria-live="polite">
      <AnimatePresence initial={false} mode="wait">
        {message && (
          <motion.span
            key={message}
            initial={reduced ? false : { opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -2 }}
            transition={reduced ? { duration: 0 } : microTransition}
          >
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function LeadForm() {
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const reduced = useAccessibleMotion();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      consent: false,
      origin: "contact-form",
      website: "",
    },
  });
  const submit = handleSubmit(async (data) => {
    setStatus(null);
    const endpoint =
      process.env.NEXT_PUBLIC_LEAD_FORM_URL?.trim() || "/api/leads";
    if (
      process.env.NEXT_PUBLIC_STATIC_HOST === "true" &&
      !process.env.NEXT_PUBLIC_LEAD_FORM_URL
    ) {
      setStatus({
        kind: "error",
        message:
          "O formulário ainda não está conectado neste ambiente. Configure um serviço de formulários externo para habilitar o envio.",
      });
      return;
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseBody: unknown = await res.json().catch(() => null);
      const message =
        responseBody &&
        typeof responseBody === "object" &&
        "message" in responseBody &&
        typeof responseBody.message === "string"
          ? responseBody.message
          : null;
      if (!res.ok)
        throw new Error(message ?? "Não foi possível concluir o envio.");
      setStatus({
        kind: "success",
        message: message ?? "Solicitação enviada com sucesso.",
      });
      reset();
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Não foi possível enviar.",
      });
    }
  });
  const visibleStatus = isSubmitting
    ? { kind: "loading" as const, message: "Enviando sua solicitação…" }
    : status;

  return (
    <motion.form onSubmit={submit} noValidate aria-busy={isSubmitting}>
      {fields.map((f) => (
        <div
          className="field"
          data-invalid={errors[f.name] ? "true" : "false"}
          key={f.name}
        >
          <label htmlFor={f.name}>{f.label}</label>
          <input
            id={f.name}
            type={f.type}
            autoComplete={f.auto}
            aria-invalid={!!errors[f.name]}
            aria-describedby={`${f.name}-error`}
            {...register(f.name)}
          />
          <FieldError
            id={`${f.name}-error`}
            message={errors[f.name]?.message}
            reduced={reduced}
          />
        </div>
      ))}
      <div
        className="field full"
        data-invalid={errors.message ? "true" : "false"}
      >
        <label htmlFor="message">Como podemos ajudar?</label>
        <textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby="message-error"
          {...register("message")}
        />
        <FieldError
          id="message-error"
          message={errors.message?.message}
          reduced={reduced}
        />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Site</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>
      <div className="check full">
        <input
          id="consent"
          type="checkbox"
          aria-invalid={!!errors.consent}
          aria-describedby="consent-error"
          {...register("consent")}
        />
        <label htmlFor="consent">
          Li e concordo com a{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </label>
        <FieldError
          id="consent-error"
          message={errors.consent?.message}
          reduced={reduced}
        />
      </div>
      <motion.button
        className="button full"
        disabled={isSubmitting}
        whileHover={
          reduced || isSubmitting ? undefined : { scale: 1.015, y: -1 }
        }
        whileTap={reduced || isSubmitting ? undefined : { scale: 0.99 }}
        transition={microTransition}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            className="form-submit-label"
            key={isSubmitting ? "loading" : "idle"}
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -4 }}
            transition={reduced ? { duration: 0 } : microTransition}
          >
            {isSubmitting ? (
              <LoaderCircle className="spin" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
            {isSubmitting ? "Enviando…" : "Enviar solicitação"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <motion.div
        className={`form-status ${visibleStatus?.kind ?? ""}`}
        data-motion-form-status=""
        data-state={visibleStatus?.kind ?? "idle"}
        role={visibleStatus?.kind === "error" ? "alert" : "status"}
        aria-live="polite"
        aria-atomic="true"
        animate={{
          height: visibleStatus ? "auto" : 0,
          opacity: visibleStatus ? 1 : 0,
        }}
        transition={reduced ? { duration: 0 } : elementTransition}
      >
        <AnimatePresence initial={false} mode="wait">
          {visibleStatus && (
            <motion.p
              key={`${visibleStatus.kind}-${visibleStatus.message}`}
              initial={reduced ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -5 }}
              transition={reduced ? { duration: 0 } : microTransition}
            >
              {visibleStatus.kind === "success" && (
                <CircleCheck aria-hidden="true" />
              )}
              {visibleStatus.kind === "error" && (
                <CircleAlert aria-hidden="true" />
              )}
              {visibleStatus.kind === "loading" && (
                <LoaderCircle className="spin" aria-hidden="true" />
              )}
              {visibleStatus.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.form>
  );
}
