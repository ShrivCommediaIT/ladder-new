

"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowLeft, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
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
  const ladderTypeFromUrl = searchParams.get("ladder_type");

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

  useEffect(() => {
    if (!ladder_id) return;
    const interval = setInterval(() => {
      dispatch(fetchLeaderboard({ ladder_id }));
      dispatch(fetchUserActivity({ ladder_id }));
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, ladder_id]);

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
console.log("handleEnter==>", user_id, ladder_id, currentId, selectedNumber, selectedNumber);

    if (!selectedNumber || isNaN(selectedNumber)) return;

    if (!resultType) return;

    if ((ladderType === "best3" || ladderType === "best5") && !score)
      return;

    if (!challengedPlayer) return;

    // BLOCK SELF OR LOWER RANK
    if (Number(selectedNumber) >= Number(currentRank)) {
      setShowRankAlert(true);
      return;
    }

    // ✅ VALID
    setShowConfirm(true);
  };

  const confirmMove = async () => {
    try {
      setLoading(true);

      let payload;

      if (ladderType === "best5" || ladderType === "best3") {
        payload = {
          ladder_id,
          match_status: resultType,
          user_id,
          move_to_rank: Number(selectedNumber),
          move_from_rank: currentRank,
          score,
          bet: betDescription,
        };
        const movePlayer = await dispatch(movePlayerBestOf5(payload)).unwrap();
          if (movePlayer.success_message == "Success") {
          toast.success("Result posted successfully! ");
          updateLadderToken({
            user_id: selectedPlayer.name,
            ladder_id,
            ladder_type: ladderType,
          })
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
        };

        const movePlayerRes = await dispatch(movePlayer(payload)).unwrap();
        
        if (movePlayerRes.success_message == "Success") {
          toast.success("Result posted successfully! ");
          updateLadderToken({
            user_id: selectedPlayer.name,
            ladder_id,
            ladder_type: ladderType,
          })
        } else {
          toast.error("Failed to post result. Please try again.");
        }
      }

      await Promise.all([
        dispatch(fetchLeaderboard({ ladder_id })),
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

      {/* Beat / Lost */}
      {/* <div className="flex justify-center gap-6 mb-2">
        {["beat", "lost"].map((type) => (
          <div
            key={type}
            onClick={() => setResultType(type)}
            className={`px-5 py-1 rounded-full cursor-pointer transition ${
              resultType === type
                ? "bg-green-500 text-black font-semibold"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {type === "beat" ? "Beat" : "Lost"}
          </div>
        ))}
      </div> */}

      <div className="flex justify-center gap-6 mb-2">
        <div
          onClick={() => setResultType("beat")}
          className={`px-5 py-1 rounded-full cursor-pointer transition ${resultType === "beat"
              ? "bg-green-500 text-black font-semibold"
              : "bg-gray-700 hover:bg-gray-600"
            }`}
        >
          Beat
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
        readOnly
        className="text-center text-3xl mb-2 bg-black text-green-400 border border-gray-700"
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


      <div className="flex gap-3">
        <Button onClick={handleBackspace} className="flex-1 bg-gray-700">
          <ArrowLeft />Back
        </Button>
        <Button variant="destructive" onClick={onClose} className="flex-1">
          <X />Cancel
        </Button>
        <Button
          onClick={handleEnter}
          disabled={!isFormValid}
          className={`flex-1 text-white ${isFormValid
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          <CheckCircle />POST 
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
              {`${selectedPlayer?.name || "Player"} beat ${challengedPlayer?.name || "Player"
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
    </motion.div>
  );
};

export default MoveNumberInput;
