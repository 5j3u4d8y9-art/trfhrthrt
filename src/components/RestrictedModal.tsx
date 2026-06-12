/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Lock, LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { Route } from "../types";

interface RestrictedModalProps {
  requestedRoute: Route;
  onClose: () => void;
  onNavigate: (route: Route) => void;
}

export const RestrictedModal: React.FC<RestrictedModalProps> = ({
  requestedRoute,
  onClose,
  onNavigate,
}) => {
  const getRouteLabel = (r: Route) => {
    switch (r) {
      case "my-characters":
        return "特工卡牌製造坊";
      case "guilds":
        return "公會聯盟競技場";
      case "profile":
        return "特工專屬核心檔案";
      case "settings":
        return "系統管理設定面板";
      default:
        return "安全受限入口系統";
    }
  };

  return (
    <div id="restricted-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050506]/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-cyber-black glass p-6 sm:p-8 shadow-2xl animate-fade-in text-center space-y-6 backdrop-blur-md">
        
         {/* Abstract warning glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md">
          <ShieldAlert className="h-7 w-7 animate-pulse" />
        </div>

        <div className="space-y-1.5 font-display">
          <h3 className="font-display text-lg font-black text-[#fafafa] uppercase tracking-tight">需要安全憑證等級 1 (Security Level 1 Required)</h3>
          <p className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-widest text-glow-amber">
            存取已遭阻斷： {getRouteLabel(requestedRoute)}
          </p>
          <p className="font-sans text-xs text-slate-400 leading-relaxed px-2">
            該資料串流目前已被安全協定加密隔離。請登入驗證您的核心憑證，或註冊您的新節點金鑰以取得存取權限。
          </p>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-2 gap-3 pt-2 font-display">
          <button
            onClick={() => {
              onClose();
              onNavigate("login");
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-cyber-black/40 hover:border-neon-cyan/40 text-slate-200 hover:text-white px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogIn className="h-4 w-4 text-neon-cyan" />
            <span>進行登入</span>
          </button>
          
          <button
            onClick={() => {
              onClose();
              onNavigate("register");
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-cyber-black px-4 py-2.5 text-xs font-bold shadow-md shadow-neon-cyan/20 hover:opacity-90 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>註冊節點</span>
          </button>
        </div>

        {/* Cancel option */}
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-slate-500 hover:text-neon-cyan transition-colors pt-2 cursor-pointer"
        >
          [終止導航程序 - Abort]
        </button>

      </div>
    </div>
  );
};
