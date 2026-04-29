"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  LogOut,
  UserCircle2,
  Shield,
  Key,
  HelpCircle,
  Menu,
  X,
  LayoutDashboard,
  Trophy,
  Users,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { clubIdPage, subAdminPage, adminPage, createClubId } from "@/helper/RouteName";
import { resetUserState } from "@/redux/slices/userSlice";
import ChangePassword from "@/components/pages/admin/ChangePassword";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// ─── Nav link definitions ─────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Competitions", icon: Trophy, key: "competitions" },
  { label: "Players", icon: Users, key: "players" },
  { label: "Reports", icon: BarChart3, key: "reports" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const PlayerLevelNavbar = ({ activeTab = "players", ladderName, demoLadderName }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ── Load user from sessionStorage ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedAdmin = sessionStorage.getItem("userData");
      const storedSubAdmin = sessionStorage.getItem("subAdmin");
      const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
      const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;

      if (admin?.user_type === "admin") { setUser(admin); return; }
      if (subAdmin?.user_type === "sub_admin") { setUser(subAdmin); return; }
      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("subAdmin");
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
    dispatch(resetUserState());

    if (user?.user_type === "admin") { router.push("/login-page"); return; }
    if (user?.user_type === "sub_admin") { router.push(clubIdPage); return; }
    router.push("/login-user");
  };

  const handleDashboard = () => {
    if (user?.user_type === "admin") router.push(adminPage);
    else if (user?.user_type === "sub_admin") router.push(subAdminPage);
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const handleTabClick = (key) => {
    setCurrentTab(key);
    if (key === "dashboard") handleDashboard();
    setMobileOpen(false);
  };

  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  const displayName = user?.name || "Guest";
  const roleLabel = user?.user_type === "sub_admin" ? "Sub Admin" : "Admin";

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{
          background: "linear-gradient(180deg, #0d1117 0%, #0a0f1a 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto w-full px-2.5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex h-14 items-center justify-between gap-3">

            {/* ── Logo ──────────────────────────────────────────────────────── */}
            <button
              onClick={handleDashboard}
              className="flex shrink-0 items-center gap-2 group"
              aria-label="Go to dashboard"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg,#29abe2,#1a3a8f)" }}
              >
                <span className="text-xs font-black text-white">S</span>
              </div>
              <span className="hidden text-sm font-bold text-white sm:block">
                Sports <span style={{ color: "#29abe2" }}>Pro</span>
              </span>
            </button>

            {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, icon: Icon, key }) => {
                const isActive = currentTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                      background: isActive ? "rgba(41,171,226,0.14)" : "transparent",
                      border: isActive ? "1px solid rgba(41,171,226,0.25)" : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    }}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
                        style={{ background: "#29abe2" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Right Controls ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {/* Quick Guide button */}
              <button
                onClick={() => setQuickGuideOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                style={{
                  background: "rgba(41,171,226,0.12)",
                  border: "1px solid rgba(41,171,226,0.28)",
                  color: "#7dd3fc",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(41,171,226,0.22)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(41,171,226,0.12)"; }}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Quick Guide
              </button>

              {/* User Avatar / Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg,#29abe2,#1a3a8f)",
                    boxShadow: profileOpen ? "0 0 0 2px rgba(41,171,226,0.45)" : "none",
                  }}
                  aria-label="User menu"
                >
                  {userInitial}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-10 w-52 rounded-xl py-2 z-50 shadow-2xl"
                    style={{
                      background: "#0d1117",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {/* User info header */}
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-400">{roleLabel}</p>
                    </div>

                    {/* Dashboard */}
                    <button
                      onClick={handleDashboard}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Shield className="h-4 w-4 text-blue-400" />
                      {user?.user_type === "sub_admin" ? "Sub-Admin Dashboard" : "Admin Dashboard"}
                    </button>

                    {/* Admin-only: Generate Club ID */}
                    {user?.user_type === "admin" && (
                      <button
                        onClick={() => { router.push(createClubId); setProfileOpen(false); }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <UserCircle2 className="h-4 w-4 text-blue-400" />
                        Generate Club ID
                      </button>
                    )}

                    {/* Change Password */}
                    {user?.user_type === "admin" && (
                      <button
                        onClick={() => { setIsChangePasswordOpen(true); setProfileOpen(false); }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Key className="h-4 w-4 text-emerald-400" />
                        Change Password
                      </button>
                    )}

                    {/* Q & A */}
                    <button
                      onClick={() => { window.open("/q-a", "_blank"); setProfileOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      Q &amp; A
                    </button>

                    <div className="my-1 border-t border-white/10" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setMobileOpen((p) => !p)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors md:hidden"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────────────── */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-white/10 px-4 pb-4 pt-2"
            style={{ background: "#0d1117" }}
          >
            {NAV_LINKS.map(({ label, icon: Icon, key }) => {
              const isActive = currentTab === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                    background: isActive ? "rgba(41,171,226,0.14)" : "transparent",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: isActive ? "#29abe2" : "inherit" }} />
                  {label}
                </button>
              );
            })}

            {/* Quick Guide in mobile */}
            <button
              onClick={() => { setQuickGuideOpen(true); setMobileOpen(false); }}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              style={{ color: "#7dd3fc" }}
            >
              <BookOpen className="h-4 w-4" />
              Quick Guide
            </button>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-14 w-full" />
      {/* ── Quick Guide Dialog ───────────────────────────────────────────────── */}
      {quickGuideOpen && (
        <Dialog open={quickGuideOpen} onOpenChange={setQuickGuideOpen}>
          <DialogContent className="bg-slate-100 text-slate-900 max-w-xl">
            <DialogTitle className="text-lg font-bold">Quick Guide</DialogTitle>
            <div className="space-y-3 text-sm leading-relaxed text-slate-700 mt-2">
              <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">📋 Players Tab</p>
                <p>View and manage all players in this competition. Click any player card to edit details, update scores, or change status.</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">🏆 Competitions</p>
                <p>Browse all active competitions. Use the ADD/REMOVE/MOVE controls in the sidebar to manage player placement.</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">⚙️ Admin Controls</p>
                <p>Use the action buttons (RESET, SORT, AGE FILTER) to manage leaderboard data. These are only visible to Admins and Sub-Admins.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <DialogClose className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors">
                Got it
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Change Password Dialog ────────────────────────────────────────────── */}
      {isChangePasswordOpen && user && (
        <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
          <DialogContent className="w-[400px] rounded-xl p-6">
            <DialogTitle className="text-lg font-semibold text-center mb-4">
              Change Password
            </DialogTitle>
            <ChangePassword userId={user.id} />
            <div className="mt-4 flex justify-center">
              <DialogClose className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90">
                Close
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PlayerLevelNavbar;
