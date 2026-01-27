
-- Add stream column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stream text;
