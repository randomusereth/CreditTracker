-- Supabase Database Schema for Credit Tracker
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (optional - if you want to track users in Supabase)
-- Note: You can also use Supabase Auth for this
-- For now, we'll create a simple table that accepts any user_id
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_id TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to automatically create user record if it doesn't exist
CREATE OR REPLACE FUNCTION ensure_user_exists(user_id TEXT, telegram_id TEXT DEFAULT NULL, phone_number TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO users (id, telegram_id, phone_number)
  VALUES (user_id, telegram_id, phone_number)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Credits table
CREATE TABLE IF NOT EXISTS credits (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  item TEXT NOT NULL,
  remarks TEXT,
  total_amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(12, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid', 'partially-paid')),
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id, user_id) REFERENCES customers(id, user_id) ON DELETE CASCADE
);

-- Payment records table
CREATE TABLE IF NOT EXISTS payment_records (
  id TEXT NOT NULL,
  credit_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_after_payment NUMERIC(12, 2) NOT NULL,
  note TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (credit_id, user_id) REFERENCES credits(id, user_id) ON DELETE CASCADE
);

-- Shop info table
CREATE TABLE IF NOT EXISTS shop_info (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  view_reports BOOLEAN NOT NULL DEFAULT false,
  add_credit BOOLEAN NOT NULL DEFAULT false,
  manage_customers BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'am', 'om')),
  calendar_type TEXT NOT NULL DEFAULT 'gregorian' CHECK (calendar_type IN ('gregorian', 'ethiopian')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_customer_id ON credits(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_credit_id ON payment_records(credit_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read/write only their own data
CREATE POLICY "Users can view own customers" ON customers
  FOR ALL USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can view own credits" ON credits
  FOR ALL USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can view own payment records" ON payment_records
  FOR ALL USING (
    credit_id IN (
      SELECT id FROM credits 
      WHERE user_id = current_setting('app.user_id', true)
    )
  );

CREATE POLICY "Users can view own shop info" ON shop_info
  FOR ALL USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can view own staff" ON staff
  FOR ALL USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can view own settings" ON settings
  FOR ALL USING (user_id = current_setting('app.user_id', true));

-- Note: For RLS to work properly, you'll need to set the user_id context
-- This is typically done in your application code or via Supabase Auth
-- For now, you can disable RLS if you're using the anon key with proper filtering:
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- (Repeat for other tables if needed)

