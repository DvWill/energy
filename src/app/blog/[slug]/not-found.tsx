import Link from "next/link";
export default function NotFound() { return <main className="blog-page"><div className="container blog-state"><h1>Publicação não encontrada</h1><p>Este conteúdo pode ter sido removido ou ainda não está disponível.</p><Link className="button" href="/blog">Voltar ao blog</Link></div></main>; }
