"use client";

import { Bookmark, Check, Copy, Facebook, Linkedin, Mail, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ReadingProgress({ minutes }: { minutes: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const article = document.querySelector("[data-news-article]");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const distance = Math.max(1, article.scrollHeight - innerHeight * .35);
      setProgress(Math.max(0, Math.min(100, Math.round((-rect.top + 150) / distance * 100))));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => { removeEventListener("scroll", update); removeEventListener("resize", update); };
  }, []);
  return <div className="article-progress" aria-label={`${progress}% da leitura concluída`}>
    <span><i style={{ width: `${progress}%` }} /></span>
    <small>{progress}% da leitura concluída · {minutes}</small>
  </div>;
}

export function ArticleActions({ slug, title, compact = false }: { slug: string; title: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const key = "energy-saved-news";
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { setSaved((JSON.parse(localStorage.getItem(key) ?? "[]") as string[]).includes(slug)); } catch { setSaved(false); }
    });
    return () => cancelAnimationFrame(frame);
  }, [slug]);
  const toggle = () => {
    let current: string[] = [];
    try { current = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch {}
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
    localStorage.setItem(key, JSON.stringify(next));
    setSaved(next.includes(slug));
  };
  const internalUrl = () => new URL(`/blog/${slug}`, location.origin).href;
  const copy = async () => { await navigator.clipboard.writeText(internalUrl()); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const nativeShare = async () => {
    if (navigator.share) { try { await navigator.share({ title, url: internalUrl() }); } catch {} }
    else await copy();
  };
  const popup = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=720,height=560");
  const encoded = () => ({ url: encodeURIComponent(internalUrl()), title: encodeURIComponent(title) });

  if (compact) return <div className="article-hero-actions">
    <button type="button" onClick={nativeShare}><Share2 aria-hidden="true" /> Compartilhar</button>
    <button type="button" data-saved={saved} onClick={toggle}>{saved ? <Check aria-hidden="true" /> : <Bookmark aria-hidden="true" />}{saved ? "Artigo salvo" : "Salvar artigo"}</button>
  </div>;

  return <div className="article-action-panel">
    <strong>Compartilhe este artigo</strong>
    <div className="article-social-row">
      <button type="button" onClick={() => { const x=encoded(); popup(`https://wa.me/?text=${x.title}%20${x.url}`); }} aria-label="Compartilhar no WhatsApp">W</button>
      <button type="button" onClick={() => { const x=encoded(); popup(`https://www.linkedin.com/sharing/share-offsite/?url=${x.url}`); }} aria-label="Compartilhar no LinkedIn"><Linkedin /></button>
      <button type="button" onClick={() => { const x=encoded(); popup(`https://www.facebook.com/sharer/sharer.php?u=${x.url}`); }} aria-label="Compartilhar no Facebook"><Facebook /></button>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent("Leia esta notícia: ")}`} onClick={(e) => { e.currentTarget.href += encodeURIComponent(internalUrl()); }} aria-label="Compartilhar por e-mail"><Mail /></a>
      <button type="button" onClick={copy} aria-label="Copiar link">{copied ? <Check /> : <Copy />}</button>
    </div>
    <strong>Salvar para depois</strong>
    <button className="article-save-wide" type="button" data-saved={saved} onClick={toggle}>{saved ? <Check /> : <Bookmark />}{saved ? "Artigo salvo" : "Salvar artigo"}</button>
  </div>;
}

export function ActiveToc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-22% 0px -65%", threshold: 0 });
    headings.forEach(({ id }) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [headings]);
  return <details className="article-toc-card" open>
    <summary>Neste artigo</summary>
    <nav aria-label="Sumário do artigo">{headings.map((heading) => <a data-active={active === heading.id} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</nav>
  </details>;
}
