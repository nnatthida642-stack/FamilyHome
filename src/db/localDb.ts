/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FamilyMember,
  IncomeCategory,
  ExpenseCategory,
  Income,
  Expense,
  Budget,
  Notification,
  AuditLog,
  FinancialSummary,
  SavingGoal
} from '../types';

// Default static categories
export const DEFAULT_INCOME_CATEGORIES: IncomeCategory[] = [
  { id: 'inc_salary', name: 'เงินเดือน' },
  { id: 'inc_freelance', name: 'งานฟรีแลนซ์' },
  { id: 'inc_rider', name: 'ค่าวิ่งไรเดอร์' },
  { id: 'inc_secondhand', name: 'ขายสินค้ามือสอง' },
  { id: 'inc_other', name: 'รายได้อื่น ๆ' }
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'exp_room', name: 'ค่าห้องพัก', isPersonal: false },
  { id: 'exp_water', name: 'ค่าน้ำ', isPersonal: false },
  { id: 'exp_electricity', name: 'ค่าไฟ', isPersonal: false },
  { id: 'exp_share', name: 'ค่าแชร์', isPersonal: false },
  { id: 'exp_car', name: 'ค่างวดรถ', isPersonal: false },
  { id: 'exp_schoolbus', name: 'ค่ารถโรงเรียน', isPersonal: false },
  { id: 'exp_fuel', name: 'ค่าน้ำมัน', isPersonal: false },
  { id: 'exp_grocery', name: 'ค่าของกิน', isPersonal: false },
  { id: 'exp_ingredients', name: 'ค่ากับข้าว', isPersonal: false },
  { id: 'exp_food', name: 'ค่าอาหาร', isPersonal: false },
  { id: 'exp_household', name: 'ของใช้ภายในบ้าน', isPersonal: false },
  { id: 'exp_other', name: 'อื่น ๆ', isPersonal: false },
  // Personal expense categories
  { id: 'exp_snacks', name: 'ค่าขนม', isPersonal: true },
  { id: 'exp_coffee', name: 'กาแฟ', isPersonal: true },
  { id: 'exp_tea', name: 'ชา', isPersonal: true },
  { id: 'exp_drinks', name: 'เครื่องดื่ม', isPersonal: true },
  { id: 'exp_schoolmoney', name: 'เงินไปโรงเรียน', isPersonal: true },
  { id: 'exp_personal', name: 'ค่าใช้จ่ายส่วนตัว', isPersonal: true }
];

export const DEFAULT_HOUSEHOLD_GOODS = [
  'ข้าวสาร',
  'น้ำปลา',
  'น้ำยาสระผม',
  'สบู่',
  'ผงซักฟอก',
  'ถ่าน',
  'ยาสีฟัน',
  'น้ำดื่ม'
];

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'member_pope', name: 'พ่อ', role: 'พนักงานประจำ', avatarColor: 'emerald' },
  { id: 'member_mae', name: 'แม่', role: 'Rider', avatarColor: 'blue' },
  { id: 'member_aya', name: 'น้องเอญ่า', role: 'ลูก (อายุ 9 ปี)', age: 9, avatarColor: 'orange' },
  { id: 'member_alice', name: 'น้องอลิซ', role: 'ลูก (อายุ 7 ปี)', age: 7, avatarColor: 'purple' }
];

const STORAGE_KEYS = {
  MEMBERS: 'ffm_members',
  INCOME_CATS: 'ffm_income_cats',
  EXPENSE_CATS: 'ffm_expense_cats',
  INCOMES: 'ffm_incomes',
  EXPENSES: 'ffm_expenses',
  BUDGETS: 'ffm_budgets',
  SAVING_GOAL: 'ffm_saving_goal',
  NOTIFICATIONS: 'ffm_notifications',
  AUDIT_LOGS: 'ffm_audit_logs',
  HOUSEHOLD_GOODS: 'ffm_household_goods'
};

const DEFAULT_GOAL: SavingGoal = {
  title: 'เป้าหมายเงินออมครอบครัว',
  targetAmount: 120000,
  currentSaved: 45000
};

