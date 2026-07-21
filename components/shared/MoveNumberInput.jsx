

"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowLeft, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import {
  movePlayer,
  movePlayerBestOf5,
} from "@/redux/slices/playerMovingSlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
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
import PlayerBet from "../pages/players/PlayerBet";

import { useSearchParams } from "next/navigation";
import { updateLadderToken } from "@/helper/helperApi";

const MoveNumberInput = ({
  onClose = () => { },
  currentId = null,
  currentRank = null,
  setLoading = () => { },
  selectedPlayer = {},
  userId = null,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // ladderId from URL
  const ladder_id = Number(searchParams.get("ladder_id"));
  const ladderTypeFromUrl = searchParams.get("type") || searchParams.get("ladder_type");

  // logged in user id
  const user_id = Number(userId);

  const players =
    useSelector(
      (state) => state.player?.players?.[ladder_id]?.data
    ) || [];

  const ladderDetails =
    useSelector(
      (state) =>
        state.player?.players?.[ladder_id]?.ladderDetails
    ) || {};

  const ladderType =
    ladderDetails?.type || ladderTypeFromUrl || "winlose";

  /* -------------------- STATE -------------------- */
  const [selectedNumber, setSelectedNumber] = useState("");
  const [localLoading, setLocalLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultType, setResultType] = useState("");
  const [score, setScore] = useState("");
  const [betDescription, setBetDescription] = useState("");

  const [showRankAlert, setShowRankAlert] = useState(false);
  // const [showSectionAlert, setShowSectionAlert] = useState(false);
  const preset = useSelector((state) => state.gradebar?.preset) || 6;

  /* -------------------- DATA -------------------- */
  const challengedPlayer =
    players.find((p) => p.rank === Number(selectedNumber)) || null;

  const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const scoreOptions =
    ladderType === "best3"
      ? ["2-0", "2-1"]
      : ladderType === "best5"
        ? ["3-0", "3-1", "3-2"]
        : [];

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Live activity poll — refreshes leaderboard + activity every 5s for real-time display
  useEffect(() => {
    if (!ladder_id) return;
    const effectiveType = ladderTypeFromUrl || ladderType;
    const interval = setInterval(() => {
      dispatch(fetchLeaderboard({ ladder_id, type: effectiveType }));
      dispatch(fetchUserActivity({ ladder_id }));
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, ladder_id, ladderTypeFromUrl, ladderType]);

  /* -------------------- HANDLERS -------------------- */
  const handleNumberClick = (num) => {
    if (selectedNumber.length < 3) {
      setSelectedNumber((prev) => prev + num);
    }
  };

  const handleBackspace = () =>
    setSelectedNumber((prev) => prev.slice(0, -1));

  const resetForm = () => {
    setSelectedNumber("");
    setResultType("");
    setScore("");
    setBetDescription("");
  };


  const isFormValid =
    user_id &&
    ladder_id &&
    currentId &&
    selectedNumber &&
    !isNaN(selectedNumber) &&
    resultType &&
    challengedPlayer &&
    (
      ladderType !== "best3" && ladderType !== "best5"
        ? true
        : score
    );


  const handleEnter = () => {


    if (!user_id || !ladder_id || !currentId) return;

    if (!selectedNumber || isNaN(selectedNumber)) return;

    if (!resultType) return;

    if ((ladderType === "best3" || ladderType === "best5") && !score)
      return;

    if (!challengedPlayer) return;

    //  REAL SECTION BY RANK (NOT BY FIELD)
    const currentSectionIndex = Math.floor(
      (Number(currentRank) - 1) / Number(preset)
    );

    const targetSectionIndex = Math.floor(
      (Number(challengedPlayer.rank) - 1) / Number(preset)
    );

    // BLOCK SELF OR LOWER RANK (Ranks are 1-based, 1 is best)
    // Commented out to allow challenging both higher and lower ranked players
    // if (Number(selectedNumber) >= Number(currentRank)) {
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

    // ✅ VALID
    setShowConfirm(true);
  };

  const confirmMove = async () => {
    try {
      setLoading(true);

      let payload;
      const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));

      if (ladderType === "best5" || ladderType === "best3") {
        payload = {
          ladder_id,
          match_status: resultType,
          user_id,
          move_to_rank: Number(selectedNumber),
          move_from_rank: currentRank,
          score,
          admin_id: adminDetails?.id,
          user_name: selectedPlayer.name,
          witness_by: selectedPlayer.name,

          // ✅ Only send bet for beat/lost
          ...(resultType === "beat" || resultType === "lost"
            ? { bet: betDescription }
            : {}),
        };
        const movePlayer = await dispatch(movePlayerBestOf5(payload)).unwrap();
          if (movePlayer.success_message == "Success") {
          toast.success("Result posted successfully! ");
          if(movePlayer?.eligible_for_token == 1){
            await updateLadderToken({
              user_id: selectedPlayer.name,
              ladder_id,
              ladder_type: ladderType,
            })
            await updateLadderToken({
              user_id: challengedPlayer.name,
              ladder_id,
              ladder_type: ladderType,
            })
          }
        } else {
          toast.error("Failed to post result. Please try again.");
        }
      } else {

        payload = {
          user_id,
          ladder_id,
          match_status: resultType,
          move_from_user_id: currentId,
          move_to_rank: Number(selectedNumber),
          move_from_rank: currentRank,
          score,
          admin_id: adminDetails?.id,
          user_name: selectedPlayer.name,
          witness_by: selectedPlayer.name,

          // ✅ Only send bet for beat/lost
          ...(resultType === "beat" || resultType === "lost"
            ? { bet: betDescription }
            : {}),
        };

        const movePlayerRes = await dispatch(movePlayer(payload)).unwrap();
        
        if (movePlayerRes.success_message == "Success") {
          toast.success("Result posted successfully! ");
          if(movePlayerRes?.eligible_for_token == 1){
            await updateLadderToken({
              user_id: selectedPlayer.name,
              ladder_id,
              ladder_type: ladderType,
            })
            await updateLadderToken({
              user_id: challengedPlayer.name,
              ladder_id,
              ladder_type: ladderType,
            })
          }
        } else {
          toast.error("Failed to post result. Please try again.");
        }
      }

      const effectiveType = ladderTypeFromUrl || ladderType;
      await Promise.all([
        dispatch(fetchLeaderboard({ ladder_id, type: effectiveType })),
        dispatch(fetchUserActivity({ ladder_id })),
      ]);

      resetForm();
      setShowConfirm(false);
      setShowSuccess(true); // Show success dialog
    } catch (err) {
      console.err(err?.message || "Failed to submit result.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  if (localLoading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Skeleton className="h-10 w-full mb-3 bg-gray-800" />
        <Skeleton className="h-10 w-full bg-gray-800" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-full mx-auto p-1 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-gray-700 text-white"
    >
      <h2 className="text-2xl font-semibold text-center mb-1">
        Match Result
      </h2>

     
      {/* Result Selection */}
      <div className="flex items-center justify-center mx-auto gap-10 mb-2 p-3 rounded-xl ">
        <div className="flex items-center gap-2">
          <Checkbox
            id="beat"
            checked={resultType === "beat"}
            onCheckedChange={(val) => setResultType(val ? "beat" : "")}
            className="border-green-300 data-[state=checked]:bg-green-500"
          />
          <label htmlFor="beat" className="text-base font-medium cursor-pointer">
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
          <label htmlFor="lost" className="text-base font-medium cursor-pointer">
            Lost to
          </label>
        </div>
      </div>

      <PlayerBet
        betDescription={betDescription}
        setBetDescription={setBetDescription}
      />

      {(ladderType === "best3" || ladderType === "best5") && (
        <div className="flex justify-center gap-3 my-2 flex-wrap">
          {scoreOptions.map((s) => (
            <div
              key={s}
              onClick={() => setScore(s)}
              className={`px-4 py-1 rounded-full cursor-pointer border ${score === s
                  ? "bg-blue-500 border-blue-500 text-black font-bold"
                  : "border-gray-600 hover:bg-gray-700"
                }`}
            >
              {s}
            </div>
          ))}
        </div>
      )}

      <Input
        value={selectedNumber}
        placeholder="Select rank"
        readOnly
        className="text-center md:text-3xl text-xl mb-2 bg-black text-green-400 border border-gray-700"
      />

      <div className="grid grid-cols-3 gap-3 mb-2">
        {numberButtons.map((num) => {
          if (num === 0) {
            return (
              <div key="zero-row" className="contents">
                <div />
                <Button
                  onClick={() => handleNumberClick(num)}
                  className="py-2 text-lg bg-gray-800 hover:bg-gray-700"
                >
                  {num}
                </Button>
                <div />
              </div>
            );
          }

          return (
            <Button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="py-2 text-lg bg-gray-800 hover:bg-gray-700"
            >
              {num}
            </Button>
          );
        })}
      </div>


      <div className="flex gap-2 sm:gap-3">
        <Button onClick={handleBackspace} className="flex-1 bg-gray-700 px-2 sm:px-4 text-xs sm:text-sm">
          <ArrowLeft className="h-4 w-4 mr-1 inline" />Back
        </Button>
        <Button variant="destructive" onClick={onClose} className="flex-1 px-2 sm:px-4 text-xs sm:text-sm">
          <X className="h-4 w-4 mr-1 inline" />Cancel
        </Button>
        <Button
          onClick={handleEnter}
          disabled={!isFormValid}
          className={`flex-1 text-white px-2 sm:px-4 text-xs sm:text-sm ${isFormValid
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          <CheckCircle className="h-4 w-4 mr-1 inline" />POST 
        </Button>
      </div>

      {/* -------------------- CONFIRM DIALOG -------------------- */}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-gray-900 border-violet-500 text-gray-100 w-[92vw] sm:max-w-md">

          <AlertDialogHeader>

            <AlertDialogTitle className="text-xl font-bold text-violet-400 flex items-center gap-2">
              <CheckCircle className="text-green-500 h-5 w-5" />
              Confirm Result
            </AlertDialogTitle>

            <AlertDialogDescription className="text-start text-lg text-white">
              {`${selectedPlayer?.name || "Player"} ${resultType === "beat" ? "beat" : "lost to"} ${challengedPlayer?.name || "Player"
                } ${score || ""}`}
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5 flex flex-col sm:flex-row gap-3">

            <AlertDialogCancel className="w-full text-gray-800 sm:w-auto">
              Go Back
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmMove}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              Confirm & Post 
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

      {/* -------------------- SUCCESS ALERT -------------------- */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Result posted successfully for {challengedPlayer?.name || "Player"}!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setShowSuccess(false); onClose(); }}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRankAlert} onOpenChange={setShowRankAlert}>
        <AlertDialogContent className="bg-gray-900 border-red-500 text-gray-100 w-[92vw] sm:max-w-md">

          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-400">
              Invalid Challenge!
            </AlertDialogTitle>

            <AlertDialogDescription className="text-gray-300 mt-3 text-sm">

              You can only challenge higher ranked players.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5">
            <AlertDialogAction
              onClick={() => setShowRankAlert(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

      {/* <AlertDialog open={showSectionAlert} onOpenChange={setShowSectionAlert}>
        <AlertDialogContent className="bg-gray-900 border-yellow-500 text-gray-100 w-[92vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-yellow-400">
              Invalid Section!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 mt-3 text-sm text-start">
              You can only post results against players within your own minileague/section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5">
            <AlertDialogAction
              onClick={() => setShowSectionAlert(false)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </motion.div>
  );
};

export default MoveNumberInput;
