import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="blog-page">
        <div className="container blog-state">
          <h1>Publicação não encontrada</h1>
          <p>Este conteúdo pode ter sido removido ou ainda não está disponível.</p>
          <Link className="button" href="/blog">Voltar ao blog</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
