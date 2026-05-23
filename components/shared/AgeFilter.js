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
          {isActive ? "AGE/GENDER" : "AGE/GENDER FILTER"}
        </Button>
      </DialogTrigger>
      <DialogContent className="best-board-card flex max-w-sm flex-col items-center rounded-xl border border-[var(--best-board-border)] p-6 text-[var(--best-board-text)]">
        <DialogTitle className="mt-2 w-full text-center text-2xl font-bold uppercase tracking-wider">
          AGE/GENDER FILTER
        </DialogTitle>
        <div className="mb-4 mt-2 flex w-full justify-center">
          <span className="h-1 w-20 rounded-full bg-[var(--best-board-accent)]"></span>
        </div>
        <p className="text-xl font-semibold text-[var(--best-board-accent)]">
          Select Gender
        </p>
        <div className="mb-6 flex w-full justify-center gap-4">
          <button
            onClick={() => setGender(gender === "male" ? "" : "male")}
            className={`flex-1 rounded border py-2 font-semibold transition-all ${
              gender === "male"
                ? "border-[var(--best-board-accent)] bg-[var(--best-board-accent)] text-black shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                : "border-[var(--best-board-border)] bg-transparent text-[var(--best-board-muted)] hover:border-[var(--best-board-accent)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender(gender === "female" ? "" : "female")}
            className={`flex-1 rounded border py-2 font-semibold transition-all ${
              gender === "female"
                ? "border-[var(--best-board-accent)] bg-[var(--best-board-accent)] text-black shadow-[0_0_10px_rgba(37,99,235,0.35)]"
                : "border-[var(--best-board-border)] bg-transparent text-[var(--best-board-muted)] hover:border-[var(--best-board-accent)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Female
          </button>
        </div>
        <p className="text-xl font-semibold text-[var(--best-board-accent)]">
          Select Age Type
        </p>
        <div className="mb-6 flex w-full justify-center gap-4 rounded-lg bg-[var(--best-board-surface-soft)] p-1">
          <button
            onClick={() => setAgeType(ageType === "under" ? "" : "under")}
            className={`flex-1 rounded-md py-2 font-bold transition-all ${
              ageType === "under"
                ? "bg-[var(--best-board-accent)] text-black shadow-md"
                : "bg-transparent text-[var(--best-board-muted)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Under Age
          </button>
          <button
            onClick={() => setAgeType(ageType === "over" ? "" : "over")}
            className={`flex-1 rounded-md py-2 font-bold transition-all ${
              ageType === "over"
                ? "bg-[var(--best-board-accent)] text-black shadow-md"
                : "bg-transparent text-[var(--best-board-muted)] hover:text-[var(--best-board-text)]"
            }`}
          >
            Over Age
          </button>
        </div>

        <div className="relative flex w-full flex-col items-center gap-4">
          <span className="font-semibold text-[var(--best-board-muted)]">
            {ageType === "under"
              ? "that's under"
              : ageType === "over"
                ? "that's over"
                : "Enter Age"}
          </span>
          <div className="mt-2 flex items-center justify-center gap-2 text-lg text-[var(--best-board-text)]">
            <div className="flex items-center">
              <span className="mr-[1px] w-4 border-b-2 border-[var(--best-board-text)] text-[var(--best-board-text)]"></span>
              <input
                type="text"
                value={calculatedAge}
                onChange={handleAgeChange}
                className="w-16 border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] py-1 text-center text-xl text-[var(--best-board-text)] outline-none transition-colors"
              />
              <span className="ml-[1px] w-4 border-b-2 border-[var(--best-board-text)] text-[var(--best-board-text)]"></span>
            </div>
          </div>

          <span className="font-semibold text-[var(--best-board-muted)]">
            On date? Adjust Date
          </span>

          <div className="flex w-full justify-center">
            <input
              type="text"
              value={dobInput}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              className="w-46 rounded border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] p-1 py-2 text-center text-2xl tracking-widest text-[var(--best-board-text)] outline-none transition-colors"
            />
          </div>
        </div>
        <div className="mt-10 grid w-full grid-cols-2 gap-4">
          <Button
            onClick={() => {
              setOpen(false);
              setDobInput("");
              setCalculatedAge("");
              setGender("");
              setAgeType("");
            }}
            className="h-12 rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] text-lg font-bold text-[var(--best-board-text)] hover:bg-[var(--best-board-surface)]"
          >
            Cancel
          </Button>
          <Button
            onClick={applyAgeFilter}
            className="h-12 rounded-xl bg-[var(--best-board-accent)] text-lg font-bold text-white hover:brightness-110"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeFilter;
