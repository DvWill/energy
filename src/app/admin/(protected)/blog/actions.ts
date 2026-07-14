"use server";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/db";
import { categories, posts, postRedirects } from "@/db/schema";
import { categoryInputSchema, postInputSchema } from "@/lib/blog-validation";
import { readingTime, sanitizeArticleHtml } from "@/lib/blog";

function value(data: FormData, key: string) { const item = data.get(key); return typeof item === "string" ? item : ""; }
function postPayload(data: FormData) {
  return { title: value(data,"title"), slug: value(data,"slug") || value(data,"title"), subtitle: value(data,"subtitle"), summary: value(data,"summary"), content: value(data,"content"), coverImageUrl: value(data,"coverImageUrl"), coverImageId: value(data,"coverImageId"), coverImageAlt: value(data,"coverImageAlt"), coverImageCaption: value(data,"coverImageCaption"), coverImageWidth: value(data,"coverImageWidth") || undefined, coverImageHeight: value(data,"coverImageHeight") || undefined, categoryId: value(data,"categoryId") || null, authorId: value(data,"authorId") || null, status: value(data,"status"), isFeatured: data.get("isFeatured") === "on", publishedAt: value(data,"publishedAt") || null, scheduledAt: value(data,"scheduledAt") || null, metaTitle: value(data,"metaTitle"), metaDescription: value(data,"metaDescription"), socialImageUrl: value(data,"socialImageUrl"), canonicalUrl: value(data,"canonicalUrl"), noIndex: data.get("noIndex") === "on" };
}
function dates(status: string, publishedAt?: string | null, scheduledAt?: string | null) {
  const schedule = status === "SCHEDULED" && scheduledAt ? new Date(scheduledAt) : null;
  return { publishedAt: status === "PUBLISHED" ? (publishedAt ? new Date(publishedAt) : new Date()) : schedule ?? (publishedAt ? new Date(publishedAt) : null), scheduledAt: schedule };
}
export type AdminFormState = { error: string; fields?: Record<string, string[]> };
export async function savePostAction(id: string | null, _state: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin(); const parsed = postInputSchema.safeParse(postPayload(formData));
  if (!parsed.success) return { error: "Revise os campos destacados.", fields: parsed.error.flatten().fieldErrors as Record<string,string[]> };
  const db = getDb(), cleanContent = sanitizeArticleHtml(parsed.data.content), now = new Date();
  const duplicate = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.slug, parsed.data.slug), ...(id ? [ne(posts.id, id)] : []))).limit(1);
  if (duplicate[0]) return { error: "Este slug já está em uso." };
  if (parsed.data.isFeatured) await db.update(posts).set({ isFeatured: false, updatedAt: now }).where(eq(posts.isFeatured, true));
  const payload = { ...parsed.data, ...dates(parsed.data.status, parsed.data.publishedAt, parsed.data.scheduledAt), content: cleanContent, readingTimeMinutes: readingTime(cleanContent), updatedAt: now };
  if (id) {
    const old = await db.select({ slug: posts.slug, status: posts.status }).from(posts).where(eq(posts.id, id)).limit(1);
    if (!old[0]) return { error: "Publicação não encontrada." };
    if (old[0].slug !== payload.slug && old[0].status === "PUBLISHED") await db.insert(postRedirects).values({ oldSlug: old[0].slug, postId: id }).onConflictDoNothing();
    await db.update(posts).set(payload).where(eq(posts.id, id));
  } else await db.insert(posts).values(payload);
  revalidatePath("/blog"); revalidatePath("/sitemap.xml"); redirect("/admin/blog?saved=1");
}
export async function deletePostAction(id: string) { await requireAdmin(); await getDb().delete(posts).where(eq(posts.id, id)); revalidatePath("/blog"); redirect("/admin/blog?deleted=1"); }
export async function duplicatePostAction(id: string) { await requireAdmin(); const db = getDb(), source = await db.select().from(posts).where(eq(posts.id,id)).limit(1); if (!source[0]) return; const { id: _id, createdAt: _created, updatedAt: _updated, ...copy } = source[0]; void _id; void _created; void _updated; await db.insert(posts).values({ ...copy, title: `${copy.title} (cópia)`, slug: `${copy.slug}-copia-${Date.now()}`, status: "DRAFT", isFeatured: false, publishedAt: null, scheduledAt: null }); redirect("/admin/blog"); }
export async function saveCategoryAction(_state: AdminFormState, formData: FormData): Promise<AdminFormState> { await requireAdmin(); const parsed = categoryInputSchema.safeParse({ name: value(formData,"name"), slug: value(formData,"slug") || value(formData,"name"), description: value(formData,"description") }); if (!parsed.success) return { error: "Revise os dados da categoria." }; try { await getDb().insert(categories).values(parsed.data); revalidatePath("/blog"); return { error: "" }; } catch { return { error: "Nome ou slug já utilizado." }; } }
export async function deleteCategoryAction(id: string) { await requireAdmin(); await getDb().delete(categories).where(eq(categories.id,id)); revalidatePath("/blog"); }
