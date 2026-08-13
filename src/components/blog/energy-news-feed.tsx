"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookOpen, ChartNoAxesCombined, CircleDollarSign, Clock3, ExternalLink, Flame, FolderOpen, Home, Leaf, Lightbulb, Menu, Search, Share2, Sparkles, SunMedium, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Brand } from "@/components/ui/brand";
import { newsData, type NewsItem } from "@/content/news-data";
import { withBasePath } from "@/lib/base-path";
import { useAccessibleMotion } from "@/hooks/use-accessible-motion";

const categories = [
  { name: "Economia", icon: CircleDollarSign }, { name: "Tecnologia", icon: Zap },
  { name: "Projetos", icon: Home }, { name: "Sustentabilidade", icon: Leaf },
  { name: "Mercado", icon: ChartNoAxesCombined }, { name: "Regulamentação", icon: BookOpen },
  { name: "Dicas", icon: Lightbulb },
];
type Filter = "feed" | "recent" | "popular" | "saved" | "guides" | "trending";
const PAGE_SIZE = 3;

export function EnergyNewsFeed() {
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState<Filter>("feed");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);
  const interactionLock = useRef(0);
  const reducedMotion = useAccessibleMotion();

  useEffect(() => {
    queueMicrotask(() => {
      try { setSaved(JSON.parse(localStorage.getItem("energy-saved-news") ?? "[]")); } catch { setSaved([]); }
    });
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    let items = newsData.filter((item) => !category || item.category === category).filter((item) => !term || [item.title, item.excerpt, item.category, item.sourceName, ...item.keywords].join(" ").toLocaleLowerCase("pt-BR").includes(term));
    if (filter === "saved") items = items.filter((item) => saved.includes(item.id));
    if (filter === "trending") items = items.filter((item) => item.trending);
    if (filter === "guides") items = items.filter((item) => item.category === "Regulamentação" || item.category === "Tecnologia");
    if (filter === "popular") items = [...items].sort((a, b) => b.views - a.views);
    else items = [...items].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    return items;
  }, [category, filter, query, saved]);
  const hasMore = limit < filtered.length;
  const loadMore = useCallback(() => setLimit((value) => Math.min(value + PAGE_SIZE, filtered.length)), [filtered.length]);
  useEffect(() => { const node = sentinel.current; if (!node || !hasMore) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && Date.now() > interactionLock.current) loadMore(); }, { rootMargin: "80px" }); observer.observe(node); return () => observer.disconnect(); }, [hasMore, loadMore]);

  const toggleSave = (id: number) => setSaved((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]; localStorage.setItem("energy-saved-news", JSON.stringify(next)); return next; });
  const share = async (item: NewsItem) => { try { if (navigator.share) await navigator.share({ title: item.title, text: item.excerpt, url: item.sourceUrl }); else { await navigator.clipboard.writeText(item.sourceUrl); setNotice("Link da notícia copiado."); setTimeout(() => setNotice(""), 2500); } } catch { /* user cancelled */ } };
  const lockInteraction = () => { interactionLock.current = Date.now() + 900; };
  const chooseFilter = (value: Filter) => { lockInteraction(); setFilter(value); setLimit(PAGE_SIZE); setFiltersOpen(false); };
  const chooseCategory = (value: string) => { lockInteraction(); setCategory(value); setLimit(PAGE_SIZE); };
  const updateQuery = (value: string) => { lockInteraction(); setQuery(value); setLimit(PAGE_SIZE); };

  return <>
    <header className="news-hero container"><span>ENERGY CONECTA</span><h1>Informação para transformar energia.</h1><p>Conteúdos, tendências e novidades sobre energia solar, economia, tecnologia e sustentabilidade.</p></header>
    <nav className="news-categories container" aria-label="Categorias rápidas">
      <button className={!category ? "active" : ""} onClick={() => chooseCategory("")} aria-pressed={!category}><span><Sparkles /></span><strong>Todos</strong></button>
      {categories.map(({ name, icon: Icon }) => <button key={name} className={category === name ? "active" : ""} onClick={() => chooseCategory(category === name ? "" : name)} aria-pressed={category === name}><span><Icon /></span><strong>{name}</strong></button>)}
    </nav>
    <button type="button" className="news-mobile-filter" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><Menu /> Busca e filtros</button>
    <div className="news-layout container" onPointerDown={lockInteraction} onKeyDown={lockInteraction}>
      <aside className={`news-left ${filtersOpen ? "open" : ""}`} aria-label="Navegação do feed"><strong>NAVEGAR</strong><FilterNav active={filter} onSelect={chooseFilter} /><button className="news-filter-close" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros"><X /></button></aside>
      <section className="news-feed" aria-label="Feed de notícias">
        {filtered.slice(0, limit).map((item, index) => <NewsCard item={item} featured={index === 0 && filter === "feed" && !query && !category} saved={saved.includes(item.id)} reducedMotion={reducedMotion} onSave={() => toggleSave(item.id)} onShare={() => share(item)} key={item.id} />)}
        {!filtered.length && <div className="news-empty" role="status"><Search /><h2>Nenhuma notícia encontrada para essa busca.</h2><button onClick={() => { setQuery(""); setCategory(""); setFilter("feed"); setLimit(PAGE_SIZE); }}>Limpar filtros</button></div>}
        {hasMore && <><div className="news-skeleton" aria-hidden="true"><span /><span /><span /></div><button className="news-load-more" onClick={loadMore}>Carregar mais</button><div ref={sentinel} /></>}
        {!hasMore && filtered.length > 0 && <p className="news-end">Você chegou ao fim das notícias.</p>}
      </section>
      <aside className="news-right" aria-label="Busca e destaques"><SearchBox query={query} setQuery={updateQuery} /><Trending onSelect={() => chooseFilter("trending")} /><section className="news-calculator"><SunMedium /><h2>Simule sua economia</h2><p>Descubra quanto você pode economizar instalando energia solar.</p><Link href="/#calculadora">Simular agora <ExternalLink /></Link></section></aside>
    </div>
    {notice && <div className="news-toast" role="status">{notice}</div>}
  </>;
}

