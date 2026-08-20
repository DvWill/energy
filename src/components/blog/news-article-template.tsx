import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Zap } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { NewsItem } from "@/content/news-data";
import { articleHeadings, sanitizeArticleHtml } from "@/lib/blog";
import { withBasePath } from "@/lib/base-path";
import { ActiveToc, ArticleActions, ReadingProgress } from "./article-interactions";

export function NewsArticleTemplate({ item, related }: { item: NewsItem; related: NewsItem[] }) {
  const article = articleHeadings(sanitizeArticleHtml(item.content));
  const headings = article.headings.filter((heading) => heading.level === 2);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const imageUrl = item.image.startsWith("http") ? item.image : `${siteUrl}${withBasePath(item.image)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    image: [imageUrl],
    datePublished: item.dateISO,
    mainEntityOfPage: `${siteUrl}/blog/${item.slug}`,
    publisher: { "@type": "Organization", name: "Energy Soluções" },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <a className="skip-link" href="#artigo">Pular para o artigo</a>
    <SiteHeader />
    <main id="artigo" className="news-article-page" data-news-article>
      <ReadingProgress minutes={item.readTime} />
      <div className="news-article-back"><Link href="/blog"><ArrowLeft /> Voltar para o blog</Link></div>

      <header className="news-article-hero">
        <div className="news-article-hero-copy">
          <span>{item.category}</span>
          <h1>{item.title}</h1>
          <p>{item.excerpt}</p>
          <div className="news-article-meta"><time dateTime={item.dateISO}>{item.date}</time><i /><span><Clock3 /> {item.readTime}</span></div>
          <ArticleActions slug={item.slug} title={item.title} compact />
        </div>
        <div className="news-article-hero-media"><Image src={withBasePath(item.image)} alt={item.imageAlt} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
      </header>

      <div className="news-article-shell">
        <aside className="news-article-left"><ActiveToc headings={headings} /></aside>
        <article className="news-article-content">
          <p className="news-article-lead">{item.excerpt}</p>
          {item.highlight && <div className="news-highlight"><Zap /><span><small>{item.highlight.label}</small><strong>{item.highlight.value}</strong><b>{item.highlight.complement}</b></span></div>}
          <div className="news-article-html" dangerouslySetInnerHTML={{ __html: article.content }} />
          {item.quote && <blockquote className="news-article-quote">“{item.quote}”</blockquote>}
          {item.sourceName && <div className="news-article-source">Fonte: {item.sourceName}</div>}
        </article>
        <aside className="news-article-right">
          <div className="news-calculator-cta">
            <Zap />
            <h2>Descubra quanto você pode economizar</h2>
            <p>Simule agora e veja o potencial de economia na sua conta de luz.</p>
            <Link href="/#calculadora">Calcular minha economia <ArrowRight /></Link>
            <ul><li><CheckCircle2 /> Simulação personalizada</li><li><CheckCircle2 /> Sem compromisso</li><li><CheckCircle2 /> Respostas em minutos</li></ul>
          </div>
        </aside>
      </div>

      {related.length > 0 && <section className="news-related"><header><h2>Continue lendo</h2><Link href="/blog">Ver todos os artigos</Link></header><div>{related.slice(0,3).map((post) => <Link className="news-related-card" href={`/blog/${post.slug}`} key={post.id}><span><Image src={withBasePath(post.image)} alt={post.imageAlt} fill sizes="(max-width: 700px) 90vw, 30vw" /></span><small>{post.category}</small><strong>{post.title}</strong><p>{post.date} · {post.readTime}</p></Link>)}</div></section>}

      <section className="news-article-bottom-cta"><div><h2>Sua conta de luz pode trabalhar a seu favor</h2><p>Transforme o custo em economia com energia solar e soluções inteligentes.</p></div><div><span>Fale com nossos especialistas</span><h3>Projetos sob medida para seu perfil de consumo</h3><a href="https://wa.me/5561993561108">Solicitar uma proposta</a></div></section>
    </main>
    <SiteFooter />
  </>;
}
