/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Key, Star, Swords, Shield, Zap, Wand2, Eye, EyeOff, Trash2 } from "lucide-react";
import { Character, Rarity } from "../types";

interface CharacterCardProps {
  character: Character;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void; // Optional if it belongs to user
  isLikedByUser: boolean;
  isUserLoggedIn: boolean;
  onLoginPrompt: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onLike,
  onDelete,
  isLikedByUser,
  isUserLoggedIn,
  onLoginPrompt,
}) => {
  const [showLore, setShowLore] = useState(false);

  // Rarity styling helpers
  const getRarityConfig = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return {
          text: "text-amber-400 font-bold",
          border: "border-amber-500/30 hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
          badge: "bg-amber-550/10 text-amber-300 border-amber-500/20",
          glow: "from-amber-500/10 via-transparent to-transparent",
        };
      case Rarity.EPIC:
        return {
          text: "text-neon-purple font-bold text-glow-purple",
          border: "border-neon-purple/30 hover:border-neon-purple group-hover:shadow-[0_0_20px_rgba(112,0,255,0.25)]",
          badge: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
          glow: "from-neon-purple/10 via-transparent to-transparent",
        };
      case Rarity.RARE:
        return {
          text: "text-neon-cyan font-bold text-glow-cyan",
          border: "border-neon-cyan/30 hover:border-neon-cyan group-hover:shadow-[0_0_20px_rgba(0,243,255,0.25)]",
          badge: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
          glow: "from-neon-cyan/10 via-transparent to-transparent",
        };
      case Rarity.UNCOMMON:
        return {
          text: "text-emerald-450",
          border: "border-emerald-500/20 hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          badge: "bg-emerald-555/10 text-emerald-300 border-emerald-500/20",
          glow: "from-emerald-500/5 via-transparent to-transparent",
        };
      default:
        return {
          text: "text-slate-400",
          border: "border-white/10 hover:border-white/20",
          badge: "bg-white/5 text-slate-300 border-white/10",
          glow: "from-white/5 via-transparent to-transparent",
        };
    }
  };

  const style = getRarityConfig(character.rarity);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUserLoggedIn) {
      onLoginPrompt();
    } else {
      onLike(character.id);
    }
  };

  return (
    <motion.div
      id={`char-card-${character.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 glass ${style.border}`}
    >
      {/* Background Rarity Glow Filter */}
      <div className={`absolute inset-0 bg-gradient-to-b ${style.glow} pointer-events-none`} />
 
      {/* Rarity & Likes Badges top float */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase backdrop-blur-md ${style.badge}`}>
          <Star className="h-2.5 w-2.5 fill-current" />
          {character.rarity}
        </span>
        
        {character.ownerEmail && (
          <span className="inline-flex rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-0.5 text-[10px] font-mono text-neon-cyan text-glow-cyan backdrop-blur-md">
            專屬鑄造
          </span>
        )}
      </div>
 
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {onDelete && (
          <button
            onClick={() => onDelete(character.id)}
            className="rounded-full border border-red-500/20 bg-cyber-black/80 p-1.5 text-red-500 backdrop-blur-md hover:bg-red-505/25 hover:text-red-400 transition-colors cursor-pointer"
            title="銷毀此特工卡牌"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
 
        <button
          onClick={handleLikeClick}
          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-mono backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isLikedByUser
              ? "bg-rose-500/25 border-rose-500/40 text-rose-400"
              : "bg-cyber-black/85 border-white/5 text-slate-400 hover:border-neon-cyan/40 hover:text-white"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isLikedByUser ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>{character.likes}</span>
        </button>
      </div>
 
      {/* Card Image Area with Zoom Effects */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cyber-black">
        <img
          src={character.image}
          alt={character.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/10 to-transparent" />
      </div>
 
      {/* Card Details Body */}
      <div className="flex flex-1 flex-col p-4.5 font-display relative z-10">
        {/* Header Metadata */}
        <div>
          <p className="font-mono text-[10px] tracking-wider uppercase text-neon-cyan text-glow-cyan">{character.game}</p>
          <h4 className="mt-0.5 font-display justify-between text-base font-extrabold text-[#fafafa] line-clamp-1">
            {character.name}
          </h4>
          <p className="mt-1 font-mono text-xs text-slate-400">{character.role}</p>
        </div>
 
        {/* Visual Attributes Stat Bar Grid */}
        <div className="mt-4 space-y-2.5">
          {/* ATK */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Swords className="h-3 w-3 text-red-400" /> 力量 (Attack / ATK)
              </span>
              <span className="text-slate-200">{character.stats.attack}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cyber-black overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${character.stats.attack}%` }}
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-450"
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
          </div>
 
          {/* DEF */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-400" /> 防禦 (Defense / DEF)
              </span>
              <span className="text-slate-200">{character.stats.defense}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cyber-black overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${character.stats.defense}%` }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-neon-cyan"
                transition={{ duration: 0.8, delay: 0.15 }}
              />
            </div>
          </div>
 
          {/* SPD */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> 敏捷 (Speed / SPD)
              </span>
              <span className="text-slate-200">{character.stats.speed}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cyber-black overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${character.stats.speed}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>
 
          {/* MAG */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Wand2 className="h-3 w-3 text-neon-purple" /> 秘法 (Magic / MAG)
              </span>
              <span className="text-slate-200">{character.stats.magic}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cyber-black overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${character.stats.magic}%` }}
                className="h-full rounded-full bg-gradient-to-r from-neon-purple to-fuchsia-400"
                transition={{ duration: 0.8, delay: 0.25 }}
              />
            </div>
          </div>
        </div>
 
        {/* Tags list */}
        <div className="mt-4 flex flex-wrap gap-1.5 font-mono">
          {character.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[9px] text-[#8e9aaf] border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>
 
        {/* Collapsible Lore view button */}
        <div className="mt-4.5 pt-3.5 border-t border-white/10 flex flex-col">
          <button
            onClick={() => setShowLore(!showLore)}
            className="flex items-center justify-between text-xs font-mono font-medium text-slate-400 hover:text-neon-cyan transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              {showLore ? <EyeOff className="h-3.5 w-3.5 text-neon-cyan" /> : <Eye className="h-3.5 w-3.5 text-slate-400" />}
              {showLore ? "收起機密檔案 (CONCEAL)" : "調閱特工傳記 (BIOGRAPHY)"}
            </span>
            <span className="text-[10px] text-slate-500">
              {showLore ? "[-]" : "[+]"}
            </span>
          </button>
 
          <AnimatePresence initial={false}>
            {showLore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs font-sans leading-relaxed text-slate-300 bg-white/5 rounded-lg p-2.5 border border-white/10">
                  {character.bio}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
