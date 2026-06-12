/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Compass, ListFilter, Trash2 } from "lucide-react";
import { Character, Rarity, User } from "../types";
import { CharacterCard } from "./CharacterCard";

interface ExplorePageProps {
  characters: Character[];
  onLike: (id: string) => void;
  onDeleteCharacter?: (id: string) => void;
  currentUser: User | null;
  likedCharacterIds: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLoginPrompt: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  characters,
  onLike,
  onDeleteCharacter,
  currentUser,
  likedCharacterIds,
  searchQuery,
  onSearchChange,
  onLoginPrompt,
}) => {
  const [rarityFilter, setRarityFilter] = useState<"ALL" | Rarity>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  // Get distinct games for filter option list
  const distinctGames = ["ALL", ...Array.from(new Set(characters.map((c) => c.game)))];

  // Apply filters
  const filtered = characters.filter((c) => {
    // Search query match
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Rarity match
    const matchesRarity = rarityFilter === "ALL" || c.rarity === rarityFilter;

    // Source match
    const matchesSource = sourceFilter === "ALL" || c.game === sourceFilter;

    return matchesSearch && matchesRarity && matchesSource;
  });

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-display">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-neon-cyan text-glow-cyan" />
          <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">特工角色競技場 (Explore Arena)</h2>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-400">在當前伺服器節點資料庫中，搜尋各款作品的高精細度遊戲卡牌角色。</p>
      </div>

      {/* Filter Toolbar controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl glass p-4 sm:grid-cols-12 items-center backdrop-blur-md">
        {/* Search input (synced with global search) */}
        <div className="relative sm:col-span-4">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="arena-search-input"
            type="text"
            placeholder="搜尋特工、遊戲作品、戰術定位..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus-neon-border transition-colors font-display"
          />
        </div>

        {/* Rarity filter */}
        <div className="sm:col-span-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase flex-shrink-0">稀有度:</span>
            <select
              id="arena-rarity-select"
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value as "ALL" | Rarity)}
              className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2 px-3 text-xs text-slate-300 outline-none focus-neon-border transition-colors font-display cursor-pointer"
            >
              <option value="ALL" className="bg-[#050506]">所有稀有度階級</option>
              {Object.values(Rarity).map((r) => (
                <option key={r} value={r} className="bg-[#050506]">{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Source game franchise filter */}
        <div className="sm:col-span-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase flex-shrink-0">作品:</span>
            <select
              id="arena-source-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2 px-3 text-xs text-slate-300 outline-none focus-neon-border transition-colors truncate font-display cursor-pointer"
            >
              <option value="ALL" className="bg-[#050506]">所有遊戲系列</option>
              {distinctGames.filter(g => g !== "ALL").map((g) => (
                <option key={g} value={g} className="bg-[#050506] truncate">{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid listing characters */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((char) => {
            const isMyOwn = char.ownerEmail && currentUser && char.ownerEmail === currentUser.email;
            return (
              <CharacterCard
                key={char.id}
                character={char}
                onLike={onLike}
                onDelete={isMyOwn && onDeleteCharacter ? onDeleteCharacter : undefined}
                isLikedByUser={likedCharacterIds.includes(char.id)}
                isUserLoggedIn={!!currentUser}
                onLoginPrompt={onLoginPrompt}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Compass className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 font-display text-sm text-slate-400">目前在樞紐資料庫中，未探索到任何符合條件的特工角色。</p>
          <button 
            onClick={() => {
              setRarityFilter("ALL");
              setSourceFilter("ALL");
              onSearchChange("");
            }}
            className="mt-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neon-cyan px-4 py-2 border border-white/10 hover:border-neon-cyan/40 transition-colors cursor-pointer font-bold"
          >
            重設搜尋過濾器
          </button>
        </div>
      )}

    </div>
  );
};
