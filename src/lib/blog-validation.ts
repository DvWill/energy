import { z } from "zod";
import { createSlug, plainText, safeWebUrl } from "./blog";

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const url = safeWebUrl(v);
    if (!url)
      ctx.addIssue({
        code: "custom",
        message: "Informe uma URL HTTP ou HTTPS válida.",
      });
    return url;
  });

const optionalImageUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    if (
      /^\/(?:images|assets|brand)\/[a-zA-Z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(
        v,
      )
    )
      return v;
    const url = safeWebUrl(v);
    if (!url || !url.startsWith("https://"))
      ctx.addIssue({
        code: "custom",
        message: "Informe uma imagem local válida ou uma URL HTTPS.",
      });
    return url;
  });

const isoDateTimeWithZone = z.iso.datetime({ offset: true });

const optionalDateTime = z
  .string()
  .trim()
  .max(40)
  .optional()
  .nullable()
  .transform((v, ctx) => {
    if (!v) return null;
    if (!isoDateTimeWithZone.safeParse(v).success) {
      ctx.addIssue({
        code: "custom",
        message:
          "Informe uma data e hora ISO 8601 com fuso horário (Z ou ±HH:MM).",
      });
      return z.NEVER;
    }
    return new Date(v);
  });

export const postInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(180, "Use no máximo 180 caracteres no título."),
    slug: z
      .string()
      .transform(createSlug)
      .pipe(
        z
          .string()
          .min(3, "Informe um endereço com pelo menos 3 caracteres.")
          .max(160, "Use no máximo 160 caracteres no endereço."),
      ),
    subtitle: z
      .string()
      .trim()
      .max(240)
      .optional()
      .transform((v) => v || null),
    summary: z
      .string()
      .trim()
      .max(500, "Use no máximo 500 caracteres no resumo."),
    content: z
      .string()
      .max(300_000, "O conteúdo ultrapassou o limite permitido."),
    highlightLabel: z.string().trim().max(120).optional().transform((v) => v || null),
    highlightValue: z.string().trim().max(120).optional().transform((v) => v || null),
    highlightComplement: z.string().trim().max(180).optional().transform((v) => v || null),
    quote: z.string().trim().max(500).optional().transform((v) => v || null),
    sourceName: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((v) => v || null),
    sourceUrl: optionalUrl,
    coverImageUrl: optionalImageUrl,
    coverImageId: z
      .string()
      .trim()
      .max(300)
      .optional()
      .transform((v) => v || null),
    coverImageAlt: z
      .string()
      .trim()
      .max(240)
      .optional()
      .transform((v) => v || null),
    coverImageCaption: z
      .string()
      .trim()
      .max(300)
      .optional()
      .transform((v) => v || null),
    coverImageWidth: z.coerce
      .number()
      .int()
      .positive()
      .max(12000)
      .optional()
      .nullable(),
    coverImageHeight: z.coerce
      .number()
      .int()
      .positive()
      .max(12000)
      .optional()
      .nullable(),
    categoryId: z.uuid().optional().nullable(),
    authorId: z.uuid().optional().nullable(),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
    isFeatured: z.coerce.boolean().default(false),
    publishedAt: optionalDateTime,
    scheduledAt: optionalDateTime,
    metaTitle: z
      .string()
      .trim()
      .max(70)
      .optional()
      .transform((v) => v || null),
    metaDescription: z
      .string()
      .trim()
      .max(170)
      .optional()
      .transform((v) => v || null),
    socialImageUrl: optionalUrl,
    canonicalUrl: optionalUrl,
    noIndex: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const isPublishable =
      data.status === "PUBLISHED" || data.status === "SCHEDULED";
    if (isPublishable && data.title.length < 5)
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "Para publicar, use um título com pelo menos 5 caracteres.",
      });
    if (!isPublishable && data.title.length < 3)
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "Informe um título com pelo menos 3 caracteres.",
      });
    if (isPublishable && data.summary.length < 20)
      ctx.addIssue({
        code: "custom",
        path: ["summary"],
        message: "Escreva um resumo com pelo menos 20 caracteres.",
      });
    if (isPublishable && plainText(data.content).length < 20)
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Escreva pelo menos 20 caracteres de conteúdo.",
      });
    if (isPublishable && data.sourceUrl && !data.sourceName)
      ctx.addIssue({
        code: "custom",
        path: ["sourceName"],
        message: "Informe o nome da fonte da notícia.",
      });
    if (isPublishable && data.sourceName && !data.sourceUrl)
      ctx.addIssue({
        code: "custom",
        path: ["sourceUrl"],
        message: "Informe o link da notícia original.",
      });
    if (isPublishable && data.coverImageUrl && !data.coverImageAlt)
      ctx.addIssue({
        code: "custom",
        path: ["coverImageAlt"],
        message: "Descreva a imagem de capa para acessibilidade.",
      });
    if (data.status === "SCHEDULED" && !data.scheduledAt)
      ctx.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Defina a data e a hora do agendamento.",
      });
    if (
      data.status === "PUBLISHED" &&
      data.publishedAt &&
      data.publishedAt.getTime() > Date.now() + 60_000
    )
      ctx.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "Para publicar no futuro, escolha o status Agendada.",
      });
  });

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .transform((value) => createSlug(value).slice(0, 100))
    .pipe(z.string().min(2).max(100)),
  description: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => v || null),
});

export const publicQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  category: z.string().trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
  limit: z.coerce.number().int().min(1).max(24).catch(9),
});
