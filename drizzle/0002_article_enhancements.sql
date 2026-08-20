ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "highlight_label" text;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "highlight_value" text;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "highlight_complement" text;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "quote" text;
