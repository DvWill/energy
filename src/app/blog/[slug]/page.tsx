import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { eq } from "drizzle-orm";
import { PostCard } from "@/components/blog/post-card";
import { ShareButtons } from "@/components/blog/share-buttons";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDb } from "@/db";
import { postRedirects, posts } from "@/db/schema";
import { adjacentPosts, getPublishedPost, relatedPosts } from "@/db/queries";
import { articleHeadings, sanitizeArticleHtml } from "@/lib/blog";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

async function find(slug: string) {
  try {
    const post = await getPublishedPost(slug); if (post) return post;
    const redirect = await getDb().select({ slug: posts.slug }).from(postRedirects).innerJoin(posts, eq(postRedirects.postId, posts.id)).where(eq(postRedirects.oldSlug, slug)).limit(1);
    if (redirect[0]) permanentRedirect(`/blog/${redirect[0].slug}`);
  } catch {}
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params, data = await find(slug); if (!data) return { title: "Publicação não encontrada" };
  const { post, author } = data, url = post.canonicalUrl || `${base}/blog/${post.slug}`, image = post.socialImageUrl || post.coverImageUrl || undefined;
  return { title: post.metaTitle || post.title, description: post.metaDescription || post.summary, alternates: { canonical: url }, robots: { index: !post.noIndex, follow: true }, authors: author ? [{ name: author.displayName }] : undefined, openGraph: { type: "article", title: post.metaTitle || post.title, description: post.metaDescription || post.summary, url, images: image ? [image] : undefined, publishedTime: post.publishedAt?.toISOString(), modifiedTime: post.updatedAt.toISOString(), authors: author ? [author.displayName] : undefined }, twitter: { card: image ? "summary_large_image" : "summary", title: post.metaTitle || post.title, description: post.metaDescription || post.summary, images: image ? [image] : undefined } };
}

export const revalidate = 300;
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, data = await find(slug); if (!data) notFound();
  const { post, category, author, tags } = data;
  const safe = articleHeadings(sanitizeArticleHtml(post.content));
  const [related, adjacent] = await Promise.all([relatedPosts(post.id, post.categoryId, tags.map((t) => t.id)), post.publishedAt ? adjacentPosts(post.publishedAt, post.id) : { previous: null, next: null }]);
  const url = `${base}/blog/${post.slug}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.metaDescription || post.summary, image: post.socialImageUrl || post.coverImageUrl || undefined, author: { "@type": "Person", name: author?.displayName || "Equipe Energy" }, publisher: { "@type": "Organization", name: "Energy" }, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), mainEntityOfPage: { "@type": "WebPage", "@id": url } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><a className="skip-link" href="#artigo">Pular para o artigo</a><SiteHeader /><main id="artigo" className="article-page"><header className="article-header"><div className="container article-header-inner"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Início</Link><span>/</span><Link href="/blog">Blog</Link>{category && <><span>/</span><Link href={`/blog?category=${category.slug}`}>{category.name}</Link></>}<span>/</span><span aria-current="page">{post.title}</span></nav>{category && <span className="blog-category">{category.name}</span>}<h1>{post.title}</h1>{post.subtitle && <p className="article-subtitle">{post.subtitle}</p>}<p className="article-summary">{post.summary}</p><div className="article-meta">{author && <span>Por {author.displayName}</span>}{post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{date.format(post.publishedAt)}</time>}<span><Clock3 /> {post.readingTimeMinutes} min de leitura</span>{post.updatedAt.getTime() - (post.publishedAt?.getTime() ?? 0) > 86400000 && <span>Atualizado em {date.format(post.updatedAt)}</span>}</div></div></header>{post.coverImageUrl && <figure className="article-cover container"><Image src={post.coverImageUrl} alt={post.coverImageAlt ?? ""} width={post.coverImageWidth || 1600} height={post.coverImageHeight || 900} sizes="(max-width: 1180px) 100vw, 1180px" priority />{post.coverImageCaption && <figcaption>{post.coverImageCaption}</figcaption>}</figure>}<div className="container article-layout">{safe.headings.length >= 3 && <aside className="article-toc"><strong>Neste artigo</strong><nav>{safe.headings.map((heading) => <a className={heading.level === 3 ? "toc-sub" : ""} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</nav></aside>}<article className="article-body" dangerouslySetInnerHTML={{ __html: safe.content }} /><aside className="article-share"><ShareButtons title={post.title} /></aside></div>{author && <section className="author-box container"><div>{author.avatarUrl && <Image src={author.avatarUrl} alt="" width={72} height={72} />}<div><span>Sobre o autor</span><h2>{author.displayName}</h2>{author.jobTitle && <strong>{author.jobTitle}</strong>}{author.biography && <p>{author.biography}</p>}</div></div></section>}<nav className="article-adjacent container" aria-label="Navegação entre artigos">{adjacent.previous ? <Link href={`/blog/${adjacent.previous.slug}`}><span>Anterior</span>{adjacent.previous.title}</Link> : <span />}{adjacent.next && <Link href={`/blog/${adjacent.next.slug}`}><span>Próximo</span>{adjacent.next.title}</Link>}</nav>{related.length > 0 && <section className="related-posts"><div className="container"><h2>Continue explorando</h2><div className="blog-grid">{related.map((item) => <PostCard post={item} key={item.id} />)}</div></div></section>}<div className="article-back container"><Link className="button" href="/blog">Voltar ao blog</Link></div></main><SiteFooter /></>;
}
