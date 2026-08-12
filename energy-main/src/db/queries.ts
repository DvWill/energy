import "server-only";
import { and, desc, eq, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { getDb } from ".";
import { authors, categories, posts, postTags, tags } from "./schema";

const published = () => or(
  and(eq(posts.status, "PUBLISHED"), lte(posts.publishedAt, new Date())),
  and(eq(posts.status, "SCHEDULED"), lte(posts.scheduledAt, new Date())),
)!;
const cardFields = {
  id: posts.id, title: posts.title, slug: posts.slug, summary: posts.summary,
  coverImageUrl: posts.coverImageUrl, coverImageAlt: posts.coverImageAlt,
  coverImageWidth: posts.coverImageWidth, coverImageHeight: posts.coverImageHeight,
  publishedAt: posts.publishedAt, readingTimeMinutes: posts.readingTimeMinutes,
  isFeatured: posts.isFeatured, categoryName: categories.name, categorySlug: categories.slug,
  authorName: authors.displayName,
};

export async function listPublishedPosts(input: { q?: string; category?: string; page?: number; limit?: number }) {
  const db = getDb();
  const page = input.page ?? 1, limit = input.limit ?? 9;
  const filters = [published()];
  if (input.category) filters.push(eq(categories.slug, input.category));
  if (input.q) {
    const term = `%${input.q}%`;
    filters.push(or(ilike(posts.title, term), ilike(posts.summary, term), ilike(posts.content, term), ilike(categories.name, term))!);
  }
  const where = and(...filters);
  const [items, countRows] = await Promise.all([
    db.select(cardFields).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).leftJoin(authors, eq(posts.authorId, authors.id))
      .where(where).orderBy(desc(posts.publishedAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).where(where),
  ]);
  const total = countRows[0]?.count ?? 0;
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)), hasMore: page * limit < total };
}

export async function getFeaturedPost() {
  const db = getDb();
  const rows = await db.select(cardFields).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(published(), eq(posts.isFeatured, true))).orderBy(desc(posts.publishedAt)).limit(1);
  return rows[0] ?? null;
}

export async function listCategories() {
  return getDb().select().from(categories).orderBy(categories.name);
}

export async function getPublishedPost(slug: string) {
  const db = getDb();
  const rows = await db.select({ post: posts, category: categories, author: authors }).from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id)).leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(published(), eq(posts.slug, slug))).limit(1);
  if (!rows[0]) return null;
  const tagRows = await db.select({ id: tags.id, name: tags.name, slug: tags.slug }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, rows[0].post.id));
  return { ...rows[0], tags: tagRows };
}

export async function relatedPosts(postId: string, categoryId: string | null, tagIds: string[], limit = 3) {
  const db = getDb();
  const categoryRows = categoryId ? await db.select(cardFields).from(posts).leftJoin(categories, eq(posts.categoryId, categories.id)).leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(published(), ne(posts.id, postId), eq(posts.categoryId, categoryId))).orderBy(desc(posts.publishedAt)).limit(limit) : [];
  if (categoryRows.length >= limit || !tagIds.length) return categoryRows;
  const ids = categoryRows.map((item) => item.id);
  const tagRows = await db.selectDistinct(cardFields).from(posts).innerJoin(postTags, eq(posts.id, postTags.postId)).leftJoin(categories, eq(posts.categoryId, categories.id)).leftJoin(authors, eq(posts.authorId, authors.id))
    .where(and(published(), ne(posts.id, postId), inArray(postTags.tagId, tagIds), ...(ids.length ? [sql`${posts.id} not in ${ids}`] : []))).orderBy(desc(posts.publishedAt)).limit(limit - categoryRows.length);
  return [...categoryRows, ...tagRows];
}

export async function adjacentPosts(publishedAt: Date, id: string) {
  const db = getDb();
  const [previous, next] = await Promise.all([
    db.select({ title: posts.title, slug: posts.slug }).from(posts).where(and(published(), ne(posts.id, id), lte(posts.publishedAt, publishedAt))).orderBy(desc(posts.publishedAt)).limit(1),
    db.select({ title: posts.title, slug: posts.slug }).from(posts).where(and(published(), ne(posts.id, id), sql`${posts.publishedAt} > ${publishedAt}`)).orderBy(posts.publishedAt).limit(1),
  ]);
  return { previous: previous[0] ?? null, next: next[0] ?? null };
}

export async function listAdminPosts(input: { q?: string; status?: string; category?: string; page?: number }) {
  const db = getDb(); const filters = [];
  if (input.q) filters.push(ilike(posts.title, `%${input.q}%`));
  if (["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"].includes(input.status ?? "")) filters.push(eq(posts.status, input.status as "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED"));
  if (input.category) filters.push(eq(posts.categoryId, input.category));
  return db.select({ ...cardFields, status: posts.status, updatedAt: posts.updatedAt, scheduledAt: posts.scheduledAt }).from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id)).leftJoin(authors, eq(posts.authorId, authors.id))
    .where(filters.length ? and(...filters) : undefined).orderBy(desc(posts.updatedAt)).limit(50).offset(((input.page ?? 1) - 1) * 50);
}

export async function getAdminPost(id: string) {
  const rows = await getDb().select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listAuthors() { return getDb().select().from(authors).orderBy(authors.displayName); }
