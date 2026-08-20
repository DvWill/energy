"use server";
import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/db";
import { categories, posts } from "@/db/schema";
import { categoryInputSchema, postInputSchema } from "@/lib/blog-validation";
import { plainText, readingTime, sanitizeArticleHtml } from "@/lib/blog";

function value(data: FormData, key: string) {
  const item = data.get(key);
  return typeof item === "string" ? item : "";
}

function postPayload(data: FormData) {
  const status =
    value(data, "intent") === "draft" ? "DRAFT" : value(data, "status");
  return {
    title: value(data, "title"),
    slug: value(data, "slug") || value(data, "title"),
    subtitle: value(data, "subtitle"),
    summary: value(data, "summary"),
    content: value(data, "content"),
    sourceName: value(data, "sourceName"),
    sourceUrl: value(data, "sourceUrl"),
    coverImageUrl: value(data, "coverImageUrl"),
    coverImageId: value(data, "coverImageId"),
    coverImageAlt: value(data, "coverImageAlt"),
    coverImageCaption: value(data, "coverImageCaption"),
    coverImageWidth: value(data, "coverImageWidth") || undefined,
    coverImageHeight: value(data, "coverImageHeight") || undefined,
    categoryId: value(data, "categoryId") || null,
    authorId: value(data, "authorId") || null,
    status,
    isFeatured: data.get("isFeatured") === "on",
    publishedAt: value(data, "publishedAt") || null,
    scheduledAt: value(data, "scheduledAt") || null,
    metaTitle: value(data, "metaTitle"),
    metaDescription: value(data, "metaDescription"),
    socialImageUrl: value(data, "socialImageUrl"),
    canonicalUrl: value(data, "canonicalUrl"),
    noIndex: data.get("noIndex") === "on",
  };
}

type ExistingPost = {
  id: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  scheduledAt: Date | null;
  updatedAt: Date;
};

function dates(
  status: ExistingPost["status"],
  publishedAt: Date | null | undefined,
  scheduledAt: Date | null | undefined,
  existing: ExistingPost | null,
  now: Date,
) {
  if (status === "DRAFT") {
    return { publishedAt: null, scheduledAt: null };
  }
  if (status === "SCHEDULED") {
    return {
      publishedAt: scheduledAt ?? null,
      scheduledAt: scheduledAt ?? null,
    };
  }
  if (status === "ARCHIVED") {
    const wasPublicAt =
      existing?.status === "PUBLISHED"
        ? existing.publishedAt
        : existing?.status === "SCHEDULED" &&
            existing.scheduledAt &&
            existing.scheduledAt.getTime() <= now.getTime()
          ? existing.scheduledAt
          : null;
    return {
      publishedAt:
        wasPublicAt ??
        (publishedAt && publishedAt.getTime() <= now.getTime()
          ? publishedAt
          : null),
      scheduledAt: null,
    };
  }
  const previousPublicDate =
    existing?.status === "PUBLISHED"
      ? existing.publishedAt
      : existing?.status === "SCHEDULED" &&
          existing.scheduledAt &&
          existing.scheduledAt.getTime() <= now.getTime()
        ? existing.scheduledAt
        : null;
  return {
    publishedAt: publishedAt ?? previousPublicDate ?? now,
    scheduledAt: null,
  };
}

export type AdminFormState = {
  error: string;
  fields?: Record<string, string[]>;
};

function isSlugConflict(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("blog_posts_slug_uidx") ||
    message.includes("duplicate key")
  );
}

