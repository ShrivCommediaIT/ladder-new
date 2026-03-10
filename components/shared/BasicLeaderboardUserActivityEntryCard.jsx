"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
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

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const activityNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BasicLeaderboardActivityEntryCard({
  ladderId,
  playerId,
  skillActivityId,
  initialActivity,
  onClose,
}) {
  const [selectedActivity, setSelectedActivity] = useState(
    initialActivity || 1,
  );
  const [value, setValue] = useState("0");
  const [witnessBy, setWitnessBy] = useState("");
  const [skillSign, setSkillSign] = useState("+"); // dynamic sign from API
  const [skillDesc, setSkillDesc] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [skillTarget, setSkillTarget] = useState("");
  const [openZeroAlert, setOpenZeroAlert] = useState(false);
  const DEFAULT_TIME = "00:00:000";
  const [time, setTime] = useState(DEFAULT_TIME);
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const timeRef = useRef(null);
  // Update selected activity if initialActivity changes
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
        const res = await axios.get(
          "https://ne-games.com/leaderBoard/api/user/getskillBynumber",
          {
            params: {
              ladder_id: ladderId,
              skill_number: selectedActivity,
            },
            headers: { APPKEY },
          },
        );

        const data = res.data?.data || {};
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

  /* ---------------- INPUT HANDLERS ---------------- */

  const handleDigit = (d) => {
    if (type !== "negative") return;

    const input = timeRef.current;
    if (!input) return;

    let pos = input.selectionStart;

    let current = input.value || time;

    let [min, sec, ms] = current.split(":");

    // ---------- MIN ----------
    if (pos <= 2) {
      let p = pos;

      let newMin =
        min.slice(0, p) +
        d +
        min.slice(p + 1);

      newMin = newMin.slice(0, 2);

      if (parseInt(newMin) > 59) return;

      const result =
        `${newMin.padStart(2, "0")}:${sec}:${ms}`;

      setTime(result);

      setTimeout(() => {
        let next = Math.min(pos + 1, 2);
        input.setSelectionRange(next, next);
      });

      return;
    }

    // ---------- SEC ----------
    if (pos > 2 && pos <= 5) {
      let p = pos - 3;

      let newSec =
        sec.slice(0, p) +
        d +
        sec.slice(p + 1);

      newSec = newSec.slice(0, 2);

      if (parseInt(newSec) > 59) return;

      const result =
        `${min}:${newSec.padStart(2, "0")}:${ms}`;

      setTime(result);

      setTimeout(() => {
        let next = pos + 1;
        if (next === 5) next = 6;
        input.setSelectionRange(next, next);
      });

      return;
    }

    // ---------- MS ----------
    if (pos > 5) {
      let p = pos - 6;

      let newMs =
        ms.slice(0, p) +
        d +
        ms.slice(p + 1);

      newMs = newMs.slice(0, 3);

      if (parseInt(newMs) > 999) return;

      const result =
        `${min}:${sec}:${newMs.padStart(3, "0")}`;

      setTime(result);

      setTimeout(() => {
        let next = Math.min(pos + 1, 8);
        input.setSelectionRange(next, next);
      });
    }
  };

  const handleBackspace = () => {
    if (type !== "negative") return;

    const input = timeRef.current;
    if (!input) return;

    let pos = input.selectionStart;

    if (pos === 0) return;

    let [min, sec, ms] = time.split(":");

    // -------- MIN --------
    if (pos <= 2) {
      let p = pos - 1;

      if (p < 0) return;

      let arr = min.split("");
      arr[p] = "0";

      const result = `${arr.join("")}:${sec}:${ms}`;

      setTime(result);

      setTimeout(() => {
        input.setSelectionRange(p, p);
      });

      return;
    }

    // -------- SEC --------
    if (pos > 2 && pos <= 5) {
      let p = pos - 4;

      if (p < 0) return;

      let arr = sec.split("");
      arr[p] = "0";

      const result = `${min}:${arr.join("")}:${ms}`;

      setTime(result);

      setTimeout(() => {
        input.setSelectionRange(pos - 1, pos - 1);
      });

      return;
    }

    // -------- MS --------
    if (pos > 5) {
      let p = pos - 7;

      if (p < 0) return;

      let arr = ms.split("");
      arr[p] = "0";

      const result = `${min}:${sec}:${arr.join("")}`;

      setTime(result);

      setTimeout(() => {
        input.setSelectionRange(pos - 1, pos - 1);
      });
    }
  };

  const handleClear = () => {
    if (type === "negative") {
      setTime("00:00:000");
    } else {
      setValue("0");
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // allow digits and optional leading minus
    if (/^\d*$/.test(val)) setValue(val || "0");
  };

  const handleInputChangeTime = (e) => {
    if (type !== "negative") return;

    let val = e.target.value;
    console.log("handleInputChangeTime==>", val)
    if (!/^[0-9:]*$/.test(val)) return;

    if (val.length > 9) return;

    let parts = val.split(":");

    if (parts.length !== 3) {
      setTime(val);
      return;
    }

    let min = parts[0] || "0";
    let sec = parts[1] || "0";
    let ms = parts[2] || "0";

    // limit length per block
    if (min.length > 2) return;
    if (sec.length > 2) return;
    if (ms.length > 3) return;

    // limit values
    if (parseInt(min) > 59) return;
    if (parseInt(sec) > 59) return;
    if (parseInt(ms) > 999) return;

    setTime(val);
  };

  const formatTimeForApi = (t) => {
    if (!t) return null;

    const [min = "00", sec = "00", ms = "000"] = t.split(":");

    // zero check
    if (
      min === "00" &&
      sec === "00" &&
      ms === "000"
    ) {
      return null;
    }

    return `${parseInt(min)}:${sec.padStart(2, "0")}.${ms.padStart(3, "0")}`;
  };

  const handleEnter = useCallback(async () => {
    if (!skillActivityId || !playerId) return;

    let finalScore;
    let URl;
    if (type === "negative") {
  URl = "user/postResultNegativeSkillboard";

  let currentTime =
    timeRef.current?.value || time;

  const formattedTime =
    formatTimeForApi(currentTime);

  if (!formattedTime) {
    setOpenZeroAlert(true);
    return;
  }

  finalScore = formattedTime; // ✅ correct format
} else {
      URl = "user/postResultPositiveSkillboard";
      const num = Math.abs(Number(value) || 0);

      if (num === 0) {
        setOpenZeroAlert(true);
        return;
      }

      finalScore = skillSign === "-" ? -num : num;
    }

    try {
      setSaving(true);

      // Agar API strictly FormData mangti hai, toh niche wala logic dekhein
      const payload = {
        user_id: playerId,
        skill_activity_id: skillActivityId,
        score: finalScore,
        witness_by: witnessBy.trim() || "test user" // trim() lagaya taki khali spaces na jayein
      };

    

      const res = await axios.post(
        `https://ne-games.com/leaderBoard/api/${URl}`,
        payload, // Direct object bhejein
        {
          headers: {
            APPKEY: APPKEY,
            "Content-Type": "application/json", // Explicitly set karein
          },
        }
      );

      setOpenSuccess(true);

    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      // Alert dikhayein agar error aaye
      alert("Failed to save: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }, [skillActivityId, playerId, value, skillSign, witnessBy]);

  const handleSuccessClose = useCallback(() => {
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  return (
    <>
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3">

        {/* HEADER - FIXED */}
        <div className="mb-2">
          {(type != "positive" && type != "negative") &&  <p className="text-[11px] uppercase tracking-wide text-sky-300">
            Skill Selected Number : {selectedActivity}
          </p>}

          {/* SKILL NAME */}
          {loadingSkill ? (
            <p className="text-xs text-slate-400">Loading skill...</p>
          ) : (
            <p className="text-sm text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
              Skill Name :   {skillDesc || "No skill description"}
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

        {/* ACTIVITY BUTTONS */}
       {(type != "positive" && type != "negative") && <div className="flex flex-wrap gap-1.5 mb-2">
          {activityNumbers.map((n) => (
            <button
              key={n}
              onClick={() => {
                setSelectedActivity(n);
                setValue("0");
              }}
              className={`w-7 h-7 rounded-md border text-[11px] transition-all duration-200
                ${
                  selectedActivity === n
                    ? "bg-sky-400 text-black border-white scale-110 shadow-md"
                    : "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:scale-105"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
        }

        {/* SCORE ENTRY */}

        <div className="flex items-center gap-2">
          {/* <Input
            ref={timeRef}
            value={type === "negative" ? time : value}
            onChange={type === "negative" ? handleInputChangeTime : handleInputChange}
            className={`text-center text-lg  ${type === "negative" ? "bg-slate-800 text-white" : "bg-slate-200 text-black"} font-semibold`}
          /> */}

          <Input
            ref={timeRef}
            value={type === "negative" ? time : value}
            onChange={
              type === "negative"
                ? handleInputChangeTime
                : handleInputChange
            }
            onClick={(e) => {
              if (type !== "negative") return;

              let pos = e.target.selectionStart;

              if (pos === 2) pos = 3;
              if (pos === 5) pos = 6;

              e.target.setSelectionRange(pos, pos);
            }}
            className={`text-center text-lg  ${type === "negative" ? "bg-slate-800 text-white" : "bg-slate-200 text-black"} font-semibold`}
          />

          {(type != "positive" && type != "negative") &&<Input
            placeholder="Witness by (optional)"
            value={witnessBy}
            onChange={(e) => setWitnessBy(e.target.value)}
            type="text"
            maxLength={50}
            className="text-start text-sm text-black font-semibold bg-slate-200"
          />}
        </div>

        {/* NUMPAD */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(String(d))}
            className="h-9 bg-white text-black rounded hover:bg-gray-100 active:scale-95 transition-all"
          >
            {d}
          </button>
        ))}

        {/* clear + dot */}
        <div className="col-span-1 grid grid-cols-12 gap-2">
          <button
            onClick={handleClear}
            className={`h-9 bg-red-500 text-black rounded transition-all ${
              type === "positive"
                ? "col-span-8"
                : "col-span-12"
            }`}
          >
            clear
          </button>

          {(type === "positive") && (
            <button
              onClick={() => handleDigit(".")}
              className="col-span-4 h-9 bg-white  text-black rounded"
            >
              .
            </button>
          )}
        </div>

        <button
          onClick={() => handleDigit("0")}
          className="h-9 bg-white text-black rounded"
        >
          0
        </button>

        <button
          onClick={handleBackspace}
          className="h-9 bg-red-300 text-black rounded"
        >
          ⌫
        </button>
      </div>

        <Button
          disabled={saving}
          onClick={handleEnter}
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
              <b>{Math.abs(value)}</b>
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

      {/* ZERO SCORE ALERT */}
      <Dialog open={openZeroAlert} onOpenChange={setOpenZeroAlert}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-xl">
              Invalid Score
            </DialogTitle>
            <DialogDescription className="text-lg">
              Zero score is not allowed
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setOpenZeroAlert(false)}
              className="bg-red-500 hover:bg-red-400 text-black font-semibold"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

