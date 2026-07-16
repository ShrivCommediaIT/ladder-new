"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { getRequest, postRequest, postUrlEncoded } from "@/services/apiService";
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
import { convertTimeToSeconds } from "@/helper/helperFunction";



const activityNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BasicLeaderboardActivityEntryCard({
  ladderId,
  playerId,
  skillActivityId,
  initialActivity,
  onClose,
  playerName,
  selectedPlayer,
  onPaymentRequired
}) {
  const createdBy = useSelector((state) => 
    state.player?.players?.[ladderId]?.ladderDetails?.created_by ||
    state.player?.players?.[Number(ladderId)]?.ladderDetails?.created_by ||
    state.skillLeaderboard?.ladderDetails?.created_by ||
    state.positiveLeaderBoard?.ladderDetails?.created_by ||
    state.negativeLeaderBoard?.ladderDetails?.created_by ||
    state.rosterLeaderboard?.ladderDetails?.created_by ||
    state.minileague?.data?.created_by
  );
  const [selectedActivity, setSelectedActivity] = useState(
    initialActivity || 1,
  );
  const [currentScore, setCurrentScore] = useState(0);
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
    setBestInputFocused(false);
  };


  const [zeroAction, setZeroAction] = useState(null);
  const [topScore, setTopScore] = useState(0);
  const [loadingTopScore, setLoadingTopScore] = useState(true);
  const [openSuccessResult, setOpenSuccessResult] = useState(false);
  const [hasEditedToday, setHasEditedToday] = useState(false);

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const ladderType = searchParams.get("ladder_type");

  useEffect(() => {
    if (selectedPlayer && selectedPlayer.scores) {
      const currentScoreObj = selectedPlayer.scores.find(s => s.skill_number === selectedActivity) || selectedPlayer.scores[skillActivityId];

      if (type === "negative" || ladderType === "negative") {
        const negScore = currentScoreObj?.negative_ladder_score || currentScoreObj?.score;
        if (negScore && negScore !== "0" && negScore !== 0) {
          const parts = String(negScore).split(":");
          if (parts.length === 3) {
            const mm = parts[1].padStart(2, "0");
            const [ss, msRaw] = parts[2].split(".");
            const ms = (msRaw || "00").slice(0, 2).padStart(2, "0");
            setMinStr(mm);
            setSecStr(ss.padStart(2, "0"));
            setMsStr(ms);
            setCurrentScore(currentScoreObj?.negative_ladder_bestscore);
          }
        } else {
          setMinStr("00"); setSecStr("00"); setMsStr("00");
        }
      } else {
        const posScore = currentScoreObj?.score;
        if (posScore !== undefined && posScore !== null) {
          setValue(String(posScore));
          setCurrentScore(posScore);
        } else {
          setValue("0");
        }
      }
      setHasEditedToday(false);
    }
  }, [selectedPlayer, type, ladderType, selectedActivity]);

  // Negative best-result editing
  const [editingBest, setEditingBest] = useState(false);
  const [editingCurrent, setEditingCurrent] = useState(false);
  const [bestMinStr, setBestMinStr] = useState("00");
  const [bestSecStr, setBestSecStr] = useState("00");
  const [bestMsStr, setBestMsStr] = useState("00");
  // Tracks whether numpad should target best-score inputs
  const [bestInputFocused, setBestInputFocused] = useState(false);
  const [bestActiveField, setBestActiveField] = useState("min");
  const [bestFieldKeystrokes, setBestFieldKeystrokes] = useState(0);



  useEffect(() => {
    if (initialActivity) {
      setSelectedActivity(initialActivity);
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
      } catch (err) {
        console.error("Skill fetch failed", err);
        setSkillDesc("");
        setSkillTarget("No target"); // ERROR STATE
        setSkillSign("+");
      } finally {
        setLoadingSkill(false);
      }
    };

    fetchSkill();
  }, [selectedActivity, ladderId]);

  useEffect(() => {
    if (!playerId || !skillActivityId) return;

    const fetchTopScore = async () => {
      setLoadingTopScore(true);
      try {
        const bestScore = await getRequest("/user/getTopScore", {
          user_id: String(playerId),
          skill_activity_id: String(skillActivityId),
          score: String(currentScore),
        });

        if (bestScore?.status === 200 || bestScore?.status === "success") {
          const ts = bestScore?.data?.[0]?.top_score || 0;
          setTopScore(ts);

          // For negative type: parse the time string and pre-populate best* fields
          // Format from server: "00:MM:SS.MS0" e.g. "00:01:23.450"
          if ((type === "negative" || ladderType === "negative") && ts && ts !== 0 && ts !== "0") {
            const parts = String(ts).split(":");
            if (parts.length === 3) {
              const mm = parts[1].padStart(2, "0");
              const [ss, msRaw] = parts[2].split(".");
              const ms = (msRaw || "00").slice(0, 2).padStart(2, "0");
              setBestMinStr(mm);
              setBestSecStr((ss || "00").padStart(2, "0"));
              setBestMsStr(ms);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load initial top score:", err);
      } finally {
        setLoadingTopScore(false);
      }
    };

    fetchTopScore();
  }, [playerId, skillActivityId, currentScore]);

  const handleDigit = (d) => {

    // ✅ BEST SCORE INPUT FOCUSED — route numpad to best score states
    if (bestInputFocused) {
      if (type === "negative" || ladderType === "negative") {
        if (!/^\d$/.test(d)) return;
        if (bestActiveField === "min") {
          setBestMinStr(prev => { let val = ((prev || "00") + d).slice(-2); return parseInt(val) > 59 ? "59" : val; });
          if (bestFieldKeystrokes === 1) { setBestActiveField("sec"); setBestFieldKeystrokes(0); }
          else setBestFieldKeystrokes(1);
        } else if (bestActiveField === "sec") {
          setBestSecStr(prev => { let val = ((prev || "00") + d).slice(-2); return parseInt(val) > 59 ? "59" : val; });
          if (bestFieldKeystrokes === 1) { setBestActiveField("ms"); setBestFieldKeystrokes(0); }
          else setBestFieldKeystrokes(1);
        } else if (bestActiveField === "ms") {
          setBestMsStr(prev => ((prev || "00") + d).slice(-2));
          setBestFieldKeystrokes(bestFieldKeystrokes === 1 ? 0 : 1);
        }
      } else {
        // positive / skill: update topScore
        setTopScore(prev => {
          const p = String(prev === 0 || prev === "0" ? "" : prev);
          if (d === "." && p.includes(".")) return prev;
          if (p === "" || (p === "0" && d !== ".")) return d;
          if (p.includes(".") && d !== "-") {
            const parts = p.split(".");
            if (parts[1].length >= 2) return prev;
          }
          return p + d;
        });
      }
      return;
    }

    // ✅ NEGATIVE (TIMER MODE)
    if (type === "negative" || ladderType === "negative") {
      // 🚨 Ignore non-digit inputs
      if (!/^\d$/.test(d)) return;

      let currentActiveField = activeField;
      let currentFieldKeystrokes = fieldKeystrokes;

      if (!hasEditedToday) {
        setMinStr("00"); setSecStr("00"); setMsStr("00");
        setHasEditedToday(true);
        setActiveField("min");
        currentActiveField = "min";
        currentFieldKeystrokes = 0;
      }

      if (currentActiveField === "min") {
        setMinStr(prev => { let val = ((!hasEditedToday ? "00" : prev || "00") + d).slice(-2); return parseInt(val) > 59 ? "59" : val; });
        if (currentFieldKeystrokes === 1) { setActiveField("sec"); setFieldKeystrokes(0); }
        else setFieldKeystrokes(1);
      } else if (currentActiveField === "sec") {
        setSecStr(prev => { let val = ((!hasEditedToday ? "00" : prev || "00") + d).slice(-2); return parseInt(val) > 59 ? "59" : val; });
        if (currentFieldKeystrokes === 1) { setActiveField("ms"); setFieldKeystrokes(0); }
        else setFieldKeystrokes(1);
      } else if (currentActiveField === "ms") {
        setMsStr(prev => ((!hasEditedToday ? "00" : prev || "00") + d).slice(-2));
        setFieldKeystrokes(currentFieldKeystrokes === 1 ? 0 : 1);
      }
      return;
    }

    // ✅ NORMAL MODE (unchanged)
    setValue((prev) => {
      const p = !hasEditedToday ? "0" : prev;
      if (d === "." && !p) return p;
      if (d === "." && p.includes(".")) return p;
      if (p === "0" && d !== ".") return d;

      // Allow only 2 decimal places
      if (p.includes(".") && d !== "-") {
        const parts = p.split(".");
        if (parts[1].length >= 2) return p;
      }

      // 🔥 Optional: handle "-" properly (only at start)
      if (d === "-") {
        if (!p || p === "0") return "-";
        return p; // ignore if already typing
      }

      return p + d;
    });
    setHasEditedToday(true);
  };

  const handleBackspace = () => {
    // ✅ BEST SCORE INPUT FOCUSED
    if (bestInputFocused) {
      if (type === "negative" || ladderType === "negative") {
        if (bestActiveField === "ms") {
          setBestMsStr(prev => { let val = (prev || "00").replace(/^0+/, ""); if (!val) { setBestActiveField("sec"); setBestFieldKeystrokes(0); return "00"; } return (val.slice(0, -1) || "00").padStart(2, "0"); });
          setBestFieldKeystrokes(0);
        } else if (bestActiveField === "sec") {
          setBestSecStr(prev => { let val = (prev || "00").replace(/^0+/, ""); if (!val) { setBestActiveField("min"); setBestFieldKeystrokes(0); return "00"; } return (val.slice(0, -1) || "00").padStart(2, "0"); });
          setBestFieldKeystrokes(0);
        } else if (bestActiveField === "min") {
          setBestMinStr(prev => { let val = (prev || "00").replace(/^0+/, ""); return (val.slice(0, -1) || "00").padStart(2, "0"); });
          setBestFieldKeystrokes(0);
        }
      } else {
        setTopScore(prev => { const p = String(prev); if (!p || p === "0") return 0; const nv = p.slice(0, -1); return nv || 0; });
      }
      return;
    }

    if (type === "negative" || ladderType === "negative") {
      if (!hasEditedToday) {
        setMinStr("00"); setSecStr("00"); setMsStr("00");
        setHasEditedToday(true);
        setActiveField("min");
        setFieldKeystrokes(0);
        return;
      }

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

    setHasEditedToday(true);
    setValue((prev) => {
      const p = !hasEditedToday ? "0" : prev;
      if (!p) return "0";
      let newVal = p.slice(0, -1);
      if (newVal === "" || newVal === "-") return "0";
      return newVal;
    });
  };

  const handleClear = () => {
    // ✅ BEST SCORE INPUT FOCUSED
    if (bestInputFocused) {
      if (type === "negative" || ladderType === "negative") {
        setBestMinStr("00"); setBestSecStr("00"); setBestMsStr("00");
        setBestActiveField("min"); setBestFieldKeystrokes(0);
      } else {
        setTopScore(0);
      }
      return;
    }

    if (type === "negative" || ladderType === "negative") {
      setMinStr("00");
      setSecStr("00");
      setMsStr("00");
      setActiveField("min");
      setFieldKeystrokes(0);
      setHasEditedToday(true);
      return;
    }

    setHasEditedToday(true);
    setValue("0");
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "-") {
      setValue(val);
      setHasEditedToday(true);
    }
  };

  const handleMinChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 59) val = "59";
    setMinStr(val);
    setActiveField("min");
    setFieldKeystrokes(0);
    setHasEditedToday(true);
  };
  const handleSecChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    if (parseInt(val) > 59) val = "59";
    setSecStr(val);
    setActiveField("sec");
    setFieldKeystrokes(0);
    setHasEditedToday(true);
  };
  const handleMsChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    setMsStr(val);
    setActiveField("ms");
    setFieldKeystrokes(0);
    setHasEditedToday(true);
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

  const isEmptyBestResult = (bestScore) => {
    if (bestScore === undefined || bestScore === null) return true;
    if (bestScore === 0 || bestScore === "0" || bestScore === "") return true;
    if (typeof bestScore === "string") {
      const normalized = bestScore.trim();
      return /^0+(?::0{2})+(?:\.0+)?$/.test(normalized);
    }
    return false;
  };

  const formatNegativeDisplay = (timeStr) => {
    if (!timeStr) return "";
    const normalized = String(timeStr).trim();
    const match = normalized.match(/^(?:00:)?(\d{2}):(\d{2})\.(\d{2})\d?$/);
    if (match) {
      return `${match[1]}:${match[2]}.${match[3]}`;
    }
    return normalized.replace(/^00:/, "");
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

    const bestResultToSubmit = isEmptyBestResult(topScore) ? currentVal : topScore;

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
        finalScore = num;
      }
    }

    // Verify subscription status for Positive and Negative Leaderboard score postings
    if (type === "positive" || ladderType === "positive" || type === "negative" || ladderType === "negative") {
      let sessionUser = null;
      let adminDetails = null;
      if (typeof window !== "undefined") {
        try {
          const storedUser = sessionStorage.getItem("user");
          if (storedUser) {
            sessionUser = JSON.parse(storedUser);
          }
          const storedAdmin = sessionStorage.getItem("adminDetails");
          if (storedAdmin) {
            adminDetails = JSON.parse(storedAdmin);
          }
        } catch (err) {
          console.error("Failed to parse user or admin in activity card", err);
        }
      }

      const requiredAdminId = Number(process.env.NEXT_PUBLIC_ADMIN_ID);
      const adminIdToCheck = Number(adminDetails?.id || createdBy);
      const isAdminMatched = adminIdToCheck === requiredAdminId;

      if (isAdminMatched && sessionUser && Number(sessionUser.id) === Number(playerId)) {
        if (sessionUser.payment_status === null || sessionUser.payment_status === "null" || !sessionUser.payment_status || sessionUser.payment_status === 0 || sessionUser.payment_status === "0" || (sessionUser.payment_status !== 1 && sessionUser.payment_status !== "1")) {
          // Only check/block if the page has provided the payment handler callback (e.g. positiveLeaderBoardUser)
          if (onPaymentRequired) {
            toast.info("Subscription required. Redirecting to payment...");
            let bestToSubmit = bestScore;
            if (bestScore === undefined || bestScore === null || bestScore === "" || bestScore === 0) {
              bestToSubmit = finalScore;
            }
            onPaymentRequired({
              playerId,
              skillActivityId,
              score: finalScore,
              bestScore: bestToSubmit,
              witnessBy: witnessBy || "",
              url: URl
            });
            return;
          }
        }
      }
    }

    try {
      const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");

      setSaving(true);

      const witnessValue =
        witnessBy && witnessBy.trim() !== "" ? witnessBy.trim() : "";
      const params = new URLSearchParams();
      params.append("user_id", String(playerId));
      params.append("skill_activity_id", String(skillActivityId));
      params.append("score", String(finalScore));
      params.append("witness_by", witnessValue);
      params.append("admin_id", adminDetails?.id || "");
      params.append("ladder_id", ladderId);
      params.append("user_name", playerName);



      if (bestScore !== undefined && bestScore !== null) {
        let bestToSubmit;
        if (type === "negative" || ladderType === "negative") {
          const currentSeconds = convertTimeToSeconds(finalScore);
          const bestSeconds = convertTimeToSeconds(bestScore);
          console.log("Current seconds:", Number(currentSeconds), "Best seconds:", Number(bestSeconds));
          if (Number(currentSeconds) < (Number(bestSeconds))) {
            bestToSubmit = String(finalScore);
          } else {
            bestToSubmit = bestScore;
          }
        } else {
          if (value > bestScore) {
            bestToSubmit = value;
          } else {
            bestToSubmit = bestScore;
          }
        }
        params.append("best_result", String(bestToSubmit));
      }
      // return
      const skillsPost = await postUrlEncoded(`/${URl}`, params);

      if (skillsPost?.status === 200 || skillsPost?.status === "success") {
        toast.success("Result posted successfully!");
        if (skillsPost?.eligible_for_token == 1) {
          updateLadderToken({
            user_id: playerName,
            ladder_id: ladderId,
            ladder_type: ladderTypeUpdate,
          });
        }

        handleSuccessClose();
        return true;
      } else {
        toast.error(skillsPost.error_message);
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
      const bestResultToSubmit = isEmptyBestResult(topScore) ? 0 : topScore;
      submitScore(0, bestResultToSubmit);
    } else if (type === "reset") {
      setValue("-");
      const bestResultToSubmit = isEmptyBestResult(topScore) ? "-" : topScore;
      submitScore("-", bestResultToSubmit);
    }
  };

  const getBestScore = async () => {
    if (ladderType === "negative" || type === "negative") {
      // Build best_result from bestMin/Sec/MsStr (pre-populated from API or user-edited)
      const bestValForNegative = `00:${bestMinStr.padStart(2, "0")}:${bestSecStr.padStart(2, "0")}.${bestMsStr.padStart(2, "0")}0`;
      setTopScore(bestValForNegative);
      setOpenSuccessResult(true);
      setEditingBest(false);
      setEditingCurrent(false)
      return;
    }

    if (value == 0 || value == "-") {
      await handleEnter();
      return;
    }

    const bestScore = await getRequest(API_ENDPOINTS.GET_SKILL_BY_NUMBER, {
      user_id: String(playerId),
      skill_activity_id: String(skillActivityId),
      score: currentScore,
    });

    if (bestScore?.status == 200) {
      setTopScore(bestScore?.data?.[0]?.top_score || 0);
      setOpenSuccessResult(true);
    }

    // For skill and positive types, use the edited topScore without fetching
    if (ladderType === "skill" || ladderType === "positive" || type === "positive") {
      setOpenSuccessResult(true);
      return;
    }


  };

  return (
    <>
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-card border border-border text-card-foreground rounded-2xl shadow-2xl p-3">
        {/* HEADER - FIXED */}
        <div className="mb-2 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 bg-muted p-2 rounded-lg">
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
              <p className="text-xs text-muted-foreground">Loading skill...</p>
            ) : (
              <p className="text-sm text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
                Skill Name : {skillDesc || "No skill description"}
              </p>
            )}

            {/* SKILL TARGET */}
            {loadingSkill ? (
              <p className="text-xs text-muted-foreground">Loading target...</p>
            ) : (
              <p className="text-sm text-emerald-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
                Target : {skillTarget ? Math.abs(skillTarget) : "No target"}
              </p>
            )}
          </div>

          <div className="flex gap-4 sm:gap-6 bg-background p-2 rounded-md border border-border w-full sm:w-auto mt-2 sm:mt-0 shadow-inner">
            <div className="flex-1 sm:flex-none flex flex-col items-center"
              onClick={() => setBestInputFocused(false)}
            >
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold whitespace-nowrap">
                Today's Result
              </label>
              {(type === "negative" || ladderType === "negative") ? (
                editingCurrent ? (
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
                ) :
                  (
                    <div
                      className="w-full sm:w-28 h-8 flex items-center justify-center rounded text-foreground font-bold mt-1 bg-muted cursor-pointer hover:bg-accent text-sm"
                      onClick={() => {
                        setEditingCurrent(true);
                        setBestInputFocused(true);
                        setBestActiveField("min");
                        setBestFieldKeystrokes(0);
                      }}
                      title="Click to edit best result"
                    >
                      {loadingTopScore ? "..." :
                        convertTimeToSeconds(selectedPlayer?.scores?.[initialActivity - 1]?.negative_ladder_bestscore) || "0"
                      }
                    </div>
                  ))
                : (
                  <input
                    className="w-full sm:w-16 h-8 text-center rounded text-black font-bold mt-1 bg-white outline-none focus:ring-2 focus:ring-sky-500"
                    value={value}
                    onFocus={() => setBestInputFocused(false)}
                    onChange={(e) => handleInputChange(e)}
                  />
                )}
            </div>

            <div className="flex-1 sm:flex-none flex flex-col items-center">
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold whitespace-nowrap">
                Best Result
              </label>

              {/* NEGATIVE: click to reveal time input */}
              {(type === "negative" || ladderType === "negative") ? (
                editingBest ? (
                  <div className="flex items-center justify-center gap-[2px] mt-1 font-bold text-black bg-white rounded h-8 w-full sm:w-28 focus-within:ring-2 focus-within:ring-sky-500 overflow-hidden border border-gray-300 px-1">
                    <input
                      className={`w-6 text-center outline-none bg-transparent p-0 text-sm ${bestActiveField === "min" ? "text-sky-600" : ""}`}
                      value={bestMinStr}
                      onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 2) v = v.slice(-2); if (parseInt(v) > 59) v = "59"; setBestMinStr(v); }}
                      onFocus={() => { setBestInputFocused(true); setBestActiveField("min"); setBestFieldKeystrokes(0); }}
                      onClick={() => { setBestInputFocused(true); setBestActiveField("min"); setBestFieldKeystrokes(0); }}
                      onBlur={() => { setBestMinStr(prev => (prev || "0").padStart(2, "0")); setBestInputFocused(false); }}
                      placeholder="MM"
                    />
                    <span>:</span>
                    <input
                      className={`w-6 text-center outline-none bg-transparent p-0 text-sm ${bestActiveField === "sec" ? "text-sky-600" : ""}`}
                      value={bestSecStr}
                      onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 2) v = v.slice(-2); if (parseInt(v) > 59) v = "59"; setBestSecStr(v); }}
                      onFocus={() => { setBestInputFocused(true); setBestActiveField("sec"); setBestFieldKeystrokes(0); }}
                      onClick={() => { setBestInputFocused(true); setBestActiveField("sec"); setBestFieldKeystrokes(0); }}
                      onBlur={() => { setBestSecStr(prev => (prev || "0").padStart(2, "0")); setBestInputFocused(false); }}
                      placeholder="SS"
                    />
                    <span>.</span>
                    <input
                      className={`w-6 text-center outline-none bg-transparent p-0 text-sm ${bestActiveField === "ms" ? "text-sky-600" : ""}`}
                      value={bestMsStr}
                      onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 2) v = v.slice(-2); setBestMsStr(v); }}
                      onFocus={() => { setBestInputFocused(true); setBestActiveField("ms"); setBestFieldKeystrokes(0); }}
                      onClick={() => { setBestInputFocused(true); setBestActiveField("ms"); setBestFieldKeystrokes(0); }}
                      onBlur={() => { setBestMsStr(prev => (prev || "0").padStart(2, "0")); setBestInputFocused(false); }}
                      placeholder="MS"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full sm:w-28 h-8 flex items-center justify-center rounded text-foreground font-bold mt-1 bg-muted cursor-pointer hover:bg-accent text-sm"
                    onClick={() => {
                      setEditingBest(true);
                      setBestInputFocused(true);
                      setBestActiveField("min");
                      setBestFieldKeystrokes(0);
                    }}
                    title="Click to edit best result"
                  >
                    {loadingTopScore ? "..." :
                      convertTimeToSeconds(selectedPlayer?.scores?.[initialActivity - 1]?.negative_ladder_score) || "0"
                    }
                  </div>
                )
              ) : (
                /* POSITIVE / SKILL: plain input, numpad routes here when focused */
                <input
                  className="w-full sm:w-16 h-8 text-center rounded text-foreground font-bold mt-1 bg-muted outline-none focus:ring-2 focus:ring-primary"
                  value={loadingTopScore ? "..." : topScore}
                  onChange={(e) => setTopScore(e.target.value)}
                  onFocus={() => setBestInputFocused(true)}
                  onBlur={() => setBestInputFocused(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ACTIVITY BUTTONS */}
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
                      ? "bg-sky-400 text-black border-border scale-110 shadow-md"
                      : "bg-muted border-border text-foreground hover:bg-accent hover:scale-105"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
            
        {/* SCORE ENTRY */}

        <div
          className={`flex items-center gap-2 w-full ${type === "negative" || ladderType === "negative"
            ? "justify-center bg-muted"
            : "justify-start"
            }`}
        >
          {type !== "negative" && ladderType !== "negative" && (
            <div className="flex items-center gap-2 mb-2 w-full">
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
          )}

          {(type === "negative" || ladderType === "negative") && (
            <div className="flex items-center gap-2  w-full">
              <div className="w-1/2 flex items-center justify-center gap-1 text-sm md:text-2xl text-foreground font-semibold bg-muted rounded-md h-[40px] px-1 sm:px-3 shadow-inner min-w-[120px]">
                <input
                  className={`w-8 text-center bg-transparent outline-none p-0 ${activeField === "min" ? "text-sky-600" : ""}`}
                  value={minStr}
                  onChange={handleMinChange}
                  onFocus={() => handleFocus("min")}
                  onClick={() => handleFocus("min")}
                  onBlur={handleTimeBlur}
                  placeholder="00"
                />
                <span className="pb-1">:</span>
                <input
                  className={`w-8 text-center bg-transparent outline-none p-0 ${activeField === "sec" ? "text-sky-600" : ""}`}
                  value={secStr}
                  onChange={handleSecChange}
                  onFocus={() => handleFocus("sec")}
                  onClick={() => handleFocus("sec")}
                  onBlur={handleTimeBlur}
                  placeholder="00"
                />
                <span className="pb-1">.</span>
                <input
                  className={`w-8 text-center bg-transparent outline-none p-0 ${activeField === "ms" ? "text-sky-600" : ""}`}
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
                  className="w-full text-start text-sm text-foreground font-semibold bg-muted border-border h-[40px]"
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
              className="h-9 bg-card text-card-foreground border border-border rounded hover:bg-accent active:scale-95 transition-all"
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
                className="col-span-4 h-9 bg-card text-card-foreground border border-border rounded hover:bg-accent active:scale-95"
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


            </div>) :
            (<button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleDigit("0")}
              className="h-9 bg-card text-card-foreground border border-border rounded font-bold hover:bg-accent active:scale-95 transition-all"
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
            {/* Scores Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base sm:text-lg font-bold gap-3">
              <div className="flex items-center gap-2">
                <span>Today’s Result</span>
                <span className="px-2 py-0.5 border border-border rounded bg-muted text-foreground font-bold">
                  {(type === "negative" || ladderType === "negative") ? formatTimeInfo() : value}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>Your Best Result</span>
                <span className="px-2 py-0.5 border border-border rounded bg-muted text-foreground font-bold">
                  {(() => {
                    const current = (type === "negative" || ladderType === "negative") ? formatTimeInfo() : value;
                    if (isEmptyBestResult(topScore)) return current;
                    return (type === "negative" || ladderType === "negative")
                      ? formatNegativeDisplay(topScore)
                      : topScore;
                  })()}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-bold">Note: Results posted without a witness will not qualify for a token.</p>
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md transition-colors"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ZERO SCORE ALERT */}

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
