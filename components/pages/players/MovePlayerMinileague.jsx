

"use client";

import { useState, React, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ArrowLeft, X, CheckCircle, XCircle, AlertCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { moveMiniLeague } from "@/redux/slices/playerMovingSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
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

const MoveNumberMinileague = ({
  onClose,
  currentId,
  currentRank,
  setLoading,
  selectedPlayer,
  userId,
  ladderId,
  currentSectionIndex,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const fallbackLadderId = Number(searchParams.get("ladder_id")) || null;
  const effectiveLadderId = ladderId || fallbackLadderId;

  // Existing state
  const [selectedNumber, setSelectedNumber] = useState("");
  const [localLoading, setLocalLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resultType, setResultType] = useState("");
  const [score, setScore] = useState("");
  const [betDescription, setBetDescription] = useState("");
  const [selfAlert, setSelfAlert] = useState(false);

  // NEW: Win/Loss detection and loading states
  const [isWin, setIsWin] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const rawMiniLeague = useSelector((state) => state.minileague?.data || []);
  const ladderDetails = useSelector(
    (state) => state.player?.players?.[effectiveLadderId]?.ladderDetails || {}
  );
  const ladderType = ladderDetails?.type?.trim().toLowerCase() || "minileague";

  // FIXED: Get current player rank from multiple sources with fallback
  const currentPlayerRank = useMemo(() => {
    // Priority 1: Use passed currentRank
    if (currentRank != null && !isNaN(Number(currentRank)) && Number(currentRank) > 0) {
      return Number(currentRank);
    }

    // Priority 2: Use selectedPlayer rank
    if (selectedPlayer?.rank != null && !isNaN(Number(selectedPlayer.rank)) && Number(selectedPlayer.rank) > 0) {
      return Number(selectedPlayer.rank);
    }

    // Priority 3: Lookup from players data
    const effectiveCurrentId = currentId || selectedPlayer?.id;
    if (effectiveCurrentId) {
      const playerInSection = rawMiniLeague
        .flatMap((section) => (section?.users_record || section?.users || []))
        .find((p) => Number(p.id) === Number(effectiveCurrentId));

      if (playerInSection?.rank != null && !isNaN(Number(playerInSection.rank)) && Number(playerInSection.rank) > 0) {
        return Number(playerInSection.rank);
      }
    }

    console.warn("No valid current player rank found", { currentRank, selectedPlayer, currentId });
    return null;
  }, [currentRank, selectedPlayer, currentId, rawMiniLeague]);

  const { players, sectionMap } = useMemo(() => {
    let players = [];
    let sectionMap = {};
    rawMiniLeague.forEach((sectionObj, sectionIndex) => {
      const users = sectionObj?.users_record || sectionObj?.users || [];
      users.forEach((p) => {
        const playerId = Number(p.id);
        players.push({
          ...p,
          id: playerId,
          rank: Number(p.rank || 0),
          sectionIndex,
        });
        sectionMap[playerId] = sectionIndex;
      });
    });
    return { players, sectionMap };
  }, [rawMiniLeague]);

  const getCurrentSection = useCallback(() => {
    if (typeof currentSectionIndex === "number") return currentSectionIndex;
    if (typeof selectedPlayer?.sectionIndex === "number") return selectedPlayer.sectionIndex;
    const id = currentId || selectedPlayer?.id;
    if (id && typeof sectionMap[id] === "number") return sectionMap[id];
    return 0;
  }, [currentSectionIndex, selectedPlayer, currentId, sectionMap]);

  const effectiveCurrentId = currentId || selectedPlayer?.id || null;
  const currentSection = getCurrentSection();
  const sectionName = rawMiniLeague[currentSection]?.section || `Section ${currentSection + 1}`;

  const sameSectionPlayers = useMemo(
    () => players.filter((p) => p.sectionIndex === currentSection),
    [players, currentSection]
  );

  const availableRanks = useMemo(
    () => sameSectionPlayers.map((p) => Number(p.rank)).sort((a, b) => a - b),
    [sameSectionPlayers]
  );

  const isValidRankForSection = useCallback(
    (rank) => availableRanks.includes(Number(rank)),
    [availableRanks]
  );

  const challengedPlayer = useMemo(
    () => sameSectionPlayers.find((p) => Number(p.rank) === Number(selectedNumber)),
    [sameSectionPlayers, selectedNumber]
  );

  const targetSectionIndex = challengedPlayer?.sectionIndex ?? null;

  const numberButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const scoreOptions =
    ladderType === "best3"
      ? ["2-0", "2-1"]
      : ladderType === "best5" || ladderType === "minileague"
        ? ["3-0", "3-1", "3-2"]
        : [];

  // NEW: Open confirm dialog with win/loss detection
  const openConfirmDialog = useCallback(() => {
    if (!score) return;

    // Detect win/loss based on resultType and score
    const isUserWin = resultType === "beat";
    setIsWin(isUserWin);
    setShowConfirm(true);
  }, [resultType, score]);

  useEffect(() => {
    if (effectiveLadderId && rawMiniLeague.length === 0) {
      dispatch(fetchMiniLeague({ ladder_id: effectiveLadderId }));
    }
  }, [dispatch, effectiveLadderId, rawMiniLeague.length]);

  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleNumberClick = (num) => {
    const newNumber = String(selectedNumber) + String(num);
    if (newNumber.length <= 3) {
      if (newNumber.length < 3 || isValidRankForSection(newNumber)) {
        setSelectedNumber(newNumber);
      } else {
        toast.error(`Rank ${newNumber} not available in Section ${currentSection + 1}`);
      }
    }
  };

  const handleBackspace = () => setSelectedNumber((prev) => String(prev).slice(0, -1));
  const handleCancel = () => {
    resetForm();
    onClose();
  };
  const resetForm = () => {
    setSelectedNumber("");
    setResultType("");
    setScore("");
    setBetDescription("");
    setIsWin(false);
  };

  // ENHANCED: Updated confirmMove with loading states
  const confirmMove = async () => {


    if (!userId || !effectiveLadderId || !effectiveCurrentId) {
      toast.error("Missing required information.");
      setShowConfirm(false);
      return;
    }



    if (!challengedPlayer) {
      toast.error("Selected player not found in this section.");
      setShowConfirm(false);
      return;
    }

    if (challengedPlayer.sectionIndex !== currentSection) {
      toast.error(`Cross-section match! Only Section ${currentSection + 1} allowed.`);
      setShowConfirm(false);
      return;
    }

    if (!currentPlayerRank || currentPlayerRank <= 0) {
      toast.error(
        `Current player rank missing! Debug: currentRank=${currentRank}, selectedPlayer.rank=${selectedPlayer?.rank}, computed=${currentPlayerRank}`
      );
      console.error("Current player rank debug:", {
        currentRank,
        selectedPlayerRank: selectedPlayer?.rank,
        currentPlayerRank,
        currentId: effectiveCurrentId,
        currentSection,
      });
      setShowConfirm(false);
      return;
    }

    try {
      setIsConfirming(true);
      setLoading?.(true);

      const fromSectionName = rawMiniLeague[currentSection]?.section || "unknown";
      const toSectionName = fromSectionName;

      const payload = {
        user_id: Number(userId),
        ladder_id: Number(effectiveLadderId),
        match_status: resultType,
        move_to_rank: Number(selectedNumber),
        move_from_rank: currentPlayerRank,
        score: score || "",
        bet: betDescription || "",
        move_from_section: fromSectionName,
        move_to_section: toSectionName,
        challengedPlayer: challengedPlayer ?? null,
      };

      const moveMiniLeagueRes = await dispatch(moveMiniLeague(payload)).unwrap();
      
      if (moveMiniLeagueRes.success_message == "Success") {
        toast.success(`Result posted in Section ${currentSection + 1}`, { autoClose: 2000 });
        if(moveMiniLeagueRes?.eligible_for_token == 1){
          updateLadderToken({
            user_id: selectedPlayer.name,
            ladder_id : effectiveLadderId,
            ladder_type: "minileague",
          })
        }
      }else{
          toast.error("Failed to post result. Please try again.");
      }

      await Promise.all([
        dispatch(fetchMiniLeague({ ladder_id: effectiveLadderId })),
        dispatch(fetchUserActivity({ ladder_id: effectiveLadderId })),
      ]);

      setShowConfirm(false);
      resetForm();
      onClose();
    } catch (err) {
      const errorMsg = err?.message || err?.error || "Result Already Posted!";
      toast.warn(errorMsg, { autoClose: 2000 });
    } finally {
      setIsConfirming(false);
      setLoading?.(false);
    }
  };

  const handleEnter = () => {
    console.log(userId)
    if (!userId || !effectiveLadderId || !effectiveCurrentId) {
      toast.error("Missing required information.");
      return;
    }

    if (Number(selectedNumber) === currentPlayerRank) {
      setSelfAlert(true);
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

    if (ladderType === "minileague" && !score) {
      toast.error("Please select the match score.");
      return;
    }

    if (!challengedPlayer) {
      toast.error(`Player with rank ${selectedNumber} not found in Section ${currentSection + 1}`);
      return;
    }

    if (challengedPlayer.sectionIndex !== currentSection) {
      toast.error(`Player in Section ${challengedPlayer.sectionIndex + 1}, not your Section ${currentSection + 1}`);
      return;
    }

    openConfirmDialog();
  };

  if (localLoading) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 space-y-6">
        <Skeleton className="h-6 w-3/4 bg-gray-700 rounded-lg" />
        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-1/2 bg-gray-700 rounded-lg" />
          <Skeleton className="h-8 w-1/2 bg-gray-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="
          w-full
          max-w-[95vw] sm:max-w-xl md:max-w-4xl lg:max-w-4xl
          mx-auto
          p-3 sm:p-0 md:p-0
          text-gray-100
          rounded-xl
          max-h-[80vh]
          overflow-y-auto
          scrollbar-thin
          scrollbar-thumb-gray-600
          scrollbar-track-transparent
          h-[90vh]
        "
      >
        {/* Add debug info for troubleshooting */}
        {process.env.NODE_ENV === 'development' && !currentPlayerRank && (
          <div className="p-2 bg-red-900/50 border border-red-500 text-xs mb-2 rounded">
            DEBUG: No current rank found. Check parent component data.
          </div>
        )}

        <h3 className="text-sm mb-2 sm:text-lg font-bold text-violet-200 text-center">
          Record Match Result
          <span className="text-sm text-blue-400 block">
            {sectionName}
            <span className="text-green-400 ml-1">
              ({sameSectionPlayers.length} players)
            </span>
          </span>
        </h3>

        {/* Result Selection */}
        <div className="w-full mx-auto mb-2 bg-gray-900/70 rounded-xl border border-gray-700 shadow-md">
          <p className="text-sm font-medium mt-2 text-gray-300 text-center">
            Select the Match Outcome
          </p>

          <div className="flex flex-col items-center justify-center sm:flex-row sm:items-center sm:justify-center gap-4">
            <div className="flex items-center gap-4">
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

            <PlayerBet betDescription={betDescription} setBetDescription={setBetDescription} />
          </div>
        </div>

        {/* Score Selection */}
        {(ladderType === "best3" || ladderType === "best5" || ladderType === "minileague") && (
          <div className="mb-2 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-md">
            <p className="text-sm font-medium mb-3 text-gray-300 text-center">
              Select Final Score ({ladderType === "best3" ? "Best of 3" : "Best of 5 / Minileague"})
            </p>

            <div className="flex justify-center gap-2 flex-wrap">
              {scoreOptions.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <Checkbox
                    id={s}
                    checked={score === s}
                    onCheckedChange={(val) => setScore(val ? s : "")}
                    className="border-violet-500 data-[state=checked]:bg-violet-600"
                  />
                  <label htmlFor={s} className="text-base font-medium cursor-pointer">{s}</label>
                </div>
              ))}
            </div>

            <div className="py-1 px-2 mt-1 rounded-md bg-yellow-200">
              <p className="text-center text-black font-semibold">
                Please make absolutely certain you enter the correct score.
                <br />
                <span className="text-red-600">This cannot be undone</span>
              </p>
            </div>
          </div>
        )}

        {/* Rank Input + Numpad */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center p-3 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
            <p className="text-base font-medium mb-2 text-gray-300">
              Enter Challenged Rank
              <span className="text-green-400 font-semibold ml-2">
                {sectionName}
              </span>
            </p>

            <Input
              value={selectedNumber}
              readOnly
              placeholder="---"
              className={`
                mb-3
                text-3xl sm:text-4xl
                text-center
                font-mono
                w-full
                max-w-[180px]
                bg-gray-900
                border-violet-500
                text-violet-400
                tracking-widest
                rounded-xl
                ${selectedNumber && isValidRankForSection(selectedNumber)
                  ? 'border-green-500 ring-2 ring-green-500/30'
                  : 'border-violet-500'
                }
              `}
            />

            {challengedPlayer && (
              <div className="text-sm text-gray-100 mt-2 space-y-1">
                <p>Player: <span className="font-semibold text-green-400">{challengedPlayer.name}</span></p>
                <p className="font-medium text-green-400">
                  Same Section ({targetSectionIndex + 1})
                </p>
              </div>
            )}

            {selectedNumber && !isValidRankForSection(selectedNumber) && (
              <p className="text-md font-semibold text-red-400 mt-1 text-justify ">
                can only post results against players in your minileague section
                Rank <span className="text-yellow-400">{selectedNumber}</span> not in your section. <span className="text-yellow-400">Available: {availableRanks.slice(0, 6).join(', ')}{availableRanks.length > 6 ? '...' : ''}</span>
              </p>
            )}
          </div>

          <div className="w-full md:w-1/4 max-w-xs grid grid-cols-3 gap-2">
            {numberButtons.map((num) => {
              if (num === 0) {
                return (
                  <div key="zero-row" className="contents">
                    <div />
                    <motion.button
                      onClick={() => handleNumberClick(num)}
                      whileTap={{ scale: 0.95 }}
                      className="h-8 w-full bg-gray-700 text-center text-gray-100 hover:bg-violet-600 transition-all text-xl font-bold rounded-xl shadow-lg border border-gray-600"
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
                  className="h-8 w-full bg-gray-700 text-gray-100 hover:bg-violet-600 transition-all text-xl font-bold rounded-xl shadow-lg border border-gray-600"
                >
                  {num}
                </motion.button>
              );
            })}
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <Button variant="outline" onClick={handleBackspace} className="w-full sm:w-auto bg-gray-700 text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-1" /> Backspace
          </Button>

          <Button variant="destructive" onClick={handleCancel} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>

          <Button
            onClick={handleEnter}
            disabled={!selectedNumber || !resultType || (ladderType === "minileague" && !score) || !challengedPlayer || !currentPlayerRank}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold disabled:bg-gray-600"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Post Result
          </Button>
        </div>

        {/* ENHANCED Confirm Dialog with Win/Loss */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent className="bg-gray-900 border-violet-500 text-gray-100 w-[92vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-violet-400 flex items-center gap-2">
                {isWin ? (
                  <CheckCircle className="text-green-500 h-5 w-5 animate-pulse" />
                ) : (
                  <XCircle className="text-red-500 h-5 w-5 animate-pulse" />
                )}
                Confirm {isWin ? 'WIN' : 'LOSS'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-200 mt-4 space-y-4 text-sm">
                {/* Match Details Card */}
                <div>

                  <div className={`py-3 px-4 rounded text-md font-bold mx-auto w-fit ${isWin
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                    {isWin ? 'WIN' : ' LOSS'} ({score}) vs #{selectedNumber} ({challengedPlayer?.name})
                  </div>
                </div>

                {/* Warning Banner */}
                <div className="py-2 px-2 rounded-lg bg-gradient-to-r from-red-900/20 to-red-900/10 border border-red-500/30 backdrop-blur-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-200 font-semibold text-sm">
                        Please verify all details carefully.
                        This action cannot be undone.
                      </p>

                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
              <AlertDialogCancel className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 h-11">
                <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmMove}
                className={`w-full sm:w-auto h-11 font-semibold ${isWin
                  ? 'bg-green-600 hover:bg-green-700 border-green-500/50'
                  : 'bg-red-600 hover:bg-red-700 border-red-500/50'
                  }`}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    {isWin ? <CheckCircle className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {isWin ? 'Confirm WIN & Post' : 'Confirm LOSS & Post'}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Self-match alert */}
        <AlertDialog open={selfAlert} onOpenChange={setSelfAlert}>
          <AlertDialogContent className="bg-red-900 border-red-500 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold">
                Invalid Action
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-red-200">
                You cannot post a result against yourself.
                <br />
                Please choose another player from your section.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => setSelfAlert(false)}
                className="bg-red-600 hover:bg-red-700"
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
};

export default MoveNumberMinileague;

