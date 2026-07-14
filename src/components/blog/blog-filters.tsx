"use client";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function BlogFilters({ categories }: { categories: { name: string; slug: string }[] }) {
  const router = useRouter(), pathname = usePathname(), current = useSearchParams();
  const [query, setQuery] = useState(current.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const category = current.get("category") ?? "";
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(current.toString());
      if (query.trim()) params.set("q", query.trim()); else params.delete("q");
      params.delete("page");
      startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
    }, 450);
    return () => clearTimeout(timeout);
  }, [query, current, pathname, router]);
  const setCategory = (slug: string) => {
    const params = new URLSearchParams(current.toString());
    if (slug) params.set("category", slug); else params.delete("category"); params.delete("page");
    startTransition(() => router.push(`${pathname}?${params}`));
  };
  return (
    <div className="blog-filters" aria-busy={pending}>
      <label className="blog-search"><Search aria-hidden="true" /><span className="sr-only">Buscar publicações</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por assunto, categoria ou palavra-chave" maxLength={100} />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X aria-hidden="true" /></button>}</label>
      <div className="blog-category-filters" aria-label="Filtrar por categoria">
        <button className={!category ? "active" : ""} onClick={() => setCategory("")} type="button">Todos</button>
        {categories.map((item) => <button className={category === item.slug ? "active" : ""} onClick={() => setCategory(item.slug)} type="button" key={item.slug}>{item.name}</button>)}
      </div>
    </div>
  );
}
