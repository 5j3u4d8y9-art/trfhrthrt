/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Home, 
  Compass, 
  Sword, 
  ShieldCheck, 
  User, 
  Settings, 
  Lock, 
  X, 
  Gamepad2, 
  Sparkles,
  Info
} from "lucide-react";
import { Route, User as UserType } from "../types";

interface SidebarProps {
  currentUser: UserType | null;
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  onRestrictedClick: (route: Route) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarItem {
  key: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  restricted: boolean;
  category: "常規" | "遊戲競技場" | "帳號控制";
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  onRestrictedClick,
  isMobileOpen,
  onMobileClose,
}) => {
  const sidebarItems: SidebarItem[] = [
    {
      key: "home",
      label: "平台樞紐",
      icon: Home,
      restricted: false,
      category: "常規",
    },
    {
      key: "explore",
      label: "探索角色",
      icon: Compass,
      restricted: false,
      category: "常規",
    },
    {
      key: "my-characters",
      label: "特工卡牌",
      icon: Sword,
      restricted: true,
      category: "遊戲競技場",
    },
    {
      key: "guilds",
      label: "公會聯盟",
      icon: ShieldCheck,
      restricted: true,
      category: "遊戲競技場",
    },
    {
      key: "profile",
      label: "特工檔案",
      icon: User,
      restricted: true,
      category: "帳號控制",
    },
    {
      key: "settings",
      label: "管理員設定",
      icon: Settings,
      restricted: true,
      category: "帳號控制",
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    onMobileClose();
    if (item.restricted && !currentUser) {
      onRestrictedClick(item.key);
    } else {
      onNavigate(item.key);
    }
  };

  const categories = ["常規", "遊戲競技場", "帳號控制"] as const;

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between glass p-4 border-r border-white/10 font-display">
      <div className="space-y-6">
        {/* Mobile Header indicator */}
        <div className="flex items-center justify-between md:hidden pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-neon-cyan text-glow-cyan" />
            <span className="font-display font-bold text-lg text-white">NAVIGATION</span>
          </div>
          <button
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Mini Card (in Sidebar) */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-3.5 shadow-inner relative overflow-hidden backdrop-blur-sm">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="h-10 w-10 rounded-lg object-cover border border-neon-cyan/50"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-cyber-black" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-200">{currentUser.username}</p>
                <p className="truncate text-[10px] font-mono text-neon-cyan text-glow-cyan">Lv.24 守護者</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-1">
              <p className="text-xs font-display text-slate-400">匿名特工</p>
              <p className="text-[10px] font-mono text-red-400 mt-1 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3 inline" /> 安全憑證等級: 0
              </p>
            </div>
          )}
        </div>

        {/* Categories Grouping */}
        {categories.map((cat) => (
          <div key={cat} className="space-y-1.5">
            <h3 className="px-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              {cat}
            </h3>
            <ul className="space-y-1 font-sans">
              {sidebarItems
                .filter((items) => items.category === cat)
                .map((item) => {
                  const isActive = currentRoute === item.key;
                  const isLocked = item.restricted && !currentUser;
                  const Icon = item.icon;

                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => handleItemClick(item)}
                        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 font-medium text-glow-cyan"
                            : "text-slate-400 hover:bg-white/5 hover:text-neon-cyan border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4.5 w-4.5 transition-colors ${
                              isActive
                                ? "text-neon-cyan"
                                : "text-slate-400 group-hover:text-neon-cyan"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        
                        {isLocked && (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono font-medium text-amber-500 flex items-center gap-1 border border-amber-500/25">
                            <Lock className="h-2.5 w-2.5" />
                            鎖定
                          </span>
                        )}
                        {!isLocked && item.restricted && (
                          <div className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f3ff]" />
                        )}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>

      {/* Cyber Aesthetic Footer */}
      <div className="mt-auto pt-4 border-t border-white/10 font-mono text-[10px] text-slate-600 space-y-1 select-none">
        <p className="flex items-center gap-1 text-neon-cyan/70">
          <Sparkles className="h-3 w-3 text-neon-cyan" /> 安全防護系統：已啟動
        </p>
        <p className="flex items-center gap-1">
          <Info className="h-3 w-3 text-slate-700" /> 系統延遲：12毫秒
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Laptop / Desktop Permanent Sidebar */}
      <aside className="hidden h-[calc(100vh-4rem)] w-64 md:block flex-shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Menu */}
          <div className="relative flex w-full max-w-xs flex-col flex-1 bg-slate-950 animate-slide-in-left">
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};
