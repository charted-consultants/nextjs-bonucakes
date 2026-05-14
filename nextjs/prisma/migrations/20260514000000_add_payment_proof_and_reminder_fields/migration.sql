-- Add payment proof and reminder fields to orders table

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_proof_url" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_proof_uploaded_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reminder_sent_at" TIMESTAMP(3);