// Seeding standard list of incomes & expenses for May and June 2026
const seedData = () => {
  const currentMonth = '2026-06';
  const prevMonth = '2026-05';

  const seededIncomes: Income[] = [
    // May Incomes
    { id: 'inc_1', date: `${prevMonth}-01`, categoryId: 'inc_salary', description: 'เงินเดือนพนักงานประจำของพ่อ', amount: 28500, note: 'โอนเข้าบัญชีหลัก' },
    { id: 'inc_2', date: `${prevMonth}-15`, categoryId: 'inc_freelance', description: 'งานพิเศษทำเว็บไซต์', amount: 8500, note: 'งานฟรีแลนซ์เสริม' },
    { id: 'inc_3', date: `${prevMonth}-28`, categoryId: 'inc_rider', description: 'ค่าวิ่งไรเดอร์สะสมของแม่', amount: 15400 },
    { id: 'inc_4', date: `${prevMonth}-20`, categoryId: 'inc_secondhand', description: 'ขายของเล่นเก่าและเสื้อผ้าไม่ได้ใช้', amount: 2400 },
    
    // June Incomes
    { id: 'inc_5', date: `${currentMonth}-01`, categoryId: 'inc_salary', description: 'เงินเดือนพ่อประจำเดือนมิถุนายน', amount: 28500, note: 'เงินเข้าบัญชี' },
    { id: 'inc_6', date: `${currentMonth}-05`, categoryId: 'inc_rider', description: 'ค่าวิ่งไรเดอร์รอบครึ่งเดือนแรกแบรนด์เขียว', amount: 7800 },
    { id: 'inc_7', date: `${currentMonth}-10`, categoryId: 'inc_freelance', description: 'เขียนโปรแกรมระบบร้านค้า', amount: 4500 }
  ];

  const seededExpenses: Expense[] = [
    // May Expenses
    { id: 'exp_1', date: `${prevMonth}-02`, categoryId: 'exp_room', description: 'ค่าห้องพักรายเดือน', amount: 4500 },
    { id: 'exp_2', date: `${prevMonth}-03`, categoryId: 'exp_electricity', description: 'ค่าไฟห้องพัก', amount: 1650 },
    { id: 'exp_3', date: `${prevMonth}-03`, categoryId: 'exp_water', description: 'ค่าน้ำประปา', amount: 180 },
    { id: 'exp_4', date: `${prevMonth}-05`, categoryId: 'exp_schoolbus', description: 'ค่ารถรับส่งโรงเรียนน้องเอญ่าและน้องอลิซ', amount: 3200 },
    { id: 'exp_5', date: `${prevMonth}-10`, categoryId: 'exp_car', description: 'ค่างวดผ่อนรถจักรยานยนต์', amount: 2800 },
    { id: 'exp_6', date: `${prevMonth}-12`, categoryId: 'exp_household', householdItems: ['ข้าวสาร', 'น้ำปลา', 'ผงซักฟอก'], description: 'ซื้อของใช้ในบ้านห้างบิ๊กซี', amount: 1450 },
    { id: 'exp_7', date: `${prevMonth}-15`, categoryId: 'exp_fuel', description: 'เติมน้ำมันมอเตอร์ไซค์พ่อแม่', amount: 1200 },
    { id: 'exp_8', date: `${prevMonth}-18`, categoryId: 'exp_food', description: 'บุฟเฟ่ต์หมูกระทะวันหยุดครอบครัว', amount: 1190 },
    { id: 'exp_9', date: `${prevMonth}-05`, categoryId: 'exp_schoolmoney', personalMemberId: 'member_aya', description: 'เงินไปโรงเรียนสัปดาห์ที่ 1', amount: 500 },
    { id: 'exp_10', date: `${prevMonth}-05`, categoryId: 'exp_schoolmoney', personalMemberId: 'member_alice', description: 'เงินไปโรงเรียนสัปดาห์ที่ 1', amount: 400 },
    { id: 'exp_11', date: `${prevMonth}-14`, categoryId: 'exp_coffee', personalMemberId: 'member_pope', description: 'กาแฟอเมซอนตอนเช้าสะสม', amount: 650 },
    { id: 'exp_12', date: `${prevMonth}-20`, categoryId: 'exp_snacks', personalMemberId: 'member_alice', description: 'ไอศกรีมและขนมเซเว่น', amount: 220 },

    // June Expenses
    { id: 'exp_13', date: `${currentMonth}-02`, categoryId: 'exp_room', description: 'ค่าห้องพักรายเดือน', amount: 4500 },
    { id: 'exp_14', date: `${currentMonth}-03`, categoryId: 'exp_electricity', description: 'ค่าไฟห้องพัก มิ.ย.', amount: 1820 },
    { id: 'exp_15', date: `${currentMonth}-03`, categoryId: 'exp_water', description: 'ค่าน้ำ มิ.ย.', amount: 190 },
    { id: 'exp_16', date: `${currentMonth}-05`, categoryId: 'exp_schoolbus', description: 'ค่ารถโรงเรียนเด็กๆ มิ.ย.', amount: 3200 },
    { id: 'exp_17', date: `${currentMonth}-05`, categoryId: 'exp_schoolmoney', personalMemberId: 'member_aya', description: 'เงินไปโรงเรียนน้องเอญ่า', amount: 600 },
    { id: 'exp_18', date: `${currentMonth}-05`, categoryId: 'exp_schoolmoney', personalMemberId: 'member_alice', description: 'เงินไปโรงเรียนน้องอลิซ', amount: 500 },
    { id: 'exp_19', date: `${currentMonth}-06`, categoryId: 'exp_household', householdItems: ['น้ำยาสระผม', 'ยาสีฟัน', 'น้ำดื่ม'], description: 'ซื้อของแห้งโลตัส', amount: 760 },
    { id: 'exp_20', date: `${currentMonth}-07`, categoryId: 'exp_fuel', description: 'ค่าน้ำมันรถมอเตอร์ไซค์ไรเดอร์แม่', amount: 1500 },
    { id: 'exp_21', date: `${currentMonth}-08`, categoryId: 'exp_coffee', personalMemberId: 'member_pope', description: 'กาแฟสตาร์บัคส์ฉลองวันเกิดพ่อ', amount: 310 },
    { id: 'exp_22', date: `${currentMonth}-09`, categoryId: 'exp_ingredients', description: 'วัตถุดิบทำกับข้าวตลาดนัดเย็น', amount: 950 },
    { id: 'exp_23', date: `${currentMonth}-11`, categoryId: 'exp_personal', personalMemberId: 'member_mae', description: 'เสื้อคลุมกันแดดสำหรับวิ่งงานไรเดอร์', amount: 490 }
  ];

  const seededBudgets: Budget[] = [
    { categoryId: 'exp_room', amount: 4500 },
    { categoryId: 'exp_electricity', amount: 2000 },
    { categoryId: 'exp_water', amount: 250 },
    { categoryId: 'exp_car', amount: 3000 },
    { categoryId: 'exp_fuel', amount: 2000 },
    { categoryId: 'exp_food', amount: 5000 },
    { categoryId: 'exp_grocery', amount: 3000 },
    { categoryId: 'exp_household', amount: 2000 },
    { categoryId: 'exp_schoolmoney', amount: 1500 }
  ];

  const seededNotifications: Notification[] = [
    {
      id: 'not_1',
      date: `${currentMonth}-05`,
      type: 'success',
      title: 'ยินดีด้วย! บันทึกรายได้เดือนใหม่',
      message: 'พ่อได้รับเงินเดือนประจำงวดเรียบร้อยแล้ว 28,500 บาท รักษาวินัยการออมด้วยนะ!',
      read: false
    },
    {
      id: 'not_2',
      date: `${currentMonth}-07`,
      type: 'info',
      title: 'เป้าหมายเงินออมครอบครัว',
      message: 'ตอนนี้เป้าหมายเงินออมสะสมของคุณคือ 45,000 บาทแล้ว (คิดเป็น 37.5% ของเป้าหมาย 120,000 บาท)',
      read: true
    }
  ];

  const seededAuditLogs: AuditLog[] = [
    {
      id: 'log_1',
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_SEED',
      tableName: 'all_tables',
      recordId: 'seed',
      details: 'ระบบทำการสร้างชุดข้อมูลทางการเงินตั้งต้นเพื่อความสะดวกในการสาธิตและใช้งาน'
    }
  ];

  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_FAMILY_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.INCOME_CATS, JSON.stringify(DEFAULT_INCOME_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.EXPENSE_CATS, JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.HOUSEHOLD_GOODS, JSON.stringify(DEFAULT_HOUSEHOLD_GOODS));
  localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(seededIncomes));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seededExpenses));
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(seededBudgets));
  localStorage.setItem(STORAGE_KEYS.SAVING_GOAL, JSON.stringify(DEFAULT_GOAL));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seededNotifications));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(seededAuditLogs));
};

