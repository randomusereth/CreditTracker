-- Migration: Make shop_info fields optional to match UI changes
-- Run this after dropping tables or on existing database

-- Make shop_info fields optional (remove NOT NULL constraints)
ALTER TABLE shop_info 
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN region DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- Note: email is already optional (no NOT NULL constraint)



