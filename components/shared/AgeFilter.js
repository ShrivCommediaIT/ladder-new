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
import { useSearchParams } from "next/navigation";
import CountrySelect from "@/components/shared/CountrySelect";

const AgeFilter = ({
  onSearch,
  user,
  resetSignal,
  isActive,
  defaultAge = "",
  defaultAgeType = "",
  defaultGender = "",
  defaultCountry = "",
  defaultWitness = 0,
  showWitness = false
}) => {
  const [open, setOpen] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [calculatedAge, setCalculatedAge] = useState("");
  const [gender, setGender] = useState("");
  const [ageType, setAgeType] = useState("");
  const [country, setCountry] = useState("");
  const [witness, setWitness] = useState(0);
  const searchParams = useSearchParams();
  const ladderType = searchParams.get("type");

  // Sync state with parent's applied filters when the dialog opens
  useEffect(() => {
    if (open) {
      setCalculatedAge(defaultAge && defaultAge !== 0 ? String(defaultAge) : "");
      setGender(defaultGender || "");
      setAgeType(defaultAgeType || "");
      setCountry(defaultCountry || "");
      setWitness(defaultWitness || 0);

      if (defaultAge && defaultAge !== 0) {
        const age = parseInt(defaultAge, 10);
        const today = new Date();
        const prevYear = today.getFullYear() - age;
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        setDobInput(`${dd}/${mm}/${prevYear}`);
      } else {
        setDobInput("");
      }
    }
  }, [open, defaultAge, defaultAgeType, defaultGender, defaultCountry, defaultWitness]);

  useEffect(() => {
    if (resetSignal !== undefined) {
      setDobInput("");
      setCalculatedAge("");
      setGender("");
      setAgeType("");
      setCountry("");
      setWitness(0);
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
    const countryValue = country || "";
    const witnessValue = showWitness ? (witness || 0) : 0;

    const wasActive = !!(defaultAge || defaultGender || defaultCountry || (showWitness && defaultWitness));
    const isAnySelected = !!(ageValue || genderValue || countryValue || witnessValue);

    if (!isAnySelected && !wasActive) {
      toast.error("Please select at least one filter before searching.");
      return;
    }

    if (ageValue && !ageType) {
      toast.error("Please select the age type before searching.");
      return;
    }

    onSearch(ageValue || "", ageTypeValue, genderValue, countryValue, witnessValue);
    setOpen(false);
    toast.success("Searching by Filter!");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={`${
            isActive
              ? "border border-emerald-500/45 bg-emerald-500/10 text-foreground hover:bg-emerald-500/15"
              : user
                ? "border border-primary/40 bg-accent text-foreground hover:bg-muted"
                : "border border-border bg-card text-foreground hover:bg-muted"
          } flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 text-[10px] font-bold uppercase leading-tight shadow-none transition-all active:scale-95`}
        >
          <Filter className="h-5 w-5" />
            <span>Filter</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card text-foreground border border-border rounded-xl max-w-sm w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto flex flex-col items-center p-4 gap-0">
        <DialogTitle className="text-xl font-bold uppercase tracking-wide text-center w-full mt-0 text-foreground">
          FILTER
        </DialogTitle>
        <div className="w-full flex justify-center mt-1 mb-2">
          <span className="h-1 w-16 bg-primary rounded-full"></span>
        </div>

        {/* Gender Section — hidden for minileague */}
          <>
            <p className="text-base font-semibold text-primary mb-1 w-full text-left">
              Select Gender
            </p>

            <div className="flex w-full justify-center gap-2 mb-3 mt-1">
              <button
                onClick={() => setGender(gender === "male" ? "" : "male")}
                className={`flex-1 py-1.5 rounded font-semibold transition-all border text-sm ${
                  gender === "male"
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(14,165,233,0.35)]"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender(gender === "female" ? "" : "female")}
                className={`flex-1 py-1.5 rounded font-semibold transition-all border text-sm ${
                  gender === "female"
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(14,165,233,0.35)]"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                Female
              </button>
            </div>
          </>
        {/* Age Type Section */}
        <p className="text-base font-semibold text-primary mb-1 w-full text-left">
          Select Age Type
        </p>

        <div className="flex w-full justify-center gap-2 mb-3 mt-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setAgeType(ageType === "under" ? "" : "under")}
            className={`flex-1 py-1.5 rounded-md font-bold text-sm transition-all ${
              ageType === "under"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Under Age
          </button>
          <button
            onClick={() => setAgeType(ageType === "over" ? "" : "over")}
            className={`flex-1 py-1.5 rounded-md font-bold text-sm transition-all ${
              ageType === "over"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Over Age
          </button>
        </div>

        {/* Age Input */}
        <div className="flex flex-col items-center w-full gap-2 relative">
          <span className="font-semibold text-sm text-muted-foreground text-center">
            {ageType === "under"
              ? "that's under"
              : ageType === "over"
              ? "that's over"
              : "Enter Age"}
          </span>

          <div className="text-foreground text-base flex items-center justify-center gap-2">
            <div className="flex items-center">
              <span className="mr-[1px] w-4 border-b-2 border-foreground"></span>
              <input
                type="text"
                value={calculatedAge}
                onChange={handleAgeChange}
                className="bg-muted border border-border outline-none text-center text-lg w-14 py-1 text-foreground transition-colors rounded"
              />
              <span className="ml-[1px] w-4 border-b-2 border-foreground"></span>
            </div>
          </div>

          <span className="font-semibold text-sm text-muted-foreground">
            Re-type in full
          </span>

          <div className="flex w-full justify-center">
            <input
              type="text"
              value={dobInput}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              className="bg-muted border border-border outline-none text-center px-2 py-1.5 text-lg w-40 tracking-widest text-foreground placeholder:text-muted-foreground transition-colors rounded"
            />
          </div>
        </div>

                {/* Country Section */}
        <p className="text-base font-semibold text-primary mb-1 w-full text-left">
          Select Country
        </p>
        <div className="w-full flex items-center gap-2 mb-3 mt-1">
          <div className="flex-1">
            <CountrySelect
              value={country}
              onValueChange={(val) => setCountry(val)}
              className="w-full h-10 bg-muted border border-border rounded-xl px-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus-visible:ring-1 focus-visible:ring-primary"
              placeholder="Select Country"
            />
          </div>
          {country && (
            <Button
              variant="outline"
              onClick={() => setCountry("")}
              className="h-10 px-3 rounded-xl border-border text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Show only Witnessed Toggle Button */}
        {showWitness && (
          <div className="w-full flex justify-center mb-4 mt-2">
            <button
              type="button"
              onClick={() => setWitness(witness === 1 ? 0 : 1)}
              className={`w-[75%] py-2 rounded-xl font-bold text-sm transition-all border ${
                witness === 1
                  ? "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800 shadow-sm"
                  : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              Show only Witnessed
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          <Button
            onClick={() => {
              setOpen(false);
            }}
            className="h-10 rounded-xl border border-border bg-muted text-sm font-bold text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={applyAgeFilter}
            className="h-10 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:brightness-110 transition-all"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeFilter;
