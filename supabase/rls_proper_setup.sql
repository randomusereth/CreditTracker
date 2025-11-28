-- Proper RLS Setup for Custom Authentication
-- This setup works with your Telegram ID + Password authentication

-- First, disable existing policies
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can view own credits" ON credits;
DROP POLICY IF EXISTS "Users can view own payment records" ON payment_records;
DROP POLICY IF EXISTS "Users can view own shop info" ON shop_info;
DROP POLICY IF EXISTS "Users can view own staff" ON staff;
DROP POLICY IF EXISTS "Users can view own settings" ON settings;

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: For custom authentication with anon key, we need to allow
-- operations but filter by user_id in the application code.
-- However, RLS can still provide an extra layer of security.

-- Option A: Allow all operations (application handles filtering)
-- This is less secure but works with anon key
CREATE POLICY "Allow all for authenticated users" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON credits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON payment_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON shop_info
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON staff
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- NOTE: The above policies allow all operations, which means RLS is enabled
-- but not restrictive. Your application code must still filter by user_id.
-- This provides minimal security but keeps RLS enabled for future enhancement.

-- Option B: If you want stricter RLS, you would need to:
-- 1. Use Supabase Auth (recommended for production)
-- 2. Or use a service role key for server-side operations
-- 3. Or implement a custom RLS function that validates user_id

-- For now, Option A is the simplest that keeps RLS enabled.


