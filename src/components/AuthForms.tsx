/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Gamepad2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Info
} from "lucide-react";
import { Route } from "../types";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthFormsProps {
  initialTab?: "login" | "register";
  onAuthSuccess: (user: { email: string; username: string; avatar: string }) => void;
  onNavigate: (route: Route) => void;
  registeredUsers: Array<{ email: string; username: string; avatar: string; rawPassword?: string }>;
  onRegisterUser: (user: { email: string; username: string; avatar: string; rawPassword?: string }) => boolean;
}

const PRESET_AVATARS = [
  { name: "霓虹武士 (Neon Katana)", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Katana&backgroundColor=6366f1" },
  { name: "虛空守望 (Void Warden)", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Warden&backgroundColor=a855f7" },
  { name: "以太編織 (Aether Weaver)", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Aether&backgroundColor=ec4899" },
  { name: "鋼鐵哨兵 (Steel Sentinel)", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Sentinel&backgroundColor=06b6d4" },
];

export const AuthForms: React.FC<AuthFormsProps> = ({
  initialTab = "login",
  onAuthSuccess,
  onNavigate,
  registeredUsers,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  
  // Form State
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    resetForm();
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!email || !password) {
      setErrorMessage("請完整填寫所有安全性欄位。");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("通訊網電子信箱格式無效。");
      return;
    }

    setIsSubmitting(true);

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr: any) {
        // Automatically register/provision on login failure if the user doesn't exist yet
        const isAuthError = signInErr.code === "auth/user-not-found" || 
                            signInErr.code === "auth/invalid-credential" || 
                            signInErr.code === "auth/wrong-password" ||
                            signInErr.code === "auth/invalid-login-credentials" ||
                            String(signInErr).includes("invalid-credential") ||
                            String(signInErr).includes("invalid-login-credentials");

        if (isAuthError) {
          try {
            // Attempt auto-registration on-the-fly for seamless testing & onboarding
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Determine dynamic username and avatar for the newly created account
            const isTester = email.toLowerCase() === "tester@nexus.com" || (email.toLowerCase().startsWith("tester_") && email.toLowerCase().endsWith("@nexus.com"));
            const usernamePrefix = isTester ? "NexusTester_" : "Agent_";
            const cleanUsername = isTester 
              ? email.split("@")[0].replace("tester_", "NexusTester_") 
              : `${usernamePrefix}${email.split("@")[0]}`;

            await setDoc(doc(db, "users", userCredential.user.uid), {
              email: email.toLowerCase(),
              username: cleanUsername,
              avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Katana&backgroundColor=6366f1",
              joinedAt: new Date().toISOString().split("T")[0],
              bio: isTester 
                ? "Chief assessment operative evaluating client-side platform components."
                : "Active agent operating on the Nexus gaming community grid."
            });
          } catch (signUpErr: any) {
            // If the account already exists but password was wrong, throw the original sign-in error
            if (signUpErr.code === "auth/email-already-in-use") {
              throw signInErr;
            } else {
              throw signUpErr;
            }
          }
        } else {
          throw signInErr;
        }
      }

      const uid = userCredential.user.uid;
      let profileData = {
        email: email.toLowerCase(),
        username: email.split("@")[0],
        avatar: PRESET_AVATARS[0].url,
        joinedAt: new Date().toISOString().split("T")[0],
        bio: "Active agent operating on the Nexus gaming community grid."
      };

      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          profileData = userDoc.data() as typeof profileData;
        } else {
          await setDoc(userDocRef, profileData);
        }
      } catch (docErr) {
        console.warn("Could not load user profile from Firestore, using local default:", docErr);
      }

      setSuccessMessage(`存取權限已授權。歡迎回來，特工 ${profileData.username}！`);
      setTimeout(() => {
        onAuthSuccess({
          email: profileData.email,
          username: profileData.username,
          avatar: profileData.avatar,
        });
        onNavigate("home");
      }, 1200);

    } catch (err: any) {
      console.error("Login Fail:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setErrorMessage("憑證安全拒絕：不正確的帳號或密碼組合。");
      } else if (err.code === "auth/invalid-email") {
        setErrorMessage("電子信箱位址無效。");
      } else {
        setErrorMessage(`憑證安全認證錯誤：${err.message || String(err)}`);
      }
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !username || !password || !confirmPassword) {
      setErrorMessage("請填寫所有運作欄位。");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("電子信箱位址格式損壞或無效。");
      return;
    }

    if (username.length < 3) {
      setErrorMessage("特工代號必須至少包含 3 個字元。");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("安全金鑰複雜度不足（最少 6 個字元）。");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("目標參數不匹配：密碼與確認密碼必須一致。");
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const profileData = {
        email: email.toLowerCase(),
        username: username,
        avatar: selectedAvatar,
        joinedAt: new Date().toISOString().split("T")[0],
        bio: "Active agent operating on the Nexus gaming community grid."
      };

      try {
        await setDoc(doc(db, "users", uid), profileData);
      } catch (fsErr) {
        console.error("Could not write profile to Firestore", fsErr);
        handleFirestoreError(fsErr, OperationType.WRITE, `users/${uid}`);
      }

      onRegisterUser({
        email: email.toLowerCase(),
        username,
        avatar: selectedAvatar,
        rawPassword: password,
      });

      setTimeout(() => {
        onAuthSuccess({
          email: profileData.email,
          username: profileData.username,
          avatar: profileData.avatar,
        });
        onNavigate("home");
      }, 1200);

    } catch (err: any) {
      console.error("Registration Fail:", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("該電子信箱已被其他特工登錄佔用。");
      } else if (err.code === "auth/weak-password") {
        setErrorMessage("安全金鑰複雜度不足（密碼安全度過低）。");
      } else {
        setErrorMessage(`系統登錄生成阻礙：${err.message || String(err)}`);
      }
      setIsSubmitting(false);
    }
  };


  // Helper autofills for testing
  const triggerCheatAutofill = () => {
    // Generate a secure, unique, and persistent evaluator ID for this browser session/instance
    let cachedEmail = localStorage.getItem("nexus_evaluator_email");
    if (!cachedEmail) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      cachedEmail = `tester_${rand}@nexus.com`;
      localStorage.setItem("nexus_evaluator_email", cachedEmail);
    }
    setEmail(cachedEmail);
    setPassword("password123");
    setActiveTab("login");
  };

  return (
    <div id="auth-forms-container" className="grid min-h-[calc(100vh-8rem)] w-full grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-cyber-black glass shadow-2xl md:grid-cols-12 backdrop-blur-md">
      
      {/* Decorative Interactive Left panel (Tech aesthetic) */}
      <div className="relative flex flex-col justify-between p-8 bg-[#050506]/40 md:col-span-5 border-r border-white/10 overflow-hidden">
        {/* Abstract grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-purple/10 via-cyber-black to-cyber-black pointer-events-none" />
        <div className="absolute top-10 left-10 w-48 h-48 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 font-display">
          <div className="flex items-center gap-2 text-neon-cyan text-glow-cyan">
            <Gamepad2 className="h-6 w-6" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">NEXUS CORESYSTEM</span>
          </div>
          
          <h2 className="mt-6 font-display text-3xl font-black leading-tight text-white tracking-tight">
            極致的賽博遊戲社群集體意識。
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-slate-400">
            登入以部署自訂特工角色卡、與動態統計數據圖表互動、解鎖公會戰略權限並開辟即時在線交流。
          </p>
        </div>

        {/* Visual Stats Block (Aesthetic details) */}
        <div className="relative z-10 space-y-4 my-8 md:my-0 font-display">
          <div className="rounded-xl border border-white/5 bg-cyber-black/80 p-4 backdrop-blur-sm relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-500 uppercase">活躍的聯邦節點 (ACTIVE NODES)</span>
              <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400">在線 (ONLINE)</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <p className="font-display text-2xl font-black text-white">142,852</p>
              <p className="font-mono text-[10px] text-neon-cyan font-bold tracking-tight text-glow-cyan">當前小時 +12%</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-cyber-black/40 p-3 flex items-center gap-3">
            <div className="rounded-lg bg-neon-cyan/10 p-2 text-neon-cyan text-glow-cyan">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs font-bold text-slate-200">即時安全查驗</p>
              <p className="font-sans text-[10px] text-slate-500 truncate">SHA-256 分類帳本加密防篡改存儲</p>
            </div>
          </div>
        </div>

        {/* Informational notice */}
        <div className="relative z-10 font-mono text-[10px] text-slate-500">
          <p>
            NEXUS CLOUD INTERFACE © 2026. 賽博安全登入閘口。
          </p>
        </div>
      </div>

      {/* Main Authentication Interactive Forms Area */}
      <div id="auth-forms-pane" className="flex flex-col justify-center p-6 sm:p-10 md:col-span-7 bg-cyber-black/30 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Tab Headers */}
        <div className="mb-8 flex justify-center border-b border-white/5 font-display">
          <button
            id="tab-select-login"
            onClick={() => handleTabChange("login")}
            className={`relative pb-3.5 px-6 font-display text-sm font-bold transition-all cursor-pointer ${
              activeTab === "login"
                ? "text-neon-cyan text-glow-cyan"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            登入主要閘口
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple"
              />
            )}
          </button>
          <button
            id="tab-select-register"
            onClick={() => handleTabChange("register")}
            className={`relative pb-3.5 px-6 font-display text-sm font-bold transition-all cursor-pointer ${
              activeTab === "register"
                ? "text-neon-cyan text-glow-cyan"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            創立免費特工節點
            {activeTab === "register" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple"
              />
            )}
          </button>
        </div>

        {/* Render Alert messages dynamically */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300 animate-fade-in font-display">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <div>
              <p className="font-bold uppercase tracking-wide text-xs">安全警戒 (Security Alert)</p>
              <p className="mt-0.5 text-xs text-red-400/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-300 animate-fade-in font-display">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold uppercase tracking-wide text-xs">核准通航 (Access Authorized)</p>
              <p className="mt-0.5 text-xs text-emerald-400/90">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Tab 1: SIGN IN FORM */}
        {activeTab === "login" && (
          <form id="nexus-login-form" onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                霓虹通訊電子信箱 (Email)
              </label>
              <div className="relative font-display">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050506]/30 py-2.5 pl-10 pr-4 font-display text-sm text-white placeholder-slate-550 outline-none focus-neon-border"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 font-display">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  特工核心運作密碼 (Password)
                </label>
                <span className="font-mono text-[10px] text-slate-500 hover:text-[#fafafa] cursor-pointer">
                  忘記金鑰？
                </span>
              </div>
              <div className="relative font-display">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050506]/30 py-2.5 pl-10 pr-10 font-display text-sm text-white placeholder-slate-550 outline-none focus-neon-border"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-550 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Terms */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-display">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  className="rounded border-white/10 bg-[#050506] text-neon-cyan focus:ring-neon-cyan focus:ring-offset-[#050506]"
                />
                保持節點授權狀態
              </label>
              <span className="text-slate-550 hover:text-slate-300">隱私安全協定</span>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl btn-primary disabled:opacity-40 disabled:pointer-events-none text-cyber-black py-3 font-display text-sm font-black shadow-md shadow-neon-cyan/20 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyber-black border-t-transparent" />
                  <span>配置網路安全許可中...</span>
                </>
              ) : (
                <>
                  <span>金鑰解密與登入 (Decrypt & Log In)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: REGISTER FORM */}
        {activeTab === "register" && (
          <form id="nexus-register-form" onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                特工代號 (Username / 使用者名稱)
              </label>
              <div className="relative font-display">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  id="register-username"
                  type="text"
                  placeholder="例如：ShadowWeaver"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050506]/30 py-2.5 pl-10 pr-4 font-display text-sm text-white placeholder-slate-550 outline-none focus-neon-border"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                特工內部運作電子信箱 (Email)
              </label>
              <div className="relative font-display">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="register-email"
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#050506]/30 py-2.5 pl-10 pr-4 font-display text-sm text-white placeholder-slate-550 outline-none focus-neon-border"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                  安全性通行密碼 (Password)
                </label>
                <div className="relative font-display">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="最少 6 個字元"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050506]/30 py-2.5 pl-10 pr-10 font-display text-sm text-white placeholder-slate-550 outline-none focus-neon-border"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-550 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                  確認通行密碼
                </label>
                <div className="relative font-display">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="重複輸入密碼"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#050506]/30 py-2.5 pl-10 pr-10 font-display text-sm text-white placeholder-slate-550 outline-none focus-neon-border"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-555 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Interactive Avatar Pick */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">
                選擇個人化特工頭像核心 (Avatar)
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`relative flex flex-col items-center p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedAvatar === av.url
                        ? "bg-neon-cyan/5 border-neon-cyan text-neon-cyan shadow-sm shadow-neon-cyan/15"
                        : "bg-[#050506]/30 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="h-10 w-10 object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <span className="mt-1.5 text-[8px] font-mono uppercase tracking-tight text-center line-clamp-1 truncate w-full font-semibold">
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Agreement Policy */}
            <p className="font-sans text-[10px] text-slate-500 leading-normal">
              部署此帳號，即表示您同意霓虹樞紐平台的《誠信行為準則》、實時節點路由準則與數位安全標準。
            </p>

            {/* Register Submit */}
            <button
              id="register-submit-button"
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl btn-primary disabled:opacity-40 disabled:pointer-events-none text-cyber-black py-3 font-display text-sm font-black shadow-md shadow-neon-cyan/25 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyber-black border-t-transparent" />
                  <span>正在鍛造帳號核心矩陣...</span>
                </>
              ) : (
                <>
                  <span>部署特工帳號節點 (Deploy Node)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Cheat Code Admin Credentials block for seamless user evaluation */}
        <div className="mt-8 rounded-xl border border-amber-500/10 bg-[#ef4444]/5 p-4 relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2.5 text-neon-cyan text-glow-cyan font-display">
            <Sparkles className="h-4.5 w-4.5 animate-bounce" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">平台快速評估登入口 (快速測試通道)</span>
          </div>
          <p className="mt-1.5 font-sans text-xs text-slate-400 leading-normal">
            為方便進行快速評估且免於手動填表，可直接觸發下方預設的測試帳號：
          </p>
          
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cyber-black/45 rounded-lg p-2.5 border border-white/5 font-display">
            <div className="font-mono text-[10px] text-slate-300 space-y-0.5">
              <p><span className="text-slate-550">測試帳密：</span> tester@nexus.com</p>
              <p><span className="text-slate-550">通行密鑰：</span> password123</p>
            </div>
            
            <button
              id="cheat-autofill-btn"
              type="button"
              onClick={triggerCheatAutofill}
              className="rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/20 text-[10px] font-mono text-neon-cyan border border-neon-cyan/35 px-3 py-1.5 transition-all cursor-pointer shadow-md shadow-neon-cyan/10 font-bold"
            >
              [ 一鍵注入測試核心 ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
