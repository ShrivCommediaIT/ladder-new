"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BasicLeaderboardPrintSkillsSheet from "./BasicLeaderboardPrintSkillsSheet";
import { Printer, CheckCircle, TriangleAlert } from "lucide-react";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
const initialRows = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  description: "",
  target: "",
  mode: "plus",
  unit: "",
}));

const TargetTimerInput = ({ value, onChange }) => {
  const extract = (val) => {
    if (val === "" || val === null || val === undefined) return { m: "00", s: "00", ms: "00" };
    const num = Math.abs(Number(val));
    if (isNaN(num)) return { m: "00", s: "00", ms: "00" };

    const totalSeconds = Math.floor(num);
    const mPart = Math.floor(totalSeconds / 60);
    const sPart = totalSeconds % 60;
    
    const parts = String(num).split(".");
    let msPart = "00";
    if (parts.length > 1) {
      msPart = parts[1].padEnd(2, "0").substring(0, 2);
    }
    
    return {
      m: String(mPart).padStart(2, "0"),
      s: String(sPart).padStart(2, "0"),
      ms: msPart,
    };
  };

  const { m, s, ms } = extract(value);
  const [activeField, setActiveField] = useState("min");

  const emitChange = (newM, newS, newMs) => {
    const mins = parseInt(newM || "0", 10);
    const secs = parseInt(newS || "0", 10);
    const msecs = parseInt(newMs || "0", 10);
    const totalSecsStr = (mins * 60 + secs) + "." + String(msecs).padStart(2, "0");
    onChange(totalSecsStr);
  };

  const handleChange = (field, event) => {
    let val = event.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(-2);
    let nm = m, ns = s, nms = ms;
    if (field === 'm') { nm = val; setActiveField("min"); }
    if (field === 's') { ns = val; setActiveField("sec"); }
    if (field === 'ms') { nms = val; setActiveField("ms"); }
    emitChange(nm, ns, nms);
  };

  const handleBlur = () => {
    emitChange(m, s, ms);
  };
  return (
    <div className="flex items-center justify-center gap-[2px] bg-white text-black font-semibold text-md border border-slate-400 rounded-md w-[80px] sm:w-[100px] h-15 px-1 outline-none focus-within:ring-2 focus-within:ring-sky-500">
      <input className={`w-5 sm:w-6 text-center outline-none bg-transparent p-0 ${activeField === "min" ? "text-sky-600" : ""}`} value={m} onChange={(e) => handleChange("m", e)} onFocus={() => setActiveField("min")} onBlur={handleBlur} placeholder="00" />
      <span className="pb-[2px]">:</span>
      <input className={`w-5 sm:w-6 text-center outline-none bg-transparent p-0 ${activeField === "sec" ? "text-sky-600" : ""}`} value={s} onChange={(e) => handleChange("s", e)} onFocus={() => setActiveField("sec")} onBlur={handleBlur} placeholder="00" />
      <span className="pb-[2px]">.</span>
      <input className={`w-5 sm:w-6 text-center outline-none bg-transparent p-0 ${activeField === "ms" ? "text-sky-600" : ""}`} value={ms} onChange={(e) => handleChange("ms", e)} onFocus={() => setActiveField("ms")} onBlur={handleBlur} placeholder="00" />
    </div>
  );
};

