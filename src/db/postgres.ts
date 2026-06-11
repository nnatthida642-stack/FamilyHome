/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from 'pg';
import { 
  FamilyMember, 
  IncomeCategory, 
  ExpenseCategory, 
  Income, 
  Expense, 
  Budget, 
  Notification, 
  AuditLog, 
  SavingGoal 
} from '../types';

const { Pool } = pg;

let pool: pg.Pool | null = null;
const GUEST_USER_ID = '8c15ae4c-4235-4682-8a9d-5a9eefce0b45';

export function getPool(): pg.Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return null;
  }
  
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: {
          rejectUnauthorized: false // Necessary for connection to hosted services like Supabase
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      console.log('PostgreSQL Pool initialized successfully.');
    } catch (err) {
      console.error('Failed to create PostgreSQL Pool:', err);
      pool = null;
    }
  }
  return pool;
}

export async function isDbConnected(): Promise<boolean> {
  const activePool = getPool();
  if (!activePool) return false;
  try {
    const client = await activePool.connect();
    client.release();
    return true;
  } catch (err) {
    console.warn('Database URL provided but connection failed:', err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Ensures that a guest authenticated user exists in auth.users and profiles
 * so that foreign keys in profiles and family manager tables are satisfied.
 */
export async function ensureDefaultProfile(): Promise<string> {
  const activePool = getPool();
  if (!activePool) return GUEST_USER_ID;

  try {
    // 1. Check if guest user already has profile
    const profileRes = await activePool.query('SELECT id FROM profiles WHERE id = $1', [GUEST_USER_ID]);
    if (profileRes.rows.length > 0) {
      return GUEST_USER_ID;
    }

    console.log('Creating guest credentials in auth.users and profiles...');
    // 2. Ensure guest row in auth.users exists
    // We try/catch this in case auth.users table is not accessible or doesn't allow direct insert
    try {
      await activePool.query(`
        INSERT INTO auth.users (id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) 
        VALUES ($1, 'guest_family@example.com', 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"name":"ครอบครัวแสนสุข"}', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [GUEST_USER_ID]);
    } catch (authErr) {
      console.log('Direct insertion to auth.users skipped (may be bypassed or profile created directly):', authErr instanceof Error ? authErr.message : authErr);
    }

    // 3. Ensure profile exists
    await activePool.query(`
      INSERT INTO profiles (id, family_name, savings_goal, current_savings)
      VALUES ($1, 'ครอบครัวแสนสุข', 120000.00, 45000.00)
      ON CONFLICT (id) DO NOTHING
    `, [GUEST_USER_ID]);

    // 4. Ensure default family members are seeded if none exist
    const membersCount = await activePool.query('SELECT count(*) FROM family_members WHERE user_id = $1', [GUEST_USER_ID]);
    if (parseInt(membersCount.rows[0].count) === 0) {
      console.log('Seeding family members in database...');
      await activePool.query(`
        INSERT INTO family_members (id, user_id, name, role, age, avatar_color) VALUES
        ('member_pope', $1, 'พ่อ', 'พนักงานประจำ', 42, 'emerald'),
        ('member_mae', $1, 'แม่', 'Rider', 39, 'blue'),
        ('member_aya', $1, 'น้องเอญ่า', 'ลูก (อายุ 9 ปี)', 9, 'orange'),
        ('member_alice', $1, 'น้องอลิซ', 'ลูก (อายุ 7 ปี)', 7, 'purple')
        ON CONFLICT DO NOTHING
      `, [GUEST_USER_ID]);
    }

    return GUEST_USER_ID;
  } catch (err) {
    console.error('Error ensuring default profile:', err);
    return GUEST_USER_ID;
  }
}

// Map database entities to React component models

export async function getMembersDb(): Promise<FamilyMember[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, name, role, age, avatar_color FROM family_members WHERE user_id = $1 ORDER BY created_at ASC',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    role: row.role,
    age: row.age !== null ? parseInt(row.age) : undefined,
    avatarColor: row.avatar_color || 'emerald'
  }));
}

export async function saveMemberDb(member: FamilyMember): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(`
    INSERT INTO family_members (id, user_id, name, role, age, avatar_color)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      age = EXCLUDED.age,
      avatar_color = EXCLUDED.avatar_color
  `, [member.id, GUEST_USER_ID, member.name, member.role, member.age || null, member.avatarColor]);
}

export async function deleteMemberDb(id: string): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query('DELETE FROM family_members WHERE id = $1 AND user_id = $2', [id, GUEST_USER_ID]);
}

export async function getIncomeCategoriesDb(): Promise<IncomeCategory[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, name, is_custom FROM income_categories WHERE user_id IS NULL OR user_id = $1 ORDER BY created_at ASC',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    isCustom: row.is_custom
  }));
}

export async function saveIncomeCategoryDb(cat: IncomeCategory): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(`
    INSERT INTO income_categories (id, user_id, name, is_custom)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      is_custom = EXCLUDED.is_custom
  `, [cat.id, GUEST_USER_ID, cat.name, cat.isCustom || false]);
}

export async function deleteIncomeCategoryDb(id: string): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query('DELETE FROM income_categories WHERE id = $1 AND user_id = $2', [id, GUEST_USER_ID]);
}

export async function getExpenseCategoriesDb(): Promise<ExpenseCategory[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, name, is_personal, is_custom FROM expense_categories WHERE user_id IS NULL OR user_id = $1 ORDER BY created_at ASC',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    isPersonal: row.is_personal,
    isCustom: row.is_custom
  }));
}

export async function saveExpenseCategoryDb(cat: ExpenseCategory): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(`
    INSERT INTO expense_categories (id, user_id, name, is_personal, is_custom)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      is_personal = EXCLUDED.is_personal,
      is_custom = EXCLUDED.is_custom
  `, [cat.id, GUEST_USER_ID, cat.name, cat.isPersonal || false, cat.isCustom || false]);
}

export async function deleteExpenseCategoryDb(id: string): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query('DELETE FROM expense_categories WHERE id = $1 AND user_id = $2', [id, GUEST_USER_ID]);
}

export async function getIncomesDb(): Promise<Income[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, date, category_id, custom_category_detail, description, amount, note FROM incomes WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
    categoryId: row.category_id,
    customCategoryDetail: row.custom_category_detail || undefined,
    description: row.description,
    amount: parseFloat(row.amount),
    note: row.note || undefined
  }));
}

export async function saveIncomeDb(income: Income): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(`
    INSERT INTO incomes (id, user_id, date, category_id, custom_category_detail, description, amount, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      date = EXCLUDED.date,
      category_id = EXCLUDED.category_id,
      custom_category_detail = EXCLUDED.custom_category_detail,
      description = EXCLUDED.description,
      amount = EXCLUDED.amount,
      note = EXCLUDED.note,
      updated_at = NOW()
  `, [
    income.id, 
    GUEST_USER_ID, 
    income.date, 
    income.categoryId, 
    income.customCategoryDetail || null, 
    income.description, 
    income.amount, 
    income.note || null
  ]);
}

export async function deleteIncomeDb(id: string): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query('DELETE FROM incomes WHERE id = $1 AND user_id = $2', [id, GUEST_USER_ID]);
}

export async function getExpensesDb(): Promise<Expense[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, date, category_id, household_items, personal_member_id, description, amount, note, slip_url FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
    categoryId: row.category_id,
    householdItems: row.household_items || undefined,
    personalMemberId: row.personal_member_id || undefined,
    description: row.description,
    amount: parseFloat(row.amount),
    note: row.note || undefined,
    slipUrl: row.slip_url || undefined
  }));
}

export async function saveExpenseDb(expense: Expense): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(`
    INSERT INTO expenses (id, user_id, date, category_id, household_items, personal_member_id, description, amount, note, slip_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      date = EXCLUDED.date,
      category_id = EXCLUDED.category_id,
      household_items = EXCLUDED.household_items,
      personal_member_id = EXCLUDED.personal_member_id,
      description = EXCLUDED.description,
      amount = EXCLUDED.amount,
      note = EXCLUDED.note,
      slip_url = EXCLUDED.slip_url,
      updated_at = NOW()
  `, [
    expense.id,
    GUEST_USER_ID,
    expense.date,
    expense.categoryId,
    expense.householdItems || null,
    expense.personalMemberId || null,
    expense.description,
    expense.amount,
    expense.note || null,
    expense.slipUrl || null
  ]);
}

export async function deleteExpenseDb(id: string): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, GUEST_USER_ID]);
}

export async function getBudgetsDb(): Promise<Budget[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT category_id, amount, month_year FROM budgets WHERE user_id = $1',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    categoryId: row.category_id,
    amount: parseFloat(row.amount),
    monthYear: row.month_year
  }));
}

export async function saveBudgetDb(budget: Budget): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  const monthYear = budget.monthYear || new Date().toISOString().substring(0, 7); // '2026-06'
  await activePool.query(`
    INSERT INTO budgets (user_id, category_id, amount, month_year)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, category_id, month_year) DO UPDATE SET
      amount = EXCLUDED.amount
  `, [GUEST_USER_ID, budget.categoryId, budget.amount, monthYear]);
}

export async function getSavingGoalDb(): Promise<SavingGoal> {
  const activePool = getPool();
  if (!activePool) return { title: 'เป้าหมายเงินออมครอบครัว', targetAmount: 120000, currentSaved: 45000 };
  
  const res = await activePool.query(
    'SELECT family_name, savings_goal, current_savings FROM profiles WHERE id = $1',
    [GUEST_USER_ID]
  );
  
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return {
      title: 'เป้าหมายเงินออมของ ' + row.family_name,
      targetAmount: parseFloat(row.savings_goal),
      currentSaved: parseFloat(row.current_savings)
    };
  }
  return { title: 'เป้าหมายเงินออมครอบครัว', targetAmount: 120000, currentSaved: 45000 };
}

export async function saveSavingGoalDb(goal: SavingGoal): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  // Parse name from title
  const familyName = goal.title.replace('เป้าหมายเงินออมของ ', '').replace('เป้าหมายเงินออมครอบครัว', 'ครอบครัวแสนสุข');
  await activePool.query(`
    UPDATE profiles SET
      family_name = $1,
      savings_goal = $2,
      current_savings = $3,
      updated_at = NOW()
    WHERE id = $4
  `, [familyName, goal.targetAmount, goal.currentSaved, GUEST_USER_ID]);
}

export async function getNotificationsDb(): Promise<Notification[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, date, type, title, message, read FROM notifications WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
    type: row.type as 'warning' | 'info' | 'success',
    title: row.title,
    message: row.message,
    read: row.read
  }));
}

export async function addNotificationDb(notif: Omit<Notification, 'id' | 'date'>): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(`
    INSERT INTO notifications (user_id, date, type, title, message, read)
    VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
  `, [GUEST_USER_ID, notif.type, notif.title, notif.message, notif.read || false]);
}

export async function markNotificationAsReadDb(id: string): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
    [id, GUEST_USER_ID]
  );
}

export async function clearAllNotificationsDb(): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  await activePool.query('DELETE FROM notifications WHERE user_id = $1', [GUEST_USER_ID]);
}

export async function getAuditLogsDb(): Promise<AuditLog[]> {
  const activePool = getPool();
  if (!activePool) return [];
  const res = await activePool.query(
    'SELECT id, timestamp, action, table_name, record_id, details FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50',
    [GUEST_USER_ID]
  );
  return res.rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
    action: row.action,
    tableName: row.table_name,
    recordId: row.record_id,
    details: row.details
  }));
}

export async function resetDatabaseDb(): Promise<void> {
  const activePool = getPool();
  if (!activePool) return;
  
  // Clean all custom ledger data for this user ID
  await activePool.query('DELETE FROM incomes WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM expenses WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM budgets WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM family_members WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM notifications WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM audit_logs WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM income_categories WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM expense_categories WHERE user_id = $1', [GUEST_USER_ID]);
  await activePool.query('DELETE FROM profiles WHERE id = $1', [GUEST_USER_ID]);

  // Re-seed default profile and members
  await ensureDefaultProfile();
}
