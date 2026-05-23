"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import UploadPlayerLists from "@/components/pages/uploadCsv/UploadPlayerLists";
import { fetchLeaderboard, setAgeFilter } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { clearActivityState } from "@/redux/slices/activitySlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import BasicLeaderboardSetUpSkill from "@/components/pages/admin/BasicLeaderboardSetUpSkill";
import {
  fetchSkillLeaderboard,
  setAgeFilter as setSkillAgeFilter,
} from "@/redux/slices/BasicLeaderboardSlice";
import { setAgeFilter as setPositiveAgeFilter } from "@/redux/slices/positiveLeaderBoardSlice";
import { setAgeFilter as setNegativeAgeFilter } from "@/redux/slices/negativeLeaderBoardSlice";
import BasicLeaderboardShort from "@/components/pages/admin/BasicLeaderboardShort";
import { paymentPage } from "@/helper/RouteName";
import {
  Funnel,
  RotateCw,
  RefreshCw,
  XCircle,
  PlusCircle,
  CreditCard,
  Zap,
} from "lucide-react";
import { fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";
import { fetchPositiveLeaderboard } from "@/redux/slices/positiveLeaderBoardSlice";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import AgeFilter from "./AgeFilter";
import QuickActionsCard from "./QuickActionsCard";

const AdminButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const ladderId = searchParams.get("ladder_id");
  const typeFromParams = searchParams.get("type");
  const ladderTypeFromParams = searchParams.get("ladder_type");

  const playerLadderType = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails?.type,
  );
  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type,
  );
  const demoLadder = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails.created_by,
  );

  const isDemoLadder = demoLadder?.toLowerCase() === "demo";
  const ladderType = typeFromParams || playerLadderType || miniLeagueLadderType;

  const isMiniLeague = ladderType === "minileague";
  const isSkill = ladderType === "skill";
  const isRoster = typeFromParams === "roster";
  const isPositive = typeFromParams === "positive";
  const isNegative = typeFromParams === "negative";

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

  const {
    appliedAge: skillAppliedAge,
    appliedAgeType: skillAppliedAgeType,
    appliedGender: skillAppliedGender,
  } = useSelector((state) => state.skillLeaderboard || {});
  const {
    appliedAge: positiveAppliedAge,
    appliedAgeType: positiveAppliedAgeType,
    appliedGender: positiveAppliedGender,
  } = useSelector((state) => state.positiveLeaderBoard || {});
  const {
    appliedAge: negativeAppliedAge,
    appliedAgeType: negativeAppliedAgeType,
    appliedGender: negativeAppliedGender,
  } = useSelector((state) => state.negativeLeaderBoard || {});

  const appliedAge = isSkill
    ? skillAppliedAge
    : isPositive
      ? positiveAppliedAge
      : isNegative
        ? negativeAppliedAge
        : localAge;
  const appliedAgeType = isSkill
    ? skillAppliedAgeType
    : isPositive
      ? positiveAppliedAgeType
      : isNegative
        ? negativeAppliedAgeType
        : localAgeType;
  const appliedGender = isSkill
    ? skillAppliedGender
    : isPositive
      ? positiveAppliedGender
      : isNegative
        ? negativeAppliedGender
        : localGender;

  const hasFiltersApplied = () => {
    const age = isSkill
      ? skillAppliedAge
      : isPositive
        ? positiveAppliedAge
        : isNegative
          ? negativeAppliedAge
          : localAge;
    const ageType = isSkill
      ? skillAppliedAgeType
      : isPositive
        ? positiveAppliedAgeType
        : isNegative
          ? negativeAppliedAgeType
          : localAgeType;
    const gender = isSkill
      ? skillAppliedGender
      : isPositive
        ? positiveAppliedGender
        : isNegative
          ? negativeAppliedGender
          : localGender;

    return (age && age !== "" && age !== 0) || (ageType && ageType !== "under") || (gender && gender !== "");
  };

  const refreshLeaderboard = () => {
    if (!ladderId) return;

    if (
      isSkill ||
      isPositive ||
      isNegative ||
      ladderType === "best5" ||
      ladderType === "best3" ||
      ladderType === "winlose" ||
      isMiniLeague
    ) {
      refreshSkillLeaderboard();
      return;
    }

    const payload = { ladder_id: ladderId, type: ladderType };
    if (appliedAge > 0) {
      payload.dob = appliedAge;
      if (appliedAgeType) payload.age_type = appliedAgeType;
    }
    if (appliedGender) payload.gender = appliedGender;

    dispatch(fetchLeaderboard(payload));
    if (isRoster) {
      dispatch(
        fetchRosterLeaderboard({
          ladder_id: ladderId,
          dob: appliedAge > 0 ? appliedAge : undefined,
          age_type: appliedAge > 0 && appliedAgeType ? appliedAgeType : undefined,
          gender: appliedGender || undefined,
        }),
      );
    }
  };

  const refreshSkillLeaderboard = (skillNo = 0, witnessByOverride) => {
    if (!ladderId) return;

    let laddartype;
    let fetchSliceLeaderboard;

    if (typeFromParams === "positive" || ladderTypeFromParams === "positive") {
      laddartype = "positive";
      fetchSliceLeaderboard = fetchPositiveLeaderboard;
    } else if (typeFromParams === "negative" || ladderTypeFromParams === "negative") {
      laddartype = "negative";
      fetchSliceLeaderboard = fetchNegativeLeaderboard;
    } else if (ladderType === "best5" || ladderType === "best3" || ladderType === "winlose") {
      laddartype = ladderType;
      fetchSliceLeaderboard = fetchLeaderboard;
    } else if (ladderType === "minileague") {
      laddartype = "minileague";
      fetchSliceLeaderboard = fetchMiniLeague;
    } else {
      laddartype = "skill";
      fetchSliceLeaderboard = fetchSkillLeaderboard;
    }

    const effectiveWitnessBy =
      witnessByOverride !== undefined ? witnessByOverride : witnessBy;

    const payload = {
      ladder_id: ladderId,
      type: laddartype,
      sortbyskillnumber: skillNo,
      ...(effectiveWitnessBy === 1 ? { witness_by: 1 } : {}),
    };

    dispatch(fetchSliceLeaderboard(payload));

    if (laddartype === "minileague") {
      dispatch(fetchLeaderboard({ ...payload, type: "minileague" }));
    }
  };

  useEffect(() => {
    if (ladderId) dispatch(fetchGradebars(ladderId));
  }, [ladderId, dispatch]);

  const handleZeroScore = async () => {
    setZeroLoading(true);
    try {
      const res = await getRequest(API_ENDPOINTS.RESET_SCORE, { ladder_id: ladderId });
      if (res?.status === 200) {
        dispatch(clearActivityState());
        refreshLeaderboard();
        toast.success("All scores reset to ZERO!");
      }
    } catch {
      toast.error("Failed to reset scores");
    } finally {
      setZeroLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const res = await getRequest(API_ENDPOINTS.UPDATE_MINILEAGUE, {
        ladder_id: ladderId,
      });
      if (res?.status === 200) {
        toast.success("Mini League updated successfully!");
        refreshLeaderboard();
      }
    } catch {
      toast.error("Failed to update Mini League");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
      setConfirmOpen(false);
      setOpenUploadDialog(true);
      toast.success("Leaderboard reset successfully!");
      refreshLeaderboard();
    } catch {
      toast.error("Failed to reset leaderboard");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetSkill = async () => {
    setResetLoading(true);
    try {
      await getRequest(API_ENDPOINTS.RESET_SKILLBOARD, { ladder_id: ladderId });
      setConfirmOpen(false);
      setOpenSkillDialog(true);
      toast.success("Skill Leaderboard reset successfully!");
      refreshLeaderboard();
    } catch {
      toast.error("Failed to reset skill leaderboard");
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmType === "zero") handleZeroScore();
    else if (confirmType === "update") handleUpdate();
    else if (confirmType === "reset") handleReset();
    else if (confirmType === "reset_skill") handleResetSkill();
  };

  const handleSortBySkill = () => {
    setOpenSkillShortDialog(true);
  };

  const handleClearAll = () => {
    setIsSorted(false);
    setCurrentSkillNo(0);
    setWitnessBy(0);
    const clearedFilter = { age: 0, ageType: "", gender: "" };

    if (isSkill) {
      dispatch(setSkillAgeFilter(clearedFilter));
    } else if (isPositive) {
      dispatch(setPositiveAgeFilter(clearedFilter));
    } else if (isNegative) {
      dispatch(setNegativeAgeFilter(clearedFilter));
    } else {
      dispatch(setAgeFilter(clearedFilter));
      setLocalAge(0);
      setLocalAgeType("");
      setLocalGender("");
    }

    setAgeFilterResetSignal((prev) => prev + 1);

    if (ladderId) {
      if (isSkill || isPositive || isNegative) {
        refreshSkillLeaderboard(0, 0);
      } else {
        const payload = { ladder_id: ladderId, type: ladderType, witness_by: 0 };
        dispatch(fetchLeaderboard(payload));
        if (isRoster) {
          dispatch(fetchRosterLeaderboard({ ladder_id: ladderId }));
        }
      }
    }
  };

  const handleAgeSearch = (age, ageType, gender) => {
    setWitnessBy(0);
    setIsSorted(false);
    setCurrentSkillNo(0);

    const ageNum = age ? Number(age) : "";
    const filter = { age: ageNum, ageType, gender };

    if (isSkill) dispatch(setSkillAgeFilter(filter));
    else if (isPositive) dispatch(setPositiveAgeFilter(filter));
    else if (isNegative) dispatch(setNegativeAgeFilter(filter));
    else {
      dispatch(setAgeFilter(filter));
      setLocalAge(ageNum);
      setLocalAgeType(ageType);
      setLocalGender(gender);
    }

    const laddartype =
      typeFromParams === "positive"
        ? "positive"
        : typeFromParams === "negative"
          ? "negative"
          : isSkill
            ? "skill"
            : ladderType;

    const payload = {
      ladder_id: ladderId,
      type: laddartype,
      dob: ageNum > 0 ? ageNum : undefined,
      gender: gender || undefined,
      ...(ageNum > 0 && ageType ? { age_type: ageType } : {}),
      witness_by: 0,
    };

    let fetchSliceLeaderboard;

    if (laddartype === "positive") {
      fetchSliceLeaderboard = fetchPositiveLeaderboard;
    } else if (laddartype === "negative") {
      fetchSliceLeaderboard = fetchNegativeLeaderboard;
    } else if (
      laddartype === "best5" ||
      laddartype === "best3" ||
      laddartype === "winlose" ||
      laddartype === "bestof5" ||
      laddartype === "bestof3" ||
      laddartype === "roster"
    ) {
      fetchSliceLeaderboard = fetchLeaderboard;
    } else {
      fetchSliceLeaderboard = fetchSkillLeaderboard;
    }

    dispatch(fetchSliceLeaderboard(payload));

    if (isRoster) {
      dispatch(
        fetchRosterLeaderboard({
          ladder_id: ladderId,
          dob: ageNum > 0 ? ageNum : undefined,
          age_type: ageNum > 0 && ageType ? ageType : undefined,
          gender: gender || undefined,
        }),
      );
    }
  };

  const handleUpgrade = () => router.push(paymentPage);

  const quickActionButtonClass =
    "best-board-card-soft h-16 w-full rounded-xl border border-[var(--best-board-border)] px-4 text-[var(--best-board-text)] shadow-none transition hover:-translate-y-0.5 hover:bg-[var(--best-board-surface)] flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight";
  const quickActionActiveButtonClass =
    "h-16 w-full rounded-xl border border-emerald-500/45 bg-emerald-500/12 px-4 text-[var(--best-board-text)] shadow-none transition hover:-translate-y-0.5 hover:bg-emerald-500/18 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight";
  const quickActionDangerButtonClass =
    "h-16 w-full rounded-xl border border-[color:color-mix(in_srgb,var(--best-board-danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--best-board-danger)_14%,transparent)] px-4 text-[var(--best-board-text)] shadow-none transition hover:-translate-y-0.5 hover:bg-[color:color-mix(in_srgb,var(--best-board-danger)_22%,transparent)] flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase leading-tight";
  const themedDialogContentClass =
    "best-board-card border-[var(--best-board-border)] text-[var(--best-board-text)] sm:max-w-2xl";
  const themedUploadDialogClass =
    "best-board-card border-[var(--best-board-border)] text-[var(--best-board-text)] sm:max-w-xl";
  const themedAlertDialogClass =
    "best-board-card border-[var(--best-board-border)] text-[var(--best-board-text)]";

  return (
    <>
      <QuickActionsCard title="Quick Actions">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isMiniLeague && (
            <>
              <Button
                onClick={() => {
                  setConfirmType("zero");
                  setConfirmOpen(true);
                }}
                disabled={zeroLoading}
                className={quickActionButtonClass}
              >
                <Zap size={20} /> {zeroLoading ? "RESETTING..." : "ZERO ALL"}
              </Button>

              <Button
                onClick={() => {
                  setConfirmType("update");
                  setConfirmOpen(true);
                }}
                disabled={updateLoading}
                className={quickActionButtonClass}
              >
                <RotateCw size={20} /> {updateLoading ? "UPDATING..." : "UPDATE"}
              </Button>
            </>
          )}

          {(isSkill || isPositive || isNegative) && (
            <Button
              onClick={() => {
                setConfirmType("reset_skill");
                setConfirmOpen(true);
              }}
              disabled={resetLoading}
              className={quickActionButtonClass}
            >
              <XCircle size={20} /> {resetLoading ? "RESETTING..." : "RESET"}
            </Button>
          )}

          {!isMiniLeague && !isSkill && !isRoster && !isPositive && !isNegative && (
            <Button
              onClick={() => {
                if (isDemoLadder) {
                  toast.warning("Disabled for Demo Purposes");
                  return;
                }
                setConfirmType("reset");
                setConfirmOpen(true);
              }}
              disabled={resetLoading}
              className={quickActionButtonClass}
            >
              <RefreshCw size={20} />
              {resetLoading ? "RESETTING..." : "RESET"}
            </Button>
          )}

          <Dialog
            open={openAddPlayerDialog}
            onOpenChange={setOpenAddPlayerDialog}
          >
            <DialogTrigger asChild>
              <Button className={quickActionButtonClass}>
                <PlusCircle size={20} />
                {isRoster ? "ADD / REMOVE" : "ADD/REMOVE/MOVE"}
              </Button>
            </DialogTrigger>

            <DialogContent className={`${themedDialogContentClass} max-h-[90vh] overflow-y-auto`}>
              <DialogHeader>
                <DialogTitle className="sr-only">Manage Players</DialogTitle>
              </DialogHeader>
              <AddRemoveBox
                ladderId={ladderId}
                onSuccessRefresh={refreshLeaderboard}
              />
            </DialogContent>
          </Dialog>

          {(isSkill || isPositive || isNegative) && (
            <Button
              onClick={handleSortBySkill}
              className={isSorted ? quickActionActiveButtonClass : quickActionButtonClass}
            >
              <Funnel size={20} /> {isSorted ? "SORTED" : "SORT"}
            </Button>
          )}

          {(isSorted || witnessBy === 1 || hasFiltersApplied()) && !isMiniLeague && (
            <Button
              onClick={handleClearAll}
              className={quickActionDangerButtonClass}
            >
              <XCircle size={20} /> CLEAR ALL
            </Button>
          )}

          {!isMiniLeague && (
            <div className="h-16 w-full">
              <AgeFilter
                onSearch={handleAgeSearch}
                user={false}
                resetSignal={ageFilterResetSignal}
                isActive={hasFiltersApplied()}
              />
            </div>
          )}

          <Dialog
            open={openSkillShortDialog}
            onOpenChange={setOpenSkillShortDialog}
          >
            <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center">
              <BasicLeaderboardShort
                ladderId={ladderId}
                onClose={() => {
                  setOpenSkillShortDialog(false);
                  setIsSorted(false);
                }}
                onSkillsUpdated={(skillNo) => {
                  setCurrentSkillNo(skillNo);
                  const clearedFilter = { age: 0, ageType: "", gender: "" };
                  if (isSkill) {
                    dispatch(setSkillAgeFilter(clearedFilter));
                  } else if (isPositive) {
                    dispatch(setPositiveAgeFilter(clearedFilter));
                  } else if (isNegative) {
                    dispatch(setNegativeAgeFilter(clearedFilter));
                  } else {
                    dispatch(setAgeFilter(clearedFilter));
                    setLocalAge(0);
                    setLocalAgeType("");
                    setLocalGender("");
                  }
                  setAgeFilterResetSignal((prev) => prev + 1);
                  setWitnessBy(0);
                  refreshSkillLeaderboard(skillNo, 0);
                  setIsSorted(true);
                  setOpenSkillShortDialog(false);
                  toast.success(`Sorted by Skill ${skillNo}!`);
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={openSkillDialog} onOpenChange={setOpenSkillDialog}>
            <DialogTrigger asChild>
              {(isSkill || isPositive || isNegative) && (
                <Button className={quickActionButtonClass}>
                  <Zap size={20} /> SETUP
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center">
              <BasicLeaderboardSetUpSkill
                onClose={() => setOpenSkillDialog(false)}
                onSkillsUpdated={refreshSkillLeaderboard}
              />
            </DialogContent>
          </Dialog>

          {(isSkill || isPositive || isNegative) && (
            <Button
              onClick={() => {
                const newWitnessBy = witnessBy === 1 ? 0 : 1;
                setWitnessBy(newWitnessBy);

                if (newWitnessBy === 1) {
                  const clearedFilter = { age: 0, ageType: "", gender: "" };
                  if (isSkill) {
                    dispatch(setSkillAgeFilter(clearedFilter));
                  } else if (isPositive) {
                    dispatch(setPositiveAgeFilter(clearedFilter));
                  } else if (isNegative) {
                    dispatch(setNegativeAgeFilter(clearedFilter));
                  } else {
                    dispatch(setAgeFilter(clearedFilter));
                    setLocalAge(0);
                    setLocalAgeType("");
                    setLocalGender("");
                  }
                  setAgeFilterResetSignal((prev) => prev + 1);
                  setIsSorted(false);
                  setCurrentSkillNo(0);
                }

                refreshSkillLeaderboard(0, newWitnessBy);
              }}
              className={witnessBy === 1 ? quickActionActiveButtonClass : quickActionButtonClass}
            >
              {witnessBy === 1 ? "WITNESSED" : "WITNESSED ONLY"}
            </Button>
          )}

          {/* {!isRoster && (
            <Button
              onClick={handleUpgrade}
              className="bg-[#6766CC] bg-[length:200%_100%] animate-gradient-x
              border border-gray-400 text-white font-bold uppercase
              rounded-xl py-8 px-24 w-full shadow-lg
              flex flex-col items-center justify-center gap-1
              text-xs text-center leading-snug"
            >
              <CreditCard size={20} />
              <span>PURCHASE</span>
              <span className="text-[8px] normal-case font-semibold text-white/80">
                Ignore if Club has a Licence
              </span>
            </Button>
          )} */}
        </div>
      </QuickActionsCard>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className={themedAlertDialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--best-board-danger)]">
              Do you want to reset ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--best-board-muted)]">
              {confirmType === "zero" &&
                "This will reset ALL scores to ZERO. This action cannot be undone!"}
              {confirmType === "update" && "This will move two up and two down."}
              {confirmType === "reset" &&
                "This will completely DELETE the entire leaderboard. All data will be lost !"}
              {confirmType === "reset_skill" &&
                "This will completely DELETE the entire skill leaderboard. All data will be lost !"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] text-[var(--best-board-text)] transition-colors hover:bg-[var(--best-board-surface)]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className="border-0 bg-[var(--background-image-gradient-brand)] text-white"
            >
              {resetLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogContent className={themedUploadDialogClass}>
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
    </>
  );
};

export default AdminButton;
