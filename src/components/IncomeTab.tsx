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
  Calendar, 
  Filter, 
  Check, 
  X, 
  AlertTriangle,
  Upload, 
  FileText, 
  TrendingUp,
  Tags,
  SlidersHorizontal,
  FolderMinus
} from 'lucide-react';
import { localDb } from '../db/localDb';
import { Income, IncomeCategory } from '../types';

export default function IncomeTab() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  
  // States of lists & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Form modal/editor trigger states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCustomDetail, setFormCustomDetail] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formSlipImage, setFormSlipImage] = useState<string>('');
  
  // UI helpers
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'filtered'>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIncomes(localDb.getIncomes());
    setCategories(localDb.getIncomeCategories());
  };

  const handleOpenAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory(categories[0]?.id || 'inc_salary');
    setFormCustomDetail('');
    setFormDescription('');
    setFormAmount('');
    setFormNote('');
    setFormSlipImage('');
  };

  const handleOpenEdit = (income: Income) => {
    setIsEditing(true);
    setEditingId(income.id);
    setFormDate(income.date);
    setFormCategory(income.categoryId);
    setFormCustomDetail(income.customCategoryDetail || '');
    setFormDescription(income.description);
    setFormAmount(income.amount.toString());
    setFormNote(income.note || '');
    setFormSlipImage(income.slipImage || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || !formAmount || parseFloat(formAmount) <= 0) {
      alert('กรุณากรอกข้อมูลคำอธิบายและระบุจำนวนเงินที่ถูกต้องค่ะ');
      return;
    }

    const newIncome: Income = {
      id: editingId || 'inc_' + Math.random().toString(36).substr(2, 9),
      date: formDate,
      categoryId: formCategory,
      customCategoryDetail: formCategory === 'inc_other' ? formCustomDetail : undefined,
      description: formDescription,
      amount: parseFloat(formAmount),
      note: formNote || undefined,
      slipImage: formSlipImage || undefined
    };

    localDb.saveIncome(newIncome);
    setIsEditing(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    localDb.deleteIncome(id);
    setShowDeleteConfirmId(null);
    loadData();
  };

  // Simulated local image attachment helper
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

  // Trigger file browser of device
  const triggerImagePicker = () => {
    fileInputRef.current?.click();
  };

  // Perform search & filters combining logic
  const filteredIncomes = incomes.filter(inc => {
    const matchQuery = inc.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (inc.note && inc.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (inc.customCategoryDetail && inc.customCategoryDetail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchCat = selectedCatFilter ? inc.categoryId === selectedCatFilter : true;
    
    const amountVal = inc.amount;
    const matchMin = minAmount ? amountVal >= parseFloat(minAmount) : true;
    const matchMax = maxAmount ? amountVal <= parseFloat(maxAmount) : true;
    
    const matchStart = startDate ? inc.date >= startDate : true;
    const matchEnd = endDate ? inc.date <= endDate : true;

    return matchQuery && matchCat && matchMin && matchMax && matchStart && matchEnd;
  });

  const categoryOptions = categories;

  return (
    <div className="space-y-4 font-sans pb-10">
      {/* Header card info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">รายรับรวมครอบครัว</h2>
          <p className="text-xs text-slate-400">บันทึกเงินเดือน ฟรีแลนซ์ และค่าไรเดอร์สะสม</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มรายรับ</span>
        </button>
      </div>

      {/* Main ledger list container or direct Form editor */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <h3 className="font-bold text-sm text-slate-800">
              {editingId ? 'แก้ไขข้อมูลรายรับ' : 'เขียนใบรายการรายรับใหม่'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            {/* Field: Date */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">วันที่ทำรายการ</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full p-2 border border-slate-100 rounded-xl focus:border-emerald-300 focus:outline-none"
              />
            </div>

            {/* Field: Category */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">หมวดรายรับ</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full p-2 border border-slate-100 rounded-xl focus:border-emerald-300 focus:outline-none"
              >
                {categoryOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* If Category is Other: show addition detail */}
            {formCategory === 'inc_other' && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <label className="block font-bold text-slate-600">รายละเอียดหมวดหมู่เพิ่มเติม *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น มรดก, ถูกรางวัลสลากกินแบ่ง"
                  value={formCustomDetail}
                  onChange={e => setFormCustomDetail(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-300"
                />
              </div>
            )}

            {/* Field: Description */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">คำอธิบาย</label>
              <input
                type="text"
                required
                placeholder="เช่น เงินเดือนคุณพ่อ, ค่าวิ่งรอบอาหารเย็นบีทีเอสพญาไท"
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-100 rounded-xl focus:border-emerald-300 focus:outline-none"
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
                placeholder="เช่น 28500"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                className="w-full p-2.5 border border-slate-100 rounded-xl font-bold text-slate-800 text-sm focus:border-emerald-300 focus:outline-none"
              />
            </div>

            {/* Field: Note */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">หมายเหตุ</label>
              <textarea
                placeholder="เช่น บันทึกเพิ่มเติมเก็บไว้ตรวจสอบสิ้นปี"
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                rows={2}
                className="w-full p-2.5 border border-slate-100 rounded-xl focus:border-emerald-300 focus:outline-none"
              />
            </div>

            {/* Field: Attached slip */}
            <div>
              <label className="block font-medium mb-1 text-slate-500">ภาพสลิป / ใบโอนเงิน</label>
              <div className="mt-1 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={triggerImagePicker}
                  className="flex items-center space-x-1 border border-dashed border-slate-200 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl active:scale-95 transition-transform"
                >
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] text-slate-500">อัปโหลดสลิป (.png, .jpg)</span>
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
                      alt="Receipt preview"
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
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all"
            >
              บันทึกรายการ
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
          {/* Filters Bar panel */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อรายการ, คำประสงค์..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-100/80 bg-slate-50/50 rounded-2xl focus:outline-none focus:border-emerald-300"
                />
              </div>
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`p-2.5 border ${showFilterDrawer ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-slate-400'} rounded-2xl active:scale-95 transition-all`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Advanced Filters drawer expansion */}
            {showFilterDrawer && (
              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                <div className="col-span-2">
                  <label className="block font-medium mb-1">คัดกรองหมวดหมู่</label>
                  <select
                    value={selectedCatFilter}
                    onChange={e => setSelectedCatFilter(e.target.value)}
                    className="w-full p-2 border border-slate-100 bg-slate-50 rounded-xl"
                  >
                    <option value="">ทั้งหมด ทุกช่องทาง</option>
                    {categoryOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">จำนวนเงินขั้นต่ำ (฿)</label>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minAmount}
                    onChange={e => setMinAmount(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">จำนวนเงินสูงสุด (฿)</label>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxAmount}
                    onChange={e => setMaxAmount(e.target.value)}
                    className="w-full p-1.5 border border-slate-100 bg-slate-50 rounded-xl"
                  />
                </div>

                <div className="col-span-2 pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCatFilter('');
                      setStartDate('');
                      setEndDate('');
                      setMinAmount('');
                      setMaxAmount('');
                      setSearchQuery('');
                    }}
                    className="text-rose-500 font-medium hover:underline"
                  >
                    ล้างการคัดกรองทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ledger count list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">ประวัติบันทึกเงินสด</h4>
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map(inc => {
                const catName = categories.find(c => c.id === inc.categoryId)?.name || 'รายได้อื่น ๆ';
                return (
                  <div
                    key={inc.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-slate-800 truncate">{inc.description}</span>
                          {inc.slipImage && (
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono">
                              SLIP 📎
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400">
                          <span>{inc.date}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium bg-emerald-50/50 px-1.5 py-0.5 rounded-md">
                            {catName} {inc.customCategoryDetail ? `(${inc.customCategoryDetail})` : ''}
                          </span>
                        </div>
                        {inc.note && (
                          <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">โน้ต: {inc.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-4">
                      <span className="text-sm font-extrabold text-emerald-600 tabular-nums">
                        +฿{inc.amount.toLocaleString()}
                      </span>
                      <div className="flex space-x-0.5">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirmId(inc.id)}
                          className="p-1 hover:bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Custom confirmation popup per record */}
                    {showDeleteConfirmId === inc.id && (
                      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white p-5 rounded-3xl w-full max-w-xs border text-center space-y-3">
                          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                          <h4 className="font-bold text-sm text-slate-800">กรุณายืนยันการลบ</h4>
                          <p className="text-[11px] text-slate-500">คุณต้องการลบข้อมูลรายรับ "{inc.description}" ยอด {inc.amount} บาท ใช่หรือไม่? ข้อมูลนี้เมื่อลบแล้วจะไม่สามารถกู้คืนได้</p>
                          <div className="flex space-x-2 pt-1.5">
                            <button
                              onClick={() => handleDelete(inc.id)}
                              className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold"
                            >
                              ใช่ ลบเลย
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
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-100 flex flex-col items-center justify-center">
                <FolderMinus className="h-10 w-10 text-slate-200 mb-2" />
                <p className="text-xs">ไม่พบรายการเงินสดตามรายการคัดเลือกของคุณ</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[11px] font-bold"
                >
                  เริ่มเพิ่มรายรับรายการแรก
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
