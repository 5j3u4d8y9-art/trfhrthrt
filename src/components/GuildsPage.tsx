/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, Shield, Radio, Terminal, Send, CheckCircle } from "lucide-react";
import { User } from "../types";

interface GuildsPageProps {
  currentUser: User;
}

interface Guild {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  powerScore: number;
  bannerGlow: string;
}

export const GuildsPage: React.FC<GuildsPageProps> = ({ currentUser }) => {
  const [joinedGuilds, setJoinedGuilds] = useState<string[]>(["guild-1"]);
  const [chats, setChats] = useState([
    { sender: "System-AI", text: "歡迎來到樞紐公會矩陣頻道。所有系統節點模組皆已處於啟動狀態。", time: "10:45 AM" },
    { sender: "Void-Rogue-23", text: "有人想一起跑「時序潛形極速挑戰」嗎？需要一個「星系召喚師」配置。", time: "10:46 AM" },
    { sender: "Slayer-Neo", text: "新版本的伺服器補丁中，「Tatsuya-09」的屬性增強得太厲害了。", time: "10:48 AM" }
  ]);
  const [chatMessage, setChatMessage] = useState("");

  const guildsList: Guild[] = [
    {
      id: "guild-1",
      name: "霓虹幕府企業 (Neon Shogun Syndicate)",
      description: "專為極客義體刀戰職業打造，專注於高速近戰連招、極速通關與賽博龐克電子合成器美學。",
      memberCount: 1425,
      powerScore: 98,
      bannerGlow: "shadow-[0_0_15px_rgba(112,0,255,0.15)] border-neon-purple/20 hover:border-neon-purple/40",
    },
    {
      id: "guild-2",
      name: "虛空探索者戰隊 (Void Seekers Clan)",
      description: "重力匕首與空間扭曲機制的支配者。我們在全球範疇內追求完美的隱形暗殺與極限爆發傷害紀錄。",
      memberCount: 954,
      powerScore: 92,
      bannerGlow: "shadow-[0_0_15px_rgba(236,72,153,0.15)] border-pink-500/20 hover:border-pink-500/40",
    },
    {
      id: "guild-3",
      name: "神盾坦克重裝營 (Aegis Tank Battalion)",
      description: "捍衛伺服器網路安全的最強壁壘。集結了重裝防禦指揮官、要塞火力專家與不落粒子能護盾配置人員。",
      memberCount: 812,
      powerScore: 88,
      bannerGlow: "shadow-[0_0_15px_rgba(0,243,255,0.15)] border-neon-cyan/25 hover:border-neon-cyan/45",
    }
  ];

  const handleJoinToggle = (guildId: string) => {
    if (joinedGuilds.includes(guildId)) {
      setJoinedGuilds(joinedGuilds.filter(id => id !== guildId));
    } else {
      setJoinedGuilds([...joinedGuilds, guildId]);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChats([
      ...chats,
      {
        sender: currentUser.username,
        text: chatMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatMessage("");
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 pb-16 animate-fade-in font-display">
      
      {/* Title block spanning 12 cols */}
      <div className="lg:col-span-12 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-neon-cyan text-glow-cyan" />
          <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">公會聯盟競技場 (Guild Alliances Arena)</h2>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-400">登錄各扇區戰隊、串聯即時戰術數據，與同盟特工即時在線連線溝通。</p>
      </div>

      {/* Left: Guild list - Col span 7 */}
      <div className="space-y-6 lg:col-span-7">
        <h3 className="font-display text-sm font-bold text-slate-350 tracking-wider uppercase">可登錄的公會聯盟 (Available Coalitions)</h3>
        
        <div className="space-y-4">
          {guildsList.map((guild) => {
            const isMember = joinedGuilds.includes(guild.id);
            return (
              <div 
                key={guild.id}
                className={`rounded-2xl border bg-cyber-black glass p-5 transition-all duration-300 backdrop-blur-md ${guild.bannerGlow}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-display font-black text-white text-base tracking-tight">{guild.name}</h4>
                    <p className="mt-1.5 font-sans text-xs leading-relaxed text-slate-400">{guild.description}</p>
                  </div>

                  <button
                    onClick={() => handleJoinToggle(guild.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      isMember
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-display font-medium"
                        : "bg-gradient-to-r from-neon-cyan to-neon-purple text-cyber-black font-extrabold font-display hover:opacity-95 shadow-md shadow-neon-cyan/15"
                    }`}
                  >
                    {isMember ? <CheckCircle className="h-3.5 w-3.5" /> : null}
                    <span>{isMember ? "主動連線節點" : "進行核心部署"}</span>
                  </button>
                </div>

                {/* Micro Stats */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-6 font-mono text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-neon-cyan" /> 成員總數: <span className="text-slate-300">{guild.memberCount} 人</span>
                  </span>
                  <span>
                    核心戰力指數: <span className="text-neon-cyan font-bold">{guild.powerScore}%</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Mock Chat - Col span 5 */}
      <div className="lg:col-span-5 flex flex-col h-[525px] rounded-2xl border border-white/10 bg-cyber-black glass overflow-hidden relative backdrop-blur-md">
        <div className="flex items-center justify-between bg-[#050506]/60 px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 font-display">
            <Radio className="h-4 w-4 text-rose-500 animate-pulse text-glow-rose" />
            <span className="font-mono text-xs font-semibold text-slate-200">跨維度矩陣聊天頻道 (TRANS-MATRIX CHAT)</span>
          </div>
          <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {/* Chats text scrolling body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans" id="matrix-chat-feed">
          {chats.map((c, i) => {
            const isMe = c.sender === currentUser.username;
            return (
              <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mb-0.5">
                  <span className={isMe ? "text-neon-cyan font-bold" : "text-slate-400"}>{c.sender}</span>
                  <span>•</span>
                  <span>{c.time}</span>
                </div>
                <div 
                  className={`rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed ${
                    isMe 
                      ? "bg-neon-purple/15 text-[#efd9ff] border border-neon-purple/20" 
                      : "bg-white/5 text-[#d3d6de] border border-white/5"
                  }`}
                >
                  {c.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal Input drawer */}
        <form onSubmit={handleSendChat} className="p-3 bg-cyber-black/60 border-t border-white/10 flex items-center gap-2">
          <div className="relative flex-1 font-display">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Terminal className="h-3.5 w-3.5" />
            </span>
            <input
              id="guild-chat-input"
              type="text"
              placeholder="注入通訊數據包..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-cyber-black/40 py-2 pl-9 pr-3 font-display text-xs text-white outline-none focus-neon-border placeholder-slate-500"
            />
          </div>
          <button 
            type="submit" 
            className="rounded-lg bg-neon-cyan hover:opacity-90 text-cyber-black p-2 border border-transparent transition-all cursor-pointer active:scale-95 shadow-md shadow-neon-cyan/20"
            title="Deploy Packet"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
