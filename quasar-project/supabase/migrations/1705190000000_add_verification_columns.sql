ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "last_verification_date" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "verification_hash" text,
ADD COLUMN IF NOT EXISTS "verification_expires" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "security_pin" text;
