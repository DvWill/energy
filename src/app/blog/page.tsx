import type { Metadata } from "next";
import { EnergyNewsFeed } from "@/components/blog/energy-news-feed";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { newsData } from "@/content/news-data";

export const metadata: Metadata = {
  title: "Energy Conecta | Notícias de energia solar",
  description: "Notícias, tendências e novidades sobre energia solar, economia, tecnologia, sustentabilidade e regulamentação.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", title: "Energy Conecta", description: "Informação para transformar energia.", url: "/blog" },
};

export default function BlogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Energy Conecta",
    description: "Feed editorial de resumos sobre energia solar com links para as fontes originais.",
    blogPost: newsData.map((item) => ({ "@type": "BlogPosting", headline: item.title, datePublished: item.dateISO, url: item.sourceUrl, publisher: { "@type": "Organization", name: item.sourceName } })),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <SiteHeader />
    <main id="conteudo" className="energy-news-page"><EnergyNewsFeed /></main>
    <SiteFooter />
  </>;
}
