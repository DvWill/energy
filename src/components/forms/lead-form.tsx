"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { leadSchema, type LeadInput } from "@/lib/validations";
import { elementTransition, microTransition } from "@/lib/motion";
const fields = [
  { name: "name", label: "Nome", type: "text", auto: "name" },
  { name: "company", label: "Empresa", type: "text", auto: "organization" },
  { name: "email", label: "E-mail", type: "email", auto: "email" },
  { name: "phone", label: "WhatsApp", type: "tel", auto: "tel" },
] as const;
export function LeadForm() {
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const reduced = useReducedMotion();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { consent: false, website: "" },
  });
  const submit = handleSubmit(async (data) => {
    setStatus(null);
    const endpoint = process.env.NEXT_PUBLIC_LEAD_FORM_URL ?? "/api/leads";
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
      const json = (await res.json()) as { message: string };
      if (!res.ok) throw new Error(json.message);
      setStatus({ kind: "success", message: json.message });
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
        <div className="field" key={f.name}>
          <label htmlFor={f.name}>{f.label}</label>
          <input
            id={f.name}
            type={f.type}
            autoComplete={f.auto}
            aria-invalid={!!errors[f.name]}
            aria-describedby={`${f.name}-error`}
            {...register(f.name)}
          />
          <span id={`${f.name}-error`} className="error">
            {errors[f.name]?.message}
          </span>
        </div>
      ))}
      <div className="field full">
        <label htmlFor="message">Como podemos ajudar?</label>
        <textarea
          id="message"
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby="message-error"
          {...register("message")}
        />
        <span id="message-error" className="error">
          {errors.message?.message}
        </span>
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
          Li e concordo com a <a href="/privacidade">política de privacidade</a>
          .
        </label>
        <span id="consent-error" className="error">
          {errors.consent?.message}
        </span>
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
              {visibleStatus.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.form>
  );
}
