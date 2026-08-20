import { NewsArticleTemplate } from "@/components/blog/news-article-template";
import { newsData, type NewsItem } from "@/content/news-data";

export function StaticNewsArticle({ item }: { item: NewsItem }) {
  const related = newsData
    .filter((candidate) => candidate.published && candidate.slug !== item.slug)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3);
  return <NewsArticleTemplate item={item} related={related} />;
}
