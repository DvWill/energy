import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, ChevronRight, Flame, Home, LayoutGrid } from "lucide-react";
import { BlogFilters } from "@/components/blog/blog-filters";
import { PostCard, type PostCardData } from "@/components/blog/post-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getFeaturedPost, listCategories, listPublishedPosts } from "@/db/queries";
import { publicQuerySchema } from "@/lib/blog-validation";

export const metadata: Metadata = {
  title: "Blog Energy | Energia solar, tecnologia e mercado",
  description: "Conteúdos da Energy sobre energia solar, eficiência, tecnologia e decisões para residências e empresas.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", title: "Blog Energy", description: "Informação para decisões mais eficientes em energia solar.", url: "/blog" },
};
export const revalidate = 300;

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const input = publicQuerySchema.parse({ q: raw.q, category: raw.category, page: raw.page, limit: 9 });
  let result: Awaited<ReturnType<typeof listPublishedPosts>>;
  let categories: Awaited<ReturnType<typeof listCategories>>;
  let featured: PostCardData | null = null;
  try {
    [result, categories] = await Promise.all([listPublishedPosts(input), listCategories()]);
    if (input.page === 1 && !input.q && !input.category) featured = await getFeaturedPost();
  } catch {
    result = { items: [], total: 0, page: 1, totalPages: 1, hasMore: false };
    categories = [];
  }
  const items = featured ? result.items.filter((item) => item.id !== featured.id) : result.items;
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.category) params.set("category", input.category);
  const popular = [featured, ...result.items.filter((item) => item.id !== featured?.id)].filter(Boolean).slice(0, 4) as PostCardData[];

  return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><SiteHeader /><main id="conteudo" className="social-blog"><header className="social-blog-header"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Início</Link><span>/</span><span aria-current="page">Blog</span></nav><div><span className="blog-kicker">ENERGY CONECTA</span><h1>Informação para transformar energia.</h1><p>Um espaço para acompanhar ideias, orientações e novidades sobre energia solar.</p></div></div></header><div className="container social-layout"><aside className="social-sidebar" aria-label="Navegação do blog"><strong>Explorar</strong><nav><Link className={!input.category ? "active" : ""} href="/blog"><Home />Início</Link>{categories.map((item) => <Link className={input.category === item.slug ? "active" : ""} href={`/blog?category=${item.slug}`} key={item.id}><LayoutGrid />{item.name}</Link>)}</nav><div className="sidebar-note"><BookOpen /><strong>Conteúdo Energy</strong><p>Informação clara para apoiar decisões mais eficientes.</p></div></aside><section className="social-feed" aria-labelledby="feed-title"><div className="feed-top"><div><h2 id="feed-title">Seu feed</h2><span>{result.total} publicações</span></div><Suspense><BlogFilters categories={categories.map(({ name, slug }) => ({ name, slug }))} /></Suspense></div>{featured && <div className="feed-featured-label"><Flame /> Em destaque</div>}{featured && <PostCard post={featured} featured />}<div className="feed-list">{items.map((post) => <PostCard post={post} key={post.id} />)}</div>{!result.items.length && <div className="blog-state"><h2>{input.q || input.category ? "Nenhum resultado encontrado" : "Novas histórias chegarão em breve"}</h2><p>{input.q || input.category ? "Tente outro termo ou remova os filtros." : "As publicações aparecerão aqui quando forem lançadas."}</p>{(input.q || input.category) && <Link className="button" href="/blog">Limpar filtros</Link>}</div>}<nav className="blog-pagination" aria-label="Paginação">{input.page > 1 && <Link href={`/blog?${params}&page=${input.page - 1}`}>Anterior</Link>}<span>Página {input.page} de {result.totalPages}</span>{result.hasMore ? <Link href={`/blog?${params}&page=${input.page + 1}`}>Carregar mais</Link> : result.total > 0 && <span>Você está em dia.</span>}</nav></section><aside className="social-rail"><section><div className="rail-title"><Flame /><strong>Em alta</strong></div>{popular.map((post, index) => <Link href={`/blog/${post.slug}`} key={post.id}><span>{String(index + 1).padStart(2,"0")}</span><div><strong>{post.title}</strong><small>{post.readingTimeMinutes} min de leitura</small></div><ChevronRight /></Link>)}</section><section className="rail-cta"><span>ENERGY</span><h2>Seu projeto começa com uma boa conversa.</h2><Link href="/#contato">Falar com a equipe</Link></section></aside></div></main><SiteFooter /></>;
}
