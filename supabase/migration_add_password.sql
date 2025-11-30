-- Migration: Add password_hash to users table
-- Run this in Supabase SQL Editor if you already have the schema

-- Add password_hash column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make password_hash required (after existing users are migrated)
-- ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Remove phone_number column (if it exists and you want to remove it)
-- ALTER TABLE users DROP COLUMN IF EXISTS phone_number;

-- Update the ensure_user_exists function
CREATE OR REPLACE FUNCTION ensure_user_exists(user_id TEXT, telegram_id TEXT DEFAULT NULL, password_hash TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO users (id, telegram_id, password_hash)
  VALUES (user_id, telegram_id, password_hash)
  ON CONFLICT (id) DO UPDATE SET telegram_id = EXCLUDED.telegram_id;
END;
$$ LANGUAGE plpgsql;





