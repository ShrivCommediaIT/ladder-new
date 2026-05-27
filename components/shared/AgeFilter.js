import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { calculateAge } from "@/lib/utils";
import { Filter } from "lucide-react";

const AgeFilter = ({ onSearch, user, resetSignal, isActive }) => {
  const [open, setOpen] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [calculatedAge, setCalculatedAge] = useState("");
  const [gender, setGender] = useState("");
  const [ageType, setAgeType] = useState("");

  useEffect(() => {
    if (resetSignal !== undefined) {
      setDobInput("");
      setCalculatedAge("");
      setGender("");
      setAgeType("");
    }
  }, [resetSignal]);

  const handleDobChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = value;
    if (value.length > 2) formatted = value.slice(0, 2) + "/" + value.slice(2);
    if (value.length > 4) formatted = formatted.slice(0, 5) + "/" + value.slice(4);
    setDobInput(formatted);
    setCalculatedAge(calculateAge(formatted));
  };

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCalculatedAge(value);

    if (value && value !== "0") {
      const age = parseInt(value, 10);
      const today = new Date();
      const prevYear = today.getFullYear() - age;
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      setDobInput(`${dd}/${mm}/${prevYear}`);
    } else if (value === "") {
      setDobInput("");
    }
  };

  const applyAgeFilter = () => {
    const ageValue = calculatedAge && calculatedAge !== "0" ? calculatedAge : "";
    const ageTypeValue = ageValue ? ageType : "";
    const genderValue = gender || "";

    if (!ageValue && !genderValue) {
      toast.error("Please select at least one filter before searching.");
      return;
    }

    if (ageValue && !ageType) {
      toast.error("Please select the age type before searching.");
      return;
    }

    onSearch(ageValue || "", ageTypeValue, genderValue);
    setOpen(false);
    toast.success("Searching by Filter!");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setDobInput("");
          setCalculatedAge("");
          setGender("");
          setAgeType("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={`${
            isActive
              ? "border border-emerald-500/45 bg-emerald-500/12 text-[var(--best-board-text)] hover:bg-emerald-500/18"
              : user
                ? "border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface)]"
                : "best-board-card-soft border border-[var(--best-board-border)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface)]"
          } flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 text-[10px] font-bold uppercase leading-tight shadow-none transition-all active:scale-95`}
        >
          <Filter className="h-5 w-5" />
          <span>AGE/
            <br/>
            GENDER</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="best-board-card text-[var(--best-board-text)] border border-[var(--best-board-border)] rounded-xl max-w-sm w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto flex flex-col items-center p-4 gap-0">
        <DialogTitle className="text-xl font-bold uppercase tracking-wide text-center w-full mt-0">
          AGE/GENDER FILTER
        </DialogTitle>
        <div className="w-full flex justify-center mt-1 mb-2">
          <span className="h-1 w-16 bg-[var(--best-board-accent)] rounded-full"></span>
        </div>
        <p className="text-base font-semibold text-[var(--best-board-accent)]">
          Select Gender
        </p>
        
        {/* Gender Filter Tabs */}
        <div className="flex w-full justify-center gap-2 mb-3 mt-1">
          <button
            onClick={() => setGender(gender === "male" ? "" : "male")}
            className={`flex-1 py-1.5 rounded font-semibold transition-all border text-sm ${
              gender === "male"
                ? "border-[var(--best-board-accent)] bg-[var(--best-board-accent)] text-black shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                : "border-[var(--best-board-border)] bg-transparent text-[var(--best-board-muted)] hover:border-[var(--best-board-accent)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender(gender === "female" ? "" : "female")}
            className={`flex-1 py-1.5 rounded font-semibold transition-all border text-sm ${
              gender === "female"
                ? "border-[var(--best-board-accent)] bg-[var(--best-board-accent)] text-black shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                : "border-[var(--best-board-border)] bg-transparent text-[var(--best-board-muted)] hover:border-[var(--best-board-accent)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Female
          </button>
        </div>

        <p className="text-base font-semibold text-[var(--best-board-accent)]">
          Select Age Type
        </p>

        {/* Under/Over Age Filter Tabs */}
        <div className="flex w-full justify-center gap-2 mb-3 mt-1 bg-[var(--best-board-surface-soft)] p-1 rounded-lg">
          <button
            onClick={() => setAgeType(ageType === "under" ? "" : "under")}
            className={`flex-1 py-1.5 rounded-md font-bold text-sm transition-all ${
              ageType === "under"
                ? "bg-[var(--best-board-accent)] text-black shadow-md"
                : "bg-transparent text-[var(--best-board-muted)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Under Age
          </button>
          <button
            onClick={() => setAgeType(ageType === "over" ? "" : "over")}
            className={`flex-1 py-1.5 rounded-md font-bold text-sm transition-all ${
              ageType === "over"
                ? "bg-[var(--best-board-accent)] text-black shadow-md"
                : "bg-transparent text-[var(--best-board-muted)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Over Age
          </button>
        </div>

        <div className="flex flex-col items-center w-full gap-2 relative">
          <span className="font-semibold text-sm text-[var(--best-board-muted)] text-center">
            {ageType === "under" ? "that's under" : ageType === "over" ? "that's over" : "Enter Age"}
          </span>
          <div className="text-[var(--best-board-text)] text-base flex items-center justify-center gap-2">
            <div className="flex items-center">
              <span className="mr-[1px] w-4 border-b-2 border-[var(--best-board-text)] text-[var(--best-board-text)]"></span>
              <input
                type="text"
                value={calculatedAge}
                onChange={handleAgeChange}
                className="bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] outline-none text-center text-lg w-14 py-1 text-[var(--best-board-text)] transition-colors"
              />
              <span className="ml-[1px] w-4 border-b-2 border-[var(--best-board-text)] text-[var(--best-board-text)]"></span>
            </div>
          </div>

          <span className="font-semibold text-sm text-[var(--best-board-muted)]">Re-type in full</span>

          <div className="flex w-full justify-center">
            <input
              type="text"
              value={dobInput}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              className="bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] outline-none text-center px-2 py-1.5 text-lg w-40 tracking-widest text-[var(--best-board-text)] transition-colors rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          <Button
            onClick={() => {
              setOpen(false);
              setDobInput("");
              setCalculatedAge("");
              setGender("");
              setAgeType("");
            }}
            className="h-10 rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] text-sm font-bold text-[var(--best-board-text)] hover:bg-[var(--best-board-surface)]"
          >
            Cancel
          </Button>
          <Button
            onClick={applyAgeFilter}
            className="h-10 rounded-xl bg-[var(--best-board-accent)] text-sm font-bold text-white hover:brightness-110"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeFilter;
