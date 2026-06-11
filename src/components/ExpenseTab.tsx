/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  SlidersHorizontal, 
  Upload, 
  X, 
  AlertTriangle, 
  TrendingDown, 
  User, 
  Check, 
  Package, 
  Tag, 
  Smile,
  Sparkles,
  Info
} from 'lucide-react';
import { localDb } from '../db/localDb';
import { Expense, ExpenseCategory, FamilyMember } from '../types';

export default function ExpenseTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  // Advanced searching/filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formSlipImage, setFormSlipImage] = useState('');
  const [formPersonalMember, setFormPersonalMember] = useState('');
  
  // Custom Household goods states
  const [householdGoodsList, setHouseholdGoodsList] = useState<string[]>([]);
  const [selectedHouseholdItems, setSelectedHouseholdItems] = useState<string[]>([]);
  const [newCustomGoodInput, setNewCustomGoodInput] = useState('');

  // UI control states
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExpenses(localDb.getExpenses());
    setCategories(localDb.getExpenseCategories());
    setMembers(localDb.getMembers());
    setHouseholdGoodsList(localDb.getHouseholdGoods());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleOpenAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    
    // Default to the first category
    const defaultCat = categories[0]?.id || 'exp_room';
    setFormCategory(defaultCat);
    setFormDescription('');
    setFormAmount('');
    setFormNote('');
    setFormSlipImage('');
    setFormPersonalMember('');
    setSelectedHouseholdItems([]);
    setNewCustomGoodInput('');
  };

  const handleOpenEdit = (expense: Expense) => {
    setIsEditing(true);
    setEditingId(expense.id);
    setFormDate(expense.date);
    setFormCategory(expense.categoryId);
    setFormDescription(expense.description);
    setFormAmount(expense.amount.toString());
    setFormNote(expense.note || '');
    setFormSlipImage(expense.slipImage || '');
    setFormPersonalMember(expense.personalMemberId || '');
    setSelectedHouseholdItems(expense.householdItems || []);
    setNewCustomGoodInput('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || !formAmount || parseFloat(formAmount) <= 0) {
      alert('กรุณากรอกข้อมูลคำอธิบายและระบุจำนวนเงินที่ถูกต้องค่ะ');
      return;
    }

    const categoryObj = categories.find(c => c.id === formCategory);
    if (categoryObj?.isPersonal && !formPersonalMember) {
      alert('หมวดค่าใช้จ่ายส่วนบุคคลนี้จำเป็นต้องเลือกสมาชิกผู้รับผิดชอบค่ะ');
      return;
    }

    const newExpense: Expense = {
      id: editingId || 'exp_' + Math.random().toString(36).substr(2, 9),
      date: formDate,
      categoryId: formCategory,
      description: formDescription,
      amount: parseFloat(formAmount),
      note: formNote || undefined,
      slipImage: formSlipImage || undefined,
      personalMemberId: categoryObj?.isPersonal ? formPersonalMember : undefined,
      householdItems: formCategory === 'exp_household' ? selectedHouseholdItems : undefined
    };

    localDb.saveExpense(newExpense);
    setIsEditing(false);
    loadData();
    showToast(editingId ? 'แก้ไขรายการความเคลื่อนไหวเสร็จสิ้น!' : 'บันทึกรายจ่ายครัวเรือนแล้ว!');
  };

  const handleDelete = (id: string) => {
    localDb.deleteExpense(id);
    setShowDeleteConfirmId(null);
    loadData();
    showToast('ลบรายการใช้จ่ายเรียบร้อยแล้วค่ะ');
  };

  const handleCustomCategoryInput = () => {
    if (newCustomGoodInput && !householdGoodsList.includes(newCustomGoodInput)) {
      const updated = localDb.addHouseholdGood(newCustomGoodInput);
      setHouseholdGoodsList(updated);
      setSelectedHouseholdItems(prev => [...prev, newCustomGoodInput]);
      setNewCustomGoodInput('');
      showToast('เพิ่มสินค้าประเภทร้านใหม่สำเร็จ!');
    }
  };

  const toggleHouseholdItem = (item: string) => {
    if (selectedHouseholdItems.includes(item)) {
      setSelectedHouseholdItems(prev => prev.filter(i => i !== item));
    } else {
      setSelectedHouseholdItems(prev => [...prev, item]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImagePicker = () => {
    fileInputRef.current?.click();
  };

  // Multiple criteria filter
  const filteredExpenses = expenses.filter(exp => {
    const matchQuery = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (exp.note && exp.note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchCat = selectedCatFilter ? exp.categoryId === selectedCatFilter : true;
    const matchMember = selectedMemberFilter ? exp.personalMemberId === selectedMemberFilter : true;
    
    const amountVal = exp.amount;
    const matchMin = minAmount ? amountVal >= parseFloat(minAmount) : true;
    const matchMax = maxAmount ? amountVal <= parseFloat(maxAmount) : true;
    
    const matchStart = startDate ? exp.date >= startDate : true;
    const matchEnd = endDate ? exp.date <= endDate : true;

    return matchQuery && matchCat && matchMember && matchMin && matchMax && matchStart && matchEnd;
  });

  const selectedCategoryObj = categories.find(c => c.id === formCategory);

  return (
    <div className="space-y-4 font-sans pb-10">
      {/* Dynamic Native Alert/Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-full px-5 py-2 whitespace-nowrap shadow-xl border border-slate-700 font-bold text-xs animate-bounce flex items-center space-x-1.5">
          <Smile className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">รายจ่ายทั้งหมด</h2>
          <p className="text-xs text-slate-400">ค่าสาธารณูปโภค ค่ารถโรงเรียน และค่าขนมส่วนตัว</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มรายจ่าย</span>
        </button>
      </div>

      {/* Main Container Form or ledger list view */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-bold text-sm text-slate-800">
              {editingId ? 'แก้ไขข้อมูลรายจ่าย' : 'เขียนใบรายการใช้จ่ายใหม่'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            {/* Field: Date */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">วันที่ทำรายการ</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full p-2 border border-slate-100 rounded-xl focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* Field: Category */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">หมวดค่าใช้จ่าย</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full p-2 border border-slate-100 rounded-xl focus:border-rose-300 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.isPersonal ? '(ค่าใช้จ่ายส่วนตัว)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* If Selected category is Household goods: show multiselection checklist of items */}
            {formCategory === 'exp_household' && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center space-x-1">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span>เลือกของใช้ภายในบ้านที่ซื้อ *</span>
                  </span>
                  <span className="text-[9px] text-slate-400">เลือกตอบได้หลายรายการ</span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border">
                  {householdGoodsList.map(item => {
                    const isSelected = selectedHouseholdItems.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleHouseholdItem(item)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center space-x-1 ${
                          isSelected 
                            ? 'bg-emerald-500 text-slate-900 font-bold' 
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom household items */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="เพิ่มสิ่งของใช้อื่นที่ซื้อ..."
                    value={newCustomGoodInput}
                    onChange={e => setNewCustomGoodInput(e.target.value)}
                    className="flex-1 p-1.5 border bg-white rounded-xl text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleCustomCategoryInput}
                    className="p-1 px-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] shrink-0"
                  >
                    เพิ่มที่นี่
                  </button>
                </div>
              </div>
            )}

            {/* If Selected Category is Personal: require selection of Family Member */}
            {selectedCategoryObj?.isPersonal && (
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col space-y-2">
                <label className="font-bold text-slate-700 flex items-center space-x-1">
                  <User className="h-4 w-4 text-amber-500" />
                  <span>ผู้รับผิดชอบ / สมาชิกที่ได้รับเงินค่าขนมประจำหมวดหมู่นี้ *</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {members.map(member => {
                    const isSelected = formPersonalMember === member.id;
                    return (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => setFormPersonalMember(member.id)}
                        className={`p-2 rounded-xl text-[10px] font-bold text-center border transition-all ${
                          isSelected 
                            ? 'bg-slate-900 border-slate-900 text-white scale-102' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Field: Description */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">คำอธิบายรายละเอียด</label>
              <input
                type="text"
                required
                placeholder="เช่น ค่าน้ำนมอภิสิทธิ์, บะหมี่กึ่งสำเร็จรูปและสบู่บิ๊กซี"
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-100 rounded-xl focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* Field: Amount */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="เช่น 1200"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                className="w-full p-2.5 border border-slate-100 rounded-xl font-bold text-slate-800 text-sm focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* Field: Note */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">หมายเหตุเพิ่มเติม</label>
              <textarea
                placeholder="เขียนข้อสังเกตเพื่อส่งวิเคราะห์ให้ Gemini AI ประมวลผลดีขึ้น"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                rows={2}
                className="w-full p-2.5 border border-slate-100 rounded-xl focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* Field: Upload slip */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">แนบรูปใบเสร็จ / บิลค่าน้ำไฟ</label>
              <div className="mt-1 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={triggerImagePicker}
                  className="flex items-center space-x-1 border border-dashed border-slate-200 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl active:scale-95 transition-transform"
                >
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] text-slate-500">อัปโหลดสลิปบิล (.png, .jpg)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {formSlipImage && (
                  <div className="relative">
                    <img
                      src={formSlipImage}
                      alt="Slip preview"
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 object-cover rounded-xl border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormSlipImage('')}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              บันทึกรายการรายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 border border-slate-100 hover:bg-slate-50 rounded-xl font-medium text-slate-500 text-xs"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Filtering Drawer Bar panel */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหารายการ, หรือโน้ตใช้สอย..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-100 bg-slate-50 rounded-2xl focus:outline-none focus:border-rose-300"
                />
              </div>
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`p-2.5 border ${showFilterDrawer ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-100 bg-white text-slate-400'} rounded-2xl active:scale-95 transition-all`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Advanced Filters panel */}
            {showFilterDrawer && (
              <div className="border-t border-slate-55 pt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                <div>
                  <label className="block font-medium mb-1">กรองสิทธิสมาชิก</label>
                  <select
                    value={selectedMemberFilter}
                    onChange={e => setSelectedMemberFilter(e.target.value)}
                    className="w-full p-2 border border-slate-100 bg-slate-50 rounded-xl"
                  >
                    <option value="">สมาชิกทุกคน</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">กรองรายจุกหมวดหมู่</label>
                  <select
                    value={selectedCatFilter}
                    onChange={e => setSelectedCatFilter(e.target.value)}
                    className="w-full p-2 border border-slate-100 bg-slate-50 rounded-xl"
                  >
                    <option value="">ทุกหมวดหมู่การใช้</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">ตั้งแต่วันที่</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">ถึงวันที่</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">เงินเริ่มขั้นต่ำ (฿)</label>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minAmount}
                    onChange={e => setMinAmount(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">เงินสูงสุด (฿)</label>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxAmount}
                    onChange={e => setMaxAmount(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>

                <div className="col-span-2 pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCatFilter('');
                      setSelectedMemberFilter('');
                      setStartDate('');
                      setEndDate('');
                      setMinAmount('');
                      setMaxAmount('');
                      setSearchQuery('');
                    }}
                    className="text-rose-500 font-medium hover:underline"
                  >
                    รีเซ็ตคำคัดค้นหา
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Render Ledger lists */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">บันทึกยอดกระแสเงินออก</h4>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(exp => {
                const catObj = categories.find(c => c.id === exp.categoryId);
                const assignedMemberName = members.find(m => m.id === exp.personalMemberId)?.name;
                return (
                  <div
                    key={exp.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-rose-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">{exp.description}</span>
                          {exp.slipImage && (
                            <span className="text-[8px] bg-indigo-50 text-indigo-500 px-1 py-0.2 rounded font-semibold font-mono shrink-0">
                              BILL 📎
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 items-center mt-1">
                          <span className="text-[9px] text-slate-400">{exp.date}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-rose-600 font-medium bg-rose-50/50 px-1.5 py-0.25 rounded text-[9px]">
                            {catObj?.name || 'รายจ่าย'}
                          </span>
                          
                          {/* If Assignee is defined, display tag */}
                          {assignedMemberName && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-blue-600 font-medium bg-blue-50/50 px-1.5 py-0.25 rounded text-[9px] flex items-center space-x-0.5">
                                <User className="h-2 w-2" />
                                <span>ผู้รับผิดชอบ: {assignedMemberName}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* If Household goods list defined, render mini badges */}
                        {exp.householdItems && exp.householdItems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 text-[8px] text-slate-500 font-mono">
                            {exp.householdItems.map((g, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded-md">
                                #{g}
                              </span>
                            ))}
                          </div>
                        )}
                        {exp.note && (
                          <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">โน้ต: {exp.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4 shrink-0">
                      <span className="text-sm font-extrabold text-rose-600 tabular-nums">
                        -฿{exp.amount.toLocaleString()}
                      </span>
                      <div className="flex space-x-0.5">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg animate-fade"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirmId(exp.id)}
                          className="p-1 hover:bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Popconfirm model */}
                    {showDeleteConfirmId === exp.id && (
                      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white p-5 rounded-3xl w-full max-w-xs border text-center space-y-3">
                          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                          <h4 className="font-bold text-sm text-slate-800">กรุณายืนยันการลบ</h4>
                          <p className="text-[11px] text-slate-500">คุณต้องการลบข้อมูลรายจ่าย "{exp.description}" ยอด {exp.amount} บาท ใช่หรือไม่? ข้อมูลนี้จะหายไปจากระบบรายงานทันที</p>
                          <div className="flex space-x-2 pt-1.5">
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold"
                            >
                              ใช่ ลบรายชื่อนี้
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmId(null)}
                              className="flex-1 py-1.5 border border-slate-100 text-slate-500 rounded-xl text-xs font-semibold"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-100">
                <p className="text-xs">ไม่พบความเคลื่อนไหวใดๆ ที่ตรงเงื่อนไขของท่าน</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[11px] font-bold"
                >
                  เบิกรายการแรกเลย
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
