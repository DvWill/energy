import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, ChevronRight, Flame, Home, LayoutGrid } from "lucide-react";
import { BlogFilters } from "@/components/blog/blog-filters";
import { PostCard, type PostCardData } from "@/components/blog/post-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal, StaggerGrid } from "@/components/motion/motion-primitives";
import {
  getFeaturedPost,
  listCategories,
  listPublishedPosts,
} from "@/db/queries";
import { publicQuerySchema } from "@/lib/blog-validation";

export const metadata: Metadata = {
  title: "Blog Energy | Energia solar, tecnologia e mercado",
  description:
    "Conteúdos da Energy sobre energia solar, eficiência, tecnologia e decisões para residências e empresas.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog Energy",
    description: "Informação para decisões mais eficientes em energia solar.",
    url: "/blog",
  },
};

export const revalidate = 300;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = publicQuerySchema.parse({
    q: raw.q,
    category: raw.category,
    page: raw.page,
    limit: 9,
  });
  let result: Awaited<ReturnType<typeof listPublishedPosts>>;
  let categories: Awaited<ReturnType<typeof listCategories>>;
  let featured: PostCardData | null = null;

  try {
    [result, categories] = await Promise.all([
      listPublishedPosts(input),
      listCategories(),
    ]);
    if (input.page === 1 && !input.q && !input.category) {
      featured = await getFeaturedPost();
    }
  } catch {
    result = {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
      hasMore: false,
    };
    categories = [];
  }

  const items = featured
    ? result.items.filter((item) => item.id !== featured.id)
    : result.items;
  const params = new URLSearchParams();
  if (input.q) params.set("q", input.q);
  if (input.category) params.set("category", input.category);
  const pageHref = (page: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    return `/blog?${next.toString()}`;
  };
  const popular = [
    featured,
    ...result.items.filter((item) => item.id !== featured?.id),
  ]
    .filter(Boolean)
    .slice(0, 4) as PostCardData[];

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="social-blog">
        <header className="social-blog-header">
          <Reveal className="blog-header-motion container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Início</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Blog</span>
            </nav>
            <div>
              <span className="blog-kicker">ENERGY CONECTA</span>
              <h1>Informação para transformar energia.</h1>
              <p>
                Um espaço para acompanhar ideias, orientações e novidades sobre
                energia solar.
              </p>
            </div>
          </Reveal>
        </header>

        <div className="social-layout container">
          <aside
            className="social-sidebar blog-side-motion"
            aria-label="Navegação do blog"
          >
            <strong>Explorar</strong>
            <nav>
              <Link
                className={!input.category ? "active" : ""}
                href="/blog"
                aria-current={!input.category ? "page" : undefined}
              >
                <Home aria-hidden="true" />
                Início
              </Link>
              {categories.map((item) => {
                const active = input.category === item.slug;
                return (
                  <Link
                    className={active ? "active" : ""}
                    href={`/blog?category=${item.slug}`}
                    key={item.id}
                    aria-current={active ? "page" : undefined}
                  >
                    <LayoutGrid aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="sidebar-note">
              <BookOpen aria-hidden="true" />
              <strong>Conteúdo Energy</strong>
              <p>Informação clara para apoiar decisões mais eficientes.</p>
            </div>
          </aside>

          <section
            id="blog-feed-results"
            className="social-feed"
            aria-labelledby="feed-title"
          >
            <Reveal className="feed-top blog-feed-top-motion">
              <div>
                <h2 id="feed-title">Seu feed</h2>
                <span aria-live="polite">{result.total} publicações</span>
              </div>
              <Suspense>
                <BlogFilters
                  categories={categories.map(({ name, slug }) => ({
                    name,
                    slug,
                  }))}
                />
              </Suspense>
            </Reveal>

            {featured && (
              <Reveal className="feed-featured-label">
                <Flame aria-hidden="true" /> Em destaque
              </Reveal>
            )}
            {featured && (
              <Reveal className="featured-card-reveal" delay={0.04}>
                <PostCard post={featured} featured />
              </Reveal>
            )}

            {items.length > 0 && (
              <StaggerGrid className="feed-list blog-feed-stagger">
                {items.map((post) => (
                  <PostCard post={post} key={post.id} />
                ))}
              </StaggerGrid>
            )}

            {!result.items.length && (
              <Reveal className="blog-state-reveal">
                <div className="blog-state" role="status" aria-live="polite">
                  <h2>
                    {input.q || input.category
                      ? "Nenhum resultado encontrado"
                      : "Novas histórias chegarão em breve"}
                  </h2>
                  <p>
                    {input.q || input.category
                      ? "Tente outro termo ou remova os filtros."
                      : "As publicações aparecerão aqui quando forem lançadas."}
                  </p>
                  {(input.q || input.category) && (
                    <Link className="button" href="/blog">
                      Limpar filtros
                    </Link>
                  )}
                </div>
              </Reveal>
            )}

            <nav className="blog-pagination" aria-label="Paginação">
              {input.page > 1 && (
                <Link href={pageHref(input.page - 1)}>Anterior</Link>
              )}
              <span aria-current="page">
                Página {input.page} de {result.totalPages}
              </span>
              {result.hasMore ? (
                <Link href={pageHref(input.page + 1)}>Carregar mais</Link>
              ) : (
                result.total > 0 && <span>Você está em dia.</span>
              )}
            </nav>
          </section>

          <aside
            className="social-rail blog-side-motion"
            aria-label="Destaques do blog"
          >
            <section aria-labelledby="popular-title">
              <h2 className="rail-title" id="popular-title">
                <Flame aria-hidden="true" />
                <span>Em alta</span>
              </h2>
              {popular.map((post, index) => (
                <Link href={`/blog/${post.slug}`} key={post.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{post.title}</strong>
                    <small>{post.readingTimeMinutes} min de leitura</small>
                  </div>
                  <ChevronRight aria-hidden="true" />
                </Link>
              ))}
            </section>
            <section className="rail-cta">
              <span>ENERGY</span>
              <h2>Seu projeto começa com uma boa conversa.</h2>
              <Link href="/#contato">Falar com a equipe</Link>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
