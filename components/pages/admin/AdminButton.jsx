

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
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import AddRemoveBox from "./AddRemoveBox"; // AddRemoveBox (handles add/remove/move logic)
import UploadPlayerLists from "../uploadCsv/UploadPlayerLists";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { clearActivityState } from "@/redux/slices/activitySlice";
import BasicLeaderboardSetUpSkill from "./BasicLeaderboardSetUpSkill";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import BasicLeaderboardShort from "./BasicLeaderboardShort";
import { paymentPage } from "@/helper/RouteName";

// import { Funnel } from "lucide-react";
import {
  Funnel,
  RotateCw,
  RefreshCw,
  XCircle,
  PlusCircle,
  Upload,
  CreditCard,
  Zap,
} from "lucide-react"; // import lucide icons
// import InvertRankButton from "./InvertRankButton";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const AdminButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const ladderId = searchParams.get("ladder_id");
  const typeFromParams = searchParams.get("type");

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
  const [confirmType, setConfirmType] = useState(""); // zero | update | reset | reset_skill
  const [isSorted, setIsSorted] = useState(false);

  const [isDescending, setIsDescending] = useState(false);

  // REFRESH FUNCTIONS
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

  const refreshSkillLeaderboard = (skillNo = 0) => {
    if (ladderId) {
      dispatch(
        fetchSkillLeaderboard({
          ladder_id: ladderId,
          type: "skill",
          sortbyskillnumber: skillNo,
        }),
      );
    }
  };

  useEffect(() => {
    if (ladderId) dispatch(fetchGradebars(ladderId));
  }, [ladderId, dispatch]);

  // ZERO SCORE
  const handleZeroScore = async () => {
    setZeroLoading(true);
    try {
      const res = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/resetscore",
        {
          params: { ladder_id: ladderId },
          headers: { APPKEY },
        },
      );

      if (res?.data?.status === 200) {
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

  // UPDATE MINI LEAGUE
  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const res = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/update/minileague",
        {
          params: { ladder_id: ladderId },
          headers: { APPKEY },
        },
      );

      if (res?.data?.status === 200) {
        toast.success("Mini League updated successfully!");
        refreshLeaderboard();
      }
    } catch {
      toast.error("Failed to update Mini League");
    } finally {
      setUpdateLoading(false);
    }
  };

  // RESET REGULAR LADDER
  const handleReset = async () => {
    setResetLoading(true);
    try {
      await axios.get(
        `https://ne-games.com/leaderBoard/api/user/Resetleaderboard?ladder_id=${ladderId}`,
        {
          headers: { APPKEY },
        },
      );

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

  // RESET SKILL LADDER
  const handleResetSkill = async () => {
    setResetLoading(true);
    try {
      await axios.get(
        `https://ne-games.com/leaderBoard/api/user/resetSkillboard?ladder_id=${ladderId}`,
        {
          headers: { APPKEY },
        },
      );

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
    refreshSkillLeaderboard(0);
  };

  // Upgrade
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
        {(isSkill  || isPositive || isNegative) && (
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

 

{!isMiniLeague && !isSkill && !isRoster && !isPositive && !isNegative &&  (
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

      {/* Skill ladder → add/remove only
          Others → add/remove/move */}

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
        {(isSkill  || isPositive || isNegative) && (
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

        {/* <div className="">
             <InvertRankButton
            isDescending={isDescending}
            onToggle={() => setIsDescending((prev) => !prev)}
          />
        </div> */}

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
            {(isSkill  || isPositive || isNegative) && (
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

        {/* PURCHASE LADDER */}
        {/* <Button
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
        </Button> */}

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
