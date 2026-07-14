import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const authors = pgTable("blog_authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  jobTitle: text("job_title"),
  biography: text("biography"),
  ...timestamps,
});

export const categories = pgTable(
  "blog_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [uniqueIndex("blog_categories_slug_uidx").on(table.slug)],
);

export const tags = pgTable(
  "blog_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("blog_tags_slug_uidx").on(table.slug)],
);

export const posts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    subtitle: text("subtitle"),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    coverImageId: text("cover_image_id"),
    coverImageAlt: text("cover_image_alt"),
    coverImageCaption: text("cover_image_caption"),
    coverImageWidth: integer("cover_image_width"),
    coverImageHeight: integer("cover_image_height"),
    status: postStatus("status").default("DRAFT").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    authorId: uuid("author_id").references(() => authors.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    socialImageUrl: text("social_image_url"),
    canonicalUrl: text("canonical_url"),
    noIndex: boolean("no_index").default(false).notNull(),
    readingTimeMinutes: integer("reading_time_minutes").default(1).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("blog_posts_slug_uidx").on(table.slug),
    index("blog_posts_status_idx").on(table.status),
    index("blog_posts_published_at_idx").on(table.publishedAt),
    index("blog_posts_scheduled_at_idx").on(table.scheduledAt),
    index("blog_posts_category_id_idx").on(table.categoryId),
    index("blog_posts_author_id_idx").on(table.authorId),
    index("blog_posts_featured_idx").on(table.isFeatured),
  ],
);

export const postTags = pgTable(
  "blog_post_tags",
  {
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export const postRedirects = pgTable(
  "blog_post_redirects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    oldSlug: text("old_slug").notNull(),
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("blog_post_redirects_old_slug_uidx").on(table.oldSlug)],
);

export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Author = typeof authors.$inferSelect;
