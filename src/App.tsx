/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  PiggyBank, 
  ChevronDown, 
  Sparkles, 
  Heart,
  ListRestart
} from 'lucide-react';
import { localDb } from './db/localDb';
import DashboardTab from './components/DashboardTab';
import IncomeTab from './components/IncomeTab';
import ExpenseTab from './components/ExpenseTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import BottomNavigation from './components/BottomNavigation';
import NotificationCenter from './components/NotificationCenter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expense' | 'reports' | 'settings'>('dashboard');
  const [activeMonth, setActiveMonth] = useState('2026-06'); // June 2026 default
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'local'>('checking');
  const [dbSyncing, setDbSyncing] = useState(false);

  useEffect(() => {
    // Check database status and query remote PostgreSQL state
    fetch('/api/db/state')
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          // Sync backend data into LocalStorage so our client wrappers work seamlessly
          localStorage.setItem('ffm_members', JSON.stringify(data.members));
          localStorage.setItem('ffm_incomes', JSON.stringify(data.incomes));
          localStorage.setItem('ffm_expenses', JSON.stringify(data.expenses));
          localStorage.setItem('ffm_budgets', JSON.stringify(data.budgets));
          localStorage.setItem('ffm_saving_goal', JSON.stringify(data.goal));
          localStorage.setItem('ffm_notifications', JSON.stringify(data.notifications));
          localStorage.setItem('ffm_audit_logs', JSON.stringify(data.auditLogs));
          
          if (Array.isArray(data.incomeCategories) && data.incomeCategories.length > 0) {
            localStorage.setItem('ffm_income_cats', JSON.stringify(data.incomeCategories));
          }
          if (Array.isArray(data.expenseCategories) && data.expenseCategories.length > 0) {
            localStorage.setItem('ffm_expense_cats', JSON.stringify(data.expenseCategories));
          }
          
          localDb.checkAllBudgets('2026-06');
          setDbStatus('connected');
        } else {
          localDb.checkAllBudgets('2026-06');
          setDbStatus('local');
        }
      })
      .catch(err => {
        console.warn('Could not retrieve DB state on start (normal for local fallback):', err);
        localDb.checkAllBudgets('2026-06');
        setDbStatus('local');
      });
  }, []);

  useEffect(() => {
    // Keep unread counts updated in visual header
    const interval = setInterval(() => {
      const allNotifs = localDb.getNotifications();
      const count = allNotifs.filter(n => !n.read).length;
      setUnreadNotifCount(count);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleBulkSyncToSupabase = async () => {
    if (dbStatus !== 'connected') return;
    setDbSyncing(true);
    try {
      const payload = {
        members: localDb.getMembers(),
        incomeCategories: localDb.getIncomeCategories(),
        expenseCategories: localDb.getExpenseCategories(),
        incomes: localDb.getIncomes(),
        expenses: localDb.getExpenses(),
        budgets: localDb.getBudgets(),
        goal: localDb.getSavingGoal()
      };
      
      const res = await fetch('/api/db/sync-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('ซิงค์ข้อมูลจาก Local Storage ขึ้นสู่ระบบคลาวด์ Supabase สำเร็จเรียบร้อยแล้วค่ะ!');
        window.location.reload();
      } else {
        alert('ไม่สามารถซิงค์ข้อมูลได้: ' + (data.error || 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ'));
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อซิงค์ข้อมูล: ' + err.message);
    } finally {
      setDbSyncing(false);
    }
  };

  if (dbStatus === 'checking') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-bold text-xs tracking-wider uppercase">กำลังเชื่อมต่อคลาวด์ฐานข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 md:pb-28">
      {/* Visual Elegant Header Block */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100/80 px-4 py-3 flex items-center justify-between print:hidden shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8.5 h-8.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10">
            <PiggyBank className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase flex items-center space-x-1">
                <span>Family Finance</span>
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              </h1>
              {dbStatus === 'connected' ? (
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-[9px] text-emerald-600 font-black px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Cloud DB</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 bg-amber-50 text-[8px] text-amber-600 font-black px-1.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span>Local DB</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold -mt-0.5 flex items-center space-x-1.5">
              <span>ระบบจัดการเงินครอบครัวแสนสุข</span>
              {dbStatus === 'connected' && (
                <button 
                  onClick={handleBulkSyncToSupabase}
                  disabled={dbSyncing}
                  className="text-[9px] text-emerald-600 hover:text-emerald-700 font-black underline cursor-pointer disabled:text-slate-400 border-none bg-none p-0 inline-flex"
                >
                  {dbSyncing ? 'กำลังซิงค์...' : '⚡ ซิงค์ขึ้นคลาวด์'}
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Global Selectors & Notifications triggers */}
        <div className="flex items-center space-x-2">
          {/* Month selective dropdown */}
          <div className="relative">
            <select
              value={activeMonth}
              onChange={e => setActiveMonth(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-100 pl-3 pr-7 py-1.5 rounded-full text-[11px] font-bold text-slate-700 outline-none focus:border-slate-300"
            >
              <option value="2026-06">มิถุนายน 2026</option>
              <option value="2026-05">พฤษภาคม 2026</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Bell Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 border border-slate-100 bg-white hover:bg-slate-50 rounded-full text-slate-500 relative transition-all shadow-sm active:scale-95"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 border border-white text-slate-950 font-bold text-[8px] rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-3xl mx-auto px-4 pt-4 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + activeMonth}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="focus-outline"
          >
            {activeTab === 'dashboard' && (
              <DashboardTab 
                onAddTransaction={(type) => setActiveTab(type === 'income' ? 'income' : 'expense')} 
                activeMonth={activeMonth} 
              />
            )}
            {activeTab === 'income' && <IncomeTab />}
            {activeTab === 'expense' && <ExpenseTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Nav System bar */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Notification Modal Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
