
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
import AddRemoveBox from "./AddRemoveBox";
import UploadPlayerLists from "../uploadCsv/UploadPlayerLists";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { clearActivityState } from "@/redux/slices/activitySlice";
import BasicLeaderboardSetUpSkill from "./BasicLeaderboardSetUpSkill";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import BasicLeaderboardShort from "./BasicLeaderboardShort";
import { paymentPage } from "@/helper/RouteName";
import {
  Funnel,
  RotateCw,
  RefreshCw,
  XCircle,
  PlusCircle,
  Upload,
  CreditCard,
  Zap,
} from "lucide-react";
import { fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";
import { fetchPositiveLeaderboard } from "@/redux/slices/positiveLeaderBoardSlice";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

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
  const [openAgeFilterDialog, setOpenAgeFilterDialog] = useState(false);

  const [zeroLoading, setZeroLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [isSorted, setIsSorted] = useState(false);
  const [currentSkillNo, setCurrentSkillNo] = useState(0);

  const [dobInput, setDobInput] = useState("");
  const [appliedDob, setAppliedDob] = useState("");
  const [calculatedAge, setCalculatedAge] = useState("");

  const calculateAge = (dobString) => {
    const parts = dobString.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const dobDate = new Date(year, month, day);
      if (!isNaN(dobDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age >= 0) {
          setCalculatedAge(age);
          return;
        }
      }
    }
    setCalculatedAge("");
  };

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = value;
    if (value.length > 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length > 4) {
      formatted = formatted.slice(0, 5) + "/" + value.slice(4);
    }
    setDobInput(formatted);
    calculateAge(formatted);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCalculatedAge(value);
    
    if (value && value !== "0") {
      const age = parseInt(value, 10);
      const today = new Date();
      const prevYear = today.getFullYear() - age;
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      setDobInput(`${dd}/${mm}/${prevYear}`);
    } else if (value === "") {
      setDobInput("");
    }
  };

  const applyAgeFilter = () => {
    if (dobInput.length === 10) {
      setAppliedDob(dobInput);
      refreshSkillLeaderboard(currentSkillNo, dobInput);
      setOpenAgeFilterDialog(false);
      setIsSorted(true);
      toast.success("Searching by Age!");
    } else {
      toast.error("Please enter a valid date (DD/MM/YYYY)");
    }
  };


  const refreshLeaderboard = () => {
    if (ladderId) {
      if (isSkill) {
        dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
      } else {
        dispatch(fetchLeaderboard({ ladder_id: ladderId }));
        if (isMiniLeague) {
          dispatch(
            fetchMiniLeague({ ladder_id: ladderId, type: "minileague" }),
          );
        }
      }
    }
  };

  const refreshSkillLeaderboard = (skillNo = 0, customDob) => {
    if (!ladderId) return;

    let laddartype;
    let fetchSliceLeaderboard;

    if (typeFromParams === "positive" || ladderTypeFromParams === "positive") {
      laddartype = "positive";
      fetchSliceLeaderboard = fetchPositiveLeaderboard;
    } else if (typeFromParams === "negative" || ladderTypeFromParams === "negative") {
      laddartype = "negative";
      fetchSliceLeaderboard = fetchNegativeLeaderboard;
    } else {
      laddartype = "skill";
      fetchSliceLeaderboard = fetchSkillLeaderboard;
    }

    const finalDob = customDob !== undefined ? customDob : appliedDob;

    const payload = {
      ladder_id: ladderId,
      type: laddartype,
      sortbyskillnumber: skillNo,
    };

    if (finalDob) {
      payload.dob = finalDob;
    }

    dispatch(fetchSliceLeaderboard(payload));
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
    setAppliedDob("");
    setDobInput("");
    setCalculatedAge("");
    refreshSkillLeaderboard(0, "");
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

        {!isRoster && (
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
                onSuccessRefresh={
                  isSkill
                    ? refreshSkillLeaderboard
                    : refreshLeaderboard
                }
              />
            </DialogContent>
          </Dialog>
        )}

        {/* SKILL SPECIFIC BUTTONS */}
        {(isSkill || isPositive || isNegative) && (
          <>
            {!isSorted ? (
              <Button
                onClick={handleSortBySkill}
                className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight"
              >
                <Funnel size={20} /> SORT
              </Button>
            ) : (
              <Button
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-8 w-full shadow-lg flex items-center justify-center gap-2"
              >
                <Funnel size={20} /> CLEAR ALL
              </Button>
            )}
          </>
        )}

        {/* AGE FILTER BUTTON */}
        {isSkill && (
          <Dialog open={openAgeFilterDialog} onOpenChange={(open) => {
            setOpenAgeFilterDialog(open);
            if (!open) {
              setDobInput("");
              setCalculatedAge("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#163344] bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-16 w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight">
                Age Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#163344] text-white border border-[#2dd4bf] rounded-xl max-w-sm flex flex-col items-center p-6">
              <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-center w-full mt-2">AGE FILTER</DialogTitle>
              <div className="w-full flex justify-center mt-2 mb-6">
                <span className="h-1 w-20 bg-[#2dd4bf] rounded-full"></span>
              </div>
              <div className="flex flex-col items-center w-full gap-4 relative">
                <p className="text-xl font-semibold">Born Before</p>
                <div className="flex justify-center w-full">
                  <input
                    type="text"
                    value={dobInput}
                    onChange={handleDobChange}
                    placeholder="DD/MM/YYYY"
                    className="bg-[#242424] border border-gray-400 outline-none text-left p-1 text-2xl w-46 py-1 tracking-widest text-white transition-colors"
                  />
                </div>
                <div className="text-white text-lg mt-2 flex items-center justify-center gap-2">
                  <span className="font-semibold">that's under</span>
                  <div className="flex items-center">
                    <span className="text-white w-4 border-b-2 border-white mr-[1px]"></span>
                    <input
                      type="text"
                      value={calculatedAge}
                      onChange={handleAgeChange}
                      className="bg-[#242424] border border-gray-400 outline-none text-center text-xl w-16 py-1 text-white transition-colors"
                    />
                    <span className="text-white w-4 border-b-2 border-white ml-[1px]"></span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                <Button onClick={() => {
                  setOpenAgeFilterDialog(false);
                  setDobInput("");
                  setCalculatedAge("");
                }} className="bg-[#fbcfe8] text-[#9d174d] hover:bg-[#f9a8d4] font-bold rounded-xl h-12 text-lg">
                  Cancel
                </Button>
                <Button onClick={applyAgeFilter} className="bg-[#2dd4bf] text-[#115e59] hover:bg-[#14b8a6] font-bold rounded-xl h-12 text-lg">
                  Search
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

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

        {!isRoster && (
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
        )}
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
