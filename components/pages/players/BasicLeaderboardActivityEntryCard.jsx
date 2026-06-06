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
  const submitScore = async (finalScore, bestScore) => {

    try {
      const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));

      setSaving(true);
      const witnessValue =
        witnessBy && witnessBy.trim() !== "" ? witnessBy.trim() : "";
      const params = new URLSearchParams();
      params.append("user_id", String(playerId));
      params.append("skill_activity_id", String(skillActivityId));
      params.append("score", String(finalScore));
      params.append("witness_by", witnessValue);
      params.append("admin_id", adminDetails.id);
      params.append("ladder_id", ladderId);
      params.append("user_name", playerName);


      console.log("cuurentScore", currentScore)

      if (bestScore !== undefined && bestScore !== null) {
        let bestToSubmit;
        if (value > bestScore) {
          bestToSubmit = value;
        } else {
          bestToSubmit = bestScore;
        }
        params.append("best_result", String(bestToSubmit));
      }
      const skillsPost = await postUrlEncoded(API_ENDPOINTS.POST_RESULT_SKILLBOARD, params);
      if ((skillsPost.status === 200)) {
        setOpenSuccess(true);
        toast.success("Result posted successfully! ");
        if (skillsPost?.eligible_for_token == 1) {
          updateLadderToken({
            user_id: playerName,
            ladder_id: ladderId,
            ladder_type: "skill",
          })
        }
        setOpenSuccess(true);
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
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-card border border-border text-card-foreground rounded-2xl shadow-2xl p-3">
        <div className="mb-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 bg-muted p-2 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-wide text-sky-500">
              Skill Selected Number : {selectedActivity}
            </p>
            {loadingSkill ? (
              <p className="text-xs text-muted-foreground">Loading skill...</p>
            ) : (
              <>
                <p className="text-sm text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words leading-relaxed">
                  Skill Name : {skillDesc || "No skill description"}
                </p>
                <p className="text-sm text-emerald-300 text-[11px] uppercase tracking-wide font-medium leading-relaxed">
                  Target : {skillTarget ? Math.abs(Number(skillTarget)) : "No target"}
                </p>
              </>
            )}
          </div>

          <div className="flex gap-4 sm:gap-6 bg-background p-2 rounded-md border border-border w-full sm:w-auto mt-2 sm:mt-0 shadow-inner">
            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold whitespace-nowrap">
                Today's Result
              </label>
              <input
                className="w-full sm:w-16 h-8 text-center rounded text-black font-bold mt-1 bg-white outline-none focus:ring-2 focus:ring-sky-500"
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
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold whitespace-nowrap">
                Best Result
              </label>
              <input
                className="w-full sm:w-16 h-8 text-center rounded text-slate-700 font-bold mt-1 bg-slate-300 outline-none focus:ring-2 focus:ring-sky-500"
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
                  ? "bg-sky-400 text-black border-border scale-110 shadow-md"
                  : "bg-muted border-border text-foreground hover:bg-accent"}`}
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
            className="h-9 bg-red-500 text-white rounded font-bold uppercase text-[10px]"
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
            className="h-9 bg-orange-400 text-white rounded font-bold"
          >
            ⌫
          </button>
        </div>

        <Button
          disabled={saving}
          onClick={getBestScore}
          className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-11 shadow-lg"
        >
          {saving ? "Saving..." : "Submit Score"}
        </Button>
      </Card>

      {/* Dialogs */}
      <Dialog open={openSuccess} onOpenChange={handleSuccessClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-emerald-500 text-xl font-bold">Score Saved</DialogTitle>
            <DialogDescription className="text-lg">
              Recorded score: <b>{value == "-" ? "Reset" : value}</b> <br />
              Witness: <b>{witnessBy}</b>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose} className="bg-emerald-500 text-black font-bold mt-4">OK</Button>
        </DialogContent>
      </Dialog>



      <Dialog open={openSuccessResult} onOpenChange={handleSuccessCloseResult}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-background text-foreground border border-border">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-500">
              Enter Result
            </h2>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base sm:text-lg font-bold gap-3">
              <div className="flex items-center gap-2">
                <span>Today’s Result</span>
                <span className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold">
                  {value}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>Your Best Result</span>
                <span className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-bold">
                   {(topScore === 0 || topScore === "0") ? value : topScore}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">Note: Results posted without a witness will not qualify for a token.</p>

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
              className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold py-2 rounded-md transition-colors"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={openZeroAlert} onOpenChange={setOpenZeroAlert}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto p-0 overflow-hidden rounded-md border border-border bg-background text-foreground shadow-xl [&>button]:hidden max-h-[90vh] overflow-y-auto">

          {/* HEADER BAR (like system popup) */}
          <div className="flex items-center justify-between bg-background px-3 py-2 border-b border-border">
            <span className="font-semibold text-sm"> </span>

            {/* Single Close Button */}
            <button
              onClick={() => setOpenZeroAlert(false)}
              className="text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex justify-between gap-4 p-4 text-foreground">

            {/* TEXT */}
            <div className="text-sm leading-relaxed">
              {(zeroAction !== "onlyReset") && <p className="font-bold">
                DO YOU WISH TO ENTER A SCORE OF ZERO?{" "}
                <span className="font-normal">If so - press OK</span>
              </p>}

              <p className={`${zeroAction !== "onlyReset" ? "mt-3" : ''}`}>
                <span className="font-bold">ERROR?</span>{" "}
                If you wish to correct putting in a score incorrectly that should
                have gone into another activity, press RESET
              </p>
            </div>

            {/* BUTTONS (right side stacked) */}
            <div className="flex flex-col gap-3 min-w-[90px]">

              {/* OK button → only when NOT "-" */}
              {zeroAction !== "onlyReset" && (
                <button
                  onClick={() => handleZeroConfirm("ok")}
                  className="bg-green-400 hover:bg-green-500 text-black font-bold py-1 rounded shadow"
                >
                  OK
                </button>
              )}

              {/* Reset button → always visible */}
              <button
                onClick={() => handleZeroConfirm("reset")}
                className="bg-red-500 hover:bg-red-600 text-black font-bold py-1 rounded shadow"
              >
                Reset
              </button>

            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
