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
import { FaTrash } from "react-icons/fa6";
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
    <div className="flex items-center justify-center gap-[2px] bg-background text-foreground font-semibold text-md border border-input rounded-md w-[80px] sm:w-[100px] h-15 px-1 outline-none focus-within:ring-2 focus-within:ring-primary">
      <input className={`w-5 sm:w-6 text-center outline-none bg-transparent p-0 ${activeField === "min" ? "text-primary" : ""}`} value={m} onChange={(e) => handleChange("m", e)} onFocus={() => setActiveField("min")} onBlur={handleBlur} placeholder="00" />
      <span className="pb-[2px]">:</span>
      <input className={`w-5 sm:w-6 text-center outline-none bg-transparent p-0 ${activeField === "sec" ? "text-primary" : ""}`} value={s} onChange={(e) => handleChange("s", e)} onFocus={() => setActiveField("sec")} onBlur={handleBlur} placeholder="00" />
      <span className="pb-[2px]">.</span>
      <input className={`w-5 sm:w-6 text-center outline-none bg-transparent p-0 ${activeField === "ms" ? "text-primary" : ""}`} value={ms} onChange={(e) => handleChange("ms", e)} onFocus={() => setActiveField("ms")} onBlur={handleBlur} placeholder="00" />
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
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowIdToDelete, setRowIdToDelete] = useState(null);

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

  const fetchSkillSetup = async () => {
    if (!ladderId) return;
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
              dbId: found.id,
              description: String(found.skill_description || ""),
              target: String(found.target || ""),
              unit: String(found.unit || ""),
              mode: found.skill_sign === "-" ? "minus" : "plus",
            }
            : {
              ...row,
              dbId: undefined,
              description: "",
              target: "",
              unit: "",
              mode: "plus",
            };
        }),
      );
    } catch (error) {
      console.error("Failed to fetch skill setup", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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



      const skills = rows
        .filter((row) => String(row.description || "").trim() !== "")
        .map((row) => {
          const targetStr = String(row.target || "").trim();
          let finalTarget = "";

          if (targetStr !== "" && targetStr !== "0" && targetStr !== "0.00" && targetStr !== "0.0") {
            const targetNum = Number(targetStr);
            if (!isNaN(targetNum)) {
              finalTarget = row.mode === "minus" ? -Math.abs(targetNum) : Math.abs(targetNum);
            } else {
              finalTarget = targetStr;
            }
          }

          return {
            skill_number: row.id,
            skill_description: String(row.description || "").trim(),
            skill_sign: row.mode,
            target: finalTarget,
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


  const handleDelete = async (rowId) => {
    const rowObj = rows.find((r) => r.id === rowId);
    if (!rowObj) return;

    const resetRow = () => {
      setRows((prevRows) =>
        prevRows.map((r) =>
          r.id === rowId
            ? { id: r.id, description: "", target: "", mode: "plus", unit: "", dbId: undefined }
            : r
        )
      );
    };

    if (rowObj.dbId) {
      setDeletingId(rowId);
      try {
        await getRequest(API_ENDPOINTS.DELETE_SKILL_SETUP, { activity_id: rowObj.dbId });
        resetRow();
        toast.success("Skill setup deleted successfully");
        onSkillsUpdated();
        onClose();
      } catch (err) {
        toast.error(
          "Failed to delete skill setup: " +
          (err?.response?.data?.message || err.message),
        );
      } finally {
        setDeletingId(null);
      }
    } else {
      resetRow();
      toast.success("Row cleared");
    }
  };

  const handleDeleteClick = (rowId) => {
    setRowIdToDelete(rowId);
    setDeleteConfirmOpen(true);
  };



  return (
    <>
        <Card className="w-full max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-card border border-border rounded-xl overflow-hidden shadow-xl text-card-foreground p-0 transition-all duration-300">
          <div className="bg-muted text-foreground py-3 border-b border-border relative">
            <h2 className="text-md font-semibold text-center">
              {type === "skill" ? "Skills/Performance Set Up" : type === "negative" ? "Set Up" : "LeaderBoard Set Up"}
            </h2>
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600/55 hover:bg-red-600/70 text-white text-lg font-bold cursor-pointer flex items-center justify-center transition-all duration-200"
            >
              ×
            </button>
          </div>

          {loading && (
            <p className="text-center text-muted-foreground text-sm py-3">
              Loading skills...
            </p>
          )}

          {/* Responsive scrollable table container */}
          <div className="w-full overflow-x-auto custom-scroll">
            <div className="min-w-[760px] md:min-w-full">
              {/* FIXED: Single line header with proper alignment */}
              <div className="flex items-center gap-3 py-2.5 px-4 border-b border-border text-foreground text-xs font-semibold uppercase tracking-wider bg-muted/30">
                <div className="w-16 text-center shrink-0">No.</div>
                <div className="w-28 shrink-0">
                  <div>Target</div>
                  <div className="text-[9px] text-muted-foreground font-normal normal-case leading-none">(Optional)</div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  {(type !== "positive" && type !== "negative") ? "Skill Name" : "Activity"}
                </div>
                {(type !== "negative") && (
                  <div className="w-40 shrink-0">Units Of Measurement</div>
                )}
                <div className="w-10 shrink-0"></div> {/* Space for delete button */}
              </div>

              {/* Rows List */}
              <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto py-1 divide-y divide-border/40 custom-scroll">
                {(type !== "negative") ?
                  rows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3 py-2 px-4 hover:bg-muted/10 transition-colors">
                      {/* Column 1: No. */}
                      <div className="w-16 shrink-0 flex justify-center">
                        <div className="bg-primary/10 text-primary border border-primary/20 font-bold rounded-md text-sm w-8 h-8 flex items-center justify-center">
                          {row.id}
                        </div>
                      </div>

                      {/* Column 2: Target */}
                      <div className="w-28 shrink-0">
                        {(type === "negative" || ladderType === "negative") ? (
                          <TargetTimerInput
                            value={row.target}
                            onChange={(val) => updateRow(row.id, { target: val })}
                          />
                        ) : (
                          <Textarea
                            rows={1}
                            placeholder="Target"
                            value={row.target !== "" ? row.target : ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                updateRow(row.id, { target: val });
                              }
                            }}
                            className="bg-background text-foreground text-xs rounded-md border border-input w-full h-10 p-2 resize-none leading-tight focus-visible:ring-1 focus-visible:ring-primary"
                          />
                        )}
                      </div>

                      {/* Column 3: Description */}
                      <div className="flex-1 min-w-[200px]">
                        <Textarea
                          rows={1}
                          placeholder={`Skill ${row.id} description`}
                          value={String(row.description || "")}
                          onChange={(e) =>
                            updateRow(row.id, { description: e.target.value })
                          }
                          className="bg-background text-foreground text-xs w-full rounded-md border border-input p-2 resize-none leading-tight focus-visible:ring-1 focus-visible:ring-primary h-10"
                        />
                      </div>

                      {/* Column 4: Unit */}
                      <div className="w-40 shrink-0">
                        <Textarea
                          rows={1}
                          placeholder="Unit"
                          value={row.unit}
                          onChange={(e) =>
                            updateRow(row.id, { unit: e.target.value })
                          }
                          className="bg-background text-foreground text-xs rounded-md border border-input w-full h-10 p-2 resize-none leading-tight focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>

                      {/* Column 5: Action */}
                      <div className="w-10 shrink-0 flex justify-center">
                        {Boolean(row.dbId) ? (
                          <button
                            className="flex items-center justify-center rounded-full text-red-500 hover:scale-105 hover:bg-red-500/10 cursor-pointer focus:outline-none transition-all duration-200 w-8 h-8 bg-muted border border-border"
                            title="Delete Activity"
                            onClick={() => handleDeleteClick(row.id)}
                            disabled={deletingId === row.id}
                          >
                            {deletingId === row.id ? (
                              <span className="animate-spin text-sm text-red-500">⌛</span>
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    </div>
                  )) :
                  rows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3 py-2 px-4 hover:bg-muted/10 transition-colors">
                      {/* Column 1: No. */}
                      <div className="w-16 shrink-0 flex justify-center">
                        <div className="bg-primary/10 text-primary border border-primary/20 font-bold rounded-md text-sm w-8 h-8 flex items-center justify-center">
                          {row.id}
                        </div>
                      </div>

                      {/* Column 2: Target */}
                      <div className="w-28 shrink-0">
                        <TargetTimerInput
                          value={row.target}
                          onChange={(val) => updateRow(row.id, { target: val })}
                        />
                      </div>

                      {/* Column 3: Description */}
                      <div className="flex-1 min-w-[200px]">
                        <Textarea
                          rows={1}
                          placeholder={`Activity ${row.id} description`}
                          value={String(row.description || "")}
                          onChange={(e) =>
                            updateRow(row.id, { description: e.target.value })
                          }
                          className="bg-background text-foreground text-xs w-full rounded-md border border-input p-2 resize-none leading-tight focus-visible:ring-1 focus-visible:ring-primary h-10"
                        />
                      </div>

                      {/* Column 4: Action */}
                      <div className="w-10 shrink-0 flex justify-center">
                        {Boolean(row.dbId) ? (
                          <button
                            className="flex items-center justify-center rounded-full text-red-500 hover:scale-105 hover:bg-red-500/10 cursor-pointer focus:outline-none transition-all duration-200 w-8 h-8 bg-muted border border-border"
                            title="Delete Activity"
                            onClick={() => handleDeleteClick(row.id)}
                            disabled={deletingId === row.id}
                          >
                            {deletingId === row.id ? (
                              <span className="animate-spin text-sm text-red-500">⌛</span>
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          <div className="bg-muted flex justify-between items-center w-full px-8 py-3 border-t border-border">
            <div className="flex items-center mx-4">
              <BasicLeaderboardPrintSkillsSheet
                skills={safeSkillsForPrint}
                ladderId={ladderId}
              />
            </div> 
            <div className="flex gap-4">
              <Button
                size="sm"
                disabled={saving}
                onClick={handleSetUpSkills}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-xs cursor-pointer"
              >
                {saving ? "Saving..." : (type === "skill") ? "Update Skills" : "Update"}
              </Button>
            </div>
          </div>

        </Card>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm bg-card border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <TriangleAlert className="w-6 h-6" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this activity/skill setup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setRowIdToDelete(null);
              }}
              className="bg-transparent border border-input text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (rowIdToDelete) {
                  handleDelete(rowIdToDelete);
                }
                setDeleteConfirmOpen(false);
                setRowIdToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
