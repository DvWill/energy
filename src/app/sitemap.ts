import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/termos`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
