import { z } from "zod";
import {
  ANALYSIS_HORIZON_MAX,
  ANALYSIS_HORIZON_MIN,
} from "@/lib/savings-calculator";

const clean = (value: string) => value.trim().replace(/\s+/g, " ");
const optionalCleanString = (maximumLength: number) =>
  z.string().transform(clean).pipe(z.string().max(maximumLength)).optional();

const requiredIssue = (
  context: z.RefinementCtx,
  path: string,
  message: string,
) => {
  context.addIssue({ code: "custom", path: [path], message });
};

export const leadSchema = z
  .object({
    name: z
      .string()
      .transform(clean)
      .pipe(z.string().min(2, "Informe seu nome.").max(80)),
    company: optionalCleanString(100),
    email: z
      .email("Informe um e-mail válido.")
      .transform((value) => value.trim().toLowerCase()),
    phone: z
      .string()
      .transform(clean)
      .pipe(z.string().min(8, "Informe um WhatsApp válido.").max(30)),
    message: optionalCleanString(1200),
    consent: z
      .boolean()
      .refine((value) => value, "Confirme que leu a política de privacidade."),
    website: z.string().max(200).optional(),
    origin: z.enum(["contact-form", "conversational-chat"]).optional(),
    customerType: z.enum(["residential", "business", "rural"]).optional(),
    monthlyBill: z
      .number()
      .finite()
      .positive("Informe um valor de conta válido.")
      .optional(),
    city: z
      .string()
      .transform(clean)
      .pipe(z.string().min(2, "Informe a cidade.").max(80))
      .optional(),
    state: z
      .string()
      .transform((value) => clean(value).toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{2}$/, "Informe uma UF válida."))
      .optional(),
    analysisHorizon: z
      .number()
      .int()
      .min(ANALYSIS_HORIZON_MIN)
      .max(ANALYSIS_HORIZON_MAX)
      .optional(),
    estimatedSpendWithoutSolar: z.number().finite().nonnegative().optional(),
  })
  .superRefine((lead, context) => {
    const origin = lead.origin ?? "contact-form";

    if (origin === "contact-form") {
      if (!lead.company || lead.company.length < 2)
        requiredIssue(context, "company", "Informe a empresa.");
      if (!lead.message || lead.message.length < 10)
        requiredIssue(
          context,
          "message",
          "Descreva sua necessidade em pelo menos 10 caracteres.",
        );
      return;
    }

    if (lead.customerType === undefined)
      requiredIssue(context, "customerType", "Informe o tipo de projeto.");
    if (lead.monthlyBill === undefined)
      requiredIssue(context, "monthlyBill", "Informe o valor da conta.");
    if (lead.city === undefined)
      requiredIssue(context, "city", "Informe a cidade.");
    if (lead.state === undefined)
      requiredIssue(context, "state", "Informe o estado.");
    if (lead.analysisHorizon === undefined)
      requiredIssue(
        context,
        "analysisHorizon",
        "Informe o período da simulação.",
      );
    if (lead.estimatedSpendWithoutSolar === undefined)
      requiredIssue(
        context,
        "estimatedSpendWithoutSolar",
        "Informe o resultado da simulação.",
      );
    if (
      lead.customerType === "business" &&
      (!lead.company || lead.company.length < 2)
    )
      requiredIssue(context, "company", "Informe a empresa.");
  });
export type LeadInput = z.input<typeof leadSchema>;
