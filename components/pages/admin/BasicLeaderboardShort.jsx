
"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

const BasicLeaderboardShort = ({
  ladderId,
  onClose = () => {},
  onSkillsUpdated = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [skillNumber, setSkillNumber] = useState("");

  /* ---------------- FETCH ALL SKILLS ---------------- */
  const fetchAllSkills = async () => {
    if (!ladderId) return;

    try {
      setLoading(true);
      const res = await getRequest(API_ENDPOINTS.GET_SKILL_SETUP, { ladder_id: ladderId });
      const skills = res?.data || [];
      setAllSkills(skills);

      if (skills.length > 0) {
        setSkillNumber(skills[0].skill_number);
      }
    } catch (e) {
      console.error("Failed to fetch skills setup", e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FIRST LOAD ---------------- */
  useEffect(() => {
    fetchAllSkills();
  }, [ladderId]);

  const handleSubmit = () => {
    if (!skillNumber) {
      toast.error("Please select skill");
      return;
    }
    
    onSkillsUpdated(skillNumber); 
  };

  return (
    <div className="relative w-[95%] max-w-md rounded-3xl p-6 sm:p-8 bg-gray-800 border border-white/20 shadow-2xl">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white/70 hover:text-white transition"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="text-center mb-5">
        <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg mb-3">
          <Trophy className="text-black" size={28} />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white break-words break-all whitespace-normal overflow-hidden leading-snug text-center max-w-full">
          {loading ? "Loading..." : `Sort by Skill ${skillNumber || "?"}`}
        </h2>

        <p className="text-white/60 text-sm mt-1">
          Select skill to sort leaderboard
        </p>
      </div>

      {/* Skill Dropdown */}
      <div className="mb-6">
        <label className="text-white/80 text-sm mb-1 block">Select skill</label>

        <select
          value={skillNumber}
          onChange={(e) => setSkillNumber(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-xl"
          disabled={loading}
        >
          <option value="" disabled className="bg-gray-300 text-black">
            Select skill
          </option>
          {allSkills.map((s) => (
            <option
              key={s.skill_number}
              value={s.skill_number}
              className="bg-[#1b2232]"
            >
              Skill {s.skill_number} - {s.skill_description}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="w-1/2 bg-red-200 text-blue-950"
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading || !skillNumber}
          className="w-1/2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold"
        >
          {loading ? "Loading..." : "Sort Now"}
        </Button>
      </div>
    </div>
  );
};

export default BasicLeaderboardShort;
