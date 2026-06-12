/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { User, Route, Character, Rarity } from "./types";
import { INITIAL_CHARACTERS } from "./data/characters";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
import { PlatformHub } from "./components/PlatformHub";
import { AuthForms } from "./components/AuthForms";
import { AgentCardsPage } from "./components/AgentCardsPage";
import { GuildsPage } from "./components/GuildsPage";
import { ProfilePage } from "./components/ProfilePage";
import { ExplorePage } from "./components/ExplorePage";
import { RestrictedModal } from "./components/RestrictedModal";
import { Shield, Sparkles, Volume2, Monitor, BellRing, Gamepad } from "lucide-react";

const SYSTEM_DEFAULT_USERS = [
  {
    email: "tester@nexus.com",
    username: "NexusTester",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Katana&backgroundColor=6366f1",
    rawPassword: "password123",
    joinedAt: "2026-03-01",
    bio: "Chief assessment operative evaluating client-side platform components."
  }
];

export default function App() {
  // Navigation Router state
  const [currentRoute, setCurrentRoute] = useState<Route>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<typeof SYSTEM_DEFAULT_USERS>(() => {
    const local = localStorage.getItem("nexus_registered_users");
    return local ? JSON.parse(local) : SYSTEM_DEFAULT_USERS;
  });

  // Characters cards state
  const [characters, setCharacters] = useState<Character[]>(() => {
    const local = localStorage.getItem("nexus_characters_db");
    return local ? JSON.parse(local) : INITIAL_CHARACTERS;
  });

  // Track liked cards by current user email
  const [likedCharacterIds, setLikedCharacterIds] = useState<string[]>(() => {
    const local = localStorage.getItem("nexus_user_likes");
    return local ? JSON.parse(local) : [];
  });

  // Interactive filters
  const [searchQuery, setSearchQuery] = useState("");
  const [restrictedRequestedRoute, setRestrictedRequestedRoute] = useState<Route | null>(null);

  // Sound & graphic preferences (For Admin settings page)
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [graphicsQuality, setGraphicsQuality] = useState("ULTRA");
  const [pushNotifs, setPushNotifs] = useState(true);

  // Synchronous local state fallbacks combined with backend triggers
  useEffect(() => {
    localStorage.setItem("nexus_user_likes", JSON.stringify(likedCharacterIds));
  }, [likedCharacterIds]);

  useEffect(() => {
    localStorage.setItem("nexus_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // 1. Authenticated User Listen Handler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              email: data.email || firebaseUser.email || "",
              username: data.username || firebaseUser.email?.split("@")[0] || "Agent",
              avatar: data.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Katana&backgroundColor=6366f1",
              bio: data.bio || "Active agent operating on the Nexus gaming community grid.",
              joinedAt: data.joinedAt || new Date().toISOString().split("T")[0],
            });
          } else {
            const defaultUser = {
              email: firebaseUser.email || "",
              username: firebaseUser.email?.split("@")[0] || "Agent",
              avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Katana&backgroundColor=6366f1",
              bio: "Active agent operating on the Nexus gaming community grid.",
              joinedAt: new Date().toISOString().split("T")[0],
            };
            await setDoc(userDocRef, defaultUser);
            setCurrentUser(defaultUser);
          }
        } catch (err) {
          console.error("Could not load user profile from Firestore:", err);
          setCurrentUser({
            email: firebaseUser.email || "",
            username: firebaseUser.email?.split("@")[0] || "Agent",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Katana&backgroundColor=6366f1",
            bio: "Active agent operating on the Nexus gaming community grid.",
            joinedAt: new Date().toISOString().split("T")[0],
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Realtime Character Cards Sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "characters"),
      (snapshot) => {
        const firestoreList: Character[] = [];
        snapshot.forEach((doc) => {
          firestoreList.push(doc.data() as Character);
        });
        
        // Merge base characters with dynamic custom characters securely, preventing duplications
        const customIds = new Set(firestoreList.map(c => c.id));
        const baseCharacters = INITIAL_CHARACTERS.filter(c => !customIds.has(c.id));
        setCharacters([...baseCharacters, ...firestoreList]);
      },
      (error) => {
        console.warn("Firestore onSnapshot error for characters list:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (userPayload: { email: string; username: string; avatar: string }) => {
    const matched = registeredUsers.find(u => u.email.toLowerCase() === userPayload.email.toLowerCase());
    const completeUser: User = {
      email: userPayload.email,
      username: userPayload.username,
      avatar: userPayload.avatar,
      bio: matched?.bio || "Active agent operating on the Nexus gaming community grid.",
      joinedAt: matched?.joinedAt || new Date().toISOString().split("T")[0],
    };
    setCurrentUser(completeUser);
    localStorage.setItem("nexus_active_session", JSON.stringify(completeUser));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out from Firebase Auth:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem("nexus_active_session");
    setCurrentRoute("home");
  };

  const handleRegisterUser = (newUser: { email: string; username: string; avatar: string; rawPassword?: string }) => {
    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === newUser.email.toLowerCase() || u.username.toLowerCase() === newUser.username.toLowerCase()
    );
    if (exists) return false;

    const formatted = {
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar,
      rawPassword: newUser.rawPassword || "password123",
      joinedAt: new Date().toISOString().split("T")[0],
      bio: "Active agent operating on the Nexus gaming community grid.",
    };

    setRegisteredUsers([...registeredUsers, formatted]);
    return true;
  };

  const handleUpdateBio = async (newBio: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, bio: newBio };
    setCurrentUser(updated);
    localStorage.setItem("nexus_active_session", JSON.stringify(updated));

    // Persist user bio edit to Cloud Firestore if signed in
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: currentUser.email,
          username: currentUser.username,
          avatar: currentUser.avatar,
          joinedAt: currentUser.joinedAt,
          bio: newBio
        });
      } catch (err) {
        console.error("Could not write bio modification to Firestore:", err);
        handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }
    }

    setRegisteredUsers(prev => 
      prev.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, bio: newBio } : u)
    );
  };

  // Likes trigger
  const handleLikeCharacter = async (charId: string) => {
    const isLiked = likedCharacterIds.includes(charId);
    
    // Toggle state locally first for instant feedback (optimistic UI)
    setCharacters(prev => 
      prev.map(char => {
        if (char.id === charId) {
          return {
            ...char,
            likes: isLiked ? Math.max(0, char.likes - 1) : char.likes + 1
          };
        }
        return char;
      })
    );

    if (isLiked) {
      setLikedCharacterIds(prev => prev.filter(id => id !== charId));
    } else {
      setLikedCharacterIds(prev => [...prev, charId]);
    }

    // If it's a Firestore-stored card (custom cards contain 'char-custom'), synchronize to cloud
    if (charId.includes("char-custom")) {
      try {
        const charRef = doc(db, "characters", charId);
        const charDoc = await getDoc(charRef);
        if (charDoc.exists()) {
          const data = charDoc.data() as Character;
          const currentLikes = data.likes || 0;
          const currentLikedBy = data.likedBy || [];
          
          let updatedLikes = currentLikes;
          let updatedLikedBy = [...currentLikedBy];

          if (isLiked) {
            updatedLikes = Math.max(0, currentLikes - 1);
            if (currentUser) {
              updatedLikedBy = updatedLikedBy.filter(email => email !== currentUser.email);
            }
          } else {
            updatedLikes = currentLikes + 1;
            if (currentUser && !updatedLikedBy.includes(currentUser.email)) {
              updatedLikedBy.push(currentUser.email);
            }
          }

          await updateDoc(charRef, {
            likes: updatedLikes,
            likedBy: updatedLikedBy
          });
        }
      } catch (err) {
        console.error("Could not sync like to Firestore:", err);
      }
    }
  };

  // Add Custom Character Card to Cloud Firestore
  const handleAddCharacter = async (newChar: Omit<Character, "id" | "likes" | "likedBy">) => {
    const charId = `char-custom-${Date.now()}`;
    const formatted: Character = {
      ...newChar,
      id: charId,
      likes: 0,
      likedBy: []
    };
    
    try {
      await setDoc(doc(db, "characters", charId), formatted);
    } catch (err) {
      console.error("Error creating character card in Firestore:", err);
      handleFirestoreError(err, OperationType.WRITE, `characters/${charId}`);
    }
  };

  // Delete Character Card from Cloud Firestore
  const handleDeleteCharacter = async (charId: string) => {
    try {
      await deleteDoc(doc(db, "characters", charId));
      setLikedCharacterIds(prev => prev.filter(id => id !== charId));
    } catch (err) {
      console.error("Error deleting character card from Firestore:", err);
      handleFirestoreError(err, OperationType.DELETE, `characters/${charId}`);
    }
  };

  // Route Rendering controller
  const renderActivePage = () => {
    switch (currentRoute) {
      case "home":
        return (
          <PlatformHub
            characters={characters}
            onLike={handleLikeCharacter}
            currentUser={currentUser}
            onNavigate={(r) => setCurrentRoute(r)}
            likedCharacterIds={likedCharacterIds}
            onLoginPrompt={() => setRestrictedRequestedRoute("explore")}
          />
        );
      case "explore":
        return (
          <ExplorePage
            characters={characters}
            onLike={handleLikeCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            currentUser={currentUser}
            likedCharacterIds={likedCharacterIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLoginPrompt={() => setRestrictedRequestedRoute("explore")}
          />
        );
      case "my-characters":
        if (!currentUser) return null;
        return (
          <AgentCardsPage
            characters={characters}
            currentUser={currentUser}
            onAddCharacter={handleAddCharacter}
            onLike={handleLikeCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            likedCharacterIds={likedCharacterIds}
          />
        );
      case "guilds":
        if (!currentUser) return null;
        return <GuildsPage currentUser={currentUser} />;
      case "profile":
        if (!currentUser) return null;
        return (
          <ProfilePage
            currentUser={currentUser}
            onUpdateBio={handleUpdateBio}
            ownedCardsCount={characters.filter(c => c.ownerEmail === currentUser.email).length}
          />
        );
      case "login":
        return (
          <AuthForms
            initialTab="login"
            onAuthSuccess={handleAuthSuccess}
            onNavigate={(r) => setCurrentRoute(r)}
            registeredUsers={registeredUsers}
            onRegisterUser={handleRegisterUser}
          />
        );
      case "register":
        return (
          <AuthForms
            initialTab="register"
            onAuthSuccess={handleAuthSuccess}
            onNavigate={(r) => setCurrentRoute(r)}
            registeredUsers={registeredUsers}
            onRegisterUser={handleRegisterUser}
          />
        );
      case "settings":
        if (!currentUser) return null;
        return (
          <div className="space-y-8 pb-16 animate-fade-in font-display">
            <div className="border-b border-white/10 pb-5">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-neon-cyan text-glow-cyan" />
                <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Admin Settings Panel</h2>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-400">Configure client audio systems, render performance overlays, and system subscriptions on the active grid node.</p>
            </div>

            <div className="rounded-2xl glass p-6 md:p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
              <p className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold text-glow-cyan">PREFERENCE ADJUSTMENT DRIVERS</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio preferences Toggle */}
                <div className="rounded-xl bg-white/5 p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-neon-cyan" />
                    <div>
                      <p className="font-display text-sm font-bold text-slate-200">Terminal Ambient Audio</p>
                      <p className="font-display text-[11px] text-slate-500">Enable synthesized ambient sound effects</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`rounded-full h-6 w-11 flex-shrink-0 transition-all pointer shadow-inner cursor-pointer relative ${
                      audioEnabled ? "bg-gradient-to-r from-neon-cyan to-neon-purple" : "bg-white/10"
                    }`}
                  >
                    <div className={`h-4 w-4 bg-cyber-black rounded-full transition-transform absolute top-1 ${
                      audioEnabled ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                {/* Render profile toggle */}
                <div className="rounded-xl bg-white/5 p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-neon-purple" />
                    <div>
                      <p className="font-display text-sm font-bold text-slate-200">Graphics Engine Target</p>
                      <p className="font-display text-[11px] text-slate-500">Choose frames-per-second performance targets</p>
                    </div>
                  </div>
                  <select 
                    value={graphicsQuality}
                    onChange={(e) => setGraphicsQuality(e.target.value)}
                    className="rounded-lg bg-cyber-black border border-white/10 text-xs text-slate-300 font-mono py-1.5 px-3 outline-none focus:border-neon-cyan cursor-pointer"
                  >
                    <option value="LOW">PERFORMANCE (60 FPS)</option>
                    <option value="MID">BALANCED (90 FPS)</option>
                    <option value="HIGH">HIGH FIDELITY (120 FPS)</option>
                    <option value="ULTRA">RAY-TRACED (ULTRA)</option>
                  </select>
                </div>

                {/* Notifications toggle */}
                <div className="rounded-xl bg-white/5 p-4 border border-white/5 flex items-center justify-between md:col-span-2">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-5 w-5 text-neon-cyan" />
                    <div>
                      <p className="font-display text-sm font-bold text-slate-200">Operational Notice Decryption (Push Notification)</p>
                      <p className="font-display text-[11px] text-slate-500">Decrypt match feeds, like indicators, and community updates directly</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPushNotifs(!pushNotifs)}
                    className={`rounded-full h-6 w-11 flex-shrink-0 transition-all pointer shadow-inner cursor-pointer relative ${
                      pushNotifs ? "bg-gradient-to-r from-neon-cyan to-neon-purple" : "bg-white/10"
                    }`}
                  >
                    <div className={`h-4 w-4 bg-cyber-black rounded-full transition-transform absolute top-1 ${
                      pushNotifs ? "translate-x-6" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Cyber credentials footprint */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                <Sparkles className="h-3.5 w-3.5 text-neon-purple" />
                <span>USER SYSTEM LEDGER ENCRYPTED MATRIX KEY PAIR ACTIVE</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="nexus-application-root" className="min-h-screen bg-[#050506] text-slate-200 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      
      {/* Immersive Theme Glowing Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-neon-purple rounded-full blur-[160px]" />
        <div className="absolute bottom-0 -left-24 w-[500px] h-[500px] bg-neon-cyan rounded-full blur-[200px]" />
      </div>

      {/* Complete Sticky Navbar */}
      <Navbar
        currentUser={currentUser}
        onNavigate={(route) => setCurrentRoute(route)}
        currentRoute={currentRoute}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch z-10">
        {/* Responsive Sidebar */}
        <Sidebar
          currentUser={currentUser}
          currentRoute={currentRoute}
          onNavigate={(route) => setCurrentRoute(route)}
          onRestrictedClick={(route) => {
            setRestrictedRequestedRoute(route);
          }}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Primary Page Canvas Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden min-h-[calc(100vh-4rem)] z-10">
          {renderActivePage()}
        </main>
      </div>

      {/* Restricted Access Shield interstitial Modal */}
      {restrictedRequestedRoute && (
        <RestrictedModal
          requestedRoute={restrictedRequestedRoute}
          onClose={() => setRestrictedRequestedRoute(null)}
          onNavigate={(route) => setCurrentRoute(route)}
        />
      )}
    </div>
  );
}
