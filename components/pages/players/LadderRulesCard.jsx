
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
      <div className="space-y-4 w-full">
        <h2 className="text-h5 font-semibold text-primary">Ladder Rules</h2>
        <Skeleton className="h-10 w-full rounded-xl bg-muted" />
        <Skeleton className="h-24 w-full rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {rulesList.map((rule, idx) => {
        const isCurrentEditing = isEditing === rule.id;
        const isOpen = openRuleIds.includes(rule.id);

        return (
          <div key={rule.id} className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm transition-all duration-300">
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
                    className="w-full sm:w-auto flex items-center gap-2 bg-primary text-primary-foreground font-bold hover:bg-brand-hover"
                  >
                    <Save size={18} /> Save
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="w-full sm:w-auto flex items-center gap-2 border border-border bg-card text-foreground font-semibold hover:bg-muted"
                  >
                    <X size={18} /> Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div
                  className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/15 via-secondary/20 to-primary/10 px-4 py-4 text-foreground shadow-sm"
                  onClick={() => toggleRule(rule.id)}
                >
                  <div className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-h5 font-semibold">{rule.title || "Ladder Rules"}</span>
                  <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="cursor-pointer text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTitleId(rule.id);
                      setTempTitle(rule.title || "");
                    }}
                  >
                    <Pen size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" className="cursor-pointer text-primary hover:bg-primary/10 hover:text-primary">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>
                  </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="pt-2">
                    <div
                      className="mt-2 max-h-[380px] overflow-y-auto rounded-2xl border border-border bg-background/70 p-5 text-sm sm:text-base text-foreground space-y-3 leading-relaxed shadow-inner"
                      dangerouslySetInnerHTML={{
                        __html: rule.rules || "No rules available.",
                      }}
                    />
                    <div className="flex flex-col sm:flex-row mt-4 justify-end gap-3 w-full">
                      <Button
                        className="w-full sm:w-auto flex items-center gap-2 bg-primary text-primary-foreground hover:bg-brand-hover"
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
        <DialogContent className="sm:max-w-[425px] border border-border bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Enter Title"
              className="border-border bg-background text-foreground focus-visible:ring-primary"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTitleId(null)} className="text-muted-foreground hover:bg-muted hover:text-foreground">
              Cancel
            </Button>
            <Button onClick={handleSaveTitle} className="bg-primary hover:bg-brand-hover text-primary-foreground font-bold">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LadderRulesCard;
