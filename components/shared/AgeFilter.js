import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const AgeFilter = ({ onSearch, user }) => {
  const [open, setOpen] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [calculatedAge, setCalculatedAge] = useState("");

  const calculateAge = (dobString) => {
    const parts = dobString.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const dobDate = new Date(year, month, day);
      if (!isNaN(dobDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age >= 0) {
          setCalculatedAge(age);
          return;
        }
      }
    }
    setCalculatedAge("");
  };

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
    calculateAge(formatted);
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
    if (dobInput.length === 10) {
      onSearch(calculatedAge);
      setOpen(false);
      setDobInput("");
      setCalculatedAge("");
      toast.success("Searching by Age!");
    } else {
      toast.error("Please enter a valid date (DD/MM/YYYY)");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setDobInput("");
          setCalculatedAge("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className={`${user? "bg-blue-500" : "bg-[#163344]"}  bg-[length:200%_100%] animate-gradient-x border border-gray-400 text-white font-bold uppercase rounded-xl py-3 px-4 h-full w-full shadow-lg flex flex-col items-center justify-center gap-1 text-[10px] leading-tight`}>
          Age Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#163344] text-white border border-[#2dd4bf] rounded-xl max-w-sm flex flex-col items-center p-6">
        <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-center w-full mt-2">
          AGE FILTER
        </DialogTitle>
        <div className="w-full flex justify-center mt-2 mb-6">
          <span className="h-1 w-20 bg-[#2dd4bf] rounded-full"></span>
        </div>
        <div className="flex flex-col items-center w-full gap-4 relative">
          <p className="text-xl font-semibold">Born Before</p>
          <div className="flex justify-center w-full">
            <input
              type="text"
              value={dobInput}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              className="bg-[#242424] border border-gray-400 outline-none text-left p-1 text-2xl w-46 py-1 tracking-widest text-white transition-colors"
            />
          </div>
          <div className="text-white text-lg mt-2 flex items-center justify-center gap-2">
            <span className="font-semibold">that's under</span>
            <div className="flex items-center">
              <span className="text-white w-4 border-b-2 border-white mr-[1px]"></span>
              <input
                type="text"
                value={calculatedAge}
                onChange={handleAgeChange}
                className="bg-[#242424] border border-gray-400 outline-none text-center text-xl w-16 py-1 text-white transition-colors"
              />
              <span className="text-white w-4 border-b-2 border-white ml-[1px]"></span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full mt-10">
          <Button
            onClick={() => {
              setOpen(false);
              setDobInput("");
              setCalculatedAge("");
            }}
            className="bg-[#fbcfe8] text-[#9d174d] hover:bg-[#f9a8d4] font-bold rounded-xl h-12 text-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={applyAgeFilter}
            className="bg-[#2dd4bf] text-[#115e59] hover:bg-[#14b8a6] font-bold rounded-xl h-12 text-lg"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeFilter;
