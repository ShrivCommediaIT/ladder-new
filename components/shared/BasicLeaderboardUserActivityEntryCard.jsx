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
import { set } from "date-fns";

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
  const [activeTime, setActiveTime] = useState("min");
  const [min, setMin] = useState("00");
  const [sec, setSec] = useState("00");
  const [ms, setMs] = useState("000");
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const ladderType = searchParams.get("ladder_type");
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

  if (type === "negative" || ladderType === "negative") {

    if (activeTime === "min") {
      setMin((p) => {
        let v = (p + d).slice(-2);
        if (Number(v) > 59) return p;
        return v;
      });
    }

    if (activeTime === "sec") {
      setSec((p) => {
        let v = (p + d).slice(-2);
        if (Number(v) > 59) return p;
        return v;
      });
    }

    if (activeTime === "ms") {
      setMs((p) => {
        let v = (p + d).slice(-3);
        if (Number(v) > 999) return p;
        return v;
      });
    }

    return;
  }

  // normal mode
  setValue((prev) => {
    if (d === "." && !prev) return prev;
    if (d === "." && prev.includes(".")) return prev;
    if (prev === "0" && d !== ".") return d;
    return prev + d;
  });
};

  const handleBackspace = () => {

    if (type === "negative" || ladderType === "negative") {

      if (activeTime === "min") {
        setMin((p) => p.slice(0, -1) || "0");
      }

      if (activeTime === "sec") {
        setSec((p) => p.slice(0, -1) || "0");
      }

      if (activeTime === "ms") {
        setMs((p) => p.slice(0, -1) || "0");
      }

      return;
    }

    setValue((prev) => {
      if (!prev) return "0";
      let newVal = prev.slice(0, -1);
      if (newVal === "" || newVal === "-") return "0";
      return newVal;
    });
  };

  const handleClear = () => {
    if (type === "negative") {
      setMin("00");
      setSec("00");
      setMs("000");
    } else {
      setValue("0");
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;

    if (/^\d*\.?\d*$/.test(val)) {
      setValue(val || "0");
    }
  };

const handleInputChangeTime = (val, type) => {
  if (!/^\d*$/.test(val)) return;

  if (type === "min") {
    if (val.length > 2) return;
    if (Number(val) > 59) return;
    setMin(val);
  }

  if (type === "sec") {
    if (val.length > 2) return;
    if (Number(val) > 59) return;
    setSec(val);
  }

  if (type === "ms") {
    if (val.length > 3) return;
    if (Number(val) > 999) return;
    setMs(val);
  }
};

  const formatTimeForApi = (t) => {
    if (!t) return null;

    const [min = "00", sec = "00", ms = "000"] = t.split(":");

    // zero check
    if (min === "00" && sec === "00" && ms === "000") {
      return null;
    }
    return `${min.padStart(2, "0")}:${sec.padStart(2, "0")}.${ms.padStart(3, "0")}`;
  };

  const handleEnter = useCallback(async () => {
    if (!skillActivityId || !playerId) return;

    let finalScore;
    let URl;
    if (type === "negative" || ladderType === "negative") {
      URl = "user/postResultNegativeSkillboard";
      finalScore = "00:" + `${min.padStart(2, "0")}:${sec.padStart(2, "0")}.${ms.padStart(3, "0")}`;
    } else {
      URl = "user/postResultSkillboard";
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
        witness_by: witnessBy.trim() || "test user",
      };

      const res = await axios.post(
        `https://ne-games.com/leaderBoard/api/${URl}`,
        payload, // Direct object bhejein
        {
          headers: {
            APPKEY: APPKEY,
            "Content-Type": "application/json", // Explicitly set karein
          },
        },
      );

      setOpenSuccess(true);
    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      // Alert dikhayein agar error aaye
      alert(
        "Failed to save: " + (err.response?.data?.message || "Unknown error"),
      );
    } finally {
      setSaving(false);
    }
  }, [skillActivityId,
  playerId,
  value,
  skillSign,
  witnessBy,
  min,
  sec,
  ms,
  type,
  ladderType,]);

  const handleSuccessClose = useCallback(() => {
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  return (
    <>
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3">
        {/* HEADER - FIXED */}
        <div className="mb-2">
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
          )}

        {/* SCORE ENTRY */}

        <div
          className={`flex items-center gap-2 w-full ${
            type === "negative" || ladderType === "negative"
              ? "justify-center bg-slate-800"
              : "justify-start"
          }`}
        >
          {type !== "negative" && ladderType !== "negative" && (
            <Input
              placeholder="Enter score"
              value={value}
              onChange={handleInputChange}
              className={`text-center text-lg font-semibold`}
            />
          )}

          {(type === "negative" || ladderType === "negative") && (
            <div className="flex items-center justify-center gap-2 text-lg">
              <Input
                placeholder="00"
                value={min}
                maxLength={2}
                onClick={() => setActiveTime("min")}
                onChange={(e) => handleInputChangeTime(e.target.value, "min")}
                className="w-12 h-10 text-center text-sm text-white font-semibold 
                bg-slate-800 border-0 outline-none ring-0
                focus:ring-0 focus:outline-none
                focus-visible:ring-0 focus-visible:outline-none"
              />
              :
              <Input
                placeholder="00"
                value={sec}
                maxLength={2}
                onClick={() => setActiveTime("sec")}
                onChange={(e) => handleInputChangeTime(e.target.value, "sec")}
                className="w-12 h-10 text-center text-sm text-white font-semibold 
                bg-slate-800 border-0 outline-none ring-0
                focus:ring-0 focus:outline-none
                focus-visible:ring-0 focus-visible:outline-none"
              />
              :
              <Input
                placeholder="000"
                value={ms}
                maxLength={3}
                onClick={() => setActiveTime("ms")}
                onChange={(e) => handleInputChangeTime(e.target.value, "ms")}
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
                type === "positive" || ladderType === "positive"
                  ? "col-span-8"
                  : "col-span-12"
              }`}
            >
              clear
            </button>

            {(type === "positive" || ladderType === "positive") && (
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
              <b>
                {type === "negative" || ladderType === "negative"
                  ? `${min}:${sec}.${ms}`
                  : Math.abs(value)}
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