export async function savePostAction(
  id: string | null,
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = postInputSchema.safeParse(postPayload(formData));
  if (!parsed.success) {
    return {
      error: "Revise os campos indicados antes de continuar.",
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const cleanContent = sanitizeArticleHtml(parsed.data.content);
  const isPublishable = ["PUBLISHED", "SCHEDULED"].includes(parsed.data.status);
  if (isPublishable && plainText(cleanContent).length < 20) {
    return {
      error: "Revise os campos indicados antes de continuar.",
      fields: {
        content: [
          "O conteúdo precisa ter pelo menos 20 caracteres de texto válido.",
        ],
      },
    };
  }

  let db: ReturnType<typeof getDb>;
  let existing: ExistingPost | null = null;
  let resolvedSlug = parsed.data.slug;
  try {
    db = getDb();
    const [duplicate, current] = await Promise.all([
      db
        .select({ id: posts.id })
        .from(posts)
        .where(
          and(
            eq(posts.slug, parsed.data.slug),
            ...(id ? [ne(posts.id, id)] : []),
          ),
        )
        .limit(1),
      id
        ? db
            .select({
              id: posts.id,
              slug: posts.slug,
              status: posts.status,
              publishedAt: posts.publishedAt,
              scheduledAt: posts.scheduledAt,
              updatedAt: posts.updatedAt,
            })
            .from(posts)
            .where(eq(posts.id, id))
            .limit(1)
        : Promise.resolve([]),
    ]);
    if (duplicate[0] && !id) {
      for (let suffix = 2; suffix <= 999; suffix += 1) {
        const candidate = `${parsed.data.slug.slice(0, 156)}-${suffix}`;
        const match = await db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.slug, candidate))
          .limit(1);
        if (!match[0]) {
          resolvedSlug = candidate;
          break;
        }
      }
    } else if (duplicate[0]) {
      return {
        error: "O endereço desta publicação já está sendo usado.",
        fields: { slug: ["Escolha outro endereço para a publicação."] },
      };
    }
    existing = current[0] ?? null;
    if (id && !existing) return { error: "Publicação não encontrada." };
  } catch (error) {
    console.error("Falha ao validar a publicação antes de salvar.", error);
    return {
      error:
        "Não foi possível acessar o banco agora. Seu texto continua nesta página; tente novamente.",
    };
  }

  const now = new Date();
  let status: ExistingPost["status"] = parsed.data.status;
  let publishedAt = parsed.data.publishedAt;
  if (
    status === "SCHEDULED" &&
    parsed.data.scheduledAt &&
    parsed.data.scheduledAt.getTime() <= now.getTime()
  ) {
    const unchangedExpiredSchedule =
      existing?.status === "SCHEDULED" &&
      existing.scheduledAt?.getTime() === parsed.data.scheduledAt.getTime();
    if (!unchangedExpiredSchedule) {
      return {
        error: "Revise os campos indicados antes de continuar.",
        fields: {
          scheduledAt: ["Escolha uma data futura para o agendamento."],
        },
      };
    }
    // Um agendamento vencido já está público; ao editá-lo, consolidamos o status.
    status = "PUBLISHED";
    publishedAt = existing.scheduledAt;
  }

  const resolvedDates = dates(
    status,
    publishedAt,
    parsed.data.scheduledAt,
    existing,
    now,
  );
  const payload = {
    ...parsed.data,
    slug: resolvedSlug,
    status,
    ...resolvedDates,
    content: cleanContent,
    // Um post futuro não toma o destaque de uma publicação que já está no ar.
    isFeatured: status === "PUBLISHED" && parsed.data.isFeatured,
    readingTimeMinutes: readingTime(cleanContent),
    updatedAt: now,
  };

  const savedId = id ?? crypto.randomUUID();
  const oldSlug = existing?.slug ?? null;
  const redirectFrom =
    existing &&
    existing.slug !== payload.slug &&
    ["PUBLISHED", "SCHEDULED"].includes(existing.status)
      ? existing.slug
      : null;
  try {
    const lock = db.execute(sql`select pg_advisory_xact_lock(246813579)`);
    const save = id
      ? db
          .update(posts)
          .set(payload)
          .where(
            and(eq(posts.id, id), eq(posts.updatedAt, existing!.updatedAt)),
          )
          .returning({ id: posts.id })
      : db
          .insert(posts)
          .values({ ...payload, id: savedId })
          .returning({ id: posts.id });
    const savedThisRequest = sql`exists (
      select 1
      from blog_posts saved_post
      where saved_post.id = ${savedId}::uuid
        and saved_post.updated_at = ${now}
    )`;
    const clearOtherHighlights = payload.isFeatured
      ? db
          .update(posts)
          .set({ isFeatured: false, updatedAt: now })
          .where(
            and(
              eq(posts.isFeatured, true),
              ne(posts.id, savedId),
              savedThisRequest,
            ),
          )
      : db.execute(sql`select 1`);
    const keepOldAddress = redirectFrom
      ? db.execute(sql`
          insert into blog_post_redirects (old_slug, post_id)
          select ${redirectFrom}, ${savedId}::uuid
          where ${savedThisRequest}
          on conflict (old_slug) do nothing
        `)
      : db.execute(sql`select 1`);

    const [, saved] = await db.batch([
      lock,
      save,
      clearOtherHighlights,
      keepOldAddress,
    ]);
    if (!saved[0]?.id) {
      return {
        error:
          "Esta publicação foi alterada ou removida em outra sessão. Recarregue a página antes de salvar novamente.",
      };
    }
  } catch (error) {
    console.error("Falha ao salvar a publicação.", error);
    if (isSlugConflict(error)) {
      return {
        error: "O endereço desta publicação já está sendo usado.",
        fields: { slug: ["Escolha outro endereço para a publicação."] },
      };
    }
    return {
      error:
        "Não foi possível salvar agora. Seu texto continua nesta página; tente novamente.",
    };
  }

  try {
    revalidatePath("/blog");
    revalidatePath(`/blog/${payload.slug}`);
    if (oldSlug && oldSlug !== payload.slug) revalidatePath(`/blog/${oldSlug}`);
    revalidatePath("/sitemap.xml");
  } catch (error) {
    // O banco já confirmou a operação; um novo acesso também recompõe o cache.
    console.error("A publicação foi salva, mas a revalidação falhou.", error);
  }
  redirect(
    `/admin/blog?saved=${payload.status.toLowerCase()}&slug=${encodeURIComponent(payload.slug)}`,
  );
}
export async function deletePostAction(id: string) {
  await requireAdmin();
  const db = getDb();
  const item = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/blog");
  if (item[0]) revalidatePath(`/blog/${item[0].slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/blog?deleted=1");
}
export async function duplicatePostAction(id: string) {
  await requireAdmin();
  const db = getDb(),
    source = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!source[0]) return;
  const {
    id: _id,
    createdAt: _created,
    updatedAt: _updated,
    ...copy
  } = source[0];
  void _id;
  void _created;
  void _updated;
  await db.insert(posts).values({
    ...copy,
    title: `${copy.title} (cópia)`,
    slug: `${copy.slug}-copia-${Date.now()}`,
    status: "DRAFT",
    isFeatured: false,
    publishedAt: null,
    scheduledAt: null,
  });
  redirect("/admin/blog");
}
export async function saveCategoryAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = categoryInputSchema.safeParse({
    name: value(formData, "name"),
    slug: value(formData, "slug") || value(formData, "name"),
    description: value(formData, "description"),
  });
  if (!parsed.success) return { error: "Revise os dados da categoria." };
  try {
    await getDb().insert(categories).values(parsed.data);
    revalidatePath("/blog");
    return { error: "" };
  } catch {
    return { error: "Nome ou slug já utilizado." };
  }
}
export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await getDb().delete(categories).where(eq(categories.id, id));
  revalidatePath("/blog");
}
