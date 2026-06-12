/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Gamepad2, 
  Flame, 
  ArrowRight, 
  ListFilter,
  Shield, 
  Users, 
  Sparkles,
  Info
} from "lucide-react";
import { Character, Route, Rarity, User } from "../types";
import { CharacterCard } from "./CharacterCard";

interface PlatformHubProps {
  characters: Character[];
  onLike: (id: string) => void;
  currentUser: User | null;
  onNavigate: (route: Route) => void;
  likedCharacterIds: string[];
  onLoginPrompt: () => void;
}

export const PlatformHub: React.FC<PlatformHubProps> = ({
  characters,
  onLike,
  currentUser,
  onNavigate,
  likedCharacterIds,
  onLoginPrompt,
}) => {
  const [activeFilter, setActiveFilter] = useState<"ALL" | Rarity>("ALL");

  const filteredCharacters = activeFilter === "ALL" 
    ? characters 
    : characters.filter(c => c.rarity === activeFilter);

  // Take top characters to display on hub
  const premiumCharacters = characters.slice(0, 3);

  return (
    <div className="space-y-10 animate-fade-in pb-16 font-display">
      
      {/* Immersive Dark Mode Cyber Arcade Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 glass px-6 py-12 md:py-16 md:px-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-neon-purple/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 font-mono text-[10px] text-neon-cyan text-glow-cyan">
            <Sparkles className="h-3 w-3 text-neon-cyan animate-pulse" />
            <span>虛擬星界特工核心節點已上線 (CORE ONLINE)</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:leading-[1.1]">
            部署與自訂您專屬的{" "}
            <span className="bg-gradient-to-r from-neon-cyan via-[#9d4edd] to-neon-purple bg-clip-text text-transparent">
              遊戲卡牌特工
            </span>
          </h1>
          
          <p className="mt-4 font-sans text-base text-slate-350 leading-relaxed">
            歡迎來到霓虹樞紐。收集傳奇特工格位，編程並調校各項戰鬥屬性，召集盟友，建立專屬工會團隊。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate(currentUser ? "my-characters" : "register")}
              className="flex items-center gap-1.5 rounded-xl btn-primary px-6 py-3 font-display text-sm font-bold shadow-lg shadow-neon-cyan/10 hover:shadow-neon-cyan/25 transition-all cursor-pointer font-bold"
            >
              <span>{currentUser ? "進入特工卡牌製造坊" : "一鍵部署核心特工帳號"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("explore")}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:border-neon-cyan hover:text-white px-5 py-3 font-display text-sm font-semibold transition-all cursor-pointer font-bold"
            >
              <span>探索角色競技場</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid statistics highlights */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 glass p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[10px] tracking-wider uppercase">活躍特工總數</span>
            <Users className="h-5 w-5 text-neon-cyan" />
          </div>
          <p className="mt-3 font-display text-3xl font-black text-white">{characters.length}</p>
          <p className="mt-1 font-mono text-[10px] text-neon-cyan/80">當前已鑄造的特工卡牌總量</p>
        </div>

        <div className="rounded-2xl border border-white/10 glass p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[10px] tracking-wider uppercase">社群特工熱讚</span>
            <Flame className="h-5 w-5 text-neon-purple" />
          </div>
          <p className="mt-3 font-display text-3xl font-black text-white">
            {characters.reduce((acc, c) => acc + c.likes, 0)}
          </p>
          <p className="mt-1 font-mono text-[10px] text-neon-purple/80">核心特工所獲得累計點讚</p>
        </div>

        <div className="rounded-2xl border border-white/10 glass p-5 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[10px] tracking-wider uppercase">全域伺服器健康度</span>
            <Shield className="h-5 w-5 text-neon-cyan" />
          </div>
          <p className="mt-3 font-display text-3xl font-black text-white">99.8%</p>
          <p className="mt-1 font-mono text-[10px] text-neon-cyan/80">安全路由節點連線即時診斷</p>
        </div>
      </section>

      {/* Interactive Quick-view Arena Category filters / Quick overview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="font-display text-xl font-extrabold text-white">特工精選角色殿堂 (Showcase Arena)</h3>
            <p className="mt-1 font-mono text-[11px] text-slate-400">過濾、篩選並調閱高階稀有核心特工</p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-white/5 border border-white/5 p-1 rounded-xl">
            {(["ALL", Rarity.LEGENDARY, Rarity.EPIC, Rarity.RARE] as const).map((rar) => (
              <button
                key={rar}
                onClick={() => setActiveFilter(rar)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                  activeFilter === rar
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 font-medium text-glow-cyan"
                    : "text-slate-500 hover:text-slate-350 hover:bg-white/5"
                }`}
              >
                {rar === "ALL" ? "所有階級" : rar}
              </button>
            ))}
          </div>
        </div>

        {/* Character showcase grid elements */}
        {filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCharacters.slice(0, 6).map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onLike={onLike}
                isLikedByUser={likedCharacterIds.includes(char.id)}
                isUserLoggedIn={!!currentUser}
                onLoginPrompt={onLoginPrompt}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <Info className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-3 font-sans text-sm text-slate-400">安全防禦網已啟動：此子網域內未探索到符合條件的特工角色。</p>
            <button 
              onClick={() => setActiveFilter("ALL")} 
              className="mt-4 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neon-cyan px-4 py-2 border border-white/10 transition-all cursor-pointer font-bold"
            >
              重設篩選
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
