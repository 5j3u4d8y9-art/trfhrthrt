/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FileText, BadgeCheck, Mail, Calendar, Sparkles, Save, ShieldCheck } from "lucide-react";
import { User } from "../types";

interface ProfilePageProps {
  currentUser: User;
  onUpdateBio: (newBio: string) => void;
  ownedCardsCount: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  currentUser, 
  onUpdateBio,
  ownedCardsCount,
}) => {
  const [bioInput, setBioInput] = useState(currentUser.bio || "在霓虹樞紐遊戲社群網路中活躍的特工。");
  const [success, setSuccess] = useState(false);

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBio(bioInput);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-display">
      
      {/* Block title */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-neon-cyan text-glow-cyan" />
          <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">特工核心檔案 (Agent Profile Core)</h2>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-400">查看網路身份矩陣並配置您的個人化核心特徵參數。</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left pane profile specs (co-span 4) */}
        <div className="md:col-span-4 rounded-2xl border border-white/10 bg-cyber-black glass p-6 flex flex-col items-center text-center backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none" />
          <div className="relative">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.username}
              className="h-24 w-24 rounded-2xl object-cover border-2 border-neon-cyan shadow-lg shadow-neon-cyan/25"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-cyber-black" />
          </div>

          <h3 className="mt-4 font-display text-lg font-black text-white">{currentUser.username}</h3>
          <p className="font-mono text-xs text-neon-cyan font-bold tracking-tight text-glow-cyan">Lv.24 守護者節點</p>

          <div className="w-full h-px bg-white/5 my-5" />

          {/* Micro spec sheets */}
          <div className="w-full space-y-3.5 text-left text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>註冊時間：{currentUser.joinedAt}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="h-4 w-4 text-slate-500" />
              <span>安全憑證：等級 3</span>
            </div>
          </div>
        </div>

        {/* Right pane settings & profile edits (co-span 8) */}
        <div className="md:col-span-8 rounded-2xl border border-white/10 bg-cyber-black/40 glass p-6 space-y-6 backdrop-blur-md">
          <h4 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider">個人數據矩陣 (Personal Data Matrix)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-cyber-black/50 p-4 border border-white/5">
              <p className="font-mono text-[10px] text-slate-500 uppercase">已鑄造的角色卡牌</p>
              <p className="mt-1 font-display text-2xl font-black text-slate-200">{ownedCardsCount}</p>
            </div>

            <div className="rounded-xl bg-cyber-black/50 p-4 border border-white/5">
              <p className="font-mono text-[10px] text-slate-500 uppercase">平台授權憑證</p>
              <p className="mt-1 font-display text-2xl font-black text-neon-cyan text-glow-cyan">已授權 (AUTHORIZED)</p>
            </div>
          </div>

          <form id="profile-bio-form" onSubmit={handleSaveBio} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">
                個人專屬特工宣言 (Personal Bio)
              </label>
              <textarea
                id="profile-bio-textarea"
                rows={4}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#050506]/30 p-3.5 font-display text-sm text-white placeholder-slate-600 outline-none focus-neon-border focus:bg-cyber-black/80 transition-colors"
                placeholder="在此輸入您的遊戲技術特長、目標派系或特工檔案宣言..."
              />
            </div>

            {success && (
              <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-3 text-xs text-emerald-450 font-mono flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>核心運行參數更新成功。</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                id="save-profile-bio-btn"
                type="submit"
                className="flex items-center gap-1.5 rounded-xl btn-primary font-display text-xs font-black px-4 py-2.5 shadow-md shadow-neon-cyan/15 cursor-pointer active:scale-95"
              >
                <Save className="h-3.5 w-3.5" />
                <span>儲存檔案核心</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};
