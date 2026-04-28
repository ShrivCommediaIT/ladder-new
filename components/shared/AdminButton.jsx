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
import { fetchSkillLeaderboard, setAppliedAge as setSkillAppliedAge, setAgeFilter as setSkillAgeFilter } from "@/redux/slices/BasicLeaderboardSlice";
import { setAppliedAge as setPositiveAppliedAge, setAgeFilter as setPositiveAgeFilter } from "@/redux/slices/positiveLeaderBoardSlice";
import { setAppliedAge as setNegativeAppliedAge, setAgeFilter as setNegativeAgeFilter } from "@/redux/slices/negativeLeaderBoardSlice";
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

  const { appliedAge: skillAppliedAge, appliedAgeType: skillAppliedAgeType, appliedGender: skillAppliedGender } = useSelector((state) => state.skillLeaderboard || {});
  const { appliedAge: positiveAppliedAge, appliedAgeType: positiveAppliedAgeType, appliedGender: positiveAppliedGender } = useSelector((state) => state.positiveLeaderBoard || {});
  const { appliedAge: negativeAppliedAge, appliedAgeType: negativeAppliedAgeType, appliedGender: negativeAppliedGender } = useSelector((state) => state.negativeLeaderBoard || {});

  const appliedAge = isSkill ? skillAppliedAge : isPositive ? positiveAppliedAge : isNegative ? negativeAppliedAge : localAge;
  const appliedAgeType = isSkill ? skillAppliedAgeType : isPositive ? positiveAppliedAgeType : isNegative ? negativeAppliedAgeType : localAgeType;
  const appliedGender = isSkill ? skillAppliedGender : isPositive ? positiveAppliedGender : isNegative ? negativeAppliedGender : localGender;

  const refreshLeaderboard = () => {
    if (ladderId) {
      if (isSkill || isPositive || isNegative || ladderType === "best5" || ladderType === "best3" || ladderType === "winlose" || isMiniLeague) {
        refreshSkillLeaderboard();
      } else {
        const payload = { ladder_id: ladderId, type: ladderType };
        if (appliedAge > 0) {
          payload.dob = appliedAge;
          payload.age_type = appliedAgeType;
        }
        if (appliedGender) payload.gender = appliedGender;

        dispatch(fetchLeaderboard(payload));
        if (isRoster) {
          dispatch(fetchRosterLeaderboard({ 
            ladder_id: ladderId, 
            dob: appliedAge > 0 ? appliedAge : undefined,
            age_type: appliedAge > 0 ? appliedAgeType : undefined,
            gender: appliedGender || undefined
          }));
        }
      }
    }
  };

  const refreshSkillLeaderboard = (skillNo = 0, ageOverride) => {
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

    const payload = {
      ladder_id: ladderId,
      type: laddartype,
    };

    if (laddartype === "skill" || laddartype === "positive" || laddartype === "negative") {
      payload.sortbyskillnumber = skillNo;
    }

    const finalAge = ageOverride !== undefined ? ageOverride : appliedAge;
    const finalAgeType = appliedAgeType;
    const finalGender = appliedGender;

    if (finalAge > 0) {
      payload.dob = finalAge;
      payload.age_type = finalAgeType;
    }
    
    if (finalGender) {
      payload.gender = finalGender;
    }

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
      const res = await getRequest(API_ENDPOINTS.UPDATE_MINILEAGUE, { ladder_id: ladderId });
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
    const resetFilter = { age: 0, ageType: "under", gender: "" };
    if (isSkill) dispatch(setSkillAgeFilter(resetFilter));
    else if (isPositive) dispatch(setPositiveAgeFilter(resetFilter));
    else if (isNegative) dispatch(setNegativeAgeFilter(resetFilter));
    else {
      dispatch(setAgeFilter(resetFilter));
      setLocalAge(0);
      setLocalAgeType("under");
      setLocalGender("");
    }
    refreshSkillLeaderboard(0, 0);
    if (isRoster) {
      dispatch(fetchRosterLeaderboard({ ladder_id: ladderId, age: 0, ageType: "under", gender: "" }));
    }
  };

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = Number(age);
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

    const laddartype = typeFromParams === "positive" ? "positive" : (typeFromParams === "negative" ? "negative" : (isSkill ? "skill" : ladderType));

    const payload = {
      ladder_id: ladderId,
      type: laddartype,
      sortbyskillnumber: currentSkillNo,
      dob: ageNum,
      age_type: ageType,
      gender: gender
    };

    let fetchSliceLeaderboard;
    if (laddartype === "positive") fetchSliceLeaderboard = fetchPositiveLeaderboard;
    else if (laddartype === "negative") fetchSliceLeaderboard = fetchNegativeLeaderboard;
    else if (laddartype === "best5" || laddartype === "best3" || laddartype === "winlose" || laddartype === "bestof5" || laddartype === "bestof3" || laddartype === "roster") {
      fetchSliceLeaderboard = fetchLeaderboard;
    } else {
      fetchSliceLeaderboard = fetchSkillLeaderboard;
    }

    dispatch(fetchSliceLeaderboard(payload));

    if (isRoster) {
      dispatch(fetchRosterLeaderboard({
        ladder_id: ladderId,
        dob: ageNum > 0 ? ageNum : undefined,
        age_type: ageNum > 0 ? ageType : undefined,
        gender: gender || undefined
      }));
    }

    setIsSorted(true);
  };

  const handleUpgrade = () => router.push(paymentPage);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-3 py-4 md:px-7 md:py-7 rounded-2xl">
        {/* MINI LEAGUE BUTTONS */}
        {isMiniLeague && (
          <>
            <Button
              onClick={() => {
                setConfirmType("zero");
                setConfirmOpen(true);
              }}
              disabled={zeroLoading}
              className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold rounded-xl py-8 w-full shadow-lg"
            >
              <Zap size={20} /> {zeroLoading ? "RESETTING..." : "ZERO ALL"}
            </Button>

            <Button
              onClick={() => {
                setConfirmType("update");
                setConfirmOpen(true);
              }}
              disabled={updateLoading}
              className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold rounded-xl py-8 w-full shadow-lg"
            >
              <RotateCw size={20} /> {updateLoading ? "UPDATING..." : "UPDATE"}
            </Button>
          </>
        )}

        {/* SKILL LADDER RESET */}
        {(isSkill || isPositive || isNegative) && (
          <Button
            onClick={() => {
              setConfirmType("reset_skill");
              setConfirmOpen(true);
            }}
            disabled={resetLoading}
            className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight"
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
            className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight"
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
            <Button className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight">
              <PlusCircle size={20} />
              ADD/REMOVE/MOVE
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-[#163344] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="sr-only">
                Manage Players
              </DialogTitle>
            </DialogHeader>

            <AddRemoveBox
              ladderId={ladderId}
              onSuccessRefresh={refreshLeaderboard}
            />
          </DialogContent>
        </Dialog>

        {/* SKILL SPECIFIC BUTTONS */}
          <>
            {(!isSorted && appliedAge === 0) ? (
              <Button
                onClick={handleSortBySkill}
                className="bg-[#163344] border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight"
              >
                <Funnel size={20} /> SORT
              </Button>
            ) : (
              <Button
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700 border border-white/20 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight transition-all active:scale-95"
              >
                <XCircle size={20} /> CLEAR ALL
              </Button>
            )}
          </>

        {/* AGE FILTER BUTTON */}

        <div className="h-16 w-full">
          <AgeFilter onSearch={handleAgeSearch} user={false} />
        </div>


        {/* SINGLE DIALOG */}
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
                refreshSkillLeaderboard(skillNo);
                setIsSorted(true);
                setOpenSkillShortDialog(false);
                toast.success(`Sorted by Skill ${skillNo}!`);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* SET UP SKILL */}
        <Dialog open={openSkillDialog} onOpenChange={setOpenSkillDialog}>
          <DialogTrigger asChild>
            {(isSkill || isPositive || isNegative) && (
              <Button className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight">
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

      {/* CONFIRM DIALOG */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Do you want to reset ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-800">
              {confirmType === "zero" &&
                "This will reset ALL scores to ZERO. This action cannot be undone!"}
              {confirmType === "update" &&
                "This will move two up and two down."}
              {confirmType === "reset" &&
                "This will completely DELETE the entire leaderboard. All data will be lost !"}
              {confirmType === "reset_skill" &&
                "This will completely DELETE the entire skill leaderboard. All data will be lost !"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-red-400 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {resetLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* UPLOAD CSV */}
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
    </>
  );
};

export default AdminButton;
