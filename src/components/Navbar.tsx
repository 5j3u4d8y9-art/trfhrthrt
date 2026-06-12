/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Gamepad2, Search, Bell, LogIn, UserPlus, LogOut, User as UserIcon, Menu } from "lucide-react";
import { User, Route } from "../types";

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (route: Route) => void;
  currentRoute: Route;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  currentRoute,
  onLogout,
  searchQuery,
  onSearchChange,
  onMobileMenuToggle,
}) => {
  return (
    <header id="nexus-navbar" className="sticky top-0 z-40 w-full border-b border-white/10 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-trigger"
            onClick={onMobileMenuToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div 
            onClick={() => onNavigate("home")}
            className="flex cursor-pointer items-center gap-2 group font-display"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple text-cyber-black font-black accent-glow">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">
              NEON<span className="text-neon-cyan text-glow-cyan text-glow-cyan">NEXUS</span>
            </span>
            <span className="hidden sm:inline-block rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono font-medium text-neon-cyan border border-neon-cyan/20">
              V1.4.0
            </span>
          </div>
        </div>

        {/* Global Search Feature (Integrated directly into the layout) */}
        <div className="hidden md:flex max-w-md flex-1 px-8">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="global-search-input"
              type="text"
              placeholder="搜尋角色、機制、職業..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-10 pr-4 font-sans text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 focus-neon-border"
            />
          </div>
        </div>

        {/* Action Controls & Profile details */}
        <div className="flex items-center gap-3">
          {/* Notifications indicator (Just visual for gaming aesthetics) */}
          <button id="notification-bell" className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan/60 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-cyan"></span>
            </span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          {currentUser ? (
            /* Logged In Status */
            <div className="flex items-center gap-3">
              <div 
                onClick={() => onNavigate("profile")}
                className="hidden sm:flex flex-col items-end cursor-pointer group"
              >
                <span className="font-sans text-sm font-medium text-slate-200 group-hover:text-neon-cyan transition-colors">
                  {currentUser.username}
                </span>
                <span className="font-mono text-[10px] text-neon-cyan flex items-center gap-1 text-glow-cyan">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                  活躍特工
                </span>
              </div>
              
              <button 
                id="profile-avatar-btn"
                onClick={() => onNavigate("profile")}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-neon-cyan/40 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 text-white shadow-md hover:border-neon-cyan transition-all duration-205 overflow-hidden"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>

              <button
                id="logout-btn"
                onClick={onLogout}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-955/20 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-all duration-200"
                title="登出帳號"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            /* Unlogged In Status */
            <div className="flex items-center gap-2">
              <button
                id="login-nav-btn"
                onClick={() => onNavigate("login")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentRoute === "login"
                    ? "bg-white/5 text-neon-cyan border border-neon-cyan/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">登入</span>
              </button>
              
              <button
                id="register-nav-btn"
                onClick={() => onNavigate("register")}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 text-cyber-black px-4 py-1.5 text-sm font-bold tracking-tight transition-all duration-200 shadow-md shadow-neon-cyan/20 cursor-pointer active:scale-95"
              >
                <UserPlus className="h-4 w-4" />
                <span>註冊</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
