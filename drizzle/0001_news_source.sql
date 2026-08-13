ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "source_name" text;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "source_url" text;
