"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
  Sun,
  Moon,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { clubIdPage, subAdminPage, adminPage, createClubId } from "@/helper/RouteName";
import { resetUserState } from "@/redux/slices/userSlice";
import ChangePassword from "@/components/pages/admin/ChangePassword";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const NAV_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Competitions", icon: Trophy, key: "competitions" },
  { label: "Players", icon: Users, key: "players" },
  { label: "Reports", icon: BarChart3, key: "reports" },
];

const formatLadderType = (type) => {
  const map = {
    best5: "Best of 5",
    best3: "Best of 3",
    winlose: "Win / Lose",
  };

  return map[type] || "";
};

const PlayerLevelNavbar = ({
  activeTab = "players",
  ladderName,
  demoLadderName,
  liveCount,
  ladderType,
  searchValue = "",
  onSearchChange,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [mounted, setMounted] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const playerEntries = useSelector((state) => state.player?.players || {});
  const playerEntry = Object.values(playerEntries)?.[0] || null;
  const resolvedLadderName =
    ladderName || demoLadderName || playerEntry?.ladderDetails?.name || "Football Ladder";
  const resolvedPlayerCount =
    liveCount ?? playerEntry?.data?.length ?? 0;
  const resolvedType = ladderType || playerEntry?.ladderDetails?.type || "";
  const resolvedTypeLabel = formatLadderType(resolvedType);

  const isPlayersPage = activeTab === "players";
  const showQuickGuide = !isPlayersPage;
  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  const displayName = user?.name || "Guest";
  const roleLabel = user?.user_type === "sub_admin" ? "Sub Admin" : "Admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedAdmin = sessionStorage.getItem("userData");
      const storedSubAdmin = sessionStorage.getItem("subAdmin");
      const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
      const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;

      if (admin?.user_type === "admin") {
        setUser(admin);
        return;
      }
      if (subAdmin?.user_type === "sub_admin") {
        setUser(subAdmin);
        return;
      }
      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("subAdmin");
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
    dispatch(resetUserState());

    if (user?.user_type === "admin") {
      router.push("/login-page");
      return;
    }
    if (user?.user_type === "sub_admin") {
      router.push(clubIdPage);
      return;
    }
    router.push("/login-user");
  };

  const handleDashboard = () => {
    if (user?.user_type === "admin") {
      router.push(adminPage);
    } else if (user?.user_type === "sub_admin") {
      router.push(subAdminPage);
    }
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const handleTabClick = (key) => {
    setCurrentTab(key);
    if (key === "dashboard") {
      handleDashboard();
    }
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-0 z-50 w-full backdrop-blur-[20px]"
        style={{
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--navbar-border)",
        }}
      >
        <div className="mx-auto w-full px-2.5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex h-14 items-center justify-between gap-3">
            {isPlayersPage ? (
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="best-board-pill flex h-10 min-w-14 items-center justify-center rounded-lg px-3 text-sm font-bold">
                  {resolvedType === "best3" ? "B3" : resolvedType === "winlose" ? "W/L" : "B5"}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-shadow-muted text-p4 md:text-h5 font-extrabold tracking-[0.08em] text-white">
                    {resolvedTypeLabel ? `${resolvedLadderName} ` : resolvedLadderName}
                  </h1>
                  <p className="mt-1 truncate text-h7 md:text-p3 font-medium uppercase tracking-[0.28em] text-primary">
                    {`Live Rankings · ${resolvedPlayerCount} players`}
                  </p>
                </div>
              </div>
            ) : (
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
                <span className="hidden text-sm font-bold text-nav-text sm:block">
                  Sports <span style={{ color: "#29abe2" }}>Pro</span>
                </span>
              </button>
            )}

            {!isPlayersPage && (
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ label, key }) => {
                  const isActive = currentTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleTabClick(key)}
                      className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
                      style={{
                        color: isActive ? "var(--primary)" : "var(--foreground)",
                        opacity: isActive ? 1 : 0.6,
                        background: isActive ? "rgba(41,171,226,0.14)" : "transparent",
                        border: isActive ? "1px solid rgba(41,171,226,0.25)" : "1px solid transparent",
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
            )}

            <div className="flex items-center gap-2">
              {isPlayersPage && (
                <div className="relative hidden sm:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder="Search player..."
                    className="h-8 w-[220px] rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-400"
                  />
                </div>
              )}

              {showQuickGuide && (
                <button
                  onClick={() => setQuickGuideOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(41,171,226,0.12)",
                    border: "1px solid rgba(41,171,226,0.28)",
                    color: "#7dd3fc",
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Quick Guide
                </button>
              )}

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Toggle theme"
              >
                {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
              </button>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((previous) => !previous)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg,#29abe2,#1a3a8f)",
                    boxShadow: profileOpen ? "0 0 0 2px rgba(41,171,226,0.45)" : "none",
                  }}
                  aria-label="User menu"
                >
                  {userInitial}
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-10 z-50 w-52 rounded-xl py-2 shadow-2xl"
                    style={{
                      background: "var(--navbar-bg)",
                      border: "1px solid var(--navbar-border)",
                    }}
                  >
                    <div className="border-b border-white/10 px-4 py-2">
                      <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                      <p className="text-xs text-slate-400">{roleLabel}</p>
                    </div>

                    <button
                      onClick={handleDashboard}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                    >
                      <Shield className="h-4 w-4 text-blue-400" />
                      {user?.user_type === "sub_admin" ? "Sub-Admin Dashboard" : "Admin Dashboard"}
                    </button>

                    {user?.user_type === "admin" && (
                      <button
                        onClick={() => {
                          router.push(createClubId);
                          setProfileOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                      >
                        <UserCircle2 className="h-4 w-4 text-blue-400" />
                        Generate Club ID
                      </button>
                    )}

                    {user?.user_type === "admin" && (
                      <button
                        onClick={() => {
                          setIsChangePasswordOpen(true);
                          setProfileOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                      >
                        <Key className="h-4 w-4 text-emerald-400" />
                        Change Password
                      </button>
                    )}

                    <button
                      onClick={() => {
                        window.open("/q-a", "_blank");
                        setProfileOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                    >
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      Q &amp; A
                    </button>

                    <div className="my-1 border-t border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileOpen((previous) => !previous)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="border-t border-nav-border px-4 pb-4 pt-2 md:hidden"
            style={{ background: "var(--navbar-bg)" }}
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

            {showQuickGuide && (
              <button
                onClick={() => {
                  setQuickGuideOpen(true);
                  setMobileOpen(false);
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                style={{ color: "#7dd3fc" }}
              >
                <BookOpen className="h-4 w-4" />
                Quick Guide
              </button>
            )}
          </div>
        )}
      </nav>

      <div className="h-14 w-full" />

      {quickGuideOpen && (
        <Dialog open={quickGuideOpen} onOpenChange={setQuickGuideOpen}>
          <DialogContent className="max-w-xl bg-slate-100 text-slate-900">
            <DialogTitle className="text-lg font-bold">Quick Guide</DialogTitle>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 font-semibold text-slate-800">Players Tab</p>
                <p>View and manage all players in this competition. Click any player card to edit details, update scores, or change status.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 font-semibold text-slate-800">Competitions</p>
                <p>Browse all active competitions. Use the add, remove, and move controls in the sidebar to manage player placement.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-1 font-semibold text-slate-800">Admin Controls</p>
                <p>Use the action buttons such as reset, sort, and age filter to manage leaderboard data.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <DialogClose className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Got it
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isChangePasswordOpen && user && (
        <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
          <DialogContent className="w-[400px] rounded-xl p-6">
            <DialogTitle className="mb-4 text-center text-lg font-semibold">
              Change Password
            </DialogTitle>
            <ChangePassword userId={user.id} />
            <div className="mt-4 flex justify-center">
              <DialogClose className="rounded-lg bg-red-500 px-4 py-2 text-white hover:opacity-90">
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
