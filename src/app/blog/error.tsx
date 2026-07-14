"use client";
export default function BlogError({ reset }: { reset: () => void }) { return <main className="blog-page"><div className="container blog-state"><h1>Não foi possível carregar o blog</h1><p>Tente novamente em alguns instantes.</p><button className="button" onClick={reset}>Tentar novamente</button></div></main>; }
