import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { NewsArticleTemplate } from "@/components/blog/news-article-template";
import { StaticNewsArticle } from "@/components/blog/static-news-article";
import { getPublishedNewsBySlug, type NewsItem } from "@/content/news-data";
import { getDb } from "@/db";
import { getPublishedPost, relatedPosts } from "@/db/queries";
import { postRedirects, posts } from "@/db/schema";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const date = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });

async function find(slug: string) {
  try {
    const post = await getPublishedPost(slug);
    if (post) return post;
    const redirect = await getDb().select({ slug: posts.slug }).from(postRedirects)
      .innerJoin(posts, eq(postRedirects.postId, posts.id)).where(eq(postRedirects.oldSlug, slug)).limit(1);
    if (redirect[0]) permanentRedirect(`/blog/${redirect[0].slug}`);
  } catch {}
  return null;
}

function cardToNews(post: Awaited<ReturnType<typeof relatedPosts>>[number]): NewsItem {
  const published = post.publishedAt ?? new Date();
  return {
    id: post.id, slug: post.slug, title: post.title, excerpt: post.summary, content: "",
    category: post.categoryName ?? "Notícias", date: date.format(published), dateISO: published.toISOString(),
    readTime: `${post.readingTimeMinutes} min de leitura`, sourceName: post.sourceName ?? undefined,
    sourceUrl: post.sourceUrl ?? undefined, image: post.coverImageUrl ?? "/images/hero-solar-plant.webp",
    imageAlt: post.coverImageAlt ?? "", featured: post.isFeatured, trending: post.isFeatured,
    views: 0, keywords: [post.title, post.categoryName ?? ""], published: true, articleUrl: `/blog/${post.slug}`, managed: true,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const staticItem = getPublishedNewsBySlug(slug);
  if (staticItem) return metadataFor(staticItem);
  const data = await find(slug);
  if (!data) return { title: "Publicação não encontrada" };
  const { post } = data;
  return metadataFor({
    id: post.id, slug: post.slug, title: post.metaTitle || post.title, excerpt: post.metaDescription || post.summary,
    content: post.content, category: data.category?.name ?? "Notícias", date: date.format(post.publishedAt ?? new Date()),
    dateISO: (post.publishedAt ?? new Date()).toISOString(), readTime: `${post.readingTimeMinutes} min de leitura`,
    sourceName: post.sourceName ?? undefined, image: post.socialImageUrl || post.coverImageUrl || "/images/hero-solar-plant.webp",
    imageAlt: post.coverImageAlt ?? "", views: 0, keywords: [], published: true,
  });
}

function metadataFor(item: NewsItem): Metadata {
  const url = `${base}/blog/${item.slug}`;
  return {
    title: item.title, description: item.excerpt, alternates: { canonical: url },
    openGraph: { type: "article", title: item.title, description: item.excerpt, url, images: [item.image], publishedTime: item.dateISO },
    twitter: { card: "summary_large_image", title: item.title, description: item.excerpt, images: [item.image] },
  };
}

export const revalidate = 300;

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staticItem = getPublishedNewsBySlug(slug);
  if (staticItem) return <StaticNewsArticle item={staticItem} />;
  const data = await find(slug);
  if (!data) notFound();
  const { post, category, tags } = data;
  const related = await relatedPosts(post.id, post.categoryId, tags.map((tag) => tag.id));
  const item: NewsItem = {
    id: post.id, slug: post.slug, title: post.title, excerpt: post.summary, content: post.content,
    category: category?.name ?? "Notícias", date: date.format(post.publishedAt ?? new Date()),
    dateISO: (post.publishedAt ?? new Date()).toISOString(), readTime: `${post.readingTimeMinutes} min de leitura`,
    sourceName: post.sourceName ?? undefined, sourceUrl: post.sourceUrl ?? undefined,
    image: post.coverImageUrl ?? "/images/hero-solar-plant.webp", imageAlt: post.coverImageAlt ?? "",
    featured: post.isFeatured, views: 0, keywords: tags.map((tag) => tag.name), published: true, managed: true,
  };
  return <NewsArticleTemplate item={item} related={related.map(cardToNews)} />;
}