const initStorage = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    seedData();
  }
};

export const localDb = {
  // Members
  getMembers: (): FamilyMember[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : INITIAL_FAMILY_MEMBERS;
  },
  saveMember: (member: FamilyMember) => {
    const members = localDb.getMembers();
    const existingIndex = members.findIndex(m => m.id === member.id);
    if (existingIndex > -1) {
      members[existingIndex] = member;
      localDb.logAudit('UPDATE', 'family_members', member.id, `แก้ไขสมาชิกครอบครัว: ${member.name}`);
    } else {
      members.push(member);
      localDb.logAudit('INSERT', 'family_members', member.id, `เพิ่มสมาชิกครอบครัว: ${member.name}`);
    }
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Remote Sync
    fetch('/api/db/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return members;
  },
  deleteMember: (id: string) => {
    const members = localDb.getMembers();
    const filtered = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filtered));
    localDb.logAudit('DELETE', 'family_members', id, `ลบสมาชิกครอบครัว`);

    // Remote Sync
    fetch(`/api/db/members/${id}`, { method: 'DELETE' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return filtered;
  },

  // Income Categories
  getIncomeCategories: (): IncomeCategory[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.INCOME_CATS);
    return data ? JSON.parse(data) : DEFAULT_INCOME_CATEGORIES;
  },
  saveIncomeCategory: (cat: IncomeCategory) => {
    const cats = localDb.getIncomeCategories();
    const existingIndex = cats.findIndex(c => c.id === cat.id);
    if (existingIndex > -1) {
      cats[existingIndex] = cat;
    } else {
      cats.push(cat);
    }
    localStorage.setItem(STORAGE_KEYS.INCOME_CATS, JSON.stringify(cats));

    // Remote Sync
    fetch('/api/db/categories/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return cats;
  },
  deleteIncomeCategory: (id: string) => {
    const cats = localDb.getIncomeCategories();
    const filtered = cats.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.INCOME_CATS, JSON.stringify(filtered));

    // Remote Sync
    fetch(`/api/db/categories/income/${id}`, { method: 'DELETE' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return filtered;
  },

  // Expense Categories
  getExpenseCategories: (): ExpenseCategory[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSE_CATS);
    return data ? JSON.parse(data) : DEFAULT_EXPENSE_CATEGORIES;
  },
  saveExpenseCategory: (cat: ExpenseCategory) => {
    const cats = localDb.getExpenseCategories();
    const existingIndex = cats.findIndex(c => c.id === cat.id);
    if (existingIndex > -1) {
      cats[existingIndex] = cat;
    } else {
      cats.push(cat);
    }
    localStorage.setItem(STORAGE_KEYS.EXPENSE_CATS, JSON.stringify(cats));

    // Remote Sync
    fetch('/api/db/categories/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return cats;
  },
  deleteExpenseCategory: (id: string) => {
    const cats = localDb.getExpenseCategories();
    const filtered = cats.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSE_CATS, JSON.stringify(filtered));

    // Remote Sync
    fetch(`/api/db/categories/expense/${id}`, { method: 'DELETE' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return filtered;
  },

  // Household items
  getHouseholdGoods: (): string[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD_GOODS);
    return data ? JSON.parse(data) : DEFAULT_HOUSEHOLD_GOODS;
  },
  addHouseholdGood: (item: string) => {
    const items = localDb.getHouseholdGoods();
    if (item && !items.includes(item)) {
      items.push(item);
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLD_GOODS, JSON.stringify(items));
    }
    return items;
  },

  // Incomes CRUD
  getIncomes: (): Income[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.INCOMES);
    return data ? JSON.parse(data) : [];
  },
  saveIncome: (income: Income) => {
    const incomes = localDb.getIncomes();
    const existingIndex = incomes.findIndex(i => i.id === income.id);
    if (existingIndex > -1) {
      incomes[existingIndex] = income;
      localDb.logAudit('UPDATE', 'incomes', income.id, `แก้ไขรายรับ: ${income.description} ยอด ${income.amount} บาท`);
    } else {
      incomes.push(income);
      localDb.logAudit('INSERT', 'incomes', income.id, `เพิ่มรายรับ: ${income.description} ยอด ${income.amount} บาท`);
    }
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));

    // Remote Sync
    fetch('/api/db/incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(income)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return incomes;
  },
  deleteIncome: (id: string) => {
    const incomes = localDb.getIncomes();
    const income = incomes.find(i => i.id === id);
    const filtered = incomes.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(filtered));
    if (income) {
      localDb.logAudit('DELETE', 'incomes', id, `ลบรายรับ: ${income.description} ยอด ${income.amount} บาท`);
    }

    // Remote Sync
    fetch(`/api/db/incomes/${id}`, { method: 'DELETE' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return filtered;
  },

  // Expenses CRUD
  getExpenses: (): Expense[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpense: (expense: Expense) => {
    const expenses = localDb.getExpenses();
    const existingIndex = expenses.findIndex(e => e.id === expense.id);
    if (existingIndex > -1) {
      expenses[existingIndex] = expense;
      localDb.logAudit('UPDATE', 'expenses', expense.id, `แก้ไขรายจ่าย: ${expense.description} ยอด ${expense.amount} บาท`);
    } else {
      expenses.push(expense);
      localDb.logAudit('INSERT', 'expenses', expense.id, `เพิ่มรายจ่าย: ${expense.description} ยอด ${expense.amount} บาท`);
    }
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

    // Check budget alert conditions dynamically
    localDb.checkBudgetAlert(expense);

    // Remote Sync
    fetch('/api/db/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return expenses;
  },
  deleteExpense: (id: string) => {
    const expenses = localDb.getExpenses();
    const expense = expenses.find(e => e.id === id);
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    if (expense) {
      localDb.logAudit('DELETE', 'expenses', id, `ลบรายจ่าย: ${expense.description} ยอด ${expense.amount} บาท`);
    }

    // Remote Sync
    fetch(`/api/db/expenses/${id}`, { method: 'DELETE' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return filtered;
  },

  // Budgets
  getBudgets: (): Budget[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  },
  saveBudget: (budget: Budget) => {
    const budgets = localDb.getBudgets();
    const existingIndex = budgets.findIndex(b => b.categoryId === budget.categoryId);
    if (existingIndex > -1) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    localDb.logAudit('UPDATE_BUDGET', 'budgets', budget.categoryId, `ตั้งงบประมาณ ${budget.amount}`);

    // Remote Sync
    fetch('/api/db/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return budgets;
  },

  // Goal
  getSavingGoal: (): SavingGoal => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.SAVING_GOAL);
    return data ? JSON.parse(data) : DEFAULT_GOAL;
  },
  saveSavingGoal: (goal: SavingGoal) => {
    localStorage.setItem(STORAGE_KEYS.SAVING_GOAL, JSON.stringify(goal));
    localDb.logAudit('UPDATE_GOAL', 'profiles', 'goal', `แก้ไขเป้าหมายการออม: ${goal.targetAmount} บาท`);

    // Remote Sync
    fetch('/api/db/saving-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return goal;
  },

  // Notifications
  getNotifications: (): Notification[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const notifications = localDb.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: 'not_' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));

    // Remote Sync
    fetch('/api/db/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return notifications;
  },
  markNotificationAsRead: (id: string) => {
    const notifications = localDb.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));

    // Remote Sync
    fetch('/api/db/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return updated;
  },
  clearAllNotifications: () => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));

    // Remote Sync
    fetch('/api/db/notifications/clear', { method: 'POST' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return [];
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  },
  logAudit: (action: string, tableName: string, recordId: string, details: string) => {
    const logs = localDb.getAuditLogs();
    const newLog: AuditLog = {
      id: 'log_' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      action,
      tableName,
      recordId,
      details
    };
    logs.unshift(newLog);
    // limit logs to 100 for storage efficiency
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  },

  // Check budget over limits dynamic logic
  checkBudgetAlert: (expense: Expense) => {
    const budgets = localDb.getBudgets();
    const budget = budgets.find(b => b.categoryId === expense.categoryId);
    if (!budget || budget.amount <= 0) return;

    const expenses = localDb.getExpenses();
    const expenseMonth = expense.date.substring(0, 7); // 'YYYY-MM'
    
    // Sum all expenses for this category in the same month
    const familyExpensesInCat = expenses.filter(e => 
      e.categoryId === expense.categoryId && 
      e.date.startsWith(expenseMonth)
    );
    const totalSpent = familyExpensesInCat.reduce((sum, e) => sum + e.amount, 0);

    if (totalSpent > budget.amount) {
      const cats = localDb.getExpenseCategories();
      const catName = cats.find(c => c.id === expense.categoryId)?.name || 'ค่าใช้จ่าย';
      localDb.addNotification({
        type: 'warning',
        title: `เกินงบประมาณประจำเดือน! ⚠️ (${catName})`,
        message: `คุณมียอดใช้ออกรวมในหมวดหมู่ "${catName}" เท่ากับ ${totalSpent.toLocaleString('th-TH')} บาท ซึ่งเกินกว่างบประมาณที่ตั้งไว้ที่ ${budget.amount.toLocaleString('th-TH')} บาท สำหรับเดือนนี้แล้ว!`
      });
    } else if (totalSpent > budget.amount * 0.85) {
      const cats = localDb.getExpenseCategories();
      const catName = cats.find(c => c.id === expense.categoryId)?.name || 'ค่าใช้จ่าย';
      localDb.addNotification({
        type: 'info',
        title: `ใกล้เต็มงบประมาณแล้ว! 🟡 (${catName})`,
        message: `คุณมียอดใช้ออกรวมในหมวดหมู่ "${catName}" ทะลุ 85% ของงบประมาณแล้ว (${totalSpent.toLocaleString('th-TH')} / ${budget.amount.toLocaleString('th-TH')} บาท)`
      });
    }
  },

  checkAllBudgets: (monthYear: string) => {
    const budgets = localDb.getBudgets();
    const expenses = localDb.getExpenses();
    const cats = localDb.getExpenseCategories();
    const notifications = localDb.getNotifications();
    const todayStr = new Date().toISOString().split('T')[0];

    budgets.forEach(budget => {
      if (!budget.amount || budget.amount <= 0) return;
      const catExpenses = expenses.filter(e => e.categoryId === budget.categoryId && e.date.startsWith(monthYear));
      const totalSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      const catName = cats.find(c => c.id === budget.categoryId)?.name || 'ค่าใช้จ่าย';

      if (totalSpent > budget.amount) {
        const alertExists = notifications.some(n => n.title.includes(catName) && n.title.includes('เกินงบประมาณ') && n.date === todayStr);
        if (!alertExists) {
          localDb.addNotification({
            type: 'warning',
            title: `งบประมาณรายหมวดหมู่เกินขีดจำกัด! ⚠️ (${catName})`,
            message: `ตรวจพบค่าใช้จ่ายหมวดหมู่ "${catName}" ยอดทะลุไปถึง ${totalSpent.toLocaleString('th-TH')} บาท ซึ่งตอนนี้เกินกว่าขีดจำกัดงบประมาณ ${budget.amount.toLocaleString('th-TH')} บาท`
          });
        }
      } else if (totalSpent > budget.amount * 0.85) {
        const alertExists = notifications.some(n => n.title.includes(catName) && n.title.includes('ใกล้เต็มงบประมาณ') && n.date === todayStr);
        if (!alertExists) {
          localDb.addNotification({
            type: 'info',
            title: `ระวังใกล้ขีดงบประมาณแล้ว! 🟡 (${catName})`,
            message: `หมวดหมู่ "${catName}" มียอดสะสม ${totalSpent.toLocaleString('th-TH')} บาท ใกล้ชนงบเพดานที่กำหนดไว้ ${budget.amount.toLocaleString('th-TH')} บาท แล้วค่ะ!`
          });
        }
      }
    });
  },

  // Calculation Views & Summaries
  getFinancialSummary: (monthYear?: string): FinancialSummary => {
    const targetMonth = monthYear || '2026-06';
    const incomes = localDb.getIncomes().filter(i => i.date.startsWith(targetMonth));
    const expenses = localDb.getExpenses().filter(e => e.date.startsWith(targetMonth));
    const goals = localDb.getSavingGoal();

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // Savings = in this case, the residue (balance) for this month, added value toward monthly target savings
    const savings = balance > 0 ? balance : 0;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Calculate average daily expense
    const currentMonthDays = new Date(parseInt(targetMonth.substring(0,4)), parseInt(targetMonth.substring(5,7)), 0).getDate();
    const avgDailyExpense = currentMonthDays > 0 ? totalExpense / currentMonthDays : 0;

    // Financial Health Score Formula (0-100)
    // 1. Savings Rate points (Max 40 pt). Healthy is 30% savings or above
    let savingsPt = 0;
    if (savingsRate >= 30) savingsPt = 40;
    else if (savingsRate > 0) savingsPt = (savingsRate / 30) * 40;

    // 2. Expense Ratio (Max 20 pt). Total Expense / Total Income. If < 50% score full 20. If > 95% score 0.
    let expenseRatioPt = 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;
    if (expenseRatio <= 50) expenseRatioPt = 20;
    else if (expenseRatio < 100) expenseRatioPt = ((100 - expenseRatio) / 50) * 20;

    // 3. Positive Balance check (Max 20 pt). Positive = 20. Negative = 0.
    const balancePt = balance > 0 ? 20 : 0;

    // 4. Saving target progress (Max 20 pt). Goal current saved vs target
    const goalRatio = goals.targetAmount > 0 ? (goals.currentSaved / goals.targetAmount) * 100 : 0;
    const goalPt = Math.min(20, (goalRatio / 100) * 20);

    const healthScore = Math.round(savingsPt + expenseRatioPt + balancePt + goalPt);

    let healthStatus = 'ปานกลาง';
    if (healthScore >= 90) healthStatus = 'ดีมาก';
    else if (healthScore >= 75) healthStatus = 'ดี';
    else if (healthScore >= 60) healthStatus = 'ปานกลาง';
    else if (healthScore >= 40) healthStatus = 'ควรระวัง';
    else healthStatus = 'วิกฤต';

    return {
      totalIncome,
      totalExpense,
      balance,
      savings,
      savingsRate: Math.max(0, parseFloat(savingsRate.toFixed(1))),
      avgDailyExpense: parseFloat(avgDailyExpense.toFixed(1)),
      healthScore,
      healthStatus
    };
  },

  // Reset function to set default seed state
  resetDatabase: () => {
    localStorage.clear();
    seedData();

    // Remote Sync
    fetch('/api/db/reset', { method: 'POST' })
      .catch(err => console.warn('Supabase DB Sync skipped (local-only/offline):', err));

    return true;
  }
};
