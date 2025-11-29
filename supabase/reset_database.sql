-- Reset entire public schema (more thorough)
-- WARNING: This will delete ALL data and tables in the public schema
-- Run this in Supabase SQL Editor

-- Drop the entire public schema and recreate it
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- After running this, you'll need to run schema.sql again to recreate tables




