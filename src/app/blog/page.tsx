import type { Metadata } from "next";
import { EnergyNewsFeed } from "@/components/blog/energy-news-feed";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { newsData } from "@/content/news-data";
import type { NewsItem } from "@/content/news-data";
import { listPublishedPosts } from "@/db/queries";

export const metadata: Metadata = {
  title: "Energy Conecta | Notícias de energia solar",
  description: "Notícias, tendências e novidades sobre energia solar, economia, tecnologia, sustentabilidade e regulamentação.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", title: "Energy Conecta", description: "Informação para transformar energia.", url: "/blog" },
};

export const revalidate = 60;

const formatDate = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

async function loadNews(): Promise<NewsItem[]> {
  if (!process.env.DATABASE_URL) return newsData;

  const { items } = await listPublishedPosts({ limit: 100 });
  return items.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.categoryName ?? "Notícias",
    date: formatDate.format(post.publishedAt ?? new Date()),
    dateISO: (post.publishedAt ?? new Date()).toISOString(),
    readTime: `${post.readingTimeMinutes} min de leitura`,
    excerpt: post.summary,
    sourceName: post.sourceName ?? undefined,
    sourceUrl: post.sourceUrl ?? undefined,
    image: post.coverImageUrl ?? "/images/hero-solar-plant.webp",
    imageAlt: post.coverImageAlt ?? "",
    featured: post.isFeatured,
    trending: post.isFeatured,
    views: 0,
    keywords: [post.title, post.categoryName ?? ""],
    articleUrl: `/blog/${post.slug}`,
    managed: true,
    content: "",
    published: true,
  }));
}

export default async function BlogPage() {
  const items = await loadNews();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Energy Conecta",
    description: "Notícias e conteúdos sobre energia solar publicados pela Energy Soluções.",
    blogPost: items.map((item) => ({ "@type": "BlogPosting", headline: item.title, datePublished: item.dateISO, url: `/blog/${item.slug}`, publisher: { "@type": "Organization", name: "Energy Soluções" } })),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <SiteHeader />
    <main id="conteudo" className="energy-news-page"><EnergyNewsFeed items={items} /></main>
    <SiteFooter />
  </>;
}
