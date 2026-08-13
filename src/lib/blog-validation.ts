import { z } from "zod";
import { createSlug, safeWebUrl } from "./blog";

const optionalUrl = z.string().trim().max(2048).optional().transform((v, ctx) => {
  if (!v) return null;
  const url = safeWebUrl(v);
  if (!url) ctx.addIssue({ code: "custom", message: "Informe uma URL HTTP ou HTTPS válida." });
  return url;
});

const optionalImageUrl = z.string().trim().max(2048).optional().transform((v, ctx) => {
  if (!v) return null;
  if (/^\/(?:images|assets|brand)\/[a-zA-Z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(v)) return v;
  const url = safeWebUrl(v);
  if (!url) ctx.addIssue({ code: "custom", message: "Informe uma imagem local válida ou uma URL HTTP/HTTPS." });
  return url;
});

const optionalDateTime = z.string().trim().max(40).optional().nullable().transform((v, ctx) => {
  if (!v) return null;
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: "custom", message: "Informe uma data e hora válidas." });
    return z.NEVER;
  }
  return date;
});

export const postInputSchema = z.object({
  title: z.string().trim().min(5).max(180),
  slug: z.string().trim().max(160).transform(createSlug).pipe(z.string().min(3)),
  subtitle: z.string().trim().max(240).optional().transform((v) => v || null),
  summary: z.string().trim().min(20).max(500),
  content: z.string().min(20).max(300_000),
  sourceName: z.string().trim().max(160).optional().transform((v) => v || null),
  sourceUrl: optionalUrl,
  coverImageUrl: optionalImageUrl, coverImageId: z.string().trim().max(300).optional().transform((v) => v || null),
  coverImageAlt: z.string().trim().max(240).optional().transform((v) => v || null),
  coverImageCaption: z.string().trim().max(300).optional().transform((v) => v || null),
  coverImageWidth: z.coerce.number().int().positive().max(12000).optional().nullable(),
  coverImageHeight: z.coerce.number().int().positive().max(12000).optional().nullable(),
  categoryId: z.uuid().optional().nullable(), authorId: z.uuid().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.coerce.boolean().default(false),
  publishedAt: optionalDateTime, scheduledAt: optionalDateTime,
  metaTitle: z.string().trim().max(70).optional().transform((v) => v || null),
  metaDescription: z.string().trim().max(170).optional().transform((v) => v || null),
  socialImageUrl: optionalUrl, canonicalUrl: optionalUrl,
  noIndex: z.coerce.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.sourceUrl && !data.sourceName) ctx.addIssue({ code: "custom", path: ["sourceName"], message: "Informe o nome da fonte da notícia." });
  if (data.sourceName && !data.sourceUrl) ctx.addIssue({ code: "custom", path: ["sourceUrl"], message: "Informe o link da notícia original." });
  if (data.coverImageUrl && !data.coverImageAlt) ctx.addIssue({ code: "custom", path: ["coverImageAlt"], message: "O texto alternativo é obrigatório quando há capa." });
  if (data.status === "SCHEDULED" && !data.scheduledAt) ctx.addIssue({ code: "custom", path: ["scheduledAt"], message: "Defina a data do agendamento." });
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(100).transform(createSlug).pipe(z.string().min(2)),
  description: z.string().trim().max(300).optional().transform((v) => v || null),
});

export const publicQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""), category: z.string().trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).max(10000).catch(1), limit: z.coerce.number().int().min(1).max(24).catch(9),
});
