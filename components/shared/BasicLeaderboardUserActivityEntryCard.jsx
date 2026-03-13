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

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const ladderType = searchParams.get("ladder_type");
  const minRef = useRef(null);
  const secRef = useRef(null);
  const msRef = useRef(null);
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

    setValue((prev) => {
        if (d === "." && !prev) return prev;
        if (d === "." && prev.includes(".")) return prev;
        if (prev === "0" && d !== ".") return d;
        return prev + d;
    })
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
      setValue(val );
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

  const handleEnter = useCallback(async () => {
    if (!skillActivityId || !playerId) return;

    let finalScore;
    let URl;
    if (type === "negative" || ladderType === "negative") {
      URl = "user/postResultNegativeSkillboard";
      finalScore =
        "00:" +
        `${timeParts.min.padStart(2, "0")}:${timeParts.sec.padStart(2, "0")}.${timeParts.ms.padStart(3, "0")}`;
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
        witness_by: witnessBy.trim(),
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
  }, [
    skillActivityId,
    playerId,
    value,
    skillSign,
    witnessBy,
    timeParts,
    type,
    ladderType,
  ]);

  const handleSuccessClose = useCallback(() => {
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  const formatTime = (timeParts) => {
  const min = (timeParts.min || "").padStart(2, "0");
  const sec = (timeParts.sec || "").padStart(2, "0");
  const ms = (timeParts.ms || "").padStart(3, "0");

    return `${min}:${sec}.${ms}`;
  };

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
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDigit(".")}
                className="col-span-4 h-9 bg-white text-black rounded"
              >
                .
              </button>
            )}
          </div>

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleDigit("0")}
            className="h-9 bg-white text-black rounded"
          >
            0
          </button>

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
                ? formatTime(timeParts)
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
