-- BEST PRACTICE: RLS with Supabase Auth
-- This is the recommended approach for production
-- It requires switching to Supabase Auth instead of custom auth

-- If you switch to Supabase Auth, use these policies:

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies that use auth.uid() (Supabase Auth user ID)
CREATE POLICY "Users see own customers" ON customers
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users see own credits" ON credits
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users see own payment records" ON payment_records
  FOR ALL USING (
    credit_id IN (
      SELECT id FROM credits WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users see own shop info" ON shop_info
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users see own staff" ON staff
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users see own settings" ON settings
  FOR ALL USING (user_id = auth.uid()::text);

-- This approach:
-- ✅ Provides true database-level security
-- ✅ Works automatically with Supabase Auth
-- ✅ Users can only access their own data
-- ✅ Even if API key is compromised, users can't access others' data





