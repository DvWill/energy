DO $$ BEGIN
 CREATE TYPE "post_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "blog_authors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "display_name" text NOT NULL,
  "avatar_url" text, "job_title" text, "biography" text,
  "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "blog_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" text NOT NULL, "slug" text NOT NULL,
  "description" text, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "blog_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" text NOT NULL, "slug" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" text NOT NULL, "slug" text NOT NULL,
  "subtitle" text, "summary" text NOT NULL, "content" text NOT NULL,
  "cover_image_url" text, "cover_image_id" text, "cover_image_alt" text, "cover_image_caption" text,
  "cover_image_width" integer, "cover_image_height" integer, "status" "post_status" DEFAULT 'DRAFT' NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL, "author_id" uuid REFERENCES "blog_authors"("id") ON DELETE SET NULL,
  "category_id" uuid REFERENCES "blog_categories"("id") ON DELETE SET NULL, "published_at" timestamptz,
  "scheduled_at" timestamptz, "meta_title" text, "meta_description" text, "social_image_url" text,
  "canonical_url" text, "no_index" boolean DEFAULT false NOT NULL, "reading_time_minutes" integer DEFAULT 1 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "blog_post_tags" (
  "post_id" uuid NOT NULL REFERENCES "blog_posts"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "blog_tags"("id") ON DELETE CASCADE,
  PRIMARY KEY("post_id", "tag_id")
);
CREATE TABLE IF NOT EXISTS "blog_post_redirects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "old_slug" text NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "blog_posts"("id") ON DELETE CASCADE,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_uidx" ON "blog_categories"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_slug_uidx" ON "blog_tags"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_uidx" ON "blog_posts"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_post_redirects_old_slug_uidx" ON "blog_post_redirects"("old_slug");
CREATE INDEX IF NOT EXISTS "blog_posts_status_idx" ON "blog_posts"("status");
CREATE INDEX IF NOT EXISTS "blog_posts_published_at_idx" ON "blog_posts"("published_at" DESC);
CREATE INDEX IF NOT EXISTS "blog_posts_scheduled_at_idx" ON "blog_posts"("scheduled_at");
CREATE INDEX IF NOT EXISTS "blog_posts_category_id_idx" ON "blog_posts"("category_id");
CREATE INDEX IF NOT EXISTS "blog_posts_author_id_idx" ON "blog_posts"("author_id");
CREATE INDEX IF NOT EXISTS "blog_posts_featured_idx" ON "blog_posts"("is_featured");
