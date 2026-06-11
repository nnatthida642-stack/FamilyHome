/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, AlertCircle, Lightbulb, CheckCircle2, RefreshCw, MessageSquare } from 'lucide-react';

interface AIInsightCardProps {
  insights: {
    insights: string[];
    recommendations: string[];
    warning: string | null;
    scoreCommentary: string;
  } | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenChat: () => void;
}

export default function AIInsightCard({ insights, loading, onRefresh, onOpenChat }: AIInsightCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between min-h-[220px] transition-all hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)] group">
      {/* Decorative AI Aurora Blurs */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              ที่โกนหนวดและกาวกระดาษ: AI ช่วยคิดวิธีประหยัดเงิน
            </h3>
            <span className="text-[9px] text-slate-400 font-bold block -mt-0.5 tracking-wider uppercase">Gemini Generative Intelligence</span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all active:scale-90 disabled:opacity-50"
          title="คำนวณแผนการเงินใหม่"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Card Content State Handler */}
      {loading ? (
        <div className="space-y-3 py-4 flex-1 flex flex-col justify-center">
          <div className="h-3.5 bg-slate-800 rounded-full animate-pulse w-11/12" />
          <div className="h-3.5 bg-slate-800 rounded-full animate-pulse w-5/6" />
          <div className="h-3.5 bg-slate-800 rounded-full animate-pulse w-3/4" />
        </div>
      ) : insights ? (
        <div className="space-y-4 z-10 flex-grow">
          {/* Active Warnings Block */}
          {insights.warning && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl text-red-200 text-xs flex items-start space-x-2 shadow-[inset_0_1px_5px_rgba(239,68,68,0.1)]">
              <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
              <span className="font-medium">{insights.warning}</span>
            </div>
          )}

          <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1 select-none">
            {/* Encouragement message */}
            <p className="text-xs text-slate-300 font-bold leading-relaxed">{insights.scoreCommentary}</p>
            
            <div className="h-px bg-slate-800/80 my-2" />

            {/* AI Insights list */}
            <div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">บทสรุปวิเคราะห์ดุลบัญชี</p>
              <div className="space-y-2">
                {insights.insights.map((ins, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-200 bg-slate-850/50 p-2 rounded-xl border border-slate-800/40">
                    <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Savings recommendations */}
            <div>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2">แนวแนะนำเพื่อความก้าวหน้าและการออม</p>
              <div className="space-y-2">
                {insights.recommendations.map((rec, r) => (
                  <div key={r} className="flex items-start space-x-2 text-xs text-slate-200 bg-slate-850/30 p-2 rounded-xl border border-slate-850/60">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-xs z-10">
          ไม่สามารถดึงข้อมูลวิเคราะห์ทางการเงินแบบเรียลไทม์ได้ในขณะนี้
          <button 
            onClick={onRefresh}
            className="mt-3 block mx-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 rounded-2xl font-black text-xs active:scale-95"
          >
            วิเคราะห์คำนวณสุขภาพการเงินใหม่
          </button>
        </div>
      )}

      {/* Interactive Footer Navigation */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between z-10">
        <span className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>โมเดลภาษาขนาดใหญ่ช่วยประเมินผล</span>
        </span>
        <button 
          onClick={onOpenChat}
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl transition-all cursor-pointer"
        >
          <MessageSquare className="h-3 w-3" />
          <span>คุยกับโค้ชอัจฉริยะ 💬</span>
        </button>
      </div>
    </div>
  );
}