export default function BasicLeaderboardSetUpSkill({
  onClose = () => { },
  onSkillsUpdated = () => { },
}) {

  const [rows, setRows] = useState(initialRows);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openValidation, setOpenValidation] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [targetValidation, setTargetValidation] = useState("");

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const type = searchParams.get("type");
  const ladderType = searchParams.get("ladder_type");

  const handlePrintSkills = () => {
    const printTrigger = document.getElementById("print-trigger");
    if (printTrigger) {
      printTrigger.click();
    }
  };

  useEffect(() => {
    if (!ladderId) return;

    const fetchSkillSetup = async () => {
      try {
        setLoading(true);
        const res = await getRequest(API_ENDPOINTS.GET_SKILL_SETUP, { ladder_id: ladderId });

        const apiSkills = res?.data || [];

        setRows((prevRows) =>
          prevRows.map((row) => {
            const found = apiSkills.find(
              (s) => Number(s.skill_number) === row.id,
            );
            return found
              ? {
                ...row,
                description: String(found.skill_description || ""),
                target: String(found.target || ""),
                unit: String(found.unit || ""),
                mode: found.skill_sign === "-" ? "minus" : "plus",
              }
              : row;
          }),
        );
      } catch (error) {
        console.error("Failed to fetch skill setup", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillSetup();
  }, [ladderId]);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleSetUpSkills = async () => {
    try {
      if (!ladderId) {
        toast.error("Ladder ID missing");
        return;
      }

      const minusWithoutTarget = (type !== "negative" && ladderType !== "negative") ? rows.find(
        (row) =>
          row.mode === "minus" &&
          String(row.description || "").trim() !== "" &&
          String(row.target || "").trim() === "",
      ) : null;

      if (minusWithoutTarget) {
        setValidationMessage(
          `Target is required for negative skill in Skill No. ${minusWithoutTarget.id}`,
        );
        setTargetValidation(true);
        return;
      }

      const skills = rows
        .filter((row) => String(row.description || "").trim() !== "")
        .map((row) => {
          const targetStr = String(row.target || "").trim();
          let targetNum = targetStr ? Number(targetStr) : null;

          if (targetNum !== null && !isNaN(targetNum)) {
            targetNum =
              row.mode === "minus" ? -Math.abs(targetNum) : Math.abs(targetNum);
          }

          return {
            skill_number: row.id,
            skill_description: String(row.description || "").trim(),
            skill_sign: row.mode,
            target: targetNum !== null && !isNaN(targetNum) ? targetNum : targetStr,
            unit: String(row.unit || "").trim(),
          };
        });

      if (skills.length === 0) {
        toast.error("Please add at least one skill");
        return;
      }

      setSaving(true);

      await postRequest(API_ENDPOINTS.SKILL_SETUP, { ladder_id: Number(ladderId), skills });

      setOpenSuccess(true);
      if (onSkillsUpdated) {
        onSkillsUpdated();
      }
    } catch (error) {
      console.error("Skill update failed:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to save skills. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const safeSkillsForPrint = rows.map((row) => ({
    id: row.id,
    description: String(row.description || ""),
    target: String(row.target || ""),
    unit: String(row.unit || ""),
    mode: row.mode,
  }));

  return (
    <>
      <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-[350px] sm:max-w-[600px] sm:w-xl bg-[#0f2433] border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-[#14283a] text-white py-3 border-b border-white/20 relative">
            <h2 className="text-md font-semibold text-center">
              {type === "skill" ? "Skills/Performance Set Up" : type === "negative" ? "Set Up" : "LeaderBoard Set Up"}
            </h2>
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/50 hover:bg-red-600/60 text-lg font-bold cursor-pointer flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {loading && (
            <p className="text-center text-white text-sm py-3">
              Loading skills...
            </p>
          )}

          {/* FIXED: Single line header with proper alignment */}
          <div className="sm:px-2 px-8 py-1  border-b border-white/10">
            <div className="flex items-end gap-2 text-white text-xs font-medium ">
              {(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") ? <div className="w-20 flex items-center">Skill No.</div> : (type === "negative" || ladderType === "negative") ? <div className="w-20 flex items-center">Activity No.</div> : null}
              <div className="w-[120px]">Target</div>
              <div className="w-[200px]">{(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") ? "Skill Name" : "Activity"}</div>
              {(type !== "negative" && ladderType !== "negative") && <div className="w-[120px] translate">Units Of Measurement</div>}
            </div>
          </div>

          <div className="max-h-[25vh] overflow-y-auto py-2 space-y-1.5">
            {(type !== "negative" && ladderType !== "negative") ?
              rows.map((row) => (
                <div key={row.id} className="flex items-start ">
                  {/* Skill No. + +/- */}
                  <div className="flex flex-col w-20 pt-1">
                    <div className="bg-white text-black font-bold rounded-md text-sm w-8 h-8 flex items-center justify-center mx-auto mb-2">
                      {row.id}
                    </div>
                    <RadioGroup
                      value={row.mode}
                      // onValueChange={(val) => updateRow(row.id, { mode: val })}
                      onValueChange={(val) => {
                        let newTarget = row.target;

                        if (newTarget !== "" && !isNaN(newTarget)) {
                          const num = Math.abs(Number(newTarget));
                          newTarget = val === "minus" ? -num : num;
                        }

                        updateRow(row.id, { mode: val, target: newTarget });
                      }}
                      className="flex gap-1 justify-center"
                    >
                    </RadioGroup>
                  </div>

                  <div className="flex gap-2 w-[250px] items-start flex-1">
                    {(type === "negative" || ladderType === "negative") ? (
                      <TargetTimerInput
                        value={row.target}
                        onChange={(val) => updateRow(row.id, { target: val })}
                      />
                    ) : (
                      <Textarea
                        rows={1}
                        placeholder="Target"
                        value={row.target !== "" ? row.target : ""}  // ✅ raw string, no Math.abs/Number
                        onChange={(e) => {
                          const val = e.target.value;
                          // ✅ max 2 digits after decimal
                          if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                            updateRow(row.id, { target: val });
                          }
                        }}
                        className="bg-white text-black text-xs rounded-md border border-slate-400 w-[100px] h-10 p-2 resize-none leading-tight"
                      />
                    )}

                    <Textarea
                      rows={1}
                      placeholder={`Skill ${row.id} description`}
                      value={String(row.description || "")}
                      onChange={(e) =>
                        updateRow(row.id, { description: e.target.value })
                      }
                      className="bg-white text-black text-xs w-[300px] rounded-md border border-slate-400 p-2 resize-none leading-tight"
                    />

                    <Textarea
                      rows={1}
                      placeholder="Unit"
                      value={row.unit}
                      onChange={(e) =>
                        updateRow(row.id, { unit: e.target.value })
                      }
                      className="bg-white text-black text-xs rounded-md border border-slate-400 w-[200px] h-10 p-2 resize-none leading-tight"
                    />
                  </div>
                </div>
              )) :
              rows.map((row) => (
                <div key={row.id} className="flex items-start p-3">
                  {/* Activity No. */}
                  <div className="flex flex-col w-20 pt-1">
                    <div className="bg-white text-black font-bold rounded-md text-sm w-8 h-8 flex items-center justify-center mx-auto mb-2">
                      {row.id}
                    </div>
                  </div>

                  {/* Activity fields */}
                  <div className="flex gap-2 w-[250px] items-start flex-1">
                    <TargetTimerInput
                      value={row.target}
                      onChange={(val) => updateRow(row.id, { target: val })}
                    />

                    <Textarea
                      rows={1}
                      placeholder={`Activity ${row.id} description`}
                      value={String(row.description || "")}
                      onChange={(e) =>
                        updateRow(row.id, { description: e.target.value })
                      }
                      className="bg-white text-black text-xs w-[300px] rounded-md border border-slate-400 p-2 resize-none leading-tight"
                    />

                    {(type !== "negative" && ladderType !== "negative") && (
                      <Textarea
                        rows={1}
                        placeholder="Unit"
                        value={row.unit}
                        onChange={(e) =>
                          updateRow(row.id, { unit: e.target.value })
                        }
                        className="bg-white text-black text-xs rounded-md border border-slate-400 w-[200px] h-10 p-2 resize-none leading-tight"
                      />)}
                  </div>
                </div>
              ))
            }
          </div>

          <div className={`bg-[#14283a] flex ${type === "positive" ||
                  type === "negative" ||
                  ladderType === "positive" ||
                  ladderType === "negative"?"justify-end" : "justify-between"}   items-center w-full px-8 py-3 border-t border-white/20`}>
            {(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") ?
              <div className="flex items-center justify-end mx-4">
                <BasicLeaderboardPrintSkillsSheet
                  skills={safeSkillsForPrint}
                  ladderId={ladderId}
                  className="hidden"
                />
              </div> : null}
            <div className="flex justify-center gap-4">
              <Button
                size="sm"
                disabled={saving}
                onClick={handleSetUpSkills}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-xs cursor-pointer"
              >
                {saving ? "Saving..." :  (type === "skill") ? "Update Skills" : "Update"}
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <Dialog open={openValidation} onOpenChange={setOpenValidation}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 rotate-45" />{" "}
              {/* just to show warning */}
              Validation Error
            </DialogTitle>
            <DialogDescription>{validationMessage}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" onClick={() => setOpenValidation(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* target validation */}
      <Dialog open={targetValidation} onOpenChange={setTargetValidation}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2 text-md">
              <TriangleAlert className="w-6 h-6" /> {/* just to show warning */}
              Target is required for negative skills
            </DialogTitle>
            <DialogDescription>{validationMessage}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2 w-full">
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white w-full cursor-pointer "
              onClick={() => setTargetValidation(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-emerald-500 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Skills updated successfully
            </DialogTitle>
            <DialogDescription>Skill setup has been saved.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenSuccess(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setOpenSuccess(false);
                onClose();
                if (onSkillsUpdated) {
                  onSkillsUpdated();
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
