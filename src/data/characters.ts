/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Rarity } from "../types";

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "char-1",
    name: "Cyber Samurai (Tatsuya-09)",
    game: "Neon Overdrive: Infinite",
    role: "Core Melee DPS / Skirmisher",
    rarity: Rarity.LEGENDARY,
    bio: "A rogue synthetic swordsman fighting on the fringes of Megacity Zero. Equipped with a custom tachyon-molecular blade capable of slicing through tank armor instantly.",
    stats: {
      attack: 95,
      defense: 60,
      speed: 92,
      magic: 40,
    },
    image: "/src/assets/images/cyber_samurai_1781242492522.jpg",
    likes: 124,
    tags: ["Melee", "High Mobility", "Synthetic", "Sci-Fi"],
    likedBy: [],
  },
  {
    id: "char-2",
    name: "Shadow Assassin (Vesper)",
    game: "Chrono Stealth",
    role: "Infiltrator / Rogue Assassin",
    rarity: Rarity.EPIC,
    bio: "Operating from the spatial shadows of the void. Vesper utilizes gravity-warping daggers to traverse distances instantly and silence critical targets unseen.",
    stats: {
      attack: 88,
      defense: 42,
      speed: 98,
      magic: 65,
    },
    image: "/src/assets/images/shadow_assassin_1781242508597.jpg",
    likes: 98,
    tags: ["Stealth", "Burst Damage", "Void", "Assassin"],
    likedBy: [],
  },
  {
    id: "char-3",
    name: "Astral Mage (Aurelia)",
    game: "Aetheria: Chronicles of Star",
    role: "Cosmic Evoker",
    rarity: Rarity.LEGENDARY,
    bio: "An ancient high elf scholar who unlocked the forbidden constellations. She summons supernova flares and starlight shields from the absolute vacuum of outer space.",
    stats: {
      attack: 78,
      defense: 50,
      speed: 70,
      magic: 99,
    },
    image: "/src/assets/images/astral_mage_1781242521594.jpg",
    likes: 156,
    tags: ["Magic", "AOE Control", "Cosmic", "Ranged"],
    likedBy: [],
  },
  {
    id: "char-4",
    name: "Mech Sentinel (Iron Aegis)",
    game: "Siege Forge: Tactics",
    role: "Heavy Tank / Frontline Guard",
    rarity: Rarity.RARE,
    bio: "Built to hold the line during the iron wars. Outfitted with automatic shoulder artillery, electromagnetic shields, and heavy localized fortification mechanics.",
    stats: {
      attack: 65,
      defense: 98,
      speed: 35,
      magic: 20,
    },
    image: "/src/assets/images/mech_sentinel_1781242535936.jpg",
    likes: 85,
    tags: ["Defense", "Shielding", "Heavy Mech", "Crowd Control"],
    likedBy: [],
  }
];
