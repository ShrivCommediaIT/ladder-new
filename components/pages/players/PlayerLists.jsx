"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import PlayersLists1 from "./PlayersLists1";
import ActivityLog from "./ActivityList";
import LeaderBoard from "./LeaderBoard";
import LadderRulesCard from "./LadderRulesCard";
import MusicDownloadList from "./MusicDownloadList";
import PlayerLevelNavbar from "@/components/shared/PlayerLevelNavbar";
import AdminEditPhone from "@/components/shared/AdminEditPhone";
import Info from "@/components/shared/Info";
import AgeFilter from "@/components/shared/AgeFilter";
import QuickActionsCard from "@/components/shared/QuickActionsCard";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import UploadPlayerLists from "@/components/pages/uploadCsv/UploadPlayerLists";
import BasicLeaderboardSetUpSkill from "@/components/pages/admin/BasicLeaderboardSetUpSkill";
import BasicLeaderboardShort from "@/components/pages/admin/BasicLeaderboardShort";

import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Funnel, RotateCw, RefreshCw, XCircle, Plus, Eye, Zap } from "lucide-react";

import { fetchUserActivity, clearActivityState } from "@/redux/slices/activitySlice";
import { fetchLeaderboard, setAgeFilter } from "@/redux/slices/leaderboardSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { fetchSkillLeaderboard, setAgeFilter as setSkillAgeFilter } from "@/redux/slices/BasicLeaderboardSlice";
import { setAgeFilter as setPositiveAgeFilter, fetchPositiveLeaderboard } from "@/redux/slices/positiveLeaderBoardSlice";
import { setAgeFilter as setNegativeAgeFilter, fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { formatLadderType } from "@/components/shared/ladderUtils";

export const PlayerLists = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const miniLeagueData = useSelector((state) => state.miniLeague?.data);
  const ladder = miniLeagueData || useSelector((state) => state.activity?.data?.data);

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type");
  const type = searchParams.get("type");
  const shouldPrint = searchParams.get("print");

  const typeFromParams = type;
  const ladderTypeFromParams = ladderType;
  const resolvedType = typeFromParams || ladderType || "";
  const isMiniLeague = resolvedType === "minileague";
  const isSkill = resolvedType === "skill";
  const isRoster = resolvedType === "roster";
  const isPositive = resolvedType === "positive";
  const isNegative = resolvedType === "negative";

  const isBestLayout = ["best5", "best3", "winlose", "skill", "positive", "negative", "minileague", "roster"].includes(resolvedType);

  const demoLadder = useSelector((state) => state.player?.players?.[ladderId]?.ladderDetails?.created_by);
  const isDemoLadder = demoLadder?.toLowerCase() === "demo";

  const { appliedAge: skillAppliedAge, appliedAgeType: skillAppliedAgeType, appliedGender: skillAppliedGender } = useSelector((state) => state.skillLeaderboard || {});
  const { appliedAge: positiveAppliedAge, appliedAgeType: positiveAppliedAgeType, appliedGender: positiveAppliedGender } = useSelector((state) => state.positiveLeaderBoard || {});
  const { appliedAge: negativeAppliedAge, appliedAgeType: negativeAppliedAgeType, appliedGender: negativeAppliedGender } = useSelector((state) => state.negativeLeaderBoard || {});

  // Page loading
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingMiniLeague, setLoadingMiniLeague] = useState(true);
  const globalLoading = loadingPlayers || loadingActivity || loadingMiniLeague;
  const [bestSearchValue, setBestSearchValue] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // Admin action state
  const [openAddPlayerDialog, setOpenAddPlayerDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [openSkillShortDialog, setOpenSkillShortDialog] = useState(false);
  const [zeroLoading, setZeroLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [isSorted, setIsSorted] = useState(false);
  const [currentSkillNo, setCurrentSkillNo] = useState(0);
  const [localAge, setLocalAge] = useState(0);
  const [localAgeType, setLocalAgeType] = useState("under");
  const [localGender, setLocalGender] = useState("");
  const [ageFilterResetSignal, setAgeFilterResetSignal] = useState(0);
  const [witnessBy, setWitnessBy] = useState(0);

  const appliedAge = isSkill ? skillAppliedAge : isPositive ? positiveAppliedAge : isNegative ? negativeAppliedAge : localAge;
  const appliedAgeType = isSkill ? skillAppliedAgeType : isPositive ? positiveAppliedAgeType : isNegative ? negativeAppliedAgeType : localAgeType;
  const appliedGender = isSkill ? skillAppliedGender : isPositive ? positiveAppliedGender : isNegative ? negativeAppliedGender : localGender;

  const hasFiltersApplied = () => {
    const age = isSkill ? skillAppliedAge : isPositive ? positiveAppliedAge : isNegative ? negativeAppliedAge : localAge;
    const ageType = isSkill ? skillAppliedAgeType : isPositive ? positiveAppliedAgeType : isNegative ? negativeAppliedAgeType : localAgeType;
    const gender = isSkill ? skillAppliedGender : isPositive ? positiveAppliedGender : isNegative ? negativeAppliedGender : localGender;
    return (age && age !== "" && age !== 0) || (ageType && ageType !== "under") || (gender && gender !== "");
  };

  const refreshSkillLeaderboard = (skillNo = 0) => {
    if (!ladderId) return;
    let laddartype, fetchSlice;
    if (typeFromParams === "positive" || ladderTypeFromParams === "positive") { laddartype = "positive"; fetchSlice = fetchPositiveLeaderboard; }
    else if (typeFromParams === "negative" || ladderTypeFromParams === "negative") { laddartype = "negative"; fetchSlice = fetchNegativeLeaderboard; }
    else if (["best5", "best3", "winlose"].includes(resolvedType)) { laddartype = resolvedType; fetchSlice = fetchLeaderboard; }
    else if (isMiniLeague) { laddartype = "minileague"; fetchSlice = fetchMiniLeague; }
    else { laddartype = "skill"; fetchSlice = fetchSkillLeaderboard; }
    const payload = { ladder_id: ladderId, type: laddartype, sortbyskillnumber: skillNo };
    dispatch(fetchSlice(payload));
    if (isMiniLeague) dispatch(fetchLeaderboard({ ...payload, type: "minileague" }));
  };

  const refreshLeaderboard = () => {
    if (!ladderId) return;
    if (isSkill || isPositive || isNegative || ["best5", "best3", "winlose"].includes(resolvedType) || isMiniLeague) {
      refreshSkillLeaderboard();
    } else {
      const payload = { ladder_id: ladderId, type: resolvedType };
      if (appliedAge > 0) { payload.dob = appliedAge; if (appliedAgeType) payload.age_type = appliedAgeType; }
      if (appliedGender) payload.gender = appliedGender;
      dispatch(fetchLeaderboard(payload));
      if (isRoster) dispatch(fetchRosterLeaderboard({ ladder_id: ladderId, dob: appliedAge > 0 ? appliedAge : undefined, age_type: appliedAge > 0 && appliedAgeType ? appliedAgeType : undefined, gender: appliedGender || undefined }));
    }
  };

  const handleZeroScore = async () => {
    setZeroLoading(true);
    try {
      await getRequest(API_ENDPOINTS.RESET_SKILLBOARD, { ladder_id: ladderId });
      dispatch(clearActivityState());
      refreshLeaderboard();
      toast.success("All scores reset to ZERO!");
    } catch { toast.error("Failed to reset scores"); }
    finally { setZeroLoading(false); }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const res = await getRequest(API_ENDPOINTS.UPDATE_MINILEAGUE, { ladder_id: ladderId });
      if (res?.status === 200) { toast.success("Mini League updated!"); refreshLeaderboard(); }
    } catch { toast.error("Failed to update Mini League"); }
    finally { setUpdateLoading(false); }
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
      setConfirmOpen(false); setOpenUploadDialog(true);
      toast.success("Leaderboard reset!"); refreshLeaderboard();
    } catch { toast.error("Failed to reset leaderboard"); }
    finally { setResetLoading(false); }
  };

  const handleResetSkill = async () => {
    setResetLoading(true);
    try {
      await getRequest(API_ENDPOINTS.RESET_SKILLBOARD, { ladder_id: ladderId });
      setConfirmOpen(false); setOpenSkillDialog(true);
      toast.success("Skill Leaderboard reset!"); refreshLeaderboard();
    } catch { toast.error("Failed to reset skill leaderboard"); }
    finally { setResetLoading(false); }
  };

  const handleConfirmAction = () => {
    if (confirmType === "zero") handleZeroScore();
    else if (confirmType === "update") handleUpdate();
    else if (confirmType === "reset") handleReset();
    else if (confirmType === "reset_skill") handleResetSkill();
  };

  const handleClearAll = () => {
    setIsSorted(false); setCurrentSkillNo(0);
    const clearedFilter = { age: 0, ageType: "", gender: "" };
    if (isSkill) dispatch(setSkillAgeFilter(clearedFilter));
    else if (isPositive) dispatch(setPositiveAgeFilter(clearedFilter));
    else if (isNegative) dispatch(setNegativeAgeFilter(clearedFilter));
    else { dispatch(setAgeFilter(clearedFilter)); setLocalAge(0); setLocalAgeType(""); setLocalGender(""); }
    setAgeFilterResetSignal((p) => p + 1);
    if (ladderId) {
      if (isSkill || isPositive || isNegative) refreshSkillLeaderboard(0);
      else { dispatch(fetchLeaderboard({ ladder_id: ladderId, type: resolvedType })); if (isRoster) dispatch(fetchRosterLeaderboard({ ladder_id: ladderId })); }
    }
  };

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : "";
    const filter = { age: ageNum, ageType, gender };
    if (isSkill) dispatch(setSkillAgeFilter(filter));
    else if (isPositive) dispatch(setPositiveAgeFilter(filter));
    else if (isNegative) dispatch(setNegativeAgeFilter(filter));
    else { dispatch(setAgeFilter(filter)); setLocalAge(ageNum); setLocalAgeType(ageType); setLocalGender(gender); }
    const laddartype = typeFromParams === "positive" ? "positive" : typeFromParams === "negative" ? "negative" : isSkill ? "skill" : resolvedType;
    const payload = { ladder_id: ladderId, type: laddartype, dob: ageNum > 0 ? ageNum : undefined, gender: gender || undefined, ...(ageNum > 0 && ageType ? { age_type: ageType } : {}) };
    let fetchSlice = laddartype === "positive" ? fetchPositiveLeaderboard : laddartype === "negative" ? fetchNegativeLeaderboard : ["best5", "best3", "winlose", "bestof5", "bestof3", "roster"].includes(laddartype) ? fetchLeaderboard : fetchSkillLeaderboard;
    dispatch(fetchSlice(payload));
    if (isRoster) dispatch(fetchRosterLeaderboard({ ladder_id: ladderId, dob: ageNum > 0 ? ageNum : undefined, age_type: ageNum > 0 && ageType ? ageType : undefined, gender: gender || undefined }));
    setIsSorted(true);
  };

  // Button classes
  const btnClass = "best-board-card-soft rounded-lg h-16 w-full border border-[var(--best-board-border)] px-4 text-white shadow-none transition hover:-translate-y-0.5 hover:bg-[var(--best-board-surface)] flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight";
  const dangerBtnClass = "rounded-lg h-16 w-full border border-[color:color-mix(in_srgb,var(--best-board-danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--best-board-danger)_16%,transparent)] px-4 text-white shadow-none transition hover:-translate-y-0.5 hover:bg-[color:color-mix(in_srgb,var(--best-board-danger)_24%,transparent)] flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight";

  useEffect(() => {
    if (ladderId) dispatch(fetchGradebars(ladderId));
  }, [ladderId, dispatch]);

  useEffect(() => {
    if (shouldPrint === "true") {
      const timer = setTimeout(() => {
        window.print();
        const params = new URLSearchParams(window.location.search);
        params.delete("print");
        router.replace(window.location.pathname + (params.toString() ? `?${params.toString()}` : ""));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!ladderId) return;
      setLoadingMiniLeague(true);
      await dispatch(fetchMiniLeague({ ladder_id: ladderId }));
      setLoadingMiniLeague(false);
      setLoadingPlayers(true);
      await dispatch(fetchLeaderboard({ ladder_id: ladderId, type: type || ladderType }));
      setLoadingPlayers(false);
      setLoadingActivity(true);
      await dispatch(fetchUserActivity({ ladder_id: ladderId }));
      setLoadingActivity(false);
    };
    fetchData();
  }, [dispatch, ladderId]);

  useEffect(() => {
    const hasSeenInfo = sessionStorage.getItem("adminInfoShown");
    if (!hasSeenInfo) { setShowInfo(true); sessionStorage.setItem("adminInfoShown", "true"); }
  }, []);

  const currentLadderId = ladder?.ladder_id || ladderId;
  const playerEntry = useSelector((state) => ladderId ? state.player?.players?.[Number(ladderId)] : null);
  const currentLadderName = playerEntry?.ladderDetails?.name || miniLeagueData?.name || "Football Ladder";
  const currentPlayerCount = playerEntry?.data?.length || 0;
  const resolvedLadderType = type || ladderType || "ladder";

  // The inline QuickActionsCard panel (replaces <AdminButton />)
  const quickActions = [];

  // Reset/Zero/Update buttons
  if (isMiniLeague) {
    quickActions.push({
      id: "zero",
      label: zeroLoading ? "Resetting..." : "Zero All",
      icon: Zap,
      onClick: () => { setConfirmType("zero"); setConfirmOpen(true); },
      disabled: zeroLoading,
    });
    quickActions.push({
      id: "update",
      label: updateLoading ? "Updating..." : "Update",
      icon: RotateCw,
      onClick: () => { setConfirmType("update"); setConfirmOpen(true); },
      disabled: updateLoading,
    });
  } else if (isSkill || isPositive || isNegative) {
    quickActions.push({
      id: "reset-skill",
      label: resetLoading ? "Resetting..." : "Zero All",
      icon: XCircle,
      onClick: () => { setConfirmType("reset_skill"); setConfirmOpen(true); },
      disabled: resetLoading,
    });
  } else {
    quickActions.push({
      id: "reset",
      label: resetLoading ? "Resetting..." : "Reset",
      icon: RefreshCw,
      onClick: () => {
        if (isDemoLadder) {
          toast.warning("Disabled for Demo Purposes");
          return;
        }
        setConfirmType("reset");
        setConfirmOpen(true);
      },
      disabled: resetLoading,
    });
  }

  // Add / Remove Player button
  quickActions.push({
    id: "add-remove",
    label: isRoster ? "Add / Remove" : "Add/Remove/Move",
    icon: Plus,
    onClick: () => setOpenAddPlayerDialog(true),
  });

  // Sort button
  if (isSkill || isPositive || isNegative) {
    quickActions.push({
      id: "sort",
      label: isSorted ? "Sorted" : "Sort",
      icon: Funnel,
      onClick: () => setOpenSkillShortDialog(true),
    });
  }

  // Witnessed button
  if (isSkill || isPositive || isNegative) {
    quickActions.push({
      id: "witnessed",
      label: witnessBy === 1 ? "Witnessed" : "Witnessed Only",
      icon: Eye,
      tone: witnessBy === 1 ? "success" : "default",
      onClick: () => {
        const newWitnessBy = witnessBy === 1 ? 0 : 1;
        setWitnessBy(newWitnessBy);
        if (newWitnessBy === 1) {
          const cleared = { age: 0, ageType: "", gender: "" };
          if (isSkill) dispatch(setSkillAgeFilter(cleared));
          else if (isPositive) dispatch(setPositiveAgeFilter(cleared));
          else if (isNegative) dispatch(setNegativeAgeFilter(cleared));
          else { dispatch(setAgeFilter(cleared)); setLocalAge(0); setLocalAgeType(""); setLocalGender(""); }
          setAgeFilterResetSignal((p) => p + 1);
          setIsSorted(false);
          setCurrentSkillNo(0);
        }
        refreshSkillLeaderboard(0);
      },
    });
  }

  // Age Filter button
  if (!isMiniLeague) {
    quickActions.push({
      id: "age-filter",
      node: (
        <AgeFilter
          onSearch={handleAgeSearch}
          user={false}
          resetSignal={ageFilterResetSignal}
          isActive={hasFiltersApplied()}
        />
      ),
    });
  }

  // Setup button
  if (isSkill || isPositive || isNegative) {
    quickActions.push({
      id: "setup",
      label: "Setup",
      icon: Zap,
      onClick: () => setOpenSkillDialog(true),
    });
  }

  // Clear All button
  if ((isSorted || witnessBy === 1 || hasFiltersApplied()) && !isMiniLeague) {
    quickActions.push({
      id: "clear",
      label: "Clear All",
      icon: XCircle,
      tone: "danger",
      onClick: handleClearAll,
    });
  }

  const AdminPanel = () => (
    <QuickActionsCard title="Quick Actions" actions={quickActions} />
  );



  return (
    <div className={isBestLayout ? "ladder-shell min-h-screen" : "bg-gray-800 min-h-screen"}>
      <PlayerLevelNavbar
        activeTab="players"
        ladderName={currentLadderName}
        liveCount={currentPlayerCount}
        ladderType={type || ladderType}
        searchValue={bestSearchValue}
        onSearchChange={setBestSearchValue}
      />

      {isBestLayout ? (
        <div className="w-full px-1 pb-6 sm:px-6 lg:px-10">
          <PlayersLists1 searchValue={bestSearchValue} onSearchChange={setBestSearchValue} />
        </div>
      ) : (
        <>
          <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row gap-6">
            {/* Left/Main Column */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <div className="flex flex-col gap-4 lg:hidden">
                <AdminEditPhone />
                <AdminPanel />
                <LadderRulesCard />
              </div>
              <div className="px-2">
                <PlayersLists1 />
              </div>
              <div className="lg:hidden">
                <ActivityLog ladderId={currentLadderId} />
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-[560px] flex-col gap-4 flex-shrink-0">
              <AdminEditPhone />
              <AdminPanel />
              <LadderRulesCard />
              {(type === "skill" || ladderType === "skill") && <MusicDownloadList />}
              <ActivityLog ladderId={currentLadderId} />
            </div>
          </div>

          <div className="px-4 mt-6 w-full overflow-x-auto">
            <LeaderBoard />
          </div>

          {globalLoading && (
            <div className="px-4 py-6 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-solid" />
            </div>
          )}
        </>
      )}

      <footer className="relative z-10 mt-10 px-4 pb-8 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full border border-border bg-card text-foreground shadow-lg">
          <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sports Solutions Pro {formatLadderType(resolvedLadderType)} Ladder</p>
              <p className="mt-1 text-sm text-muted-foreground">Rankings, activity, and player management in one shared ladder view.</p>
            </div>
            <p className="text-sm text-primary">
              {currentPlayerCount > 0 ? `${currentPlayerCount} player${currentPlayerCount === 1 ? "" : "s"} on this ladder` : "Player list updates live as members join"}
            </p>
          </CardContent>
        </Card>
      </footer>

      {/* Sort by skill dialog */}
      <Dialog open={openSkillShortDialog} onOpenChange={setOpenSkillShortDialog}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center">
          <BasicLeaderboardShort
            ladderId={ladderId}
            onClose={() => { setOpenSkillShortDialog(false); setIsSorted(false); }}
            onSkillsUpdated={(skillNo) => {
              setCurrentSkillNo(skillNo);
              const cleared = { age: 0, ageType: "", gender: "" };
              if (isSkill) dispatch(setSkillAgeFilter(cleared));
              else if (isPositive) dispatch(setPositiveAgeFilter(cleared));
              else if (isNegative) dispatch(setNegativeAgeFilter(cleared));
              else { dispatch(setAgeFilter(cleared)); setLocalAge(0); setLocalAgeType(""); setLocalGender(""); }
              setAgeFilterResetSignal((p) => p + 1);
              setWitnessBy(0);
              refreshSkillLeaderboard(skillNo);
              setIsSorted(true); setOpenSkillShortDialog(false);
              toast.success(`Sorted by Skill ${skillNo}!`);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Do you want to reset?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-800">
              {confirmType === "zero" && "This will reset ALL scores to ZERO. This action cannot be undone!"}
              {confirmType === "update" && "This will move two up and two down."}
              {confirmType === "reset" && "This will completely DELETE the entire leaderboard. All data will be lost!"}
              {confirmType === "reset_skill" && "This will completely DELETE the entire skill leaderboard. All data will be lost!"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-red-400 transition-colors">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              {resetLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload CSV after reset */}
      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogContent className="bg-gray-400 rounded-lg border border-[#313546] sm:max-w-xl">
          <UploadPlayerLists
            ladderId={ladderId}
            onSuccessClose={() => {
              setOpenUploadDialog(false);
              refreshLeaderboard();
              dispatch(fetchGradebars(ladderId));
              toast.success("Players uploaded successfully!");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add / Remove Dialog */}
      <Dialog open={openAddPlayerDialog} onOpenChange={setOpenAddPlayerDialog}>
        <DialogContent className="bg-[#163344] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Manage Players</DialogTitle>
          </DialogHeader>
          <AddRemoveBox ladderId={ladderId} onSuccessRefresh={refreshLeaderboard} />
        </DialogContent>
      </Dialog>

      {/* Skill Setup Dialog */}
      <Dialog open={openSkillDialog} onOpenChange={setOpenSkillDialog}>
        <DialogContent showCloseButton={false} className="bg-transparent border-none shadow-none flex items-center justify-center">
          <BasicLeaderboardSetUpSkill onClose={() => setOpenSkillDialog(false)} onSkillsUpdated={refreshSkillLeaderboard} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
