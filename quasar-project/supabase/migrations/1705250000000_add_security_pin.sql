ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "security_pin" text;
