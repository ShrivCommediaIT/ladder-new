"use client";

import { useEffect, useState } from "react";
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
        alert("Ladder ID missing");
        return;
      }

      const minusWithoutTarget = rows.find(
        (row) =>
          row.mode === "minus" &&
          String(row.description || "").trim() !== "" &&
          String(row.target || "").trim() === "",
      );

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
            skill_sign: rows.mode,
            target: targetNum,
            unit: String(row.unit || "").trim(),
          };
        });

      if (skills.length === 0) {
        alert("Please add at least one skill");
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
      alert(
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
              Skills/Performance Set Up
            </h2>
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/50 hover:bg-red-600/60 text-lg font-bold cursor-pointer flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") && (<div className="max-h-[20vh] sm:max-h-[20vh] md:max-h-[20vh] overflow-y-auto">
            <div className=" bg-gray-100 ">
              <div className="text-gray-950 text-[11px] mb-2 text-justify sm:text-[14px] md:text-[14px] px-3 sm:px-4 md:px-6 leading-relaxed">
                <div className="w-full flex items-center justify-center gap-3 py-2">
                  <div className="flex-1 h-[3px] bg-red-600"></div>

                  <p className="text-red-600 font-semibold whitespace-nowrap">
                    VERY IMPORTANT
                  </p>

                  <div className="flex-1 h-[3px] bg-red-600"></div>
                </div>

                <p>
                  NEGTIVE ACTIVITIES (the lower score the better) - it is
                  IMPERATIVE that you set a target score because the uploaded
                  scores are turned into points relative to a target score.
                  Without a target, the rankings will be incorrect.
                </p>
              </div>
            </div>

            <div className="px-1">
              <p className="text-[11px] sm:text-xs md:text-sm px-3 sm:px-4 md:px-6 text-gray-300 leading-relaxed">
                Type in your skill test description - for example :
                <span className="block mt-1">
                  "How many times can you head the ball?" or "What is your best
                  time for the 1000m?"
                </span>
              </p>

              <p className="text-gray-300 text-[11px] sm:text-xs md:text-sm px-3 sm:px-4 md:px-6 mt-2 leading-relaxed">
                Remember to select{" "}
                <span className="text-green-300 font-medium">"Plus"</span> or{" "}
                <span className="text-red-300 font-medium">"Minus"</span>
                <br className="hidden sm:block" />
                Select{" "}
                <span className="text-green-300 font-medium">"Plus"</span>{" "}
                <br />
                if the bigger number = higher rank.
                <br className="hidden sm:block" />
                Select <span className="text-red-300 font-medium">
                  "Minus"
                </span>{" "}
                <br />
                if the smaller number = higher rank.
              </p>
            </div>

            <div className="mt-2 bg-yellow-100 p-2 rounded">
              <p className="text-gray-950 text-[11px] sm:text-xs md:text-sm px-3 sm:px-4 md:px-6 leading-relaxed">
                <span className="text-teal-900 font-semibold">TARGET - </span>
                Setting a target is optional. However, you can set up a target
                for each activity as a{" "}
                <span className="text-teal-900 font-semibold">
                  GOAL
                </span> for{" "}
                <span className="text-teal-900 font-semibold">PASS</span> or
                even have a{" "}
                <span className="text-teal-900 font-semibold">
                  TARGET RACE -{" "}
                </span>{" "}
                first to reach all targets! When a target is reached, the square
                goes green - so girst to turn all their squares green!
              </p>

              <p className="text-gray-950 text-justify text-[11px] mt-1 sm:text-xs md:text-sm px-3 sm:px-4 md:px-6 leading-relaxed">
                <span className="text-slate-900 font-semibold">
                  IMPORTANT NOTE - for negatives skills where the lower the
                  score the better.{" "}
                </span>{" "}
                <br />
                You <span className="text-slate-900 font-semibold">
                  MUST
                </span>{" "}
                select a target as negatives scores are turned into points to go
                towards to the total scores for accurate ranking. The system
                will not let you set a negative skill without first setting a
                target. It is suggested that you choose a target close to a
                “best performance” but achievable for that skill/performance.
              </p>
            </div>
          </div>)}

          {loading && (
            <p className="text-center text-white text-sm py-3">
              Loading skills...
            </p>
          )}

          {/* FIXED: Single line header with proper alignment */}
          <div className="sm:px-2 px-8 py-1  border-b border-white/10">
            <div className="flex items-end gap-2 text-white text-xs font-medium ">
              {(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") ? <div className="w-20 flex items-center">Skill No.</div> : null}
              <div className="w-[120px]">Target</div>
              <div className="w-[200px]">{(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") ? "Skill Name" : "Activity"}</div>
              {(type !== "negative" && ladderType !== "negative") && <div className="w-[120px] translate">Units Of Measurement</div>}
            </div>
          </div>

          <div className="max-h-[25vh] overflow-y-auto py-2 space-y-1.5">
            {(type !== "positive" && type !== "negative" && ladderType !== "positive" && ladderType !== "negative") ?
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
                      <Label
                        className={`px-2 py-1 cursor-pointer rounded text-xs leading-4 ${row.mode === "plus"
                            ? "bg-green-400 text-black font-bold"
                            : "bg-[#101c29] text-white"
                          }`}
                      >
                        <RadioGroupItem value="plus" className="hidden" />+
                      </Label>
                      <Label
                        className={`px-2 py-1 cursor-pointer rounded text-xs leading-4 ${row.mode === "minus"
                            ? "bg-red-400 text-black font-bold"
                            : "bg-[#101c29] text-white"
                          }`}
                      >
                        <RadioGroupItem value="minus" className="hidden" />−
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="flex gap-2 w-[250px] items-start flex-1">
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
              <div className="flex items-start p-3">
                {/* Skill No. + +/- */}
                <div className="flex gap-2 w-[250px] items-start flex-1">
                  <Textarea
                    rows={1}
                    placeholder="Target"
                    value={rows[0].target !== "" ? rows[0].target : ""}  // ✅ raw string
                    onChange={(e) => {
                      const val = e.target.value;
                      // ✅ max 2 digits after decimal
                      if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                        updateRow(1, { target: val });
                      }
                    }}
                    className="bg-white text-black text-xs rounded-md border border-slate-400 w-[100px] h-10 p-2 resize-none leading-tight"
                  />

                  <Textarea
                    rows={1}
                    placeholder={`Skill 1 description`}
                    value={String(rows[0].description || "")}
                    onChange={(e) =>
                      updateRow(1, { description: e.target.value })
                    }
                    className="bg-white text-black text-xs w-[300px] rounded-md border border-slate-400 p-2 resize-none leading-tight"
                  />

                  {(type !== "negative" && ladderType !== "negative") && (
                    <Textarea
                      rows={1}
                      placeholder="Unit"
                      value={rows[0].unit}
                      onChange={(e) =>
                        updateRow(1, { unit: e.target.value })
                      }
                      className="bg-white text-black text-xs rounded-md border border-slate-400 w-[200px] h-10 p-2 resize-none leading-tight"
                    />)}
                </div>
              </div>
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
                {saving ? "Saving..." : "Update Skills"}
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
