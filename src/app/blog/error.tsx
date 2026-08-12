"use client";

import { useTransition } from "react";

export default function BlogError({ reset }: { reset: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <main className="blog-page blog-error-page">
      <div
        className="blog-state blog-error-state container"
        role="alert"
        aria-live="assertive"
      >
        <h1>Não foi possível carregar o blog</h1>
        <p>
          {pending
            ? "Tentando carregar novamente…"
            : "Tente novamente em alguns instantes."}
        </p>
        <button
          className="button"
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() => startTransition(reset)}
        >
          {pending ? "Tentando novamente…" : "Tentar novamente"}
        </button>
      </div>
    </main>
  );
}
