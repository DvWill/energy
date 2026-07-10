import { z } from "zod";

const clean = (value: string) => value.trim().replace(/\s+/g, " ");
export const leadSchema = z.object({
  name: z
    .string()
    .transform(clean)
    .pipe(z.string().min(2, "Informe seu nome.").max(80)),
  company: z
    .string()
    .transform(clean)
    .pipe(z.string().min(2, "Informe a empresa.").max(100)),
  email: z
    .email("Informe um e-mail válido.")
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .transform(clean)
    .pipe(z.string().min(8, "Informe um WhatsApp válido.").max(30)),
  message: z
    .string()
    .transform(clean)
    .pipe(
      z
        .string()
        .min(10, "Descreva sua necessidade em pelo menos 10 caracteres.")
        .max(1200),
    ),
  consent: z
    .boolean()
    .refine((value) => value, "Confirme que leu a política de privacidade."),
  website: z.string().max(0).optional(),
});
export type LeadInput = z.input<typeof leadSchema>;
