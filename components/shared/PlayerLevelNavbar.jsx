"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { IMAGE_BASE_URL } from "@/constants/api";
import { postFormData, postWithParams } from "@/services/apiService";
import { toast } from "react-toastify";
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
  Pencil,
  Check,
  Upload,
  ArrowRight,
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
  userLevel = false,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localLogo, setLocalLogo] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [localName, setLocalName] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const playerEntries = useSelector((state) => state.player?.players || {});
  const playerEntry = Object.values(playerEntries)?.[0] || null;

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const fileInputRef = useRef(null);

  const handleLogoClick = () => {
    if (!demoLadderName) {
      setShowLogoModal(true);
    }
  };

  const handleLogoUpload = (e) => {
    if (demoLadderName) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedLogoPreview(previewUrl);
  };

  const confirmLogoUpload = async () => {
    if (demoLadderName || !selectedLogoFile || !ladderId) return;

    setIsUploadingLogo(true);
    const originalLogo = localLogo || playerEntry?.ladderDetails?.logo || null;

    // Set preview in UI instantly
    setLocalLogo(selectedLogoPreview);

    const formData = new FormData();
    formData.append("logo", selectedLogoFile);
    formData.append("ladder_id", ladderId);

    try {
      const response = await postFormData("/user/updateladderlogo", formData);
      if (response?.status === 200 || response?.status === true) {
        toast.success("Logo updated successfully!");
        if (response?.logo) {
          setLocalLogo(response.logo);
        } else if (response?.data?.logo) {
          setLocalLogo(response.data.logo);
        }
        setShowLogoModal(false);
        setSelectedLogoFile(null);
        setSelectedLogoPreview(null);
      } else {
        setLocalLogo(originalLogo);
        let errorMsg = "Logo upload failed";
        if (response?.error_message?.logo?.[0]) {
          errorMsg = response.error_message.logo[0];
        } else if (response?.message) {
          errorMsg = response.message;
        }
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setLocalLogo(originalLogo);
      const errorData = err.response?.data;
      let errorMsg = "Logo upload failed";
      if (errorData?.error_message?.logo?.[0]) {
        errorMsg = errorData.error_message.logo[0];
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsUploadingLogo(false);
    }
  };
  const resolvedLadderName =
    localName || ladderName || demoLadderName || playerEntry?.ladderDetails?.name || "Football Ladder";
  const resolvedPlayerCount =
    liveCount ?? playerEntry?.data?.length ?? 0;
  const resolvedType = ladderType || playerEntry?.ladderDetails?.type || "";
  const resolvedTypeLabel = formatLadderType(resolvedType);

  const logo = localLogo || playerEntry?.ladderDetails?.logo || null;
  const imagePath =
    logo && logo !== "null"
      ? logo.startsWith("http") || logo.startsWith("blob:")
        ? logo
        : `${IMAGE_BASE_URL}/${logo}`
      : null;

  useEffect(() => {
    if (resolvedLadderName) {
      setEditedName(resolvedLadderName);
    }
  }, [resolvedLadderName]);

  const handleNameEdit = () => {
    if (!demoLadderName) {
      setEditedName(resolvedLadderName);
      setIsEditingName(true);
    }
  };

  const cancelNameEdit = () => {
    setEditedName(resolvedLadderName);
    setIsEditingName(false);
  };

  const triggerConfirmation = () => {
    if (!demoLadderName && editedName.trim() && editedName.trim() !== resolvedLadderName) {
      setShowConfirmDialog(true);
    } else {
      setIsEditingName(false);
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      triggerConfirmation();
    } else if (e.key === "Escape") {
      cancelNameEdit();
    }
  };

  const saveName = async () => {
    if (demoLadderName) return;
    if (!ladderId || !editedName.trim()) return;

    const originalName = localName || resolvedLadderName;
    const newName = editedName.trim();

    // Instant dynamic update to the UI
    setLocalName(newName);
    setIsEditingName(false);
    setShowConfirmDialog(false);

    try {
      const response = await postWithParams("/user/updateladdername", {
        ladder_id: ladderId,
        name: newName
      });

      if (response?.status === 200 || response?.status === true) {
        toast.success("Ladder name updated successfully!");
      } else {
        setLocalName(originalName);
        toast.error(response?.message || "Failed to update ladder name");
      }
    } catch (error) {
      console.error("Name update error:", error);
      setLocalName(originalName);
      toast.error("Failed to update ladder name");
    }
  };

  const isPlayersPage = activeTab === "players" || userLevel;
  const showQuickGuide = !isPlayersPage && !userLevel;
  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  const displayName = user?.name || "Guest";
  const roleLabel =
    user?.user_type === "admin"
      ? "Admin"
      : user?.user_type === "sub_admin"
      ? "Sub Admin"
      : "Player";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedAdmin = sessionStorage.getItem("userData");
      const storedSubAdmin = sessionStorage.getItem("subAdmin");
      const storedUser = sessionStorage.getItem("user");
      const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
      const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;
      const normalUser = storedUser ? JSON.parse(storedUser) : null;

      if (admin?.user_type === "admin") {
        setUser(admin);
        return;
      }
      if (subAdmin?.user_type === "sub_admin") {
        setUser(subAdmin);
        return;
      }
      if (normalUser) {
        setUser(normalUser);
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
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div
                  className={`relative h-10 w-10 shrink-0 ${demoLadderName ? "" : "cursor-pointer"}`}
                  onClick={handleLogoClick}
                >
                  <Image
                    src={imagePath || "/game.png"}
                    alt="Ladder Logo"
                    width={40}
                    height={40}
                    className="rounded-full border border-white/10 shadow-md object-cover h-10 w-10"
                    unoptimized
                  />

                  {!demoLadderName && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white p-0.5 rounded-full shadow border border-gray-100 flex items-center justify-center">
                      <Pencil className="w-2.5 h-2.5 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <input
                        className={`text-p4 md:text-h5 font-extrabold tracking-[0.08em] bg-transparent border-b-2 focus:outline-none px-1 py-0.5 max-w-[140px] sm:max-w-xs md:max-w-md ${
                          mounted && theme !== "dark" ? "text-primary border-blue-600" : "text-white border-blue-500"
                        }`}
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleNameKeyPress}
                        autoFocus
                      />
                      <button
                        onClick={triggerConfirmation}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center shrink-0"
                        title="Save Name"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </button>
                      <button
                        onClick={cancelNameEdit}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center shrink-0"
                        title="Cancel Edit"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/title min-w-0">
                      <h1
                        className={`truncate text-shadow-muted text-[12px] md:text-h5 font-extrabold tracking-[0.08em] ${
                          mounted && theme !== "dark" ? "text-primary" : "text-[var(--best-board-text)]"
                        }`}
                      >
                        {resolvedTypeLabel ? `${resolvedLadderName} ` : resolvedLadderName}
                      </h1>

                      {!demoLadderName && (
                        <button
                          onClick={handleNameEdit}
                          className="p-1 rounded-full hover:bg-white/10 transition-all flex items-center justify-center shrink-0"
                          title="Edit Ladder Name"
                        >
                          <Pencil className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="mt-1 truncate text-[8px] md:text-p3 font-medium uppercase tracking-[0.28em] text-primary">
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



            <div className="flex items-center gap-2">
              
              {!userLevel && (
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

              <div className="relative hidden md:block" ref={profileRef}>
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

                    {!userLevel && (
                      <>
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
                      </>
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

              {!userLevel && (
                <button
                  onClick={() => setMobileOpen((previous) => !previous)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
                  aria-label="Toggle mobile menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="border-t border-nav-border px-4 pb-4 pt-2 md:hidden flex flex-col gap-1"
            style={{ background: "var(--navbar-bg)" }}
          >
            {/* User profile header in mobile menu */}
            <div className="border-b border-white/10 px-3 py-2.5 mb-2">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>

            {/* Dashboard / Admin options */}
            {!userLevel && (
              <>
                <button
                  onClick={() => {
                    handleDashboard();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                >
                  <Shield className="h-4 w-4 text-blue-400" />
                  {user?.user_type === "sub_admin" ? "Sub-Admin Dashboard" : "Admin Dashboard"}
                </button>

                {user?.user_type === "admin" && (
                  <button
                    onClick={() => {
                      router.push(createClubId);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <UserCircle2 className="h-4 w-4 text-blue-400" />
                    Generate Club ID
                  </button>
                )}

                {user?.user_type === "admin" && (
                  <button
                    onClick={() => {
                      setIsChangePasswordOpen(true);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <Key className="h-4 w-4 text-emerald-400" />
                    Change Password
                  </button>
                )}
              </>
            )}

            {/* Q & A Link */}
            <button
              onClick={() => {
                window.open("/q-a", "_blank");
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <HelpCircle className="h-4 w-4 text-slate-400" />
              Q &amp; A
            </button>

            {/* Quick Guide (if applicable) */}
            {showQuickGuide && (
              <button
                onClick={() => {
                  setQuickGuideOpen(true);
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left"
                style={{ color: "#7dd3fc" }}
              >
                <BookOpen className="h-4 w-4" />
                Quick Guide
              </button>
            )}

            <div className="my-1 border-t border-white/10" />

            {/* Logout Option */}
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
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

      {showConfirmDialog && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className={`max-w-md p-6 rounded-2xl border shadow-2xl backdrop-blur-md ${
            mounted && theme !== "dark" ? "bg-white text-gray-900 border-gray-100" : "bg-zinc-900/90 text-white border-zinc-800"
          }`}>
            <DialogTitle className="text-xl font-bold mb-2">Confirm Name Change</DialogTitle>
            <div className="text-sm opacity-80 mb-6">
              Are you sure you want to change the ladder name from <span className="font-semibold">"{resolvedLadderName}"</span> to <span className="font-semibold text-blue-500">"{editedName.trim()}"</span>?
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mounted && theme !== "dark" ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={saveName}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg shadow-blue-600/20"
              >
                Confirm
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showLogoModal && (
        <Dialog open={showLogoModal} onOpenChange={setShowLogoModal}>
          <DialogContent className={`max-w-md p-6 rounded-2xl border shadow-2xl backdrop-blur-md ${
            mounted && theme !== "dark" ? "bg-white text-gray-900 border-gray-100" : "bg-zinc-900/90 text-white border-zinc-800"
          }`}>
            <DialogTitle className="text-xl font-bold mb-4 text-center">Update Ladder Logo</DialogTitle>
            
            {selectedLogoPreview ? (
              <div className="flex flex-col items-center py-4">
                <div className="flex items-center justify-center gap-6 sm:gap-10">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-md">
                      <Image
                        src={imagePath || "/game.png"}
                        alt="Old Logo"
                        width={96}
                        height={96}
                        className="rounded-full object-cover h-24 w-24"
                        unoptimized
                      />
                    </div>
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-60">Current</span>
                  </div>

                  <div className="flex items-center justify-center shrink-0">
                    <ArrowRight className="w-6 h-6 opacity-40 animate-pulse text-blue-500" />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg shadow-blue-500/20">
                      <Image
                        src={selectedLogoPreview}
                        alt="New Logo"
                        width={96}
                        height={96}
                        className="rounded-full object-cover h-24 w-24 animate-fade-in"
                        unoptimized
                      />
                    </div>
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-500 font-bold">New Logo</span>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4"
                >
                  Choose a different image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700 flex items-center justify-center shadow-lg bg-gray-50 dark:bg-zinc-800">
                  <Image
                    src={imagePath || "/game.png"}
                    alt="Current Logo"
                    width={128}
                    height={128}
                    className="rounded-full object-cover h-32 w-32"
                    unoptimized
                  />
                </div>
                <p className="mt-4 text-sm font-medium opacity-70">Current Logo</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/10 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Logo
                </button>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4 border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setShowLogoModal(false);
                  setSelectedLogoFile(null);
                  setSelectedLogoPreview(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  mounted && theme !== "dark" ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                Close
              </button>
              {selectedLogoPreview && (
                <button
                  onClick={confirmLogoUpload}
                  disabled={isUploadingLogo}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  {isUploadingLogo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm & Save"
                  )}
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PlayerLevelNavbar;
