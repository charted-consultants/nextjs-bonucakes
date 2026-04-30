-- Add deleted_at soft delete column to all main tables

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "discounts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "email_templates" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "contact_submissions" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "workshop_registrations" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Indexes
CREATE INDEX IF NOT EXISTS "products_deleted_at_idx" ON "products"("deleted_at");
CREATE INDEX IF NOT EXISTS "courses_deleted_at_idx" ON "courses"("deleted_at");
CREATE INDEX IF NOT EXISTS "blog_posts_deleted_at_idx" ON "blog_posts"("deleted_at");
CREATE INDEX IF NOT EXISTS "events_deleted_at_idx" ON "events"("deleted_at");
CREATE INDEX IF NOT EXISTS "reviews_deleted_at_idx" ON "reviews"("deleted_at");
CREATE INDEX IF NOT EXISTS "faqs_deleted_at_idx" ON "faqs"("deleted_at");
CREATE INDEX IF NOT EXISTS "testimonials_deleted_at_idx" ON "testimonials"("deleted_at");
CREATE INDEX IF NOT EXISTS "customers_deleted_at_idx" ON "customers"("deleted_at");
CREATE INDEX IF NOT EXISTS "discounts_deleted_at_idx" ON "discounts"("deleted_at");
CREATE INDEX IF NOT EXISTS "media_deleted_at_idx" ON "media"("deleted_at");
CREATE INDEX IF NOT EXISTS "email_templates_deleted_at_idx" ON "email_templates"("deleted_at");
CREATE INDEX IF NOT EXISTS "contact_submissions_deleted_at_idx" ON "contact_submissions"("deleted_at");
CREATE INDEX IF NOT EXISTS "orders_deleted_at_idx" ON "orders"("deleted_at");
CREATE INDEX IF NOT EXISTS "workshop_registrations_deleted_at_idx" ON "workshop_registrations"("deleted_at");
