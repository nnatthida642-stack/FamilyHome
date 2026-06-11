/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { localDb } from '../db/localDb';
import { Notification } from '../types';
import { Bell, X, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    setNotifications(localDb.getNotifications());
  };

  const handleMarkRead = (id: string) => {
    const updated = localDb.markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('คุณต้องการเคลียร์และลบประวัติการแจ้งเตือนทั้งหมดใช่หรือไม่?')) {
      const updated = localDb.clearAllNotifications();
      setNotifications(updated);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl relative animate-fade">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-emerald-500" />
            <span className="font-bold text-slate-800 text-sm">การแจ้งเตือนระบบคุณ</span>
          </div>
          <button onClick={onClose} className="p-1 px-2.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">
            ปิด
          </button>
        </div>

        {/* List of triggers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all text-xs cursor-pointer ${
                  notif.read ? 'bg-slate-50/50 border-slate-100 opacity-75' : 'bg-slate-50 border-emerald-100 ring-1 ring-emerald-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    {notif.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-rose-500" /> :
                     notif.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                     <Info className="h-4 w-4 text-blue-500" />}
                    <span>{notif.title}</span>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-slate-600 mb-2 leading-relaxed">{notif.message}</p>
                <span className="text-[9px] text-slate-400 block text-right">{notif.date}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center text-xs h-full">
              <Bell className="h-10 w-10 text-slate-200 mb-2" />
              <p>ไม่มีการแจ้งเตือนข้อความเตือนในงบใดๆ เลยค่ะ</p>
            </div>
          )}
        </div>

        {/* Clear control footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 text-xs text-rose-500 hover:underline font-bold"
            >
              <Trash2 className="h-4 w-4" />
              <span>ล้างกล่องการแจ้งทั้งหมด</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
