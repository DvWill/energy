"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Category = { name: string; slug: string };

export function BlogFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const currentQuery = current.get("q") ?? "";
  const [draft, setDraft] = useState({
    routeQuery: currentQuery,
    value: currentQuery,
  });
  const query =
    draft.routeQuery === currentQuery ? draft.value : currentQuery;
  const [pending, startTransition] = useTransition();
  const category = current.get("category") ?? "";

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery === currentQuery) return;

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(current.toString());
      if (normalizedQuery) params.set("q", normalizedQuery);
      else params.delete("q");
      params.delete("page");
      const search = params.toString();

      startTransition(() => {
        router.replace(search ? `${pathname}?${search}` : pathname, {
          scroll: false,
        });
      });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [current, currentQuery, pathname, query, router]);

  const setCategory = (slug: string) => {
    if (slug === category) return;

    const params = new URLSearchParams(current.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    params.delete("page");
    const search = params.toString();

    startTransition(() => {
      router.push(search ? `${pathname}?${search}` : pathname);
    });
  };

  return (
    <div
      className="blog-filters"
      data-pending={pending ? "true" : "false"}
      aria-busy={pending}
    >
      <label className="blog-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Buscar publicações</span>
        <input
          type="search"
          value={query}
          onChange={(event) =>
            setDraft({ routeQuery: currentQuery, value: event.target.value })
          }
          placeholder="Buscar por assunto, categoria ou palavra-chave"
          maxLength={100}
          autoComplete="off"
          aria-controls="blog-feed-results"
          aria-describedby="blog-filter-status"
        />
        {query && (
          <button
            type="button"
            onClick={() => setDraft({ routeQuery: currentQuery, value: "" })}
            aria-label="Limpar busca"
          >
            <X aria-hidden="true" />
          </button>
        )}
      </label>

      <div
        className="blog-category-filters"
        role="group"
        aria-label="Filtrar por categoria"
      >
        <button
          className={!category ? "active" : ""}
          onClick={() => setCategory("")}
          type="button"
          aria-pressed={!category}
          aria-controls="blog-feed-results"
        >
          Todos
        </button>
        {categories.map((item) => {
          const active = category === item.slug;
          return (
            <button
              className={active ? "active" : ""}
              onClick={() => setCategory(item.slug)}
              type="button"
              key={item.slug}
              aria-pressed={active}
              aria-controls="blog-feed-results"
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <span
        id="blog-filter-status"
        className="blog-filter-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {pending && (
          <>
            <span className="blog-filter-pulse" aria-hidden="true" />
            Atualizando publicações…
          </>
        )}
      </span>
    </div>
  );
}
