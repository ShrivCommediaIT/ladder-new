
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
import { ChevronDown, ChevronUp, Edit, Pen, Save, X } from "lucide-react";
import EditDiscountToken from "@/components/shared/editDiscountToken";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const LadderRulesCard = ({ ladderIdProp }) => {
  const searchParams = useSearchParams();
  const ladderId = ladderIdProp || searchParams.get("id") || searchParams.get("ladder_id");

  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Default CLOSED → []
  const [openRuleIds, setOpenRuleIds] = useState([]);

  const [rulesList, setRulesList] = useState([]);
  const [tempRulesList, setTempRulesList] = useState([]);

  const [editTitleId, setEditTitleId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");

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

  const handleSaveTitle = async () => {
    if (!editTitleId) return;

    try {
      const rule = tempRulesList.find((r) => r.id === editTitleId);
      if (!rule) return;

      await postRequest(API_ENDPOINTS.UPDATE_RULES_DOCUMENT, {
        id: rule.id,
        title: tempTitle,
        rules: rule.rules,
      });

      const updatedRules = rulesList.map((r) =>
        r.id === editTitleId ? { ...r, title: tempTitle } : r
      );
      const updatedTempRules = tempRulesList.map((r) =>
        r.id === editTitleId ? { ...r, title: tempTitle } : r
      );

      setRulesList(updatedRules);
      setTempRulesList(updatedTempRules);
      setEditTitleId(null);
      toast.success("Title updated successfully.");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title. Please try again.");
    }
  };

  const toggleRule = (ruleId) => {
    setOpenRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 w-full p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl">
        <h2 className="text-xl font-semibold text-blue-400">Ladder Rules</h2>
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
                  <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-amber-400 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTitleId(rule.id);
                      setTempTitle(rule.title || "");
                    }}
                  >
                    <Pen size={24} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-amber-400 cursor-pointer">
                    {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </Button>
                  </div>
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

      <Dialog open={editTitleId !== null} onOpenChange={(open) => !open && setEditTitleId(null)}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Enter Title"
              className="bg-gray-800 border-gray-700 text-white focus:ring-amber-500"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTitleId(null)} className="text-gray-300 hover:bg-gray-800 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveTitle} className="bg-blue-900 hover:bg-blue-950 text-white font-bold">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LadderRulesCard;
