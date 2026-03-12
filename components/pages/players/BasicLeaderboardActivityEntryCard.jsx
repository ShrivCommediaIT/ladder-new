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
  const [selectedActivity, setSelectedActivity] = useState(initialActivity || 1);
  const [value, setValue] = useState("0");
  const [witnessBy, setWitnessBy] = useState("");
  const [skillSign, setSkillSign] = useState("+");
  const [skillDesc, setSkillDesc] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [skillTarget, setSkillTarget] = useState("");
  const [openZeroAlert, setOpenZeroAlert] = useState(false);

  useEffect(() => {
    if (initialActivity) {
      setSelectedActivity(initialActivity);
      setValue("0");
    }
  }, [initialActivity]);

  useEffect(() => {
    if (!selectedActivity || !ladderId) return;

    const fetchSkill = async () => {
      try {
        setLoadingSkill(true);
        const res = await axios.get(
          "https://ne-games.com/leaderBoard/api/user/getskillBynumber",
          {
            params: { ladder_id: ladderId, skill_number: selectedActivity },
            headers: { APPKEY },
          }
        );

        const data = res.data?.data || {};
        setSkillDesc(data.skill_description || "");
        setSkillTarget(data.target || "No target");
        setSkillSign(data.skill_sign === "-" ? "-" : "+");
        setValue("0");
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
    setValue((prev) => (prev === "0" ? d : prev + d));
  };

  const handleBackspace = () => {
    setValue((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  };

  const handleClear = () => setValue("0");

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) setValue(val || "0");
  };

  /* ---------------- SAVE LOGIC ---------------- */
  const handleEnter = useCallback(async () => {
    if (!skillActivityId || !playerId) return;

    const num = Math.abs(Number(value) || 0);
    if (num === 0) {
      setOpenZeroAlert(true);
      return;
    }

    try {
      setSaving(true);
      const finalScore = skillSign === "-" ? -num : num;

      // 100% string ensure karne ke liye fallback
      const witnessValue = witnessBy && witnessBy.trim() !== "" && witnessBy.trim() 

      // PHP/Laravel Backend ke liye URLSearchParams sabse stable hota hai
      const params = new URLSearchParams();
      params.append("user_id", String(playerId));
      params.append("skill_activity_id", String(skillActivityId));
      params.append("score", String(finalScore));
      params.append("witness_by", witnessValue);


      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/postResultSkillboard",
        params,
        {
          headers: {
            APPKEY: APPKEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      setOpenSuccess(true);
    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      alert("Failed to save: " + (err.response?.data?.message || "Error"));
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
        <div className="mb-2">
          <p className="text-[11px] uppercase tracking-wide text-sky-300">
            Skill Selected Number : {selectedActivity}
          </p>
          {loadingSkill ? (
            <p className="text-xs text-slate-400">Loading skill...</p>
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
                  ? "bg-sky-400 text-black border-white scale-110 shadow-md" 
                  : "bg-slate-800 border-slate-600 hover:bg-slate-700"}`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
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

        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(String(d))}
              className="h-9 bg-white text-black rounded hover:bg-gray-100 active:scale-95 transition-all font-bold"
            >
              {d}
            </button>
          ))}
          <button onClick={handleClear} className="h-9 bg-red-500 text-white rounded font-bold uppercase text-[10px]">Clear</button>
          <button onClick={() => handleDigit("0")} className="h-9 bg-white text-black rounded font-bold">0</button>
          <button onClick={handleBackspace} className="h-9 bg-orange-400 text-white rounded font-bold">⌫</button>
        </div>

        <Button
          disabled={saving}
          onClick={handleEnter}
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
              Recorded score: <b>{value}</b> <br/>
              Witness: <b>{witnessBy }</b>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose} className="bg-emerald-500 text-black font-bold mt-4">OK</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={openZeroAlert} onOpenChange={setOpenZeroAlert}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-xl font-bold">Invalid Score</DialogTitle>
            <DialogDescription className="text-lg">Zero score is not allowed</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setOpenZeroAlert(false)} className="bg-red-500 text-white mt-4 font-bold">OK</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}