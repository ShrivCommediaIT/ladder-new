"use client";

import { getUserImage } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import topLogo from "@/public/topLogo.png";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Sun,
  Moon,
  Search,
  Pencil,
  Check,
  Upload,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { clubIdPage, subAdminPage, adminPage, createClubId, submitPerformancePage } from "@/helper/RouteName";
import { resetUserState } from "@/redux/slices/userSlice";
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

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const Navbar = ({
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

  useEffect(() => {
    return () => {
      if (selectedLogoPreview) URL.revokeObjectURL(selectedLogoPreview);
    };
  }, [selectedLogoPreview]);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isSubmitPerformance = pathname === "/submit-performance" || pathname?.includes("/submit-performance");
  const isClubIdPage = pathname === "/clubid-page" || pathname?.includes("/clubid-page");
  const ladderId = searchParams.get("ladder_id");

  const playerEntries = useSelector((state) => state.player?.players || EMPTY_OBJECT);
  const playerEntry = ladderId 
    ? (playerEntries[Number(ladderId)] || playerEntries[ladderId] || null) 
    : (Object.values(playerEntries)?.[0] || null);
  const fileInputRef = useRef(null);

  // Players selectors for all board types
  const skillPlayers = useSelector((state) => state.skillLeaderboard?.data || EMPTY_ARRAY);
  const positivePlayers = useSelector((state) => state.positiveLeaderBoard?.data || EMPTY_ARRAY);
  const negativePlayers = useSelector((state) => state.negativeLeaderBoard?.data || EMPTY_ARRAY);
  const rosterPlayers = useSelector((state) => state.rosterLeaderboard?.data || EMPTY_ARRAY);
  const minileagueDataSelector = useSelector((state) => state.minileague?.data || EMPTY_ARRAY);
  const standardPlayers = useSelector((state) => ladderId ? state.player?.players?.[Number(ladderId)]?.data || EMPTY_ARRAY : EMPTY_ARRAY);

  // Ladder details selectors for all board types
  const skillLadderDetails = useSelector((state) => state.skillLeaderboard?.ladderDetails);
  const positiveLadderDetails = useSelector((state) => state.positiveLeaderBoard?.ladderDetails);
  const negativeLadderDetails = useSelector((state) => state.negativeLeaderBoard?.ladderDetails);
  const rosterLadderDetails = useSelector((state) => state.rosterLeaderboard?.ladderDetails);
  const minileagueLadderDetails = useSelector((state) => state.minileague?.ladderDetails);
  const standardLadderDetails = useSelector((state) => ladderId ? state.player?.players?.[Number(ladderId)]?.ladderDetails : null);

  const handleLogoClick = () => {
    if (!demoLadderName && !userLevel) {
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
  const activeType = ladderType || playerEntry?.ladderDetails?.type || searchParams.get("type") || searchParams.get("ladder_type") || "";
  const isSkill = activeType === "skill";
  const isPositive = activeType === "positive";
  const isNegative = activeType === "negative";
  const isRoster = activeType === "roster";
  const isMiniLeague = activeType === "minileague";

  let computedLadderName = "";
  if (isSkill && skillLadderDetails?.name) {
    computedLadderName = skillLadderDetails.name;
  } else if (isPositive && positiveLadderDetails?.name) {
    computedLadderName = positiveLadderDetails.name;
  } else if (isNegative && negativeLadderDetails?.name) {
    computedLadderName = negativeLadderDetails.name;
  } else if (isRoster && rosterLadderDetails?.name) {
    computedLadderName = rosterLadderDetails.name;
  } else if (isMiniLeague && minileagueLadderDetails?.name) {
    computedLadderName = minileagueLadderDetails.name;
  } else if (standardLadderDetails?.name) {
    computedLadderName = standardLadderDetails.name;
  }

  let computedPlayerCount = 0;
  if (isSkill) {
    computedPlayerCount = skillPlayers.length;
  } else if (isPositive) {
    computedPlayerCount = positivePlayers.length;
  } else if (isNegative) {
    computedPlayerCount = negativePlayers.length;
  } else if (isRoster) {
    computedPlayerCount = rosterPlayers.length;
  } else if (isMiniLeague) {
    computedPlayerCount = minileagueDataSelector.reduce((sum, section) => sum + (section.users_record?.length || 0), 0);
  } else {
    computedPlayerCount = standardPlayers.length;
  }

  let computedLogo = null;
  if (isSkill) computedLogo = skillLadderDetails?.logo;
  else if (isPositive) computedLogo = positiveLadderDetails?.logo;
  else if (isNegative) computedLogo = negativeLadderDetails?.logo;
  else if (isRoster) computedLogo = rosterLadderDetails?.logo;
  else if (isMiniLeague) computedLogo = minileagueLadderDetails?.logo;
  else computedLogo = standardLadderDetails?.logo;

  const resolvedLadderName =
    localName || ladderName || demoLadderName || computedLadderName || playerEntry?.ladderDetails?.name || "Football Ladder";
  
  const resolvedPlayerCount =
    liveCount !== undefined && liveCount !== null
      ? liveCount
      : computedPlayerCount || playerEntry?.data?.length || 0;

  const resolvedType = activeType;
  const resolvedTypeLabel = formatLadderType(resolvedType);

  const logo = localLogo || computedLogo || playerEntry?.ladderDetails?.logo || null;
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
    if (!demoLadderName && !userLevel) {
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

  const isPlayersPage = (activeTab === "players" || userLevel) && !!ladderId;
  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || user?.user_id?.trim()?.[0]?.toUpperCase() || "?";
  const displayName = user?.name || user?.user_id || "Guest";
  const roleLabel =
    user?.user_type === "admin"
      ? "Admin"
      : user?.user_type === "sub_admin"
      ? "Section Admin"
      : user?.user_type === "guest"
      ? "Guest User"
      : "Player";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadUser = () => {
      try {
        const storedAdminDetails = sessionStorage.getItem("adminDetails");
        const storedSubAdmin = sessionStorage.getItem("subAdmin");
        const storedAdmin = sessionStorage.getItem("userData");
        const storedUser = sessionStorage.getItem("user");

        const adminDetails = storedAdminDetails ? JSON.parse(storedAdminDetails) : null;
        const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;
        const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
        const normalUser = storedUser ? JSON.parse(storedUser) : null;

        let mergedUser = null;
        if (subAdmin?.user_type === "sub_admin") {
          mergedUser = { ...subAdmin };
        } else if (admin?.user_type === "admin") {
          mergedUser = { ...admin, ...adminDetails };
        } else if (adminDetails?.user_type === "admin") {
          mergedUser = { ...adminDetails };
        } else if (admin?.user_type === "guest") {
          mergedUser = { ...admin };
        } else if (adminDetails?.user_type === "guest") {
          mergedUser = { ...adminDetails };
        } else if (normalUser) {
          mergedUser = { ...normalUser };
        }

        setUser(mergedUser);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("profileUpdate", loadUser);
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("profileUpdate", loadUser);
    };
  }, [pathname]);

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
    if (user?.user_type === "guest") {
      router.push("/");
      return;
    }

    const ladderId = searchParams.get("ladder_id");
    const ladderType = searchParams.get("ladder_type") || searchParams.get("type");

    if (ladderId && ladderType) {
      router.push(`/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`);
    } else {
      router.push("/login-user");
    }
  };

  const handleDashboard = () => {
    toast.dismiss();
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
            {isSubmitPerformance ? (
              <div className="flex items-center gap-3">
                <Image
                  src={topLogo}
                  alt="Sports Solutions Pro"
                  width={40}
                  height={40}
                  className="md:h-10 md:w-10 h-10 w-10 object-contain"
                  priority
                />
                <div className="flex items-center text-sm md:text-base font-extrabold uppercase tracking-wide gap-1">
                  <span className="text-primary">SSP</span>
                  <span className="text-black dark:text-white">TALENT BOARD</span>
                </div>
              </div>
            ) : isPlayersPage ? (
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div
                  className={`relative h-10 w-10 shrink-0 ${(demoLadderName || userLevel) ? "" : "cursor-pointer"}`}
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

                  {!demoLadderName && !userLevel && (
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

                      {!demoLadderName && !userLevel && (
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
              <Image src={topLogo} alt="Sports Solutions Pro" width={40} height={40} className="md:h-10 md:w-10 h-10 w-10 object-contain" priority />
            )}


            <div className="flex items-center gap-2">
              

              {!isClubIdPage && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Toggle theme"
                >
                  {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
                </button>
              )}

              {!isClubIdPage && (
                <div className="relative hidden lg:block" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((previous) => !previous)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white transition-all overflow-hidden border border-white/10"
                    style={{
                      background: "linear-gradient(135deg,#29abe2,#1a3a8f)",
                      boxShadow: profileOpen ? "0 0 0 2px rgba(41,171,226,0.45)" : "none",
                    }}
                    aria-label="User menu"
                  >
                    {getUserImage(user) ? (
                      <img
                        src={getUserImage(user)}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      userInitial
                    )}
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
                        {user?.user_type === "guest" ? (
                          <>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as Submitter:</p>
                            <p className="truncate text-sm font-black text-white mt-0.5">{user.user_id}</p>
                            <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mt-0.5">(Guest User)</p>
                          </>
                        ) : (
                          <>
                            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{roleLabel}</p>
                          </>
                        )}
                      </div>

                      {!userLevel && (
                        <>
                          {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
                            <button
                              onClick={handleDashboard}
                              className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                            >
                              <Shield className="h-4 w-4 text-blue-400" />
                              {user?.user_type === "sub_admin" ? "Section-Admin Dashboard" : "Admin Dashboard"}
                            </button>
                          )}

                          {user?.user_type === "admin" && (
                            <button
                              onClick={() => {
                                router.push(createClubId);
                                setProfileOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                            >
                              <UserCircle2 className="h-4 w-4 text-blue-400" />
                             Create Club or Coach ID 
                            </button>
                          )}

                          {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
                            <button
                              onClick={() => {
                                router.push("/profile");
                                setProfileOpen(false);
                              }}
                              className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                            >
                              <UserCircle2 className="h-4 w-4 text-emerald-400" />
                              Update Profile
                            </button>
                          )}
                        </>
                      )}

                      {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
                        <button
                          onClick={() => {
                            router.push(submitPerformancePage);
                            setProfileOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                        >
                          <Trophy className="h-4 w-4 text-amber-400" />
                          Submit to Talent Board
                        </button>
                      )}

                      <button
                        onClick={() => {
                          window.open("/q-a", "_blank");
                          setProfileOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-sm text-left ${theme === "dark" ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-black/5 hover:text-black"}`}
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        Q &amp; A
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-left text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!userLevel && !isClubIdPage && (
                <button
                  onClick={() => setMobileOpen((previous) => !previous)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
                  aria-label="Toggle mobile menu"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && !isClubIdPage && (
          <div
            ref={mobileMenuRef}
            className="border-t border-nav-border px-4 pb-4 pt-2 lg:hidden flex flex-col gap-1"
            style={{ background: "var(--navbar-bg)" }}
          >
            {/* User profile header in mobile menu */}
            <div className="border-b border-white/10 px-3 py-2.5 mb-2">
              {user?.user_type === "guest" ? (
                <>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged in as Submitter:</p>
                  <p className="truncate text-sm font-black text-white mt-0.5">{user.user_id}</p>
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mt-0.5">(Guest User)</p>
                </>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{roleLabel}</p>
                </>
              )}
            </div>

            {!userLevel && (
              <>
                {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
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
                )}

                {user?.user_type === "admin" && (
                  <button
                    onClick={() => {
                      router.push(createClubId);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <UserCircle2 className="h-4 w-4 text-blue-400" />
                    Create Club or Coach ID
                  </button>
                )}

                {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <UserCircle2 className="h-4 w-4 text-emerald-400" />
                    Update Profile
                  </button>
                )}
              </>    


            )}

            {/* Submit to Talent Board (Admin/Sub-Admin only) */}
            {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
              <button
                onClick={() => {
                  router.push(submitPerformancePage);
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                Submit to Talent Board
              </button>
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
                    <span className="mt-2 text-xs  uppercase tracking-wider text-blue-500 font-bold">New Logo</span>
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

export default Navbar;
