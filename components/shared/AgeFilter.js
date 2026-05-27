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
  const [gender, setGender] = useState(""); // "" | "male" | "female"
  const [ageType, setAgeType] = useState(""); // "under" | "over"

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
    if (value.length > 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length > 4) {
      formatted = formatted.slice(0, 5) + "/" + value.slice(4);
    }
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
        <Button className={`${
          isActive
            ? "bg-green-600 hover:bg-green-700 border-green-400"
            : user
            ? "bg-blue-500 hover:bg-blue-600 border-gray-400"
            : "bg-[#163344] hover:bg-[#1e4a63] border-gray-400"
        } bg-[length:200%_100%] animate-gradient-x border text-white font-bold uppercase rounded-xl py-3 px-4 h-full w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight transition-all active:scale-95`}>
          {isActive ? "✓ AGE/GENDER" : "AGE/GENDER FILTER"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#163344] text-white border border-[#2dd4bf] rounded-xl max-w-sm w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto flex flex-col items-center p-4 gap-0">
        <DialogTitle className="text-xl font-bold uppercase tracking-wide text-center w-full mt-0">
          AGE/GENDER FILTER
        </DialogTitle>
        <div className="w-full flex justify-center mt-1 mb-2">
          <span className="h-1 w-16 bg-[#2dd4bf] rounded-full"></span>
        </div>
        <p className="text-base font-semibold text-[#2dd4bf]">
          Select Gender
        </p>
        {/* Gender Filter Tabs */}
        <div className="flex w-full justify-center gap-2 mb-3 mt-1">
          <button
            onClick={() => setGender(gender === "male" ? "" : "male")}
            className={`flex-1 py-1.5 rounded font-semibold transition-all border text-sm ${gender === "male" ? "bg-[#2dd4bf] border-[#2dd4bf] text-black shadow-[0_0_10px_#2dd4bf]" : "bg-transparent border-gray-500 text-gray-300 hover:border-[#2dd4bf] hover:text-white"}`}
          >
            Male
          </button>
          <button
            onClick={() => setGender(gender === "female" ? "" : "female")}
            className={`flex-1 py-1.5 rounded font-semibold transition-all border text-sm ${gender === "female" ? "bg-[#2dd4bf] border-[#2dd4bf] text-black shadow-[0_0_10px_#2dd4bf]" : "bg-transparent border-gray-500 text-gray-300 hover:border-[#2dd4bf] hover:text-white"}`}
          >
            Female
          </button>
        </div>
        <p className="text-base font-semibold text-[#2dd4bf]">
          Select Age Type
        </p>
        {/* Under/Over Age Filter Tabs */}
        <div className="flex w-full justify-center gap-2 mb-3 mt-1 bg-[#242424] p-1 rounded-lg">

          <button
            onClick={() => setAgeType(ageType === "under" ? "" : "under")}
            className={`flex-1 py-1.5 rounded-md font-bold text-sm transition-all ${ageType === "under" ? "bg-[#2dd4bf] text-black shadow-md" : "bg-transparent text-gray-400 hover:text-white"}`}
          >
            Under Age
          </button>
          <button
            onClick={() => setAgeType(ageType === "over" ? "" : "over")}
            className={`flex-1 py-1.5 rounded-md font-bold text-sm transition-all ${ageType === "over" ? "bg-[#2dd4bf] text-black shadow-md" : "bg-transparent text-gray-400 hover:text-white"}`}
          >
            Over Age
          </button>
        </div>

        <div className="flex flex-col items-center w-full gap-2 relative">
          <span className="font-semibold text-sm text-gray-300 text-center">{ageType === "under" ? "that's under" : ageType === "over" ? "that's over" : "Enter Age"}</span>
          <div className="text-white text-base flex items-center justify-center gap-2">
            <div className="flex items-center">
              <span className="text-white w-4 border-b-2 border-white mr-[1px]"></span>
              <input
                type="text"
                value={calculatedAge}
                onChange={handleAgeChange}
                className="bg-[#242424] border border-gray-400 outline-none text-center text-lg w-14 py-1 text-white transition-colors"
              />
              <span className="text-white w-4 border-b-2 border-white ml-[1px]"></span>
            </div>

          </div>

          <span className="font-semibold text-sm text-gray-300">Re-type in full</span>

          <div className="flex justify-center w-full">
            <input
              type="text"
              value={dobInput}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              className="bg-[#242424] border border-gray-400 outline-none text-center px-2 py-1.5 text-lg w-40 tracking-widest text-white transition-colors rounded"
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
            className="bg-[#fbcfe8] text-[#9d174d] hover:bg-[#f9a8d4] font-bold rounded-xl h-10 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={applyAgeFilter}
            className="bg-[#2dd4bf] text-[#115e59] hover:bg-[#14b8a6] font-bold rounded-xl h-10 text-sm"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeFilter;
