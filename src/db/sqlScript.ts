/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FULL_SUPABASE_SQL = `-- FAMILY FINANCE MANAGER - FULL DATABASE MIGRATION SCRIPT
-- Generated for Supabase (PostgreSQL 15+)
-- This script contains schemas, constraints, views, RLS policies, storage bucket configurations, and seed data.

-- ==========================================================
-- 1. DROP EXISTING TABLE (Clean reset if run repeatedly)
-- ==========================================================
DROP VIEW IF EXISTS financial_health_summary CASCADE;
DROP VIEW IF EXISTS top_expense_members CASCADE;
DROP VIEW IF EXISTS top_expense_categories CASCADE;
DROP VIEW IF EXISTS monthly_member_expense_summary CASCADE;
DROP VIEW IF EXISTS monthly_balance_summary CASCADE;
DROP VIEW IF EXISTS monthly_expense_summary CASCADE;
DROP VIEW IF EXISTS monthly_income_summary CASCADE;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS monthly_summaries CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS incomes CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS income_categories CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 2. CREATE TABLES
-- ==========================================================

-- A. Profiles (Linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  family_name VARCHAR(100) NOT NULL DEFAULT 'ครอบครัวแสนสุข',
  savings_goal NUMERIC(12, 2) NOT NULL DEFAULT 50000.00,
  current_savings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Family Members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'พ่อ', 'แม่', 'ลูก', อื่นๆ
  age INTEGER,
  avatar_color VARCHAR(20) DEFAULT 'emerald',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Income Categories
CREATE TABLE income_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- null means system default
  name VARCHAR(100) NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. Expense Categories
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- null means system default
  name VARCHAR(100) NOT NULL,
  is_personal BOOLEAN DEFAULT FALSE, -- if TRUE, must select category assignee
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Incomes
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID NOT NULL REFERENCES income_categories(id) ON DELETE RESTRICT,
  custom_category_detail VARCHAR(200), -- Used when category name is 'รายได้อื่น ๆ'
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  slip_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
  household_items TEXT[], -- Specific list of purchased items e.g., ['ข้าวสาร', 'น้ำปลา']
  personal_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL, -- Who incurred this if personal
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  slip_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  month_year VARCHAR(7) NOT NULL, -- format 'YYYY-MM'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month_year)
);

-- H. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('warning', 'info', 'success')),
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- I. Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  details TEXT
);

-- ==========================================================
-- 3. CREATE DATABASE VIEWS
-- ==========================================================

-- View: Monthly Income Summary
CREATE OR REPLACE VIEW monthly_income_summary AS
SELECT 
  user_id,
  to_char(date, 'YYYY-MM') AS month_year,
  COALESCE(SUM(amount), 0) AS total_income,
  COUNT(id) AS income_count
FROM incomes
GROUP BY user_id, to_char(date, 'YYYY-MM');

-- View: Monthly Expense Summary
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT 
  user_id,
  to_char(date, 'YYYY-MM') AS month_year,
  COALESCE(SUM(amount), 0) AS total_expense,
  COUNT(id) AS expense_count
FROM expenses
GROUP BY user_id, to_char(date, 'YYYY-MM');

-- View: Monthly Balance Summary
CREATE OR REPLACE VIEW monthly_balance_summary AS
SELECT
  COALESCE(i.user_id, e.user_id) AS user_id,
  COALESCE(i.month_year, e.month_year) AS month_year,
  COALESCE(i.total_income, 0) AS total_income,
  COALESCE(e.total_expense, 0) AS total_expense,
  (COALESCE(i.total_income, 0) - COALESCE(e.total_expense, 0)) AS balance,
  CASE 
    WHEN COALESCE(i.total_income, 0) > 0 THEN 
      ROUND(((COALESCE(i.total_income, 0) - COALESCE(e.total_expense, 0)) / i.total_income) * 100, 2)
    ELSE 0
  END AS savings_percentage
FROM monthly_income_summary i
FULL OUTER JOIN monthly_expense_summary e 
  ON i.user_id = e.user_id AND i.month_year = e.month_year;

-- View: Monthly Member Expense Summary
CREATE OR REPLACE VIEW monthly_member_expense_summary AS
SELECT 
  e.user_id,
  to_char(e.date, 'YYYY-MM') AS month_year,
  e.personal_member_id,
  m.name AS member_name,
  m.role AS member_role,
  COALESCE(SUM(e.amount), 0) AS total_member_expense
FROM expenses e
JOIN family_members m ON e.personal_member_id = m.id
GROUP BY e.user_id, to_char(e.date, 'YYYY-MM'), e.personal_member_id, m.name, m.role;

-- View: Top Expense Categories
CREATE OR REPLACE VIEW top_expense_categories AS
SELECT 
  e.user_id,
  to_char(e.date, 'YYYY-MM') AS month_year,
  e.category_id,
  c.name AS category_name,
  COALESCE(SUM(e.amount), 0) AS total_category_expense
FROM expenses e
JOIN expense_categories c ON e.category_id = c.id
GROUP BY e.user_id, to_char(e.date, 'YYYY-MM'), e.category_id, c.name;

-- ==========================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Family Members Policies
CREATE POLICY "Users can view family members" ON family_members 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create family members" ON family_members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update family members" ON family_members 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete family members" ON family_members 
  FOR DELETE USING (auth.uid() = user_id);

-- Income Categories Policies
CREATE POLICY "Users and guests can view default or own income categories" ON income_categories 
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own income categories" ON income_categories 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own income categories" ON income_categories 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income categories" ON income_categories 
  FOR DELETE USING (auth.uid() = user_id);

-- Expense Categories Policies
CREATE POLICY "Users and guests can view default or own expense categories" ON expense_categories 
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own expense categories" ON expense_categories 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expense categories" ON expense_categories 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expense categories" ON expense_categories 
  FOR DELETE USING (auth.uid() = user_id);

-- Incomes Policies
CREATE POLICY "Users can view their own incomes" ON incomes 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own incomes" ON incomes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own incomes" ON incomes 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own incomes" ON incomes 
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view their own expenses" ON expenses 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own expenses" ON expenses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON expenses 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON expenses 
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets Policies
CREATE POLICY "Users can view their own budgets" ON budgets 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert budgets" ON budgets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update budgets" ON budgets 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete budgets" ON budgets 
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs 
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================================
-- 5. FUNCTION & TRIGGER FOR AUDIT LOGGING
-- ==========================================================
CREATE OR REPLACE FUNCTION process_audit_log() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
    VALUES (OLD.user_id, 'DELETE', TG_TABLE_NAME, OLD.id::text, row_to_json(OLD)::text);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
    VALUES (NEW.user_id, 'UPDATE', TG_TABLE_NAME, NEW.id::text, row_to_json(NEW)::text);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
    VALUES (NEW.user_id, 'INSERT', TG_TABLE_NAME, NEW.id::text, row_to_json(NEW)::text);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map audit triggers to key financial actions
CREATE TRIGGER audit_incomes_trigger
AFTER INSERT OR UPDATE OR DELETE ON incomes
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER audit_expenses_trigger
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- ==========================================================
-- 6. TRIGGER TO NOTIFY ON OVER-BUDGET EXPENSE
-- ==========================================================
CREATE OR REPLACE FUNCTION check_expense_budget()
RETURNS TRIGGER AS $$
DECLARE
  v_budget_amount NUMERIC(12, 2);
  v_total_expenses NUMERIC(12, 2);
  v_month_year VARCHAR(7);
  v_cat_name VARCHAR(100);
BEGIN
  v_month_year := to_char(NEW.date, 'YYYY-MM');
  
  -- Get category name
  SELECT name INTO v_cat_name FROM expense_categories WHERE id = NEW.category_id;
  
  -- Get configured budget
  SELECT amount INTO v_budget_amount 
  FROM budgets 
  WHERE user_id = NEW.user_id 
    AND category_id = NEW.category_id 
    AND month_year = v_month_year;
    
  IF v_budget_amount IS NOT NULL AND v_budget_amount > 0 THEN
    -- Calculate total expenses in category this month
    SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
    FROM expenses
    WHERE user_id = NEW.user_id
      AND category_id = NEW.category_id
      AND to_char(date, 'YYYY-MM') = v_month_year;
      
    IF v_total_expenses > v_budget_amount THEN
      -- Create Over-Budget Warning notification
      INSERT INTO notifications (user_id, date, type, title, message)
      VALUES (
        NEW.user_id,
        CURRENT_DATE,
        'warning',
        'เกินงบประมาณประจําเดือน! ⚠️',
        'หมวดหมู่ "' || v_cat_name || '" มียอดใช้ออกรวม ' || v_total_expenses || ' บาท เกินจากงบประมาณ ' || v_budget_amount || ' บาท ที่ตั้งไว้สำหรับเดือน ' || v_month_year
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_expense_budget_trigger
AFTER INSERT OR UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION check_expense_budget();

-- ==========================================================
-- 7. SEED DATA - COMPREHENSIVE INITIAL STATES
-- ==========================================================

-- A. Insert Default System Income Categories (user_id IS NULL)
INSERT INTO income_categories (id, name, is_custom) VALUES
('11111111-1111-1111-1111-111111111111', 'เงินเดือน', FALSE),
('22222222-2222-2222-2222-222222222222', 'งานฟรีแลนซ์', FALSE),
('33333333-3333-3333-3333-333333333333', 'ค่าวิ่งไรเดอร์', FALSE),
('44444444-4444-4444-4444-444444444444', 'ขายสินค้ามือสอง', FALSE),
('55555555-5555-5555-5555-555555555555', 'รายได้อื่น ๆ', FALSE);

-- B. Insert Default System Expense Categories (user_id IS NULL)
INSERT INTO expense_categories (id, name, is_personal, is_custom) VALUES
('00000000-0000-0000-0000-000000000001', 'ค่าห้องพัก', FALSE, FALSE),
('00000000-0000-0000-0000-000000000002', 'ค่าน้ำ', FALSE, FALSE),
('00000000-0000-0000-0000-000000000003', 'ค่าไฟ', FALSE, FALSE),
('00000000-0000-0000-0000-000000000004', 'ค่าแชร์', FALSE, FALSE),
('00000000-0000-0000-0000-000000000005', 'ค่างวดรถ', FALSE, FALSE),
('00000000-0000-0000-0000-000000000006', 'ค่ารถโรงเรียน', FALSE, FALSE),
('00000000-0000-0000-0000-000000000007', 'ค่าน้ำมัน', FALSE, FALSE),
('00000000-0000-0000-0000-000000000008', 'ค่าของกิน', FALSE, FALSE),
('00000000-0000-0000-0000-000000000009', 'ค่ากับข้าว', FALSE, FALSE),
('00000000-0000-0000-0000-000000000010', 'ค่าอาหาร', FALSE, FALSE),
('00000000-0000-0000-0000-000000000011', 'ของใช้ภายในบ้าน', FALSE, FALSE),
('00000000-0000-0000-0000-000000000012', 'อื่น ๆ', FALSE, FALSE),

-- Personal Expense Categories
('00000000-0000-0000-0000-000000000013', 'ค่าขนม', TRUE, FALSE),
('00000000-0000-0000-0000-000000000014', 'กาแฟ', TRUE, FALSE),
('00000000-0000-0000-0000-000000000015', 'ชา', TRUE, FALSE),
('00000000-0000-0000-0000-000000000016', 'เครื่องดื่ม', TRUE, FALSE),
('00000000-0000-0000-0000-000000000017', 'เงินไปโรงเรียน', TRUE, FALSE),
('00000000-0000-0000-0000-000000000018', 'ค่าใช้จ่ายส่วนตัว', TRUE, FALSE);

-- ==========================================================
-- 8. STORAGE BUCKETS SETUP (via Supabase Storage API)
-- ==========================================================
-- Note: Run these SQL lines or configuration via the storage system dashboard
-- to register the buckets slips and receipts.

-- Insert into storage config
INSERT INTO storage.buckets (id, name, public) 
VALUES ('slips', 'slips', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket 'slips'
CREATE POLICY "Public Access Slips" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'slips');

CREATE POLICY "Authenticated Users Insert Slips" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'slips' AND auth.uid() IS NOT NULL);

-- RLS policies for storage bucket 'receipts'
CREATE POLICY "Public Access Receipts" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated Users Insert Receipts" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);
`;
