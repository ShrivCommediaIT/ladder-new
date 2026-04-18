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
  const [minStr, setMinStr] = useState("00");
  const [secStr, setSecStr] = useState("00");
  const [msStr, setMsStr] = useState("00");
  const [activeField, setActiveField] = useState("min");
  const [fieldKeystrokes, setFieldKeystrokes] = useState(0);

  const handleFocus = (field) => {
    setActiveField(field);
    setFieldKeystrokes(0);
  };

  const [zeroAction, setZeroAction] = useState(null);
  const [topScore, setTopScore] = useState(0);
  const [openSuccessResult, setOpenSuccessResult] = useState(false);

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const ladderType = searchParams.get("ladder_type"); 



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
      if (activeField === "min") {
        setMinStr(prev => ((prev || "00") + d).slice(-2));
        if (fieldKeystrokes === 1) {
          setActiveField("sec");
          setFieldKeystrokes(0);
        } else setFieldKeystrokes(1);
      } else if (activeField === "sec") {
        setSecStr(prev => ((prev || "00") + d).slice(-2));
        if (fieldKeystrokes === 1) {
          setActiveField("ms");
          setFieldKeystrokes(0);
        } else setFieldKeystrokes(1);
      } else if (activeField === "ms") {
        setMsStr(prev => ((prev || "00") + d).slice(-2));
        setFieldKeystrokes(fieldKeystrokes === 1 ? 0 : 1);
      }
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
      if (activeField === "ms") {
        setMsStr(prev => {
          let val = (prev || "00").replace(/^0+/, "");
          if (!val) {
            setActiveField("sec");
            setFieldKeystrokes(0);
            return "00";
          }
          return (val.slice(0, -1) || "00").padStart(2, "0");
        });
        setFieldKeystrokes(0);
      } else if (activeField === "sec") {
        setSecStr(prev => {
          let val = (prev || "00").replace(/^0+/, "");
          if (!val) {
            setActiveField("min");
            setFieldKeystrokes(0);
            return "00";
          }
          return (val.slice(0, -1) || "00").padStart(2, "0");
        });
        setFieldKeystrokes(0);
      } else if (activeField === "min") {
        setMinStr(prev => {
          let val = (prev || "00").replace(/^0+/, "");
          return (val.slice(0, -1) || "00").padStart(2, "0");
        });
        setFieldKeystrokes(0);
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
      setMinStr("00");
      setSecStr("00");
      setMsStr("00");
      setActiveField("min");
      setFieldKeystrokes(0);
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

  const handleMinChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    setMinStr(val);
    setActiveField("min");
    setFieldKeystrokes(0);
  };
  const handleSecChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    setSecStr(val);
    setActiveField("sec");
    setFieldKeystrokes(0);
  };
  const handleMsChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    setMsStr(val);
    setActiveField("ms");
    setFieldKeystrokes(0);
  };
  const handleTimeBlur = () => {
    setMinStr(prev => (prev || "0").padStart(2, "0"));
    setSecStr(prev => (prev || "0").padStart(2, "0"));
    setMsStr(prev => (prev || "0").padStart(2, "0"));
  };

  const formatTimeInfo = () => {
    const m = (minStr || "00").padStart(2, "0");
    const s = (secStr || "00").padStart(2, "0");
    const ms = (msStr || "00").padStart(2, "0");
    return `${m}:${s}.${ms}`;
  };

  const handleEnter = async () => {
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

    // ✅ If topScore is 0, send the current value (or current time string) as the best result
    const currentVal = (type === "negative" || ladderType === "negative") 
        ? `00:${minStr.padStart(2, "0")}:${secStr.padStart(2, "0")}.${msStr.padStart(2, "0")}0`
        : value;
    
    const bestResultToSubmit = (topScore === 0 || topScore === "0") ? currentVal : topScore;

    return await submitScore(value, bestResultToSubmit, { m: minStr, s: secStr, ms: msStr });
}



  const submitScore = async (inputScore, bestScore, timeObj) => {
    if (!skillActivityId || !playerId) return;

    let finalScore;
    let URl;
    let ladderTypeUpdate;
    if (type === "negative" || ladderType === "negative") {
      URl = "user/postResultNegativeSkillboard";
      ladderTypeUpdate = "negative";

      const m = (timeObj?.m || "00").padStart(2, "0");
      const s = (timeObj?.s || "00").padStart(2, "0");
      const ms = (timeObj?.ms || "00").padStart(2, "0");

      finalScore = `00:${m}:${s}.${ms}0`;


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
      const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));

      setSaving(true);

      const payload = {
        user_id: playerId,
        skill_activity_id: skillActivityId,
        score: finalScore,
        witness_by: witnessBy.trim(),
        admin_id: adminDetails.id,
        ladder_id: ladderId,
        user_name: playerName,
      };

      if (bestScore !== undefined && bestScore !== null) {
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
       
        setOpenSuccess(true);
        return true;
      } else {
        toast.error(res.error_message);
        return false;
      }
    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      toast.error("Failed to save: " + (err.response?.data?.message || "Unknown error"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = useCallback(() => {
    setValue("0");
    setWitnessBy("");
    setMinStr("00");
    setSecStr("00");
    setMsStr("00");
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  const handleSuccessCloseResult = useCallback(() => {
    setOpenSuccessResult(false);
  }, []);



  const handleZeroConfirm = (type) => {
    setOpenZeroAlert(false);

    if (type === "ok") {
      const bestResultToSubmit = (topScore === 0 || topScore === "0") ? 0 : topScore;
      submitScore(0, bestResultToSubmit);
    } else if (type === "reset") {
      setValue("-");
      const bestResultToSubmit = (topScore === 0 || topScore === "0") ? "-" : topScore;
      submitScore("-", bestResultToSubmit);
    }
  };

  const getBestScore = async () => {
    if (ladderType === "negative" || type === "negative") {
      await submitScore(value, topScore, { m: minStr, s: secStr, ms: msStr });
      return;
    }

    if (value == 0 || value == "-" || ladderType === "positive" || type === "positive") {
      await handleEnter();
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
          
          {(ladderType !== "negative" && type !== "negative") && <div className="flex gap-4 sm:gap-6 bg-slate-900 p-2 rounded-md border border-slate-700 w-full sm:w-auto mt-2 sm:mt-0 shadow-inner">
            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">
                Today's Result
              </label>
              {(type === "negative" || ladderType === "negative") ? (
                <div className="flex items-center justify-center gap-[2px] mt-1 font-bold text-black bg-white rounded h-8 w-full sm:w-28 focus-within:ring-2 focus-within:ring-sky-500 overflow-hidden border border-gray-300 px-1">
                  <input
                    className={`w-6 text-center outline-none bg-transparent p-0 text-sm ${activeField === "min" ? "text-sky-500" : ""}`}
                    value={minStr}
                    onChange={handleMinChange}
                    onFocus={() => handleFocus("min")}
                    onClick={() => handleFocus("min")}
                    onBlur={handleTimeBlur}
                    placeholder="MM"
                  />
                  <span>:</span>
                  <input
                    className={`w-6 text-center outline-none bg-transparent p-0 text-sm ${activeField === "sec" ? "text-sky-500" : ""}`}
                    value={secStr}
                    onChange={handleSecChange}
                    onFocus={() => handleFocus("sec")}
                    onClick={() => handleFocus("sec")}
                    onBlur={handleTimeBlur}
                    placeholder="SS"
                  />
                  <span>.</span>
                  <input
                    className={`w-6 text-center outline-none bg-transparent p-0 text-sm ${activeField === "ms" ? "text-sky-500" : ""}`}
                    value={msStr}
                    onChange={handleMsChange}
                    onFocus={() => handleFocus("ms")}
                    onClick={() => handleFocus("ms")}
                    onBlur={handleTimeBlur}
                    placeholder="MS"
                  />
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
                className="w-full sm:w-16 h-8 text-center rounded text-slate-700 font-bold mt-1 bg-slate-300 outline-none focus:ring-2 focus:ring-sky-500"
                value={(topScore === 0 || topScore === "0") 
                  ? ((type === "negative" || ladderType === "negative") ? formatTimeInfo() : value) 
                  : topScore}
                onChange={(e) => setTopScore(e.target.value)}
              />
            </div>
          </div>}
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
            <div className="flex items-center gap-2  w-full">
              <div className="w-1/2 flex items-center justify-center gap-1 text-2xl text-black font-semibold bg-slate-200 rounded-md h-[40px] px-1 sm:px-3 shadow-inner min-w-[120px]">
                <input
                  className={`w-10 text-center bg-transparent outline-none p-0 ${activeField === "min" ? "text-sky-600" : ""}`}
                  value={minStr}
                  onChange={handleMinChange}
                  onFocus={() => handleFocus("min")}
                  onClick={() => handleFocus("min")}
                  onBlur={handleTimeBlur}
                  placeholder="00"
                />
                <span className="pb-1">:</span>
                <input
                  className={`w-10 text-center bg-transparent outline-none p-0 ${activeField === "sec" ? "text-sky-600" : ""}`}
                  value={secStr}
                  onChange={handleSecChange}
                  onFocus={() => handleFocus("sec")}
                  onClick={() => handleFocus("sec")}
                  onBlur={handleTimeBlur}
                  placeholder="00"
                />
                <span className="pb-1">.</span>
                <input
                  className={`w-10 text-center bg-transparent outline-none p-0 ${activeField === "ms" ? "text-sky-600" : ""}`}
                  value={msStr}
                  onChange={handleMsChange}
                  onFocus={() => handleFocus("ms")}
                  onClick={() => handleFocus("ms")}
                  onBlur={handleTimeBlur}
                  placeholder="00"
                />
              </div>
              <div className="w-1/2">
                <Input
                  placeholder="Witness by (optional)"
                  value={witnessBy}
                  onChange={(e) => setWitnessBy(e.target.value)}
                  className="w-full text-start text-sm text-black font-semibold bg-slate-200 h-[40px]"
                />
              </div>
            </div>
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
                  ? formatTimeInfo()
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
                  {(topScore === 0 || topScore === "0") 
                    ? ((type === "negative" || ladderType === "negative") ? formatTimeInfo() : value) 
                    : topScore}
                </span>
              </div>
            </div>
            {/* Witness */}
            <div>
              <label className="text-md font-medium">Witness: <span className="ml-3 font-bold"> {witnessBy || "—"} </span></label>
            </div>

            {/* Button */}
            <Button
              onClick={async () => {
                const success = await handleEnter();
                if (success) {
                  handleSuccessCloseResult();
                }
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
