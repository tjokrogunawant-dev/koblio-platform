ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "subscription_status" TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "subscription_id" TEXT;
