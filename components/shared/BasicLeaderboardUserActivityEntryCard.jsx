"use client";

import { useEffect, useState, useCallback } from "react";
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
    initialActivity || 1
  );
  const [value, setValue] = useState("0");
  const [skillSign, setSkillSign] = useState("+"); // dynamic sign from API
  const [skillDesc, setSkillDesc] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [skillTarget, setSkillTarget] = useState("");

  const [openZeroAlert, setOpenZeroAlert] = useState(false);


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
          }
        );

        const data = res.data?.data || {};
        setSkillDesc(data.skill_description || "");
        setSkillTarget(data.target || "No target"); // ✅ SET TARGET
        setSkillSign(data.skill_sign === "-" ? "-" : "+");
        setValue("0");
      } catch (err) {
        console.error("Skill fetch failed", err);
        setSkillDesc("");
        setSkillTarget("No target"); // ✅ ERROR STATE
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
    setValue((prev) => {
      // if prev is just "-" or "0", replace it
      if (prev === "0") return d;
      return prev + d;
    });
  };

  const handleBackspace = () => {
    setValue((prev) => {
      if (prev.length <= 1) return "0";
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setValue("0");
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // allow digits and optional leading minus
    if (/^\d*$/.test(val)) setValue(val || "0");
  };

  /* ---------------- SAVE & AUTO CLOSE ⚡ ---------------- */
  // const handleEnter = useCallback(async () => {
  //   if (!skillActivityId || !playerId) return;

  //   try {
  //     setSaving(true);

  //     // const payload = {
  //     //   user_id: Number(playerId),
  //     //   skill_activity_id: Number(skillActivityId),
  //     //   score: Number(value), // negative numbers handled
  //     // };

  //     const num = Math.abs(Number(value) || 0);
  //     const finalScore = skillSign === "-" ? -num : num;

  //     const payload = {
  //       user_id: Number(playerId),
  //       skill_activity_id: Number(skillActivityId),
  //       score: finalScore,
  //     };

  //     await axios.post(
  //       "https://ne-games.com/leaderBoard/api/user/postResultSkillboard",
  //       payload,
  //       {
  //         headers: {
  //           APPKEY,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     setOpenSuccess(true);

  //     setTimeout(() => {
  //       setOpenSuccess(false);
  //       if (onClose) onClose();
  //     }, 1500);
  //   } catch (err) {
  //     console.error("Failed to save score:", err);
  //     alert("Failed to save score");
  //   } finally {
  //     setSaving(false);
  //   }
  // }, [skillActivityId, playerId, value, onClose]);


  const handleEnter = useCallback(async () => {
  if (!skillActivityId || !playerId) return;

  const num = Math.abs(Number(value) || 0);

  // 🚫 ZERO BLOCK
  if (num === 0) {
    setOpenZeroAlert(true);
    return;
  }

  try {
    setSaving(true);

    const finalScore = skillSign === "-" ? -num : num;

    const payload = {
      user_id: Number(playerId),
      skill_activity_id: Number(skillActivityId),
      score: finalScore,
    };

    await axios.post(
      "https://ne-games.com/leaderBoard/api/user/postResultSkillboard",
      payload,
      {
        headers: {
          APPKEY,
          "Content-Type": "application/json",
        },
      }
    );

    setOpenSuccess(true);

    setTimeout(() => {
      setOpenSuccess(false);
      if (onClose) onClose();
    }, 1500);
  } catch (err) {
    console.error("Failed to save score:", err);
    alert("Failed to save score");
  } finally {
    setSaving(false);
  }
}, [skillActivityId, playerId, value, skillSign, onClose]);



  const handleSuccessClose = useCallback(() => {
    setOpenSuccess(false);
    if (onClose) onClose();
  }, [onClose]);

  return (
    <>
      <Card className="w-full mx-auto max-w-sm sm:max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-3">
        {/* HEADER */}
        {/* <div className="mb-2">
          <p className="text-[11px] uppercase tracking-wide text-sky-300">
            Skill Selected Number : {selectedActivity}
          </p>

          {loadingSkill ? (
            <p className="text-xs text-slate-400">Loading skill...</p>
          ) : (
            <p className="text-sm text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
              Skill Selected Name : {skillDesc || "No skill description"}
            </p>
          )}

          {loadingSkill ? (
            <p className="text-xs text-slate-400">Loading skill...</p>
          ) : (
            <p className="text-sm text-sky-300 text-[11px] uppercase tracking-wide font-medium break-words break-all whitespace-normal overflow-hidden leading-relaxed">
              Skill Target : {skillDesc || "No skill description"}
            </p>
          )}
        </div> */}

        {/* HEADER - FIXED */}
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-wide text-sky-300">
            Skill Selected Number : {selectedActivity}
          </p>

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

        {/* SCORE ENTRY */}
        <Input
          value={value}
          onChange={handleInputChange}
          className="text-center text-lg text-black font-semibold bg-slate-200"
        />

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
          <button
            onClick={handleClear}
            className="h-9 bg-red-500 text-black rounded hover:bg-slate-400 active:scale-95 transition-all"
          >
            clear
          </button>
          <button
            onClick={() => handleDigit("0")}
            className="h-9 bg-white text-black rounded hover:bg-gray-100 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-9 bg-red-300 text-black rounded hover:bg-slate-400 active:scale-95 transition-all"
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
              Activity #{selectedActivity} updated with score <b>{Math.abs(value)}</b>
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
