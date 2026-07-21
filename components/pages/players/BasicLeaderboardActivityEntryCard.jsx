"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getRequest, postUrlEncoded } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { updateLadderToken } from "@/helper/helperApi";
import { useSearchParams } from "next/navigation";
import { convertTimeToSeconds } from "@/helper/helperFunction";


import { Card } from "@/components/ui/card";
const activityNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BasicLeaderboardActivityEntryCard({
  ladderId,
  playerId,
  skillActivityId,
  initialActivity,
  onClose,
  playerName,
  selectedPlayer
}) {
  const [selectedActivity, setSelectedActivity] = useState(initialActivity || 1);
  const [value, setValue] = useState("0");
  const [currentScore, setCurrentScore] = useState(0);
  const [witnessBy, setWitnessBy] = useState("");
  const [skillSign, setSkillSign] = useState("+");
  const [skillDesc, setSkillDesc] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openSuccessResult, setOpenSuccessResult] = useState(false);
  const [topScore, setTopScore] = useState(0);
  const [todaysScore, setTodaysScore] = useState(0);
  const [skillTarget, setSkillTarget] = useState("");
  const [openZeroAlert, setOpenZeroAlert] = useState(false);
  const [zeroAction, setZeroAction] = useState(null);
  const [bestInputFocused, setBestInputFocused] = useState(false);
  const [loadingTopScore, setLoadingTopScore] = useState(true);
  const [hasEditedToday, setHasEditedToday] = useState(false);
  const lastTopScoreRequestRef = useRef("");

  const searchParams = useSearchParams();
  const [openYoutubeVerification, setOpenYoutubeVerification] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  // "ok" | "reset" | null
  useEffect(() => {
    if (initialActivity) {
      setSelectedActivity(initialActivity);
    }
  }, [initialActivity]);

  useEffect(() => {
    if (selectedPlayer && selectedPlayer.scores && selectedPlayer.scores.length > 0) {
      const currentScoreObj = selectedPlayer.scores.find(s => s.skill_number === selectedActivity) || selectedPlayer.scores[skillActivityId];
      const posScore = currentScoreObj?.score;
      if (posScore !== undefined && posScore !== null) {
        setValue(String(posScore));
        setCurrentScore(posScore);

      } else {
        setValue("0");
      }
      setHasEditedToday(false);
    }
  }, [selectedPlayer, selectedActivity]);


  useEffect(() => {
    if (!selectedActivity || !ladderId) return;

    const fetchSkill = async () => {
      try {
        setLoadingSkill(true);
        const res = await getRequest(API_ENDPOINTS.GET_SKILL_BY_NUMBER, {
          ladder_id: ladderId,
          skill_number: selectedActivity,
        });

        const data = res?.data || {};
        setSkillDesc(data.skill_description || "");
        setSkillTarget(data.target || "No target");
        setSkillSign(data.skill_sign === "-" ? "-" : "+");
      } catch (err) {
        console.error("Skill fetch failed", err);
      } finally {
        setLoadingSkill(false);
      }
    };
    fetchSkill();
  }, [selectedActivity, ladderId]);

  /* ---------------- INPUT HANDLERS ---------------- */
  const handleDigit = (d) => {
    if (bestInputFocused) {
      setTopScore((prev) => {
        const p = String(prev === 0 || prev === "0" ? "" : prev);
        if (p === "0" && d !== ".") return d;
        if (p === "") return d;
        if (p.includes(".") && d !== "-") {
          const parts = p.split(".");
          if (parts[1].length >= 2) return prev;
        }
        return p + d;
      });
      return;
    }

    setValue((prev) => {
      const p = !hasEditedToday ? "0" : prev;
      if (p === "0" && d !== ".") return d;
      // Allow only 2 decimal places
      if (p.includes(".")) {
        const parts = p.split(".");
        if (parts[1].length >= 2) return p;
      }
      return p + d;
    });
    setHasEditedToday(true);
  };

  const handleBackspace = () => {
    if (bestInputFocused) {
      setTopScore((prev) => { const p = String(prev); if (!p || p === "0") return 0; const nv = p.slice(0, -1); return nv || 0; });
      return;
    }
    setHasEditedToday(true);
    setValue((prev) => {
      const p = !hasEditedToday ? "0" : prev;
      return p.length <= 1 ? "0" : p.slice(0, -1);
    });
  };

  const handleClear = () => {
    if (bestInputFocused) {
      setTopScore(0);
      return;
    }
    setHasEditedToday(true);
    setValue("0");
  };


  /* ---------------- SAVE LOGIC ---------------- */
  const submitScore = async (finalScore, bestScore, bypassVerification = false, finalWitness = null) => {
    const lType = searchParams?.get("type") || searchParams?.get("ladder_type") || "";
    const resolvedLadderType = lType === "negative" ? "negative" : (lType === "positive" ? "positive" : "skill");

    // Check if we are running for NEXT_PUBLIC_ADMIN_ID and target condition is met
    const requiredAdminId = Number(process.env.NEXT_PUBLIC_ADMIN_ID);
    let currentAdminDetails = {};
    let subAdminDetails = {};
    let userData = {};
    let user = {};
    if (typeof window !== "undefined") {
      try {
        currentAdminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");
        subAdminDetails = JSON.parse(sessionStorage.getItem("subAdmin") || "{}");
        userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
        user = JSON.parse(sessionStorage.getItem("user") || "{}");
      } catch (e) {
        console.error("Error reading sessionStorage", e);
      }
    }
    const adminIdToCheck = Number(
      currentAdminDetails?.id ||
      currentAdminDetails?.user_id ||
      subAdminDetails?.id ||
      subAdminDetails?.user_id ||
      userData?.id ||
      userData?.user_id ||
      user?.admin_id
    );
    const isTargetAdmin = adminIdToCheck === requiredAdminId;

    let hasTarget = false;
    let targetMet = false;
    let isPrepost = false;

    if (isTargetAdmin && !bypassVerification) {
      // BasicLeaderboardActivityEntryCard has searchParams and we can get ladder_type from it.
      const ladderType = searchParams?.get("type") || searchParams?.get("ladder_type");
      const isNegative = ladderType === "negative";
      
      let scoreForCompare = 0;
      let targetForCompare = 0;

      if (skillTarget && skillTarget !== "No target" && skillTarget !== "null" && skillTarget !== "" && skillTarget !== "0" && skillTarget !== 0) {
        hasTarget = true;
        if (isNegative) {
          scoreForCompare = Number(convertTimeToSeconds(finalScore));
          targetForCompare = Number(convertTimeToSeconds(skillTarget) || skillTarget);
        } else {
          scoreForCompare = Number(finalScore);
          targetForCompare = Number(skillTarget);
        }
      }

      if (hasTarget && !isNaN(scoreForCompare) && !isNaN(targetForCompare)) {
        const invertedParam = searchParams?.get("inverted");
        const isInverted = invertedParam === "1" || isNegative;
        targetMet = isInverted ? (scoreForCompare <= targetForCompare) : (scoreForCompare >= targetForCompare);
      }

      if (targetMet) {
        const currentWitness = witnessBy ? witnessBy.trim() : "";
        const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(currentWitness);

        setPendingSubmission({
          finalScore,
          bestScore,
          isPrepost: true
        });

        if (isYoutube) {
          setIsAlreadyVerified(true);
          setYoutubeUrl(currentWitness);
          setOpenYoutubeVerification(true);
        } else {
          setIsAlreadyVerified(false);
          setYoutubeUrl("");
          setOpenYoutubeVerification(true);
        }
        return false;
      }
    }

    if (bypassVerification && pendingSubmission?.isPrepost) {
      isPrepost = true;
    }

    try {
      const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");

      setSaving(true);
      const witnessValue =
        finalWitness !== null
          ? finalWitness.trim()
          : (witnessBy && witnessBy.trim() !== "" ? witnessBy.trim() : "");
      
      if (finalWitness !== null) {
        setWitnessBy(finalWitness);
      }

      const params = new URLSearchParams();
      params.append("user_id", String(playerId));
      params.append("skill_activity_id", String(skillActivityId));
      params.append("skill_number", String(selectedActivity));
      params.append("score", String(finalScore));
      params.append("witness_by", witnessValue);
      params.append("admin_id", adminDetails?.id || adminDetails?.user_id || "");
      params.append("ladder_id", String(ladderId));
      params.append("user_name", playerName);
      params.append("ladder_type", resolvedLadderType);

      if (bestScore !== undefined && bestScore !== null) {
        let bestToSubmit;
        if (value > bestScore) {
          bestToSubmit = value;
        } else {
          bestToSubmit = bestScore;
        }
        params.append("best_result", String(bestToSubmit));
      }
      
      const apiPath = isPrepost 
        ? `${API_ENDPOINTS.SAVE_PREPOST_RESULT}?ladder_id=${ladderId}&skill_number=${selectedActivity}` 
        : (resolvedLadderType === "negative" ? "/user/postResultNegativeSkillboard" : API_ENDPOINTS.POST_RESULT_SKILLBOARD);
      const skillsPost = await postUrlEncoded(apiPath, params);
      
      if (skillsPost.status === 200 || skillsPost?.status === "success") {
        if (isPrepost) {
          toast.success("Result submitted for verification successfully!");
        } else if (hasTarget && !targetMet) {
          toast.info("Target not met. Result posted directly to the leaderboard!");
        } else {
          toast.success("Result posted successfully!");
        }
        handleSuccessClose();
        if (skillsPost?.eligible_for_token == 1) {
          updateLadderToken({
            user_id: playerName,
            ladder_id: ladderId,
            ladder_type: resolvedLadderType,
          })
        }
        setPendingSubmission(null);
        return true;
      } else {
        toast.error(skillsPost.error_message);
        return false;
      }
    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      toast.error("Failed to save: " + (err.response?.data?.message || "Error"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleEnter = async () => {
    if (!skillActivityId || !playerId) return;

    const num = Math.abs(Number(value) || 0);

    if (value === "-") {
      setOpenZeroAlert(true);
      setZeroAction("onlyReset");
      return;
    }

    if (num === 0) {
      setOpenZeroAlert(true);
      setZeroAction("both");
      return;
    }

    const finalScore = num;

    // ✅ If topScore is 0, send the current value as the best result
    const bestResultToSubmit = (topScore === 0 || topScore === "0") ? finalScore : topScore;

    return await submitScore(finalScore, bestResultToSubmit);
  };

  const handleZeroConfirm = (type) => {
    setOpenZeroAlert(false);

    if (type === "ok") {
      const bestResultToSubmit = (topScore === 0 || topScore === "0") ? 0 : topScore;
      submitScore(0, bestResultToSubmit);
    } else if (type === "reset") {
      setValue("-")
      const bestResultToSubmit = (topScore === 0 || topScore === "0") ? "-" : topScore;
      submitScore("-", bestResultToSubmit);
    }
  };


  const handleSuccessClose = useCallback(() => {
    setValue("0");
    setWitnessBy("");
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  const handleSuccessCloseResult = useCallback(() => {
    setOpenSuccessResult(false);
  }, []);

  const getBestScore = async () => {
    if (value == 0 || value == "-") {
      handleEnter();
      return;
    }
    setOpenSuccessResult(true);
  };

  useEffect(() => {
    if (!playerId || !skillActivityId || currentScore <= 0) {
      setLoadingTopScore(false);
      return;
    }

    const fetchTopScore = async () => {
      setLoadingTopScore(true);
      try {
        const bestScore = await getRequest(API_ENDPOINTS.GET_TOP_SCORE, {
          user_id: String(playerId),
          skill_activity_id: String(skillActivityId),
          score: String(currentScore),
        });


        if (bestScore.status === 200) {
          setTopScore(bestScore?.data?.[0]?.top_score);
          setTodaysScore(bestScore?.data?.[0]?.current_score || currentScore);
        }
      } catch (err) {
        console.error("Failed to load initial top score:", err);
      } finally {
        setLoadingTopScore(false);
      }
    };

    fetchTopScore();
  }, [playerId, skillActivityId, currentScore]);

  return (
    <>
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-card border border-border text-card-foreground rounded-2xl shadow-2xl p-2 sm:p-3">
        <div className="mb-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 sm:gap-3 bg-muted p-1.5 sm:p-2 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Skill Selected Number : {selectedActivity}
            </p>
            {loadingSkill ? (
              <p className="text-xs text-muted-foreground">Loading skill...</p>
            ) : (
              <>
                <p className="text-sm text-sky-600 dark:text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words leading-relaxed">
                  Skill Name : {skillDesc || "No skill description"}
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-300 text-[11px] uppercase tracking-wide font-medium leading-relaxed">
                  Target : {skillTarget ? Math.abs(Number(skillTarget)) : "No target"}
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2 sm:gap-4 bg-background p-1.5 sm:p-2 rounded-md border border-border w-full sm:w-auto mt-2 sm:mt-0 shadow-inner">
            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-normal sm:tracking-widest font-bold whitespace-nowrap">
                Today's Result
              </label>
              <input
                className="w-full sm:w-16 h-8 text-center rounded text-foreground font-bold mt-1 bg-background border border-input outline-none focus:ring-2 focus:ring-ring"
                value={value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(val) || val === "-") {
                    setValue(val);
                    setHasEditedToday(true);
                  }
                }}
              />
            </div>

            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-normal sm:tracking-widest font-bold whitespace-nowrap">
                Best Result
              </label>
              <input
                className="w-full sm:w-16 h-8 text-center rounded text-muted-foreground font-bold mt-1 bg-muted border border-input outline-none focus:ring-2 focus:ring-ring"
                value={loadingTopScore ? "..." : topScore}
                onChange={(e) => setTopScore(e.target.value)}
                onFocus={() => setBestInputFocused(true)}
                onBlur={() => setBestInputFocused(false)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {activityNumbers.map((n) => (
            <button
              key={n}
              onClick={() => {
                setSelectedActivity(n);
                setValue("0");
              }}
              className={`w-7 h-7 rounded-md border text-[11px] transition-all
                ${selectedActivity === n
                  ? "bg-primary text-primary-foreground border-primary scale-110 shadow-md font-bold"
                  : "bg-muted border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Input
            value={value}
            readOnly
            className="text-center text-lg text-foreground font-semibold bg-muted border-border"
          />
          <Input
            placeholder="Witness by (optional)"
            value={witnessBy}
            onChange={(e) => setWitnessBy(e.target.value)}
            className="text-start text-sm text-foreground font-semibold bg-muted border-border"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleDigit(String(d))}
              className="h-9 bg-card text-card-foreground border border-border rounded hover:bg-accent active:scale-95 transition-all font-bold"
            >
              {d}
            </button>
          ))}

          {/* Last row */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded font-bold uppercase text-[10px] active:scale-95 transition-all"
          >
            Clear
          </button>

          {/* Split 0 into two buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleDigit("0")}
              className="h-9 bg-card text-card-foreground border border-border rounded font-bold hover:bg-accent active:scale-95 transition-all"
            >
              0
            </button>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleDigit("-")}
              className="h-9 bg-card text-card-foreground border border-border rounded font-bold hover:bg-accent active:scale-95 transition-all"
            >
              -
            </button>
          </div>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleBackspace}
            className="h-9 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded font-bold active:scale-95 transition-all"
          >
            ⌫
          </button>
        </div>

        <Button
          disabled={saving}
          onClick={getBestScore}
          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black font-bold h-11 shadow-lg transition-all"
        >
          {saving ? "Saving..." : "Submit Score"}
        </Button>
      </Card>





      <Dialog open={openSuccessResult} onOpenChange={handleSuccessCloseResult}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-background text-foreground border border-border rounded-2xl shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-500">
              Enter Result
            </h2>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base sm:text-lg font-bold gap-3">
              <div className="flex items-center gap-2">
                <span>Today’s Result</span>
                <span className="px-2 py-0.5 border border-input rounded bg-muted text-foreground font-bold">
                  {value}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>Your Best Result</span>
                <span className="px-2 py-0.5 border border-input rounded bg-muted text-foreground font-bold">
                   {(topScore === 0 || topScore === "0") ? value : topScore}
                </span>
              </div>
            </div>


            {/* Witness */}
            <div>
              <label className="text-md font-medium text-foreground">Witness: <span className="ml-3 font-bold text-foreground"> {witnessBy || "—"} </span></label>
            </div>

            {/* Button */}
            <Button
              onClick={async () => {
                const success = await handleEnter();
                if (success) {
                  handleSuccessCloseResult();
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black font-semibold py-2 rounded-md transition-all"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={openZeroAlert} onOpenChange={setOpenZeroAlert}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto p-0 overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-xl [&>button]:hidden max-h-[90vh] overflow-y-auto">

          {/* HEADER BAR (like system popup) */}
          <div className="flex items-center justify-between bg-muted/50 px-3 py-2 border-b border-border">
            <span className="font-semibold text-sm">System Alert</span>

            {/* Single Close Button */}
            <button
              onClick={() => setOpenZeroAlert(false)}
              className="text-muted-foreground hover:text-foreground text-lg font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex justify-between gap-4 p-4 text-foreground bg-background">

            {/* TEXT */}
            <div className="text-sm leading-relaxed">
              {(zeroAction !== "onlyReset") && <p className="font-bold">
                DO YOU WISH TO ENTER A SCORE OF ZERO?{" "}
                <span className="font-normal text-muted-foreground">If so - press OK</span>
              </p>}

              <p className={`${zeroAction !== "onlyReset" ? "mt-3" : ''}`}>
                <span className="font-bold">ERROR?</span>{" "}
                <span className="text-muted-foreground">
                  If you wish to correct putting in a score incorrectly that should
                  have gone into another activity, press RESET
                </span>
              </p>
            </div>

            {/* BUTTONS (right side stacked) */}
            <div className="flex flex-col gap-3 min-w-[90px]">

              {/* OK button → only when NOT "-" */}
              {zeroAction !== "onlyReset" && (
                <button
                  onClick={() => handleZeroConfirm("ok")}
                  className="bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black font-bold py-1 px-3 rounded shadow active:scale-95 transition-all"
                >
                  OK
                </button>
              )}

              {/* Reset button → always visible */}
              <button
                onClick={() => handleZeroConfirm("reset")}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-1 px-3 rounded shadow active:scale-95 transition-all"
              >
                Reset
              </button>

            </div>

          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openYoutubeVerification} onOpenChange={setOpenYoutubeVerification}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-background text-foreground border border-border rounded-2xl shadow-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-500">
              Score Verification
            </h2>
          </div>

          <div className="px-5 py-4 space-y-4 bg-background">
            {isAlreadyVerified ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Congratulations! We will verify your score.
                </p>
                <Button
                  onClick={async () => {
                    setOpenYoutubeVerification(false);
                    if (pendingSubmission) {
                      await submitScore(
                        pendingSubmission.finalScore,
                        pendingSubmission.bestScore,
                        true,
                        youtubeUrl
                      );
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-md transition-all"
                >
                  Confirm and Post Score
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-foreground leading-relaxed">
                  Congratulations on a great result! To submit your result, please enter a YouTube verification video link of your performance into the "Witnessed By" box. Without a valid YouTube link, your result cannot be posted.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Witnessed By (YouTube URL)
                  </label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      if (youtubeError) setYoutubeError("");
                    }}
                    className="text-start text-sm text-foreground bg-muted border-border"
                  />
                  {youtubeError && (
                    <p className="text-xs text-destructive font-semibold">
                      {youtubeError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={async () => {
                    const validateYoutubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test((url || "").trim());
                    if (validateYoutubeUrl(youtubeUrl)) {
                      setOpenYoutubeVerification(false);
                      if (pendingSubmission) {
                        await submitScore(
                          pendingSubmission.finalScore,
                          pendingSubmission.bestScore,
                          true,
                          youtubeUrl
                        );
                      }
                    } else {
                      setYoutubeError("Please provide a valid YouTube URL");
                      toast.error("Please provide a valid YouTube URL");
                    }
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-md transition-all"
                >
                  Submit YouTube Link
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