function FilterNav({ active, onSelect }: { active: Filter; onSelect: (value: Filter) => void }) {
  const links: Array<[Filter, string, typeof Home]> = [["feed", "Seu feed", Home], ["recent", "Mais recentes", Clock3], ["popular", "Mais lidas", Flame], ["saved", "Notícias salvas", Bookmark], ["guides", "Guias", FolderOpen]];
  return <nav>{links.map(([value, label, Icon]) => <button key={value} className={active === value ? "active" : ""} onClick={() => onSelect(value)} aria-pressed={active === value}><Icon />{label}</button>)}</nav>;
}
function SearchBox({ query, setQuery }: { query: string; setQuery: (value: string) => void }) { return <label className="news-search"><Search /><span className="sr-only">Buscar no blog</span><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar no blog" />{query && <button onClick={() => setQuery("")} aria-label="Limpar busca"><X /></button>}</label>; }
function Trending({ onSelect }: { onSelect: () => void }) { return <section className="news-trending"><h2><Flame /> EM ALTA</h2>{newsData.filter((item) => item.trending).slice(0, 3).map((item) => <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" key={item.id}><Image src={withBasePath(item.image)} alt="" width={64} height={64} /><span><strong>{item.title}</strong><small>{item.readTime}</small></span></a>)}<button onClick={onSelect}>Ver todas em alta</button></section>; }
function NewsCard({ item, featured, saved, reducedMotion, onSave, onShare }: { item: NewsItem; featured: boolean; saved: boolean; reducedMotion: boolean; onSave: () => void; onShare: () => void }) { return <motion.article className={`news-card ${featured ? "featured" : ""}`} initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: reducedMotion ? 0 : 0.35 }}>
  <header><span className="news-avatar"><Brand compact /></span><strong>Energy Soluções</strong><span className="news-category">{item.category}</span><time dateTime={item.dateISO}>{item.date}</time></header>
  <div className="news-image"><Image src={withBasePath(item.image)} alt={item.imageAlt} fill loading="lazy" sizes="(max-width: 760px) 100vw, 760px" /></div>
  <div className="news-card-copy"><h2>{item.title}</h2><p>{item.excerpt}</p><span className="news-source">Resumo Energy · Fonte: <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.sourceName} <ExternalLink /></a></span></div>
  <footer><span>{item.readTime}</span><div><button className={saved ? "saved" : ""} onClick={onSave} aria-pressed={saved} aria-label={saved ? "Remover das notícias salvas" : "Salvar notícia"}><Bookmark />{saved ? "Salva" : "Salvar"}</button><button onClick={onShare} aria-label={`Compartilhar ${item.title}`}><Share2 />Compartilhar</button><a className="article-external-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ler notícia completa no site da ${item.sourceName}`}>Ler notícia completa <ExternalLink /></a></div></footer>
  </motion.article>; }
