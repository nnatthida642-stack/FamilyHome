/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings, 
  Bell 
} from 'lucide-react';
import { localDb } from '../db/localDb';
import { useState, useEffect } from 'react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'income' | 'expense' | 'reports' | 'settings';
  onTabChange: (tab: 'dashboard' | 'income' | 'expense' | 'reports' | 'settings') => void;
  onOpenNotifications: () => void;
}

export default function BottomNavigation({ activeTab, onTabChange, onOpenNotifications }: BottomNavigationProps) {
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    // Check unread notifications periodically from local state
    const interval = setInterval(() => {
      const allNotifs = localDb.getNotifications();
      const unread = allNotifs.filter(n => !n.read).length;
      setUnreadNotifCount(unread);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard, color: 'from-amber-400 to-orange-500 shadow-amber-300/35 text-amber-500' },
    { id: 'income', label: 'รายรับ', icon: TrendingUp, color: 'from-emerald-400 to-teal-500 shadow-emerald-300/35 text-emerald-500' },
    { id: 'expense', label: 'รายจ่าย', icon: TrendingDown, color: 'from-rose-400 to-red-500 shadow-rose-300/35 text-rose-500' },
    { id: 'reports', label: 'รายงาน', icon: BarChart3, color: 'from-indigo-400 to-blue-500 shadow-indigo-300/35 text-indigo-500' },
    { id: 'settings', label: 'ตั้งค่า', icon: Settings, color: 'from-slate-600 to-slate-800 shadow-slate-500/25 text-slate-500' }
  ] as const;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-40 bg-white/90 backdrop-blur-xl border border-slate-100 shadow-[0_15px_35px_-5px_rgba(15,23,42,0.18)] px-2.5 py-2 rounded-3xl flex items-center justify-between h-16.5 print:hidden transition-transform">
      {navItems.map(item => {
        const active = activeTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-black tracking-tight relative transition-all duration-300 select-none cursor-pointer ${
              active 
                ? 'text-slate-900 scale-102 -translate-y-1' 
                : 'text-slate-400 hover:text-slate-500 active:scale-95'
            }`}
          >
            {/* Active 3D Glowing Capsule Layer */}
            {active && (
              <span className={`absolute inset-x-1.5 inset-y-0.5 bg-gradient-to-br ${item.color.split(' shadow-')[0]} opacity-10 rounded-2xl border-t border-white/60 shadow-[0_8px_20px_-3px_rgba(0,0,0,0.06)]`} />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Icon Container with 3D shadow depth */}
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                active 
                  ? `bg-slate-900 text-white shadow-[0_8px_16px_rgba(15,23,42,0.25)] scale-110` 
                  : 'bg-transparent text-slate-400'
              }`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              
              {/* Optional dynamic count helper badge for settings/notifications */}
              {item.id === 'settings' && unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[8px] h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </div>
            
            <span className={`mt-0.5 z-10 transition-colors text-[9px] ${active ? 'font-black text-slate-800' : 'text-slate-400 font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
