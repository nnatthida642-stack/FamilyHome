/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderLock, 
  Target, 
  Coins, 
  Database, 
  Trash2, 
  Plus, 
  Check, 
  RefreshCw, 
  Clipboard, 
  CheckCircle,
  HelpCircle,
  PiggyBank,
  AlertTriangle,
  FolderMinus,
  Atom,
  Info
} from 'lucide-react';
import { localDb } from '../db/localDb';
import { FULL_SUPABASE_SQL } from '../db/sqlScript';
import { FamilyMember, Budget, SavingGoal, ExpenseCategory } from '../types';

export default function SettingsTab() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goal, setGoal] = useState<SavingGoal>({ title: '', targetAmount: 0, currentSaved: 0 });

  // Add Member state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('ลูก');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberColor, setNewMemberColor] = useState('emerald');

  // Add Category state
  const [newExpenseCatName, setNewExpenseCatName] = useState('');
  const [newExpenseCatPersonal, setNewExpenseCatPersonal] = useState(false);

  // SQL Copied Status helper
  const [sqlCopied, setSqlCopied] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<'members' | 'budgets' | 'goals' | 'sql'>('members');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setMembers(localDb.getMembers());
    setExpenseCategories(localDb.getExpenseCategories());
    setBudgets(localDb.getBudgets());
    setGoal(localDb.getSavingGoal());
  };

  // Member actions
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;

    const newMem: FamilyMember = {
      id: 'member_' + Math.random().toString(36).substr(2, 9),
      name: newMemberName,
      role: newMemberRole,
      age: newMemberAge ? parseInt(newMemberAge) : undefined,
      avatarColor: newMemberColor
    };

    localDb.saveMember(newMem);
    setNewMemberName('');
    setNewMemberAge('');
    loadSettings();
  };

  const handleDeleteMember = (id: string) => {
    localDb.deleteMember(id);
    loadSettings();
  };

  // Category Actions
  const handleAddExpenseCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseCatName) return;

    const newCat: ExpenseCategory = {
      id: 'exp_custom_' + Math.random().toString(36).substr(2, 9),
      name: newExpenseCatName,
      isPersonal: newExpenseCatPersonal,
      isCustom: true
    };

    localDb.saveExpenseCategory(newCat);
    setNewExpenseCatName('');
    setNewExpenseCatPersonal(false);
    loadSettings();
  };

  const handleDeleteExpenseCategory = (id: string) => {
    localDb.deleteExpenseCategory(id);
    loadSettings();
  };

  // Saving Goals updater
  const handleUpdateSavingGoal = (e: React.FormEvent) => {
    e.preventDefault();
    localDb.saveSavingGoal(goal);
    loadSettings();
    alert('บันทึกเป้าหมายการเงินเรียบร้อยแล้วค่ะ! 💰');
  };

  // Budget category updater
  const handleBudgetChange = (catId: string, value: string) => {
    const updated = localDb.saveBudget({
      categoryId: catId,
      amount: value ? parseFloat(value) : 0
    });
    setBudgets(updated);
  };

  // Database Reset helper
  const handleResetDb = () => {
    if (window.confirm('คำเตือน: คุณต้องการล้างฐานข้อมูลตัวอย่างและตั้งค่าเริ่มต้นใหม่หมดใช่หรือไม่? รายการแมนนวลทั้งหมดจะถูกลบออกนะ')) {
      localDb.resetDatabase();
      loadSettings();
      alert('ระบบฐานข้อมูลรายรับรายจ่ายได้รับการรีเซ็ตแล้วค่ะ!');
      window.location.reload();
    }
  };

  // Copy Schema SQL helper
  const handleCopySQL = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_SQL);
    setSqlCopied(true);
    setTimeout(() => {
      setSqlCopied(false);
    }, 2500);
  };

  return (
    <div className="space-y-4 font-sans pb-10">
      {/* Settings Tab header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">จัดการระบบตั้งค่า</h2>
        <p className="text-xs text-slate-400">ควบคุมข้อมูลสมาชิก งบประมาณหมวดหมู่เป้าหมาย และตรวจสอบ Supabase SQL Schema</p>
      </div>

      {/* Segment Selector tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm text-center text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveSettingsSection('members')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all ${activeSettingsSection === 'members' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="text-[10px]">ตั้งค่าสมาชิก</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('budgets')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all ${activeSettingsSection === 'budgets' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
        >
          <Coins className="h-3.5 w-3.5" />
          <span className="text-[10px]">งบประมาณรายเดือน</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('goals')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all ${activeSettingsSection === 'goals' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
        >
          <Target className="h-3.5 w-3.5" />
          <span className="text-[10px]">เป้าหมายการออม</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('sql')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all ${activeSettingsSection === 'sql' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
        >
          <Database className="h-3.5 w-3.5" />
          <span className="text-[10px]">Supabase SQL</span>
        </button>
      </div>

      {/* Render sections sequentially */}
      {activeSettingsSection === 'members' && (
        <div className="space-y-4">
          {/* Members manager */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 pb-2 border-b">
              <Users className="h-4.5 w-4.5 text-emerald-500" />
              <span>สมาชิกในบ้าน ({members.length})</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map(m => (
                <div key={m.id} className="p-3.5 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                      m.avatarColor === 'emerald' ? 'bg-emerald-500' :
                      m.avatarColor === 'blue' ? 'bg-blue-500' :
                      m.avatarColor === 'orange' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}>
                      {m.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{m.name}</h4>
                      <p className="text-[10px] text-slate-400">{m.role} {m.age ? `• อายุ ${m.age} ปี` : ''}</p>
                    </div>
                  </div>
                  {/* Delete Member, only if not of the seeded ones (optional, let's allow all delete but warn) */}
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-1 px-2.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Create member inline form */}
            <form onSubmit={handleAddMember} className="bg-slate-50/50 p-4 rounded-2xl border border-dashed space-y-3">
              <p className="text-[11px] font-bold text-slate-700">➕ เพิ่มสมาชิกในครอบครัวคนถัดไป</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                <div>
                  <label className="block mb-1">ชื่อสมาชิก</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ป้าแก้ว"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-100 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">อาชีพ / บทบาท</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แม่บ้าน, นักเรียน"
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-100 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    placeholder="ปล่อยว่างหากไม่อยากแจ้ง"
                    value={newMemberAge}
                    onChange={e => setNewMemberAge(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-100 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1">สีสิทธิ์แบรนด์ส่วนตัว</label>
                  <select
                    value={newMemberColor}
                    onChange={e => setNewMemberColor(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-100 rounded-xl text-[10px]"
                  >
                    <option value="emerald">สีเขียวสว่าง (Emerald)</option>
                    <option value="blue">สีฟ้าคราม (Blue)</option>
                    <option value="orange">สีส้มพระอาทิตย์ (Orange)</option>
                    <option value="purple">สีม่วงผลไม้ (Purple)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[10px] active:scale-95"
              >
                ลงทะเบียนสมาชิกใหม่
              </button>
            </form>
          </div>

          {/* Custom expenditure categories */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 pb-2 border-b">
              <FolderLock className="h-4.5 w-4.5 text-amber-500" />
              <span>การจำแนกหมวดหมู่รายจ่ายที่เพิ่มเอง</span>
            </span>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {expenseCategories.filter(c => c.isCustom).length > 0 ? (
                expenseCategories.filter(c => c.isCustom).map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="text-[9px] text-slate-400 ml-2">({cat.isPersonal ? 'รายบุคคล' : 'ครัวเรือน'})</span>
                    </div>
                    <button
                      onClick={() => handleDeleteExpenseCategory(cat.id)}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-[10px] text-slate-400">ยังไม่ได้รับการกรอกหมวดหมู่รายจ่ายปรับแต่งส่วนแมนนวลค่ะ</div>
              )}
            </div>

            {/* Custom categories form inline */}
            <form onSubmit={handleAddExpenseCategory} className="bg-slate-50/50 p-4 rounded-2xl border border-dashed space-y-3">
              <p className="text-[11px] font-bold text-slate-700">➕ สร้างหมวดหมู่รายจ่ายใหม่</p>
              <div className="grid grid-cols-1 gap-2 text-[10px] text-slate-600">
                <div>
                  <label className="block mb-1">ชื่อหมวดหมู่ที่ต้องการ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น บุหรี่เบียร์คุณพ่อ, สวนต้นไม้คุณแม่"
                    value={newExpenseCatName}
                    onChange={e => setNewExpenseCatName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-100 rounded-xl"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="newExpenseCatPersonal"
                    checked={newExpenseCatPersonal}
                    onChange={e => setNewExpenseCatPersonal(e.target.checked)}
                    className="rounded text-emerald-500"
                  />
                  <label htmlFor="newExpenseCatPersonal" className="font-medium cursor-pointer select-none">
                    บังคับระบุสมาชิกผู้รับผิดชอบเมื่อทำรายการ (เพื่อส่งวิเคราะห์ตัวบุคคล)
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[10px] active:scale-95"
              >
                สร้างหมวดหมู่ใหม่
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Category budgets configurations */}
      {activeSettingsSection === 'budgets' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="pb-2 border-b flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Coins className="h-4.5 w-4.5 text-indigo-500" />
              <span>กำหนดวงเงินงบประมาณรายเดือน</span>
            </span>
            <span className="text-[10px] text-slate-400">ใส่ '0' หรือเว้นว่างหากไม่จำกัดงบ</span>
          </div>

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {expenseCategories.map(cat => {
              const currentBudget = budgets.find(b => b.categoryId === cat.id)?.amount || '';
              return (
                <div key={cat.id} className="grid grid-cols-2 gap-2 items-center text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block">{cat.name}</label>
                    <span className="text-[9px] text-slate-400 block">{cat.isPersonal ? 'รายบุคคล' : 'ครัวเรือนทั้งหมด'}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-[10px]">฿</span>
                    <input
                      type="number"
                      placeholder="ไม่จำกัด"
                      value={currentBudget}
                      onChange={e => handleBudgetChange(cat.id, e.target.value)}
                      className="w-full pl-6 pr-3 py-1.5 border border-slate-100 bg-slate-50/50 rounded-xl focus:outline-none focus:border-indigo-400 font-bold tabular-nums"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Savings Goals configurations */}
      {activeSettingsSection === 'goals' && (
        <form onSubmit={handleUpdateSavingGoal} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 pb-2 border-b">
            <Target className="h-4.5 w-4.5 text-teal-500" />
            <span>เป้าหมายงบทางการเงิน</span>
          </span>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div>
              <label className="block mb-1 text-slate-450 font-medium">ชื่อหัวข้อเป้าหมายการออม</label>
              <input
                type="text"
                required
                value={goal.title}
                onChange={e => setGoal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2.5 border border-slate-100 rounded-xl"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-45k font-medium">จำนวนเงินเป้าหมายที่ต้องการสะสม (บาท)</label>
              <input
                type="number"
                required
                min="1000"
                value={goal.targetAmount}
                onChange={e => setGoal(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) }))}
                className="w-full p-2.5 border border-slate-100 rounded-xl font-bold font-mono"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-45k font-medium">จำนวนเงินที่เก็บออมได้สะสม ณ ปัจจุบัน (บาท)</label>
              <input
                type="number"
                required
                min="0"
                value={goal.currentSaved}
                onChange={e => setGoal(prev => ({ ...prev, currentSaved: parseFloat(e.target.value) }))}
                className="w-full p-2.5 border border-slate-100 rounded-xl font-bold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-extrabold text-xs active:scale-95 shadow-sm transition-all"
          >
            ปรับปรุงเป้าหมายทางการเงิน
          </button>
        </form>
      )}

      {/* SQL Script Code visual inspector for Supabase integration reviews */}
      {activeSettingsSection === 'sql' && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Database className="h-4.5 w-4.5 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold font-mono text-emerald-400">PostgreSQL Migration Script</h3>
                <p className="text-[9px] text-slate-400"> schemas, partitions, indexes, RLS, and functions</p>
              </div>
            </div>
            <button
              onClick={handleCopySQL}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg text-[10px] font-bold"
            >
              {sqlCopied ? <CheckCircle className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
              <span>{sqlCopied ? 'คัดลอกแล้ว!' : 'คัดลอก SQL Code'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl overflow-x-auto max-h-72 border border-slate-800 font-mono text-[9px] text-slate-300 leading-normal">
            <pre>{FULL_SUPABASE_SQL}</pre>
          </div>
          
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 bg-slate-950 p-3 rounded-2xl">
            <Info className="h-4 w-4 text-emerald-400 shrink-0" />
            <span> สามารถนำรหัส SQL นี้ไปวางรันตรงเมนู "SQL Editor" ของแผงควบคุมระบบจัดเก็บ Supabase เพื่อเตรียมระบบดาต้าเบสจริงๆ ได้ทันทีค่ะ</span>
          </div>
        </div>
      )}

      {/* System reset diagnostic utilities */}
      <div className="bg-rose-50/50 p-4.5 rounded-3xl border border-rose-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-rose-800">พื้นที่ล้างค่าระบบบัญชี</h4>
          <p className="text-[10px] text-rose-600/80">รีเซ็ตยอดรายรับจ่ายและสมาชิกอัติโนมัติ กลับคืนค่าเริ่มต้นจำลอง</p>
        </div>
        <button
          onClick={handleResetDb}
          className="flex items-center space-x-1 px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>ล้างและรีเซ็ตระบบ</span>
        </button>
      </div>
    </div>
  );
}
