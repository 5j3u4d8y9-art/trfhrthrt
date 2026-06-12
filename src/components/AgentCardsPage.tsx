/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  HelpCircle, 
  Sparkles, 
  Swords, 
  Shield, 
  Zap, 
  Wand2, 
  Gamepad2, 
  Fingerprint,
  Trash2,
  Info
} from "lucide-react";
import { Character, Rarity, User } from "../types";
import { CharacterCard } from "./CharacterCard";

interface AgentCardsPageProps {
  characters: Character[];
  currentUser: User;
  onAddCharacter: (character: Omit<Character, "id" | "likes" | "likedBy">) => void;
  onLike: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  likedCharacterIds: string[];
}

const DESIGN_PRESETS_IMAGES = [
  { name: "賽博武士 (Cyber Samurai)", url: "/src/assets/images/cyber_samurai_1781242492522.jpg" },
  { name: "幽影刺客 (Shadow Assassin)", url: "/src/assets/images/shadow_assassin_1781242508597.jpg" },
  { name: "星界法師 (Astral Mage)", url: "/src/assets/images/astral_mage_1781242521594.jpg" },
  { name: "重裝機甲 (Heavy Mech)", url: "/src/assets/images/mech_sentinel_1781242535936.jpg" },
];

export const AgentCardsPage: React.FC<AgentCardsPageProps> = ({
  characters,
  currentUser,
  onAddCharacter,
  onLike,
  onDeleteCharacter,
  likedCharacterIds,
}) => {
  const [showCreator, setShowCreator] = useState(false);
  
  // Custom Card Creator States
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [role, setRole] = useState("");
  const [rarity, setRarity] = useState<Rarity>(Rarity.RARE);
  const [bio, setBio] = useState("");
  const [attack, setAttack] = useState(70);
  const [defense, setDefense] = useState(60);
  const [speed, setSpeed] = useState(65);
  const [magic, setMagic] = useState(50);
  const [selectedImage, setSelectedImage] = useState(DESIGN_PRESETS_IMAGES[0].url);
  const [tagsInput, setTagsInput] = useState("");
  const [errorMess, setErrorMess] = useState("");

  const userCharacters = characters.filter(c => c.ownerEmail === currentUser.email);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess("");

    if (!name || !game || !role || !bio) {
      setErrorMess("請完整填寫卡牌的所有結構化屬性參數。");
      return;
    }

    // Process tags
    const processedTags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (processedTags.length === 0) {
      processedTags.push("自訂特工", rarity);
    }

    onAddCharacter({
      name,
      game,
      role,
      rarity,
      bio,
      stats: {
        attack,
        defense,
        speed,
        magic,
      },
      image: selectedImage,
      tags: processedTags,
      ownerEmail: currentUser.email,
    });

    // Reset Form
    setName("");
    setGame("");
    setRole("");
    setRarity(Rarity.RARE);
    setBio("");
    setAttack(75);
    setDefense(60);
    setSpeed(65);
    setMagic(50);
    setTagsInput("");
    setShowCreator(false);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in font-display">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-neon-cyan text-glow-cyan" />
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">特工卡牌製造坊 (Agent Card Studio)</h2>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">登入特工特權憑證即可在此處鑄造、保存、策劃與銷毀自訂的遊戲人物載體卡。</p>
        </div>

        <button
          id="toggle-creative-studio-btn"
          onClick={() => setShowCreator(!showCreator)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 text-cyber-black px-4 py-2.5 text-xs font-bold tracking-tight shadow-md shadow-neon-cyan/20 cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{showCreator ? "收起創造控制台" : "開啟角色研發核心"}</span>
        </button>
      </div>

      {/* Accordion Creator Console */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden animate-fade-in"
          >
            <form id="card-creator-form" onSubmit={handleCreateSubmit} className="rounded-2xl border border-white/10 glass p-6 md:p-8 space-y-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <Sparkles className="h-5 w-5 text-neon-cyan animate-pulse text-glow-cyan" />
                <h3 className="font-display font-extrabold text-base text-white">配置全新角色特徵實體 (CONFIGURE NEW AGENT)</h3>
              </div>

              {errorMess && (
                <div className="rounded-lg bg-red-955/20 border border-red-900/30 p-3 text-xs text-red-400 font-mono">
                  {errorMess}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* Form Inputs */}
                <div className="space-y-4 font-display">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">英雄 / 角色名稱 (Character Name)</label>
                    <input
                      id="card-name-input"
                      type="text"
                      placeholder="例如：時空主宰-03 (Chronos Master-03)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2.5 px-3.5 font-display text-sm text-white placeholder-slate-600 outline-none focus-neon-border transition-colors focus:bg-cyber-black/80"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">來源作品 / 遊戲名</label>
                      <input
                        id="card-game-input"
                        type="text"
                        placeholder="例如：虛空領域"
                        value={game}
                        onChange={(e) => setGame(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2.5 px-3.5 font-display text-sm text-white placeholder-slate-600 outline-none focus-neon-border transition-colors focus:bg-cyber-black/80"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">戰鬥戰術定位 / 職業</label>
                      <input
                        id="card-role-input"
                        type="text"
                        placeholder="例如：前鋒重裝坦"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2.5 px-3.5 font-display text-sm text-white placeholder-slate-600 outline-none focus-neon-border transition-colors focus:bg-cyber-black/80"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">卡牌稀有度矩陣</label>
                      <select
                        id="card-rarity-select"
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value as Rarity)}
                        className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2.5 px-3.5 font-display text-xs text-slate-200 outline-none focus-neon-border transition-colors cursor-pointer focus:bg-[#050506]"
                      >
                        {Object.values(Rarity).map((r) => (
                          <option key={r} value={r} className="bg-[#050506] text-slate-300">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">自訂特徵標籤 (半形逗號分隔)</label>
                      <input
                        id="card-tags-input"
                        type="text"
                        placeholder="例：重裝, 輸出, 火系"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2.5 px-3.5 font-display text-sm text-white placeholder-slate-600 outline-none focus-neon-border transition-colors focus:bg-cyber-black/80"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1.5 font-semibold">特工傳記故事 / 詳細履歷背景</label>
                    <textarea
                      id="card-bio-input"
                      rows={3}
                      placeholder="描述該人物在系統登錄中的背景故事、戰鬥能力與傳奇履歷..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-cyber-black/40 py-2.5 px-3.5 font-display text-sm text-white placeholder-slate-600 outline-none focus-neon-border transition-colors focus:bg-cyber-black/80"
                      required
                    />
                  </div>
                </div>

                {/* Interactive Sliders (Stats) & Model Selector */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-slate-400 mb-2 font-semibold">選擇數位虛擬卡牌外觀核心 (PORTRAIT)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {DESIGN_PRESETS_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setSelectedImage(preset.url)}
                          className={`relative rounded-xl border p-2 flex items-center gap-3 transition-colors text-left cursor-pointer ${
                            selectedImage === preset.url
                              ? "bg-neon-cyan/10 border-neon-cyan"
                              : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="h-9 w-9 object-cover rounded-lg border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-mono text-[10px] text-slate-400 leading-tight">
                            {preset.name.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attributes Customization Controls */}
                  <div className="space-y-3.5 rounded-xl bg-[#050506]/40 p-4 border border-white/5">
                    <p className="font-mono text-[10px] text-neon-cyan uppercase tracking-wider font-semibold text-glow-cyan">配置戰鬥屬性係數微調</p>
                    
                    {/* ATK */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1"><Swords className="h-3 w-3 text-red-455" /> 攻擊 ATK</span>
                        <span className="font-bold text-slate-200">{attack}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={attack}
                        onChange={(e) => setAttack(Number(e.target.value))}
                        className="w-full accent-neon-cyan cursor-pointer h-1.5 bg-cyber-black rounded-lg outline-none border border-white/5"
                      />
                    </div>

                    {/* DEF */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1"><Shield className="h-3 w-3 text-blue-405" /> 防禦 DEF</span>
                        <span className="font-bold text-slate-200">{defense}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={defense}
                        onChange={(e) => setDefense(Number(e.target.value))}
                        className="w-full accent-neon-cyan cursor-pointer h-1.5 bg-cyber-black rounded-lg outline-none border border-white/5"
                      />
                    </div>

                    {/* SPD */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1"><Zap className="h-3 w-3 text-amber-455" /> 速度 SPD</span>
                        <span className="font-bold text-slate-200">{speed}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full accent-neon-cyan cursor-pointer h-1.5 bg-cyber-black rounded-lg outline-none border border-white/5"
                      />
                    </div>

                    {/* MAG */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1"><Wand2 className="h-3 w-3 text-neon-purple" /> 奧術秘力 MAG</span>
                        <span className="font-bold text-slate-200">{magic}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={magic}
                        onChange={(e) => setMagic(Number(e.target.value))}
                        className="w-full accent-neon-purple cursor-pointer h-1.5 bg-cyber-black rounded-lg outline-none border border-white/5"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Trigger */}
              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  id="mint-character-btn"
                  type="submit"
                  className="rounded-xl btn-primary font-display text-sm font-black px-6 py-3 shadow-lg shadow-neon-cyan/20 cursor-pointer"
                >
                  確認並進行卡牌鑄造 (Confirm Mint)
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid listing Owned Cards */}
      <div className="space-y-5">
        <h3 className="font-display text-lg font-extrabold text-slate-200 flex items-center gap-2">
          <span>我已鑄造的特工角色</span>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-neon-cyan border border-white/10">
            {userCharacters.length}
          </span>
        </h3>

        {userCharacters.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userCharacters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onLike={onLike}
                onDelete={onDeleteCharacter}
                isLikedByUser={likedCharacterIds.includes(char.id)}
                isUserLoggedIn={true}
                onLoginPrompt={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Info className="mx-auto h-8 w-8 text-slate-655" />
            <p className="mt-4 font-display text-sm text-slate-400">目前您的安全節點庫存中還沒有鑄造過任何自訂角色卡。</p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">部署上方研發核心來產出您的第一個賽博特工角色卡牌！</p>
            <button
              onClick={() => setShowCreator(true)}
              className="mt-4 rounded-xl btn-primary font-display font-black text-xs px-4 py-2.5 shadow-md shadow-neon-cyan/10 cursor-pointer"
            >
              初始化角色研發核心控制台
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
