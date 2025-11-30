-- Drop all tables in Supabase
-- Run this in Supabase SQL Editor to remove all your tables

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS payment_records CASCADE;
DROP TABLE IF EXISTS credits CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS shop_info CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS ensure_user_exists(TEXT, TEXT, TEXT);

-- Verify tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';





