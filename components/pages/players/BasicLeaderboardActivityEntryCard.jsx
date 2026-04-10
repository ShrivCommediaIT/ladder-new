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
import { toast } from "react-toastify";
import { updateLadderToken } from "@/helper/helperApi";


const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";
const activityNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BasicLeaderboardActivityEntryCard({
  ladderId,
  playerId,
  skillActivityId,
  initialActivity,
  onClose,
  playerName
}) {
  const [selectedActivity, setSelectedActivity] = useState(initialActivity || 1);
  const [value, setValue] = useState("0");
  const [witnessBy, setWitnessBy] = useState("");
  const [skillSign, setSkillSign] = useState("+");
  const [skillDesc, setSkillDesc] = useState("");
  const [loadingSkill, setLoadingSkill] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openSuccessResult, setOpenSuccessResult] = useState(false);
  const [topScore, setTopScore] = useState(0);
  const [skillTarget, setSkillTarget] = useState("");
  const [openZeroAlert, setOpenZeroAlert] = useState(false);
  const [zeroAction, setZeroAction] = useState(null);
  // "ok" | "reset" | null
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


  /* ---------------- SAVE LOGIC ---------------- */
  const submitScore = async (finalScore, bestScore) => {

    try {
      setSaving(true);

      const witnessValue =
        witnessBy && witnessBy.trim() !== "" ? witnessBy.trim() : "";

      const params = new URLSearchParams();
      params.append("user_id", String(playerId));
      params.append("skill_activity_id", String(skillActivityId));
      params.append("score", String(finalScore));
      params.append("witness_by", witnessValue);
      
      if (bestScore) {
        params.append("best_result", bestScore);
      }

      const skillsPost = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/postResultSkillboard",
        params,
        {
          headers: {
            APPKEY: APPKEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (skillsPost.status == 200) {
        setOpenSuccess(true);

        toast.success("Result posted successfully! ");
        updateLadderToken({
          user_id: playerName,
          ladder_id: ladderId,
          ladder_type: "skill",
        })
      } else {
        toast.error("Failed to post result. Please try again.");
      }


    } catch (err) {
      console.error("Error Detail:", err.response?.data || err);
      alert("Failed to save: " + (err.response?.data?.message || "Error"));
    } finally {
      setSaving(false);
    }
  };

  const handleEnter = useCallback(async () => {
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

    const finalScore = skillSign === "-" ? -num : num;
    submitScore(finalScore, topScore);

  }, [skillActivityId, playerId, value, skillSign, topScore]);

  const handleZeroConfirm = (type) => {
    setOpenZeroAlert(false);

    if (type === "ok") {
      submitScore(0);
    } else if (type === "reset") {
      setValue("-")
      submitScore("-");
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

  const getBestScore = async () => {
    if (value == 0 || value == "-"){
      handleEnter() 
      return
    } 
    const bestScore = await axios.get(
      `https://ne-games.com/leaderBoard/api/user/getTopScore?user_id=${String(playerId)}&skill_activity_id=${String(skillActivityId)}&score=${String(value)}`,
      {
        headers: {
          APPKEY: APPKEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (bestScore.status == 200) {
      setTopScore(bestScore.data.data[0].top_score)
      setOpenSuccessResult(true)
    }
  }

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

          {/* Last row */}
          <button
            onClick={handleClear}
            className="h-9 bg-red-500 text-white rounded font-bold uppercase text-[10px]"
          >
            Clear
          </button>

          {/* Split 0 into two buttons */}
          <div className="grid grid-cols-2 gap-2">
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
          </div>

          <button
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