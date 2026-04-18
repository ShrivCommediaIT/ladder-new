
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, Edit, Save, X } from "lucide-react";
import EditDiscountToken from "@/components/shared/editDiscountToken";

const LadderRulesCard = ({ ladderIdProp }) => {
  const searchParams = useSearchParams();
  const ladderId = ladderIdProp || searchParams.get("id") || searchParams.get("ladder_id");

  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Default CLOSED → []
  const [openRuleIds, setOpenRuleIds] = useState([]);

  const [rulesList, setRulesList] = useState([]);
  const [tempRulesList, setTempRulesList] = useState([]);

  useEffect(() => {
    if (!ladderId) return;

    const fetchRules = async () => {
      try {
        const res = await getRequest(API_ENDPOINTS.GET_RULES_SUGGESTION, { ladder_id: ladderId });

        if (res.status === 200 && Array.isArray(res.data)) {
          setRulesList(res.data);
          setTempRulesList(res.data);

          // ❌ Earlier: open all by default
          // ✔️ Now: keep all CLOSED
          setOpenRuleIds([]);
        }
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [ladderId]);

  const handleSave = async (ruleId) => {
    try {
      const rule = tempRulesList.find((r) => r.id === ruleId);
      if (!rule) return;

      await postRequest(API_ENDPOINTS.UPDATE_RULES_DOCUMENT, {
        id: rule.id,
        title: rule.title,
        rules: rule.rules,
      });

      setRulesList([...tempRulesList]);
      setIsEditing(null);
    } catch (error) {
      console.error("Error updating rules:", error);
      toast.error("Failed to update rules. Please try again.");
    }
  };

  const handleCancel = () => {
    setTempRulesList(rulesList);
    setIsEditing(null);
  };

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
      {rulesList.map((rule, idx) => {
        const isCurrentEditing = isEditing === rule.id;
        const isOpen = openRuleIds.includes(rule.id);

        return (
          <div key={rule.id} className="space-y-3 pb-6 rounded-xl transition-all duration-300">
            {isCurrentEditing ? (
              <>
                <EditDiscountToken 
                  tempRulesList={tempRulesList[idx].rules} 
                  onChange={(newHtml) => {
                    const newList = [...tempRulesList];
                    newList[idx].rules = newHtml;
                    setTempRulesList(newList);
                  }}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-3 w-full pt-2">
                  <Button
                    onClick={() => handleSave(rule.id)}
                    className="bg-amber-500 text-gray-900 font-bold hover:bg-amber-600 w-full sm:w-auto flex items-center gap-2"
                  >
                    <Save size={18} /> Save
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 w-full sm:w-auto flex items-center gap-2"
                  >
                    <X size={18} /> Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div
                  className="text-white bg-gradient-to-r from-[#154052] to-blue-900 rounded-lg text-xl sm:text-2xl p-4 flex items-center justify-between cursor-pointer shadow-xl"
                  onClick={() => toggleRule(rule.id)}
                >
                  <span>{rule.title || "Ladder Rules"}</span>
                  <Button variant="ghost" size="icon" className="text-amber-400">
                    {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </Button>
                </div>

                {isOpen && (
                  <div className="pt-2">
                    <div
                      className="mt-2 bg-gray-900/70 p-6 text-gray-200 rounded-xl text-base sm:text-lg max-h-[380px] overflow-y-auto border border-gray-800 space-y-3 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: rule.rules || "No rules available.",
                      }}
                    />
                    <div className="flex flex-col sm:flex-row mt-4 justify-end gap-3 w-full">
                      <Button
                        className="bg-blue-900 text-white hover:bg-blue-950 w-full sm:w-auto flex items-center gap-2"
                        onClick={() => setIsEditing(rule.id)}
                      >
                        <Edit size={18} /> Edit Info
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LadderRulesCard;
