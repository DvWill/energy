export default function Loading() {
  return (
    <main className="blog-page blog-loading" aria-busy="true">
      <div
        className="blog-skeleton container"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Carregando publicações…</span>
        <div className="blog-skeleton-content" aria-hidden="true">
          <span className="blog-skeleton-line blog-skeleton-line-short" />
          <span className="blog-skeleton-line blog-skeleton-line-title" />
          <div className="blog-skeleton-grid">
            <span className="blog-skeleton-card" />
            <span className="blog-skeleton-card" />
            <span className="blog-skeleton-card" />
          </div>
        </div>
      </div>
    </main>
  );
}
