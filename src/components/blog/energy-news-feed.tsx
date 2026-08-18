"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen, Calculator, ChartNoAxesCombined, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Compass, ExternalLink, Flame, Home, Leaf, MoreHorizontal, Search, Share2, Sparkles, SunMedium, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "@/components/ui/brand";
import type { NewsItem } from "@/content/news-data";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";
import { withBasePath } from "@/lib/base-path";

const categoryOptions = [
  { name: "Economia", icon: CircleDollarSign }, { name: "Mercado", icon: ChartNoAxesCombined },
  { name: "Projetos", icon: Home }, { name: "Regulamentação", icon: BookOpen },
  { name: "Sustentabilidade", icon: Leaf }, { name: "Tecnologia", icon: Zap },
];
type Filter = "feed" | "recent" | "popular" | "saved" | "guides" | "trending";
const PAGE_SIZE = 3;

export function EnergyNewsFeed({ items }: { items: NewsItem[] }) {
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState<Filter>("feed");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Array<number | string>>([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const categoriesRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useAccessibleMotion();

  useEffect(() => {
    queueMicrotask(() => {
      try { setSaved(JSON.parse(localStorage.getItem("energy-saved-news") ?? "[]")); }
      catch { setSaved([]); }
    });
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    let result = items.filter((item) => !category || item.category === category);
    result = result.filter((item) => !term || [item.title, item.excerpt, item.category, item.sourceName ?? "", ...item.keywords].join(" ").toLocaleLowerCase("pt-BR").includes(term));
    if (filter === "saved") result = result.filter((item) => saved.includes(item.id));
    if (filter === "trending") result = result.filter((item) => item.trending);
    if (filter === "guides") result = result.filter((item) => ["Regulamentação", "Tecnologia"].includes(item.category));
    if (filter === "popular") return [...result].sort((a, b) => b.views - a.views);
    return [...result].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [category, filter, items, query, saved]);

  const resetLimit = () => setLimit(PAGE_SIZE);
  const chooseCategory = (value: string) => { setCategory(value); resetLimit(); };
  const chooseFilter = (value: Filter) => { setFilter(value); resetLimit(); };
  const updateQuery = (value: string) => { setQuery(value); resetLimit(); };
  const toggleSave = (id: number | string) => setSaved((current) => {
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem("energy-saved-news", JSON.stringify(next));
    return next;
  });
  const share = async (item: NewsItem) => {
    const url = new URL(item.articleUrl ?? item.sourceUrl ?? "/blog", window.location.href).href;
    try {
      if (navigator.share) await navigator.share({ title: item.title, text: item.excerpt, url });
      else { await navigator.clipboard.writeText(url); setNotice("Link da notícia copiado."); window.setTimeout(() => setNotice(""), 2500); }
    } catch { /* compartilhamento cancelado */ }
  };
  const loadMore = () => {
    setLoading(true);
    window.setTimeout(() => { setLimit((value) => Math.min(value + PAGE_SIZE, filtered.length)); setLoading(false); }, reducedMotion ? 0 : 240);
  };
  const clearFilters = () => { setQuery(""); setCategory(""); setFilter("feed"); resetLimit(); };
  const scrollCategories = (direction: number) => categoriesRef.current?.scrollBy({ left: direction * 380, behavior: reducedMotion ? "auto" : "smooth" });

  return <>
    <section className="news-hero" aria-labelledby="blog-title">
      <div className="news-solar-lines" aria-hidden="true" />
      <div className="container news-hero-inner">
        <span className="news-kicker"><SunMedium /> ENERGY CONECTA</span>
        <h1 id="blog-title">Informação para transformar energia.</h1>
        <p>Conteúdo, tendências e novidades sobre energia solar.</p>
        <SearchBox query={query} setQuery={updateQuery} />
        <div className="news-stories-shell">
          <button type="button" className="news-story-arrow" onClick={() => scrollCategories(-1)} aria-label="Categorias anteriores"><ChevronLeft /></button>
          <div className="news-categories" ref={categoriesRef} role="list" aria-label="Categorias do blog">
            <CategoryButton label="Todos" icon={Sparkles} active={!category} onClick={() => chooseCategory("")} />
            {categoryOptions.map(({ name, icon }) => <CategoryButton key={name} label={name} icon={icon} active={category === name} onClick={() => chooseCategory(name)} />)}
          </div>
          <button type="button" className="news-story-arrow" onClick={() => scrollCategories(1)} aria-label="Próximas categorias"><ChevronRight /></button>
        </div>
      </div>
    </section>

    <div className="news-surface">
      <div className="news-layout container">
        <aside className="news-left" aria-label="Navegação do feed"><FilterNav active={filter} onSelect={chooseFilter} /></aside>
        <span className="news-vertical-label" aria-hidden="true">NOVIDADES</span>
        <section className="news-feed" id="blog-feed-results" aria-label="Feed de notícias" aria-live="polite">
          <div className="news-feed-heading"><div><span>SEU FEED</span><h2>Notícias para você</h2></div><small>{filtered.length} publicações</small></div>
          {filtered.slice(0, limit).map((item, index) => <NewsCard key={item.id} item={item} featured={index === 0 && filter === "feed" && !query && !category} saved={saved.includes(item.id)} reducedMotion={reducedMotion} onSave={() => toggleSave(item.id)} onShare={() => share(item)} />)}
          {!filtered.length && <div className="news-empty" role="status"><Search /><h2>Nenhuma notícia encontrada.</h2><p>Tente outro termo ou remova os filtros atuais.</p><button onClick={clearFilters}>Limpar filtros</button></div>}
          {limit < filtered.length && <button className="news-load-more" onClick={loadMore} disabled={loading} aria-busy={loading}>{loading ? "Carregando publicações..." : "Carregar mais publicações"}</button>}
          {limit >= filtered.length && filtered.length > PAGE_SIZE && <p className="news-end">Você chegou ao fim das notícias.</p>}
        </section>
        <aside className="news-right" aria-label="Conteúdos complementares">
          <Trending items={items} onSelect={() => chooseFilter("trending")} />
          <section className="news-calculator"><span className="news-rail-icon"><Calculator /></span><h2>Descubra quanto você pode economizar</h2><p>Simule agora e veja como a energia solar pode reduzir sua conta de luz.</p><Link href="/#calculadora">Simular minha economia <ArrowRight /></Link></section>
          <section className="news-guide"><span>COMECE POR AQUI</span><h2>Comece por aqui</h2><p>Aprenda o essencial sobre energia solar de forma rápida e prática.</p><ul><li>Como funciona</li><li>Quanto economiza</li><li>Prazo de retorno</li></ul><button type="button" onClick={() => chooseFilter("guides")}>Abrir guia solar <ArrowRight /></button></section>
        </aside>
      </div>
    </div>
    {notice && <div className="news-toast" role="status">{notice}</div>}
  </>;
}

function CategoryButton({ label, icon: Icon, active, onClick }: { label: string; icon: typeof Home; active: boolean; onClick: () => void }) {
  return <button type="button" className={active ? "active" : ""} aria-pressed={active} onClick={onClick}><span><Icon /></span><strong>{label}</strong></button>;
}
function FilterNav({ active, onSelect }: { active: Filter; onSelect: (value: Filter) => void }) {
  const links: Array<[Filter, string, typeof Home]> = [["feed", "Seu feed", Home], ["recent", "Mais recentes", Clock3], ["popular", "Mais lidos", Flame], ["saved", "Notícias salvas", Bookmark], ["guides", "Guia solar", Compass]];
  return <nav>{links.map(([value, label, Icon]) => <button type="button" key={value} className={active === value ? "active" : ""} onClick={() => onSelect(value)} aria-pressed={active === value}><Icon />{label}</button>)}</nav>;
}
function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return <label className="news-search"><Search /><span className="sr-only">Buscar no blog</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no blog" aria-controls="blog-feed-results" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X /></button>}</label>;
}
function Trending({ items, onSelect }: { items: NewsItem[]; onSelect: () => void }) {
  const trending = [...items].sort((a, b) => Number(Boolean(b.trending)) - Number(Boolean(a.trending)) || b.views - a.views).slice(0, 3);
  return <section className="news-trending"><h2><Flame /> EM ALTA AGORA</h2><div>{trending.map((item, index) => <Link href={item.articleUrl ?? item.sourceUrl ?? "/blog"} target={item.articleUrl ? undefined : "_blank"} rel={item.articleUrl ? undefined : "noopener noreferrer"} key={item.id}><b>{String(index + 1).padStart(2, "0")}</b><Image src={withBasePath(item.image)} alt="" width={68} height={68} /><span><strong>{item.title}</strong><small>{item.date}</small></span></Link>)}</div><button type="button" onClick={onSelect}>Ver todas as notícias <ArrowRight /></button></section>;
}
function NewsCard({ item, featured, saved, reducedMotion, onSave, onShare }: { item: NewsItem; featured: boolean; saved: boolean; reducedMotion: boolean; onSave: () => void; onShare: () => void }) {
  const destination = item.articleUrl ?? item.sourceUrl;
  const external = !item.articleUrl && Boolean(item.sourceUrl);
  return <motion.article className={`news-card ${featured ? "featured" : ""}`} initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.35 }}>
    <header><span className="news-avatar"><Brand compact /></span><span className="news-author"><strong>Energy Soluções</strong><small>Conteúdo verificado</small></span><span className="news-category">{item.category}</span><MoreHorizontal className="news-more" aria-hidden="true" /></header>
    <div className="news-image"><Image src={withBasePath(item.image)} alt={item.imageAlt} fill loading="lazy" sizes="(max-width: 760px) 100vw, 680px" /></div>
    <div className="news-card-actions"><div><button type="button" onClick={onShare} aria-label={`Compartilhar ${item.title}`}><Share2 /><span>Compartilhar</span></button><button type="button" className={saved ? "saved" : ""} onClick={onSave} aria-pressed={saved} aria-label={saved ? "Remover das notícias salvas" : "Salvar notícia"}><Bookmark /><span>{saved ? "Salva" : "Salvar"}</span></button></div><span><Clock3 /> {item.readTime}</span></div>
    <div className="news-card-copy"><h2>{destination ? <Link href={destination} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{item.title}</Link> : item.title}</h2><p>{item.excerpt}</p><div className="news-card-meta"><time dateTime={item.dateISO}>{item.date}</time>{item.sourceName && <span>Fonte: {item.sourceName}</span>}</div>{destination && <Link className="news-read-more" href={destination} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>Ler notícia completa <ExternalLink /></Link>}</div>
  </motion.article>;
}
