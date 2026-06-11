/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FamilyMember {
  id: string; // "pope", "mae", "aya", "alice" etc
  name: string;
  role: string;
  age?: number;
  avatarColor: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isPersonal: boolean; // if true, requires assigning a family member
  isCustom?: boolean;
}

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string; // e.g. "salary"
  customCategoryDetail?: string; // show when "รายได้อื่นๆ" (other) is selected
  description: string;
  amount: number;
  note?: string;
  slipImage?: string; // base64 or placeholder URL
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  categoryId: string; // e.g. "room_rent"
  householdItems?: string[]; // for household goods category
  personalMemberId?: string; // for personal expense category (e.g. "pope")
  description: string;
  amount: number;
  note?: string;
  slipImage?: string; // base64 or placeholder URL
  slipUrl?: string; // compatible for database storage
}

export interface Budget {
  categoryId: string;
  amount: number;
  monthYear?: string; // compatible for monthly SQL budgeting
}

export interface SavingGoal {
  targetAmount: number;
  currentSaved: number;
  title: string;
}

export interface Notification {
  id: string;
  date: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  tableName: string;
  recordId: string;
  details: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savings: number;
  savingsRate: number; // in %
  avgDailyExpense: number;
  healthScore: number; // 0-100
  healthStatus: string; // "ดีมาก" | "ดี" | "ปานกลาง" | "ควรระวัง" | "วิกฤต"
}
