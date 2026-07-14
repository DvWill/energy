import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Newspaper } from "lucide-react";

export type PostCardData = {
  id: string; title: string; slug: string; summary: string; coverImageUrl: string | null;
  coverImageAlt: string | null; coverImageWidth: number | null; coverImageHeight: number | null;
  publishedAt: Date | null; readingTimeMinutes: number; categoryName: string | null; authorName: string | null;
};

const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export function PostCard({ post, featured = false }: { post: PostCardData; featured?: boolean }) {
  return (
    <article className={featured ? "blog-card blog-card-featured" : "blog-card"}>
      <Link href={`/blog/${post.slug}`} className="blog-card-link" aria-label={`Ler ${post.title}`}>
        <header className="feed-author">
          <span className="feed-avatar" aria-hidden="true"><Newspaper /></span>
          <span><strong>{post.authorName ?? "Equipe Energy"}</strong><small>{post.categoryName ?? "Conteúdo Energy"}{post.publishedAt ? ` · ${date.format(post.publishedAt)}` : ""}</small></span>
        </header>
        <div className="blog-card-media">
          {post.coverImageUrl ? (
            <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? ""} fill sizes={featured ? "(max-width: 800px) 100vw, 60vw" : "(max-width: 700px) 100vw, 33vw"} className="blog-cover" priority={featured} />
          ) : <div className="blog-image-fallback" aria-hidden="true"><span>ENERGY</span></div>}
        </div>
        <div className="blog-card-copy">
          {post.categoryName && <span className="blog-category">{post.categoryName}</span>}
          <h2>{post.title}</h2>
          <p>{post.summary}</p>
          <div className="blog-card-meta">
            <span><Clock3 aria-hidden="true" /> {post.readingTimeMinutes} min</span>
          </div>
          <span className="blog-read-more">Leia mais <ArrowRight aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  );
}
