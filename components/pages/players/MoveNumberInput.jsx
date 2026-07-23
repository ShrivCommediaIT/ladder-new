

"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeft, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { movePlayer, movePlayerBestOf5 } from "@/redux/slices/playerMovingSlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { useSearchParams } from "next/navigation";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import PlayerBet from "./PlayerBet";
import { updateLadderToken } from "@/helper/helperApi";

const MoveNumberInput = ({
  onClose = () => { },
  currentId = null,
  currentRank = null,
  setLoading,
  selectedPlayer = {},
  userId: user_id
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");

  // States
  const [selectedNumber, setSelectedNumber] = useState("");
  const [localLoading, setLocalLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resultType, setResultType] = useState("");
  const [score, setScore] = useState("");
  const [betDescription, setBetDescription] = useState("");
  const [showSectionAlert, setShowSectionAlert] = useState(false);

  const [showRankAlert, setShowRankAlert] = useState(false);

  const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];


  const players = useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];
  const ladderDetails = useSelector((state) => state.player?.players?.[ladder_id]?.ladderDetails) || {};
  const ladderType = ladderDetails?.type;

  const challengedPlayer = players.find((p) => Number(p.rank) === Number(selectedNumber)) || null;

  const preset = useSelector((state) => state.gradebar?.preset) || 6;


  // Loading skeleton
  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Event Handlers
  const handleNumberClick = (num) => {
    if (selectedNumber.length < 3) {
      setSelectedNumber((prev) => prev + num);
    }
  };

  const handleBackspace = () => setSelectedNumber((prev) => prev.slice(0, -1));
  const handleCancel = () => onClose();

  const resetForm = () => {
    setSelectedNumber("");
    setResultType("");
    setScore("");
    setBetDescription("");
  };

  // FIXED: Correct payload structure
  const confirmMove = async () => {
    if (!user_id || !ladder_id || !currentId) {
      toast.error("Missing required information.");
      setShowConfirm(false);
      return;
    }

    try {
      setLoading(true);

      const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");
      const isLost = resultType === "lost";
      const challengedUserId = challengedPlayer?.id || challengedPlayer?.user_id || challengedPlayer?.player_id;

      // Common payload parts
      const commonPayload = {
        ladder_id,
        match_status: isLost ? "beat" : resultType,
        user_id,
        move_to_rank: isLost ? currentRank : Number(selectedNumber),
        move_from_rank: isLost ? Number(selectedNumber) : currentRank,
        score,
        admin_id: adminDetails.id,
        user_name: isLost ? challengedPlayer?.name : selectedPlayer?.name,
        opposit_user_id: isLost ? selectedPlayer?.name : challengedPlayer?.name,
        witness_by: "test",
        move_from_user_id: isLost ? challengedUserId : currentId,
        ...(resultType === "beat" || resultType === "lost"
          ? { bet: betDescription }
          : {}),
      };

      let response;
      if (ladderType === "best5" || ladderType === "best3") {
        if (ladderType === "best5") {
          response = await dispatch(movePlayerBestOf5(commonPayload)).unwrap();
        } else {
          response = await dispatch(movePlayer(commonPayload)).unwrap();
        }
      } else {
        console.log("standard ladder move payload", commonPayload);
        response = await dispatch(movePlayer(commonPayload)).unwrap();
      }

      if (response?.success_message === "Success") {
        toast.success("Result posted successfully!");

        // Handle token updates if eligible
        if (response?.eligible_for_token == 1) {
          try {
            await Promise.all([
              updateLadderToken({
                user_id: selectedPlayer.name,
                ladder_id,
                ladder_type: ladderType,
              }),
              updateLadderToken({
                user_id: challengedPlayer.name,
                ladder_id,
                ladder_type: ladderType,
              })
            ]);
          } catch (tokenErr) {
            console.error("Token Update Error:", tokenErr);
          }
        }

        // Refresh data
        const effectiveType = urlType || ladderType;
        await Promise.all([
          dispatch(fetchLeaderboard({ ladder_id, type: effectiveType })),
          dispatch(fetchUserActivity({ ladder_id })),
        ]);

        // Close and Reset
        setShowConfirm(false);
        resetForm();
        onClose();
      } else {
        toast.error(response?.message || "Failed to post result. Please try again.");
      }
    } catch (err) {
      console.error("Error Details:", err);
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  // ==================== new handle enter funtionality changes ==================

  const handleEnter = () => {
    if (!user_id || !ladder_id || !currentId) {
      toast.error("Missing required information.");
      return;
    }

    if (!selectedNumber || isNaN(selectedNumber) || Number(selectedNumber) <= 0) {
      toast.error("Please enter a valid rank number.");
      return;
    }

    if (!resultType) {
      toast.error("Please select 'Beat' or 'Lost'.");
      return;
    }

    if ((ladderType === "best3" || ladderType === "best5") && !score) {
      toast.error("Please select the match score.");
      return;
    }

    if (!challengedPlayer) {
      toast.error(`Player with rank ${selectedNumber} not found.`);
      return;
    }

    const currentPlayer = players.find(
      (p) => String(p.id) === String(currentId)
    );

    if (!currentPlayer) {      
      toast.error("Current player not found.");
      return;
    }

    //  REAL SECTION BY RANK (NOT BY FIELD)
    const currentSectionIndex = Math.floor(
      (Number(currentPlayer.rank) - 1) / Number(preset)
    );

    const targetSectionIndex = Math.floor(
      (Number(challengedPlayer.rank) - 1) / Number(preset)
    );


    // ❌ BLOCK INVALID RANK
    // Commented out to allow challenging both higher and lower ranked players
    // if (resultType === "beat" && Number(selectedNumber) >= Number(currentRank)) {
    //   setShowRankAlert(true);
    //   return;
    // }

    // if (resultType === "lost" && Number(selectedNumber) >= Number(currentRank)) {
    //   setShowRankAlert(true);
    //   return;
    // }

    // Prevent self challenge
    if (Number(selectedNumber) === Number(currentRank)) {
      toast.error("You cannot challenge yourself.");
      return;
    }


    // BLOCK CROSS-SECTION
    // if (currentSectionIndex !== targetSectionIndex) {
    //   setShowSectionAlert(true);
    //   return;
    // }

    // ALLOW SAME SECTION
    setShowConfirm(true);
  };


  // FIXED Score options
  const scoreOptions = ladderType === "best3"
    ? ["2-0", "2-1"]
    : ladderType === "best5"
      ? ["3-0", "3-1", "3-2"]
      : [];

  if (localLoading) {
    return (
      <div className="w-full max-w-lg mx-auto p-2 space-y-2">
        <Skeleton className="h-6 w-3/4 bg-gray-700 rounded-lg" />
        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-1/2 bg-gray-700 rounded-lg" />
          <Skeleton className="h-8 w-1/2 bg-gray-700 rounded-lg" />
        </div>
        {(ladderType === "best3" || ladderType === "best5") && (
          <Skeleton className="h-8 w-full bg-gray-700 rounded-lg" />
        )}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="
      w-full
      max-w-[95vw] overflow-auto sm:max-w-none md:max-w-none lg:max-w-none
      mx-auto
      p-3 sm:p-2 md:p-2
      text-slate-800 dark:text-gray-100
      rounded-xl
      max-h-[60vh]
      sm:max-h-[80vh]
      md:max-h-[80vh]
      lg:max-h-[80vh]
      scrollbar-thin
      scrollbar-thumb-gray-600
      scrollbar-track-transparent
    "
    >
      <h3 className="mb-2 text-xl sm:text-2xl font-bold text-slate-800 dark:text-violet-200 text-center">
        Record Match Result
      </h3>

      {/* Result Selection */}
      <div className="mb-2 p-2 bg-slate-50 dark:bg-gray-900/70 rounded-xl border border-slate-200 dark:border-gray-700 shadow-md">
        <p className="text-sm font-medium mb-1 text-slate-500 dark:text-gray-300 text-center">
          Select the Match Outcome
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-center gap-4">

          <div className="flex items-center justify-between mx-auto gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="beat"
                checked={resultType === "beat"}
                onCheckedChange={(val) => setResultType(val ? "beat" : "")}
                className="border-green-300 data-[state=checked]:bg-green-500"
              />
              <label htmlFor="beat" className="text-base font-medium cursor-pointer text-slate-700 dark:text-gray-200">
                Beat
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="lost"
                checked={resultType === "lost"}
                onCheckedChange={(val) => setResultType(val ? "lost" : "")}
                className="border-red-300 data-[state=checked]:bg-red-500"
              />
              <label htmlFor="lost" className="text-base font-medium cursor-pointer text-slate-700 dark:text-gray-200">
                Lost to
              </label>
            </div>
          </div>

          <PlayerBet betDescription={betDescription} setBetDescription={setBetDescription} />
        </div>
      </div>

      {/* Score Selection */}
      {(ladderType === "best3" || ladderType === "best5") && (
        <div className="mb-2 p-1.5 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-md">
          <p className="text-sm font-medium mb-2 text-slate-500 dark:text-gray-300 text-center">
            Select Final Score ({ladderType === "best3" ? "Best of 3" : "Best of 5"})
          </p>

          <div className="flex sm:flex justify-center gap-2">
            {scoreOptions.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <Checkbox
                  id={s}
                  checked={score === s}
                  onCheckedChange={(val) => setScore(val ? s : "")}
                  className="border-violet-500 data-[state=checked]:bg-violet-600"
                />
                <label htmlFor={s} className="text-base font-medium cursor-pointer text-slate-700 dark:text-gray-200">
                  {s}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rank Input + Numpad */}
      <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center p-4 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-xl">
        {/* Input */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
          <p className="text-base font-medium mb-2 text-slate-600 dark:text-gray-300">
            Enter Challenged Rank
          </p>

          <Input
            value={selectedNumber}
            readOnly
            placeholder="---"
            className="
            mb-1
            text-3xl sm:text-4xl
            text-center
            font-mono
            w-full
            max-w-[180px]
            bg-slate-100
            dark:bg-gray-900
            border-violet-300
            dark:border-violet-500
            text-violet-600
            dark:text-violet-400
            tracking-widest
            rounded-xl
          "
          />

          {challengedPlayer && (
            <p className="text-base text-slate-700 dark:text-gray-100 mt-1">
              Player: <span className="font-semibold">{challengedPlayer.name}</span>
            </p>
          )}
        </div>

        <div className="w-full md:w-1/2 max-w-xs grid grid-cols-3 gap-3">
          {numberButtons.map((num) => {
            if (num === 0) {
              return (
                <div key="zero-row" className="contents">
                  <div />
                  <motion.button
                    onClick={() => handleNumberClick(num)}
                    style={{ touchAction: "manipulation" }}
                    whileTap={{ scale: 0.95 }}
                    className="
              h-12
              w-full
              bg-slate-200
              text-slate-800
              dark:bg-gray-700
              dark:text-gray-100
              hover:bg-violet-600
              hover:text-white
              dark:hover:bg-violet-600
              transition-all
              text-xl
              font-bold
              rounded-xl
              shadow-lg
              border
              border-slate-300
              dark:border-gray-600
            "
                  >
                    {num}
                  </motion.button>
                  <div />
                </div>
              );
            }

            return (
              <motion.button
                key={num}
                onClick={() => handleNumberClick(num)}
                style={{ touchAction: "manipulation" }}
                whileTap={{ scale: 0.95 }}
                className="
          h-12
          w-full
          bg-slate-200
          text-slate-800
          dark:bg-gray-700
          dark:text-gray-100
          hover:bg-violet-600
          hover:text-white
          dark:hover:bg-violet-600
          transition-all
          text-xl
          font-bold
          rounded-xl
          shadow-lg
          border
          border-slate-300
          dark:border-gray-600
        "
              >
                {num}
              </motion.button>
            );
          })}
        </div>


      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleBackspace}
          className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border-0"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Backspace
        </Button>

        <Button
          variant="destructive"
          onClick={handleCancel}
          className="w-full sm:w-auto"
        >
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>

        <Button
          onClick={handleEnter}
          disabled={
            !selectedNumber ||
            !resultType ||
            ((ladderType === "best3" || ladderType === "best5") && !score)
          }
          className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold"
        >
          <CheckCircle className="w-4 h-4 mr-1" /> Post Result
        </Button>
      </div>


      {/* Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-violet-500 text-slate-900 dark:text-gray-100 w-[92vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <CheckCircle className="text-green-500 h-5 w-5" /> Confirm Result
            </AlertDialogTitle>

            <AlertDialogDescription className="text-start text-lg text-slate-700 dark:text-white">
              {resultType === "lost"
                ? `${selectedPlayer?.name || "Player"} lost to ${challengedPlayer?.name || "Player"} ${score || ""}`
                : `${selectedPlayer?.name || "Player"} beat ${challengedPlayer?.name || "Player"} ${score || ""}`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="w-full text-gray-800 dark:text-gray-200 sm:w-auto">
              Go Back
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmMove}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm & Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* ❌ DIFFERENT SECTION ALERT
      <AlertDialog open={showSectionAlert} onOpenChange={setShowSectionAlert}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-red-500 text-slate-900 dark:text-gray-100 w-[92vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-500 dark:text-red-400">
              Invalid Match!
            </AlertDialogTitle>

            <AlertDialogDescription className="text-slate-600 dark:text-gray-300 mt-3 text-sm">
              You can only play with players from the <b>same section</b>.
              <br />
              Cross-section matches are <b>not allowed</b>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5">
            <AlertDialogAction
              onClick={() => setShowSectionAlert(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              OK, Got It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      */}


      {/* ❌ INVALID RANK ALERT */}
      <AlertDialog open={showRankAlert} onOpenChange={setShowRankAlert}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-red-500 text-slate-900 dark:text-gray-100 w-[92vw] sm:max-w-md">

          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-500 dark:text-red-400">
              Invalid Challenge!
            </AlertDialogTitle>

            <AlertDialogDescription className="text-slate-600 dark:text-gray-300 mt-3 text-sm">
              {resultType === "lost"
                ? "You can only report a loss to lower ranked players."
                : "You can only challenge higher ranked players."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5">
            <AlertDialogAction
              onClick={() => setShowRankAlert(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );

};

export default MoveNumberInput;
