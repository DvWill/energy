import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/db/queries";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const result = await listPublishedPosts({ page: 1, limit: 24 });
    blogPosts = result.items.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.publishedAt ?? undefined, changeFrequency: "monthly", priority: 0.7 }));
  } catch {}
  return [
    {
      url: base,
      changeFrequency: "monthly",
      priority: 1,
    },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...blogPosts,
  ];
}
