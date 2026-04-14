"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { updateLadderToken } from "@/helper/helperApi";



const activityNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BasicLeaderboardActivityEntryCard({
  ladderId,
  playerId,
  skillActivityId,
  initialActivity,
  onClose,
  playerName
}) {
  const [selectedActivity, setSelectedActivity] = useState(
    initialActivity || 1,
  );
  const [value, setValue] = useState("0");
  const [witnessBy, setWitnessBy] = useState("");
  const [skillSign, setSkillSign] = useState("+");
  const [skillDesc, setSkillDesc] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [skillTarget, setSkillTarget] = useState("");
  const [openZeroAlert, setOpenZeroAlert] = useState(false);
  const [timeParts, setTimeParts] = useState({
    min: "",
    sec: "",
    ms: "",
  });
  const [zeroAction, setZeroAction] = useState(null);
  const [topScore, setTopScore] = useState(0);
  const [openSuccessResult, setOpenSuccessResult] = useState(false);

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const ladderType = searchParams.get("ladder_type");
  const minRef = useRef(null);
  const secRef = useRef(null);
  const msRef = useRef(null);



  useEffect(() => {
    if (initialActivity) {
      setSelectedActivity(initialActivity);
      setValue("0");
    }
  }, [initialActivity, skillSign]);

  // Update the fetchSkill useEffect
  useEffect(() => {
    if (!selectedActivity || !ladderId) return;

    const fetchSkill = async () => {
      try {
        setLoadingSkill(true);
        const res = await getRequest("/user/getskillBynumber", {
          ladder_id: ladderId,
          skill_number: selectedActivity,
        });

        const data = res?.data || {};
        setSkillDesc(data.skill_description || "");
        setSkillTarget(data.target || "No target"); // SET TARGET
        setSkillSign(data.skill_sign === "-" ? "-" : "+");
        setValue("0");
      } catch (err) {
        console.error("Skill fetch failed", err);
        setSkillDesc("");
        setSkillTarget("No target"); // ERROR STATE
        setSkillSign("+");
        setValue("0");
      } finally {
        setLoadingSkill(false);
      }
    };

    fetchSkill();
  }, [selectedActivity, ladderId]);

  useEffect(() => {
    if (!playerId || !skillActivityId) return;

    const fetchTopScore = async () => {
      try {
        const bestScore = await getRequest("/user/getTopScore", {
          user_id: String(playerId),
          skill_activity_id: String(skillActivityId),
          score: "0",
        });
        
        if (bestScore?.status === 200 || bestScore?.status === "success") {
          setTopScore(bestScore?.data?.[0]?.top_score || 0);
        }
      } catch (err) {
        console.error("Failed to load initial top score:", err);
      }
    };

    fetchTopScore();
  }, [playerId, skillActivityId]);

  const handleDigit = (d) => {

    // ✅ NEGATIVE (TIMER MODE)
    if (type === "negative" || ladderType === "negative") {

      // 🚨 Ignore non-digit inputs
      if (!/^\d$/.test(d)) return;

      if (document.activeElement === minRef.current) {
        setTimeParts((p) => {
          let v = (p.min + d).slice(-2);
          if (Number(v) > 59) return p;

          if (v.length === 2) secRef.current?.focus();

          return { ...p, min: v };
        });
        return;
      }

      if (document.activeElement === secRef.current) {
        setTimeParts((p) => {
          let v = (p.sec + d).slice(-2);
          if (Number(v) > 59) return p;

          if (v.length === 2) msRef.current?.focus();

          return { ...p, sec: v };
        });
        return;
      }

      if (document.activeElement === msRef.current) {
        setTimeParts((p) => {
          let v = (p.ms + d).slice(-3);
          return { ...p, ms: v };
        });
        return;
      }

      minRef.current?.focus();
      return;
    }

    // ✅ NORMAL MODE (unchanged)
    setValue((prev) => {
      if (d === "." && !prev) return prev;
      if (d === "." && prev.includes(".")) return prev;
      if (prev === "0" && d !== ".") return d;

      // 🔥 Optional: handle "-" properly (only at start)
      if (d === "-") {
        if (!prev) return "-";
        return prev; // ignore if already typing
      }

      return prev + d;
    });
  };
  const handleBackspace = () => {
    if (type === "negative" || ladderType === "negative") {
      const active = document.activeElement;

      // MIN
      if (active === minRef.current) {
        setTimeParts((p) => ({
          ...p,
          min: p.min.slice(0, -1),
        }));
        return;
      }

      // SEC
      if (active === secRef.current) {
        setTimeParts((p) => {
          if (!p.sec) {
            minRef.current?.focus();
            return p;
          }

          return {
            ...p,
            sec: p.sec.slice(0, -1),
          };
        });

        return;
      }

      // MS
      if (active === msRef.current) {
        setTimeParts((p) => {
          if (!p.ms) {
            secRef.current?.focus();
            return p;
          }

          return {
            ...p,
            ms: p.ms.slice(0, -1),
          };
        });

        return;
      }

      return;
    }

    // normal mode
    setValue((prev) => {
      if (!prev) return "0";
      let newVal = prev.slice(0, -1);
      if (newVal === "" || newVal === "-") return "0";
      return newVal;
    });
  };

  const handleClear = () => {
    if (type === "negative" || ladderType === "negative") {
      setTimeParts({
        min: "",
        sec: "",
        ms: "",
      });

      minRef.current?.focus();

      return;
    }

    setValue("0");
  };
  const handleInputChange = (e) => {
    const val = e.target.value;

    if (/^\d*\.?\d*$/.test(val)) {
      setValue(val);
    }
  };

  const handleTimeChange = (type, value) => {
    if (!/^\d*$/.test(value)) return;

    setTimeParts((prev) => {
      const newVal = { ...prev, [type]: value };

      if (type === "min") {
        if (value.length === 2) {
          secRef.current?.focus();
        }
      }

      if (type === "sec") {
        if (value.length === 2) {
          msRef.current?.focus();
        }
      }

      return newVal;
    });
  };

  const handleEnter = useCallback(() => {
    if (!skillActivityId || !playerId) return;

    const num = Math.abs(Number(value) || 0);

    if (type !== "negative" && ladderType !== "negative") {
      if (value === "-") {
        setZeroAction("onlyReset");
        setOpenZeroAlert(true);
        return;
      }
      if (num === 0) {
        setZeroAction("both");
        setOpenZeroAlert(true);
        return;
      }
    }

    // ✅ snapshot timeParts RIGHT NOW and pass it in
    submitScore(value, topScore, timeParts);

  }, [skillActivityId, playerId, value, skillSign, topScore, timeParts]); // timeParts in deps


  const submitScore = async (inputScore, bestScore, currentTimeParts) => {
    if (!skillActivityId || !playerId) return;

    let finalScore;
    let URl;
    let ladderTypeUpdate;
    if (type === "negative" || ladderType === "negative") {
      URl = "user/postResultNegativeSkillboard";
      ladderTypeUpdate = "negative";

      // ✅ use the directly passed timeParts — always fresh
      const latest = currentTimeParts;

      finalScore =
        "00:" +
        `${latest.min.padStart(2, "0")}:${latest.sec.padStart(2, "0")}.${latest.ms.padStart(3, "0")}`;


    } else {
      URl = "user/postResultSkillboard";
      ladderTypeUpdate =
        type === "positive" || ladderType === "positive"
          ? "positive"
          : "skill";

      if (inputScore === "-") {
        finalScore = "-";
      } else {
        const num = Math.abs(Number(inputScore) || 0);
        finalScore = skillSign === "-" ? -num : num;
      }
    }

    try {
      setSaving(true);

      const payload = {
        user_id: playerId,
        skill_activity_id: skillActivityId,
        score: finalScore,
        witness_by: witnessBy.trim(),
      };

      if (bestScore && ladderType === "skill") {
        payload.best_result = bestScore;
      }

      const res = await postRequest(`/${URl}`, payload);

      if (res?.status === 200 || res?.status === "success") {
        toast.success("Result posted successfully!");
        updateLadderToken({
          user_id: playerName,
          ladder_id: ladderId,
          ladder_type: ladderTypeUpdate,
        });
      } else {
        toast.error("Failed to post result. Please try again.");
      }

      setOpenSuccess(true);
    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      alert("Failed to save: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = useCallback(() => {
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  const handleSuccessCloseResult = useCallback(() => {
    setOpenSuccessResult(false);
    if (onClose) onClose();
  }, [onClose]);

  const formatTime = (timeParts) => {
    const min = (timeParts.min || "").padStart(2, "0");
    const sec = (timeParts.sec || "").padStart(2, "0");
    const ms = (timeParts.ms || "").padStart(3, "0");

    return `${min}:${sec}.${ms}`;
  };

  const handleZeroConfirm = (type) => {
    setOpenZeroAlert(false);

    if (type === "ok") {
      submitScore(0);
    } else if (type === "reset") {
      setValue("-");
      submitScore("-");
    }
  };

  const getBestScore = async () => {
    if (ladderType === "negative" || type === "negative") {
      submitScore(value, topScore, timeParts);
      return;
    }

    if (value == 0 || value == "-" || ladderType === "positive") {
      handleEnter();
      return;
    }

    const bestScore = await getRequest("/user/getTopScore", {
      user_id: String(playerId),
      skill_activity_id: String(skillActivityId),
      score: String(value),
    });

    if (bestScore?.status == 200) {
      setTopScore(bestScore?.data?.[0]?.top_score || 0);
      setOpenSuccessResult(true);
    }
  };

  return (
    <>
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3">
        {/* HEADER - FIXED */}
        <div className="mb-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 bg-slate-800 p-2 rounded-lg">
          <div className="flex flex-col gap-1">
            {type != "positive" &&
              type != "negative" &&
              ladderType != "positive" &&
              ladderType != "negative" && (
                <p className="text-[11px] uppercase tracking-wide text-sky-300">
                  Skill Selected Number : {selectedActivity}
                </p>
              )}

            {/* SKILL NAME */}
            {loadingSkill ? (
              <p className="text-xs text-slate-400">Loading skill...</p>
            ) : (
              <p className="text-sm text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
                Skill Name : {skillDesc || "No skill description"}
              </p>
            )}

            {/* SKILL TARGET */}
            {loadingSkill ? (
              <p className="text-xs text-slate-400">Loading target...</p>
            ) : (
              <p className="text-sm text-emerald-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
                Target : {skillTarget ? Math.abs(skillTarget) : "No target"}
              </p>
            )}
          </div>
          
          <div className="flex gap-4 sm:gap-6 bg-slate-900 p-2 rounded-md border border-slate-700 w-full sm:w-auto mt-2 sm:mt-0 shadow-inner">
            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">
                Today's Result
              </label>
              {(type === "negative" || ladderType === "negative") ? (
                <div className="flex mt-1 items-center bg-white rounded px-2 h-8 border border-white">
                  <span className="text-xs text-black font-bold whitespace-nowrap">TIMER</span>
                </div>
              ) : (
                <input
                  className="w-full sm:w-16 h-8 text-center rounded text-black font-bold mt-1 bg-white outline-none focus:ring-2 focus:ring-sky-500"
                  value={value}
                  onChange={(e) => handleInputChange(e)}
                />
              )}
            </div>
            
            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">
                Best Result
              </label>
              <input
                className="w-full sm:w-16 h-8 text-center rounded text-slate-700 font-bold mt-1 bg-slate-300 cursor-not-allowed outline-none"
                value={topScore && topScore}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* ACTIVITY BUTTONS */}
        {type != "positive" &&
          type != "negative" &&
          ladderType != "positive" &&
          ladderType != "negative" && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {activityNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setSelectedActivity(n);
                    setValue("0");
                  }}
                  className={`w-7 h-7 rounded-md border text-[11px] transition-all duration-200
                ${selectedActivity === n
                      ? "bg-sky-400 text-black border-white scale-110 shadow-md"
                      : "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:scale-105"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

        {/* SCORE ENTRY */}

        <div
          className={`flex items-center gap-2 w-full ${type === "negative" || ladderType === "negative"
            ? "justify-center bg-slate-800"
            : "justify-start"
            }`}
        >
          {type !== "negative" && ladderType !== "negative" && (
            <div className="flex items-center gap-2 mb-2 w-full">
              <Input
                value={value}
                readOnly
                className="text-center text-lg text-black font-semibold bg-slate-200"
              />
              <Input
                placeholder="Witness by (optional)"
                value={witnessBy}
                onChange={(e) => setWitnessBy(e.target.value)}
                className="text-start text-sm text-black font-semibold bg-slate-200"
              />
            </div>
          )}

          {(type === "negative" || ladderType === "negative") && (
            <div className="flex items-center justify-center gap-2 text-lg">
              <Input
                ref={minRef}
                value={timeParts.min}
                maxLength={2}
                placeholder="00"
                onChange={(e) => handleTimeChange("min", e.target.value)}
                className="w-12 h-10 text-center text-sm text-white font-semibold 
                bg-slate-800 border-0 outline-none ring-0
                focus:ring-0 focus:outline-none
                focus-visible:ring-0 focus-visible:outline-none"
              />
              :
              <Input
                ref={secRef}
                value={timeParts.sec}
                maxLength={2}
                placeholder="00"
                onChange={(e) => handleTimeChange("sec", e.target.value)}
                className="w-12 h-10 text-center text-sm text-white font-semibold 
                bg-slate-800 border-0 outline-none ring-0
                focus:ring-0 focus:outline-none
                focus-visible:ring-0 focus-visible:outline-none"
              />
              :
              <Input
                ref={msRef}
                value={timeParts.ms}
                maxLength={3}
                placeholder="000"
                onChange={(e) => handleTimeChange("ms", e.target.value)}
                className="w-14 h-10 text-center text-sm text-white font-semibold 
                bg-slate-800 border-0 outline-none ring-0
                focus:ring-0 focus:outline-none
                focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>
          )}

          {type != "positive" &&
            type != "negative" &&
            ladderType != "positive" &&
            ladderType != "negative" && (
              <Input
                placeholder="Witness by (optional)"
                value={witnessBy}
                onChange={(e) => setWitnessBy(e.target.value)}
                type="text"
                maxLength={50}
                className="text-start text-sm text-black font-semibold bg-slate-200"
              />
            )}
        </div>
        {/* NUMPAD */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleDigit(String(d))}
              className="h-9 bg-white text-black rounded hover:bg-gray-100 active:scale-95 transition-all"
            >
              {d}
            </button>
          ))}

          <div className="col-span-1 grid grid-cols-12 gap-2">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className={`h-9 bg-red-500 text-black rounded transition-all ${type === "positive" || ladderType === "positive"
                ? "col-span-8"
                : "col-span-12"
                }`}
            >
              clear
            </button>

            {(type === "positive" || ladderType === "positive") && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDigit(".")}
                className="col-span-4 h-9 bg-white text-black rounded"
              >
                .
              </button>
            )}
          </div>




          {type != "positive" &&
            type != "negative" &&
            ladderType != "positive" &&
            ladderType != "negative" ? (<div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDigit("0")}
                className="h-9 bg-white text-black rounded font-bold"
              >
                0
              </button>

              <button
                onClick={() => handleDigit("-")}
                className="h-9 bg-white text-black rounded font-bold"
              >
                -
              </button>


            </div>) :
            (<button
              onClick={() => handleDigit("0")}
              className="h-9 bg-white text-black rounded font-bold"
            >
              0
            </button>
            )}

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleBackspace}
            className="h-9 bg-red-300 text-black rounded"
          >
            ⌫
          </button>
        </div>

        <Button
          disabled={saving}
          onClick={getBestScore}
          className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg"
        >
          {saving ? "Saving..." : "Enter"}
        </Button>
      </Card>

      {/* AUTO-CLOSE SUCCESS DIALOG */}
      <Dialog open={openSuccess} onOpenChange={handleSuccessClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-emerald-500 text-xl">
              Score Saved
            </DialogTitle>
            <DialogDescription className="text-lg">
              Activity #{selectedActivity} updated with score{" "}
              <b>
                {type === "negative" || ladderType === "negative"
                  ? formatTime(timeParts)
                  : value == "-" ? "Reset" : Math.abs(value)}
              </b>
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSuccessClose}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openSuccessResult} onOpenChange={handleSuccessCloseResult}>
        <DialogContent className="max-w-md p-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-emerald-600">
              Enter Result
            </h2>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">

            {/* Scores Row */}
            <div className="flex items-center justify-between text-lg font-bold">
              <div className="flex items-center gap-2">
                <span>Today’s Result</span>
                <span className="px-2 py-0.5 border rounded bg-gray-100 font-bold">
                  {value}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>Your Best Result</span>
                <span className="px-2 py-0.5 border rounded bg-gray-100 font-bold">
                  {topScore || 0}
                </span>
              </div>
            </div>

            {/* Note */}
            <p className="text-md text-gray-500 italic">
              Note: If today's result is also your best result, fill in both boxes
            </p>

            {/* Witness */}
            <div>
              <label className="text-md font-medium">Witness: <span className="ml-3 font-bold"> {witnessBy || "—"} </span></label>
            </div>

            {/* Button */}
            <Button
              onClick={async () => {
                await handleEnter();
                handleSuccessCloseResult();
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ZERO SCORE ALERT */}

      <Dialog open={openZeroAlert} onOpenChange={setOpenZeroAlert}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-md border shadow-xl [&>button]:hidden">

          {/* HEADER BAR (like system popup) */}
          <div className="flex items-center justify-between bg-white px-3 py-2 border-b">
            <span className="font-semibold text-sm"> </span>

            {/* Single Close Button */}
            <button
              onClick={() => setOpenZeroAlert(false)}
              className="text-gray-600 hover:text-black text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex justify-between gap-4 p-4">

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
