"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Lock, 
  LogOut, 
  Sun, 
  Moon, 
  Search, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Building2,
  Clock3,
  Settings,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- CUSTOM EXTRACTED COMPONENTS ---
import RegisteredSportsClubsTab from "@/components/super-admin/RegisteredSportsClubsTab";
import AnalyticsGrowthTab from "@/components/super-admin/AnalyticsGrowthTab";
import SystemSettingsTab from "@/components/super-admin/SystemSettingsTab";

export default function SuperAdminPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // --- AUTH STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // --- DASHBOARD STATES ---
  const [activeTab, setActiveTab] = useState("clubs");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem("superAdminToken");
    if (token === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // --- LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.warning("Please fill in all credentials");
      return;
    }
    setAuthLoading(true);
    
    setTimeout(() => {
      if (username.trim().toLowerCase() === "graham jaggers" && password === "Abcd@1234") {
        sessionStorage.setItem("superAdminToken", "true");
        setIsLoggedIn(true);
        toast.success("Welcome, Super Admin graham jaggers! 👑");
      } else {
        toast.error("Invalid Username or Password");
      }
      setAuthLoading(false);
    }, 800);
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    sessionStorage.removeItem("superAdminToken");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    toast.info("Logged out successfully");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          // ==================== LOGIN SCREEN ====================
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen items-center justify-center p-4"
            style={{
              background: "var(--page-glow-corners), var(--ladder-shell-bg)"
            }}
          >
            <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl backdrop-blur-md text-foreground">
              {/* Header Branding */}
              <div className="text-center mb-8">
                <div className="mb-5 flex items-center justify-center">
                  <img 
                    src="/topLogo.png" 
                    alt="AOU Logo" 
                    className="h-20 w-auto object-contain drop-shadow-md" 
                  />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-wide text-foreground">
                  Super Admin
                </h2>
                <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1.5">
                  Sports Solutions Pro Portal
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-11 h-12 bg-muted border-input text-foreground focus-visible:ring-primary text-base rounded-xl"
                      disabled={authLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 bg-muted border-input text-foreground focus-visible:ring-primary text-base rounded-xl"
                      disabled={authLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-13 mt-4 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Secure Log In</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center border-t border-border/50 pt-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Graham Jaggers Access Only
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          // ==================== DASHBOARD SCREEN ====================
          <motion.div
            key="dashboard-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col min-h-screen"
            style={{
              background: "var(--page-glow-corners), var(--ladder-shell-bg)"
            }}
          >
            {/* Header / Navbar */}
            <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border text-foreground px-4 py-3.5 sm:px-8">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Branding */}
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/topLogo.png" 
                    alt="AOU Logo" 
                    className="h-8 w-auto object-contain" 
                  />
                  <div>
                    <h1 className="text-lg font-black tracking-tight uppercase leading-none">
                      SSP
                    </h1>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Super Admin Portal
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* User Profile Info */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black text-foreground uppercase tracking-wider">
                      Graham Jaggers
                    </span>
                  </div>

                  {/* Light/Dark Toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-10 h-10 rounded-xl border-border hover:bg-muted text-foreground"
                    title="Toggle Theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-indigo-500" />
                    )}
                  </Button>

                  {/* Log Out */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="h-10 px-4 gap-2 rounded-xl border-border text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/35 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline font-bold uppercase text-[10px] tracking-wider">Log Out</span>
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Workspace Layout with Sidebar */}
            <div className="flex-grow flex flex-col md:flex-row w-full">
              {/* Sidebar (Sticky on desktop, horizontal scroll on mobile) */}
              <aside className="w-full md:w-64 shrink-0 bg-card/30 backdrop-blur-md border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col gap-2 md:sticky md:top-[72px] md:h-[calc(100vh-72px)] md:overflow-y-auto">
                <div className="hidden md:block mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3">
                    Workspace Modules
                  </span>
                </div>
                <div className="flex flex-row md:flex-col gap-1 md:gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                  {/* Tab 1: Registered Sports Clubs */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("clubs")}
                    className={`flex items-center gap-2 md:gap-2.5 px-4 md:px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap md:whitespace-normal border-l-2 md:border-l-4 transition-all duration-200 text-left cursor-pointer ${
                      activeTab === "clubs"
                        ? "bg-primary/10 text-primary border-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Registered Sports Clubs</span>
                  </button>

                  {/* Tab 2: Analytics & Growth */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("analytics")}
                    className={`flex items-center gap-2 md:gap-2.5 px-4 md:px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap md:whitespace-normal border-l-2 md:border-l-4 transition-all duration-200 text-left cursor-pointer ${
                      activeTab === "analytics"
                        ? "bg-primary/10 text-primary border-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <span>Analytics & Growth</span>
                  </button>

                  {/* Tab 3: System Settings */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center gap-2 md:gap-2.5 px-4 md:px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap md:whitespace-normal border-l-2 md:border-l-4 transition-all duration-200 text-left cursor-pointer ${
                      activeTab === "settings"
                        ? "bg-primary/10 text-primary border-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>System Settings</span>
                  </button>
                </div>
              </aside>

              {/* Workspace Panels (Scrolls independently on desktop) */}
              <main className="flex-grow p-4 sm:p-8 min-w-0 min-h-[600px]">
                <AnimatePresence mode="wait">
                  {activeTab === "clubs" ? (
                    <motion.div
                      key="clubs-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8 max-w-7xl mx-auto"
                    >
                      <RegisteredSportsClubsTab />
                    </motion.div>
                  ) : activeTab === "analytics" ? (
                    <motion.div
                      key="analytics-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnalyticsGrowthTab />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="settings-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SystemSettingsTab />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center border-t border-border mt-12 bg-card/40">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Sports Solutions Pro — Secure Platform Management Portal
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
