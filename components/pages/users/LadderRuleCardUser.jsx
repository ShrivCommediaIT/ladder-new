"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const LadderRuleCardUser = ({ ladderIdProp }) => {
  const searchParams = useSearchParams();
  const ladderId = ladderIdProp || searchParams.get("id") || searchParams.get("ladder_id");
  console.log("ladderId : ", ladderId);

  const [loading, setLoading] = useState(true);
  const [openRuleIds, setOpenRuleIds] = useState([]);
  const [rulesList, setRulesList] = useState([]);

  useEffect(() => {
    if (!ladderId) return;

    const fetchRules = async () => {
      try {
        const res = await axios.get(
          `https://ne-games.com/leaderBoard/api/user/getRulesSuggestion?ladder_id=${ladderId}`,
          { headers: { APPKEY } }
        );

        if (res.data.status === 200 && Array.isArray(res.data.data)) {
          setRulesList(res.data.data);
          setOpenRuleIds([]); // All closed by default
        }
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [ladderId]);

  const toggleRule = (ruleId) => {
    setOpenRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 w-full p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl">
        <h2 className="text-xl font-semibold text-amber-400">Ladder Rules</h2>
        <Skeleton className="h-10 w-full bg-gray-700" />
        <Skeleton className="h-24 w-full bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-6">
      {rulesList.map((rule) => {
        const isOpen = openRuleIds.includes(rule.id);

        return (
          <div key={rule.id} className="space-y-3 pb-6 rounded-xl transition-all duration-300">
            <div
              className="text-white bg-gradient-to-r from-[#154052] to-blue-900 rounded-lg text-xl sm:text-2xl p-4 flex items-center justify-between cursor-pointer shadow-xl"
              onClick={() => toggleRule(rule.id)}
            >
              <span>{rule.title || "Ladder Rules"}</span>
              <ChevronDown
                size={24}
                className={`text-amber-400 transform transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isOpen && (
              <div className="pt-2">
                <p className="mt-2 bg-gray-900/70 p-6 text-gray-200 rounded-xl text-base sm:text-lg max-h-[380px] overflow-y-auto border border-gray-800">
                  {rule.rules || "No rules available."}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LadderRuleCardUser;
