/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  email: string;
  username: string;
  avatar: string; // URL or preset avatar name
  bio?: string;
  joinedAt: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

export interface CharacterStats {
  attack: number;    // 0-100
  defense: number;   // 0-100
  speed: number;     // 0-100
  magic: number;     // 0-100
}

export enum Rarity {
  COMMON = "Common",
  UNCOMMON = "Uncommon",
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary",
}

export interface Character {
  id: string;
  name: string;
  game: string;
  role: string;
  rarity: Rarity;
  bio: string;
  stats: CharacterStats;
  image: string;
  likes: number;
  tags: string[];
  ownerEmail?: string; // If custom created, links to specific user
  likedBy: string[];   // Array of user emails who liked the character
}

export type Route = 
  | "home" 
  | "explore" 
  | "my-characters" 
  | "guilds" 
  | "profile" 
  | "settings" 
  | "login" 
  | "register";
