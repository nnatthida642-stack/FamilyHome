/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileDown, 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  User, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ChevronRight,
  Calculator,
  Download
} from 'lucide-react';
import { localDb } from '../db/localDb';
import { Income, Expense, IncomeCategory, ExpenseCategory, FamilyMember } from '../types';

export default function ReportsTab() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  // Filtering Options
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'local'>('checking');

  useEffect(() => {
    loadData();
    fetch('/api/db/state')
      .then(res => res.json())
      .then(data => {
        if (data.connected) {
          setDbStatus('connected');
        } else {
          setDbStatus('local');
        }
      })
      .catch(() => setDbStatus('local'));
  }, []);

  const loadData = () => {
    setIncomes(localDb.getIncomes());
    setExpenses(localDb.getExpenses());
    setIncomeCategories(localDb.getIncomeCategories());
    setExpenseCategories(localDb.getExpenseCategories());
    setMembers(localDb.getMembers());
  };

  // Helper function to check if date falls in current week
  const isCurrentWeek = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const dayDiff = Math.abs(today.getTime() - target.getTime()) / (1000 * 3600 * 24);
    return dayDiff <= 7;
  };

  const getFilteredIncomes = () => {
    return incomes.filter(inc => {
      // 1. Search query
      const matchQuery = searchQuery ? (
        inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inc.note && inc.note.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;

      // 2. Category selection
      const matchCat = selectedCat ? inc.categoryId === selectedCat : true;

      // 3. Member (Incomes don't have personal member, so if a member filter is active, exclude incomes)
      const matchMember = selectedMember ? false : true;

      // 4. Report Type Date filtering
      let matchDateType = true;
      const todayStr = new Date().toISOString().split('T')[0];
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = new Date().toISOString().substring(0, 7);

      if (reportType === 'daily') {
        const queryDate = selectedDate || todayStr;
        matchDateType = inc.date === queryDate;
      } else if (reportType === 'weekly') {
        matchDateType = isCurrentWeek(inc.date);
      } else if (reportType === 'monthly') {
        const queryMonth = selectedDate ? selectedDate.substring(0, 7) : currentMonth;
        matchDateType = inc.date.startsWith(queryMonth);
      } else if (reportType === 'annual') {
        const queryYear = selectedDate ? selectedDate.substring(0, 4) : currentYear;
        matchDateType = inc.date.startsWith(queryYear);
      }

      return matchQuery && matchCat && matchMember && matchDateType;
    });
  };

  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      // 1. Search Query
      const matchQuery = searchQuery ? (
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.note && exp.note.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;

      // 2. Category selection
      const matchCat = selectedCat ? exp.categoryId === selectedCat : true;

      // 3. Member selection
      const matchMember = selectedMember ? exp.personalMemberId === selectedMember : true;

      // 4. Report type Date filtering
      let matchDateType = true;
      const todayStr = new Date().toISOString().split('T')[0];
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = new Date().toISOString().substring(0, 7);

      if (reportType === 'daily') {
        const queryDate = selectedDate || todayStr;
        matchDateType = exp.date === queryDate;
      } else if (reportType === 'weekly') {
        matchDateType = isCurrentWeek(exp.date);
      } else if (reportType === 'monthly') {
        const queryMonth = selectedDate ? selectedDate.substring(0, 7) : currentMonth;
        matchDateType = exp.date.startsWith(queryMonth);
      } else if (reportType === 'annual') {
        const queryYear = selectedDate ? selectedDate.substring(0, 4) : currentYear;
        matchDateType = exp.date.startsWith(queryYear);
      }

      return matchQuery && matchCat && matchMember && matchDateType;
    });
  };

  const currentFilteredIncomes = getFilteredIncomes();
  const currentFilteredExpenses = getFilteredExpenses();

  const totalIncomesSum = currentFilteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpensesSum = currentFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balanceSum = totalIncomesSum - totalExpensesSum;

  // EXPORT TO CSV (AND CHROME EXCEL ENCODIBLE)
  const exportToCSV = (fileType: 'excel' | 'csv') => {
    const isSupabase = dbStatus === 'connected';
    // Collate all incomes and expenses in beautiful grid records with Supabase proofing header
    const rows = [
      ['แหล่งข้อมูลอ้างอิง', isSupabase ? 'คลาวด์ฐานข้อมูลความปลอดภัยสูง Supabase (Cloud Live Sync)' : 'ระบบโลคอลดาต้าเบสฟอลแบ็ก LocalStorage'],
      ['วันที่ดึงรายงานล่าสุด', new Date().toLocaleString('th-TH')],
      ['ระบบจัดการเงิน', 'Family Finance (ระบบแยกงบครัวเรือน)'],
      [],
      ['ประเภท', 'วันที่', 'หมวดหมู่', 'รายการคำอธิบาย', 'จำนวนเงิน (บาท)', 'ผู้รับผิดชอบ / แนบโน้ต']
    ];

    currentFilteredIncomes.forEach(inc => {
      const catName = incomeCategories.find(c => c.id === inc.categoryId)?.name || 'รายได้อื่น ๆ';
      rows.push(['รายรับ', inc.date, catName, inc.description, inc.amount.toString(), inc.note || '']);
    });

    currentFilteredExpenses.forEach(exp => {
      const catName = expenseCategories.find(c => c.id === exp.categoryId)?.name || 'อื่น ๆ';
      const memberName = members.find(m => m.id === exp.personalMemberId)?.name || 'ของใช้ส่วนรวม';
      rows.push([
        'รายจ่าย', 
        exp.date, 
        catName, 
        exp.description, 
        exp.amount.toString(), 
        `${memberName}${exp.note ? ' - ' + exp.note : ''}`
      ]);
    });

    // Add final summaries line
    rows.push([]);
    rows.push(['สรุปผลวิเคราะห์รายงาน']);
    rows.push(['รายรับรวมทั้งสิ้น', totalIncomesSum.toString()]);
    rows.push(['รายจ่ายรวมทั้งสิ้น', totalExpensesSum.toString()]);
    rows.push(['ยอดออมสะสมสุทธิ', balanceSum.toString()]);
    rows.push(['สถานะความคุ้มค่าทางการเงิน', balanceSum >= totalExpensesSum * 0.3 ? 'มีความปลอดภัยสูง' : 'ควรติดตามใกล้ชิด']);

    // Build downloadable blob using standard UTF-8 with BOM for elegant Thai character reading in MS Excel
    const csvContent = "\uFEFF" + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `รายงานรายรับรายจ่าย_Supabase_${reportType}_${new Date().toISOString().split('T')[0]}.${fileType === 'excel' ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NATIVE PRINT VIEW SIMULATOR as elegant exportable formatting
  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans pb-10 print:p-6 print:bg-white print:text-black">
      {/* Header section */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">รายงานและส่งออกข้อมูล</h2>
          <p className="text-xs text-slate-400">กรองแยกหมวดหมู่ ประเมินสัดส่วนของสมาชิก และออกรายงานด้วย Excel/PDF</p>
        </div>
      </div>

      {/* Primary Report Type Switch tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex grid grid-cols-4 text-center text-xs font-bold text-slate-500 print:hidden">
        {(['daily', 'weekly', 'monthly', 'annual'] as const).map(type => {
          const labels = { daily: 'รายวัน', weekly: 'รายสัปดาห์', monthly: 'รายเดือน', annual: 'รายปี' };
          const active = reportType === type;
          return (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`py-2 rounded-xl transition-all ${
                active ? 'bg-slate-900 text-white shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              {labels[type]}
            </button>
          );
        })}
      </div>

      {/* Real-time Dynamic aggregate results widgets */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50 p-3.5 rounded-2xl border border-emerald-100 text-center">
          <span className="text-[10px] text-emerald-600 font-bold block mb-1">รายรับในช่วง</span>
          <p className="text-base font-extrabold text-emerald-800 tabular-nums">฿{totalIncomesSum.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50/50 to-amber-50 p-3.5 rounded-2xl border border-rose-100 text-center">
          <span className="text-[10px] text-rose-600 font-bold block mb-1">รายจ่ายในช่วง</span>
          <p className="text-base font-extrabold text-rose-800 tabular-nums">฿{totalExpensesSum.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50 p-3.5 rounded-2xl border border-indigo-100 text-center">
          <span className="text-[10px] text-indigo-600 font-bold block mb-1">ยอดเหลือสุทธิ</span>
          <p className={`text-base font-extrabold tabular-nums ${balanceSum >= 0 ? 'text-indigo-800' : 'text-rose-600'}`}>
            ฿{balanceSum.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Comprehensive Filtering fields card (Required) */}
      <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5 print:hidden">
        <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
          <Filter className="h-4 w-4 text-emerald-500" />
          <span>เงื่อนไขการค้นหารายงานแบบละเอียด</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          {/* Query input path */}
          <div>
            <label className="block font-medium mb-1 text-slate-400">คำค้นหาหลัก</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="เช่น บิ๊กซี, ค่าไฟ, ของเล่น..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-100 bg-slate-50/50 rounded-xl"
              />
            </div>
          </div>

          {/* Date Picker context */}
          <div>
            <label className="block font-medium mb-1 text-slate-400">ระบุวันที่ประเมิน</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full p-1.5 border border-slate-100 bg-slate-50/50 rounded-xl"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block font-medium mb-1 text-slate-400">คัดกรองหมวดหมู่</label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="w-full p-2 border border-slate-100 bg-slate-50/50 rounded-xl"
            >
              <option value="">ทั้งหมด ทุกรายรับ/รายจ่าย</option>
              <option value="" disabled className="font-bold text-slate-500">── หมวดหมู่รายรับ ──</option>
              {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="" disabled className="font-bold text-slate-500">── หมวดหมู่รายจ่าย ──</option>
              {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Assignee / Member Selection filter */}
          <div>
            <label className="block font-medium mb-1 text-slate-400">คัดกรองสิทธิสมาชิก</label>
            <select
              value={selectedMember}
              onChange={e => setSelectedMember(e.target.value)}
              className="w-full p-2 border border-slate-100 bg-slate-50/50 rounded-xl"
            >
              <option value="">สมาชิกทุกคนในครอบครัว</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filter button */}
        {(searchQuery || selectedCat || selectedMember || selectedDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCat('');
                setSelectedMember('');
                setSelectedDate('');
              }}
              className="text-[10px] text-rose-500 font-bold hover:underline"
            >
              คืนค่าเงื่อนไขการค้นทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Exporters Row Block */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white p-5 rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div>
          <span className="text-xs font-bold text-slate-200 block">ส่งออกสรุปงบประมาณครอบครัว</span>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
            <span>ฐานข้อมูลคลาวด์:</span>
            {dbStatus === 'connected' ? (
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-extrabold text-[9px] bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                <span>Supabase Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-amber-400 font-extrabold text-[8px] bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20 uppercase">
                <span>Local DB Synced</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto justify-end">
          {/* Excel Export */}
          <button
            onClick={() => exportToCSV('excel')}
            className="flex items-center justify-center space-x-1.5 px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-900 shadow-[0_4px_15px_rgba(16,185,129,0.25)] rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 text-white"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>EXPORT CSV (EXCEL)</span>
          </button>

          {/* PDF Trigger Print */}
          <button
            onClick={exportPDF}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <FileText className="h-4 w-4 text-indigo-400" />
            <span>พิมพ์สรุป / PDF</span>
          </button>
        </div>
      </div>

      {/* Print-only Header section */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">สรุปรายงานบัญชีครอบครัวแสนสุข ประจําปี 2026</h1>
        <p className="text-sm text-slate-500 mt-1">ประเภทรายงาน: {reportType === 'daily' ? 'รายวัน' : reportType === 'weekly' ? 'รายสัปดาห์' : reportType === 'monthly' ? 'รายเดือน' : 'รายปี'}</p>
        <p className="text-xs text-slate-400 mt-0.5">พิมพ์ข้อมูลเมื่อ: {new Date().toLocaleString('th-TH')}</p>
      </div>

      {/* Structured grid showing Incomes and Expenses ledger results separately */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
        {/* Ledger Incomes */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm print:shadow-none print:border-none">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>รายการรายรับทั้งหมด ({currentFilteredIncomes.length})</span>
            </h3>
            <span className="text-xs font-extrabold text-emerald-600">฿{totalIncomesSum.toLocaleString()}</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {currentFilteredIncomes.length > 0 ? (
              currentFilteredIncomes.map(inc => {
                const catName = incomeCategories.find(c => c.id === inc.categoryId)?.name || 'รายได้อื่น ๆ';
                return (
                  <div key={inc.id} className="p-3 bg-slate-50/50 hover:bg-slate-100/50 rounded-xl border border-slate-100/30 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{inc.description}</p>
                      <div className="flex items-center space-x-2 mt-0.5 text-[9px] text-slate-400">
                        <span>{inc.date}</span>
                        <span>•</span>
                        <span>{catName}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 shrink-0">฿{inc.amount.toLocaleString()}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">ไม่มีรายการรายรับในช่วงนี้</p>
            )}
          </div>
        </div>

        {/* Ledger Expenses */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm print:shadow-none print:border-none">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              <span>รายการรายจ่ายทั้งหมด ({currentFilteredExpenses.length})</span>
            </h3>
            <span className="text-xs font-extrabold text-rose-600">฿{totalExpensesSum.toLocaleString()}</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {currentFilteredExpenses.length > 0 ? (
              currentFilteredExpenses.map(exp => {
                const catName = expenseCategories.find(c => c.id === exp.categoryId)?.name || 'อื่น ๆ';
                const memberName = members.find(m => m.id === exp.personalMemberId)?.name;
                return (
                  <div key={exp.id} className="p-3 bg-slate-50/50 hover:bg-slate-100/50 rounded-xl border border-slate-100/30 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{exp.description}</p>
                      <div className="flex items-center space-x-2 mt-0.5 text-[9px] text-slate-400">
                        <span>{exp.date}</span>
                        <span>•</span>
                        <span>{catName}</span>
                        {memberName && (
                          <span className="bg-indigo-50 text-indigo-500 px-1 py-0.2 rounded-md font-medium">@{memberName}</span>
                        )}
                      </div>
                    </div>
                    <span className="font-extrabold text-rose-600 shrink-0">฿{exp.amount.toLocaleString()}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-xs text-slate-400">ไม่มีรายการรายจ่ายในช่วงนี้</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
