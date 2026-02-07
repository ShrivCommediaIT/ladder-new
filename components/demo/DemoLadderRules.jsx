"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RulesForLadder from "./RulesForLadder";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const LadderRulesCard = ({ ladderIdProp }) => {
  const searchParams = useSearchParams();
  // const ladderId = searchParams.get("ladder_id");
  const ladderId =
    ladderIdProp || searchParams.get("id") || searchParams.get("ladder_id");

  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rulesList, setRulesList] = useState([]);
  const [tempRulesList, setTempRulesList] = useState([]);

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
          setTempRulesList(res.data.data);
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

      await axios.post(
        "https://ne-games.com/leaderBoard/api/user/updateRulesDocument",
        {
          id: rule.id,
          title: rule.title,
          rules: rule.rules,
        },
        { headers: { APPKEY } }
      );

      setRulesList([...tempRulesList]);
      setIsEditing(null);
    } catch (error) {
      console.error("Error updating rules:", error);
      alert("Failed to update rules. Please try again.");
    }
  };

  const handleCancel = () => {
    setTempRulesList(rulesList);
    setIsEditing(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-full px-4 sm:px-6 md:px-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 md:px-8 max-w-full">
      {rulesList.map((rule, idx) => {
        const isCurrentEditing = isEditing === rule.id;
        return (
          <div key={rule.id} className="space-y-3 border-b pb-4 w-full">
            {isCurrentEditing ? (
              <>
                <Input
                  className="text-xl sm:text-2xl font-bold text-blue-900 w-full"
                  value={tempRulesList[idx].title}
                  onChange={(e) => {
                    const newList = [...tempRulesList];
                    newList[idx].title = e.target.value;
                    setTempRulesList(newList);
                  }}
                />
                <Textarea
                  className="w-full"
                  rows={4}
                  value={tempRulesList[idx].rules}
                  onChange={(e) => {
                    const newList = [...tempRulesList];
                    newList[idx].rules = e.target.value;
                    setTempRulesList(newList);
                  }}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                  {/* ✅ Button dono ko show hoga */}
                  <Button
                    className={`mt-2 sm:mt-0 px-4 sm:px-8 rounded font-semibold w-full sm:w-auto cursor-pointer 
      ${
        isAdmin
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
      }
    `}
                    onClick={() => setIsEditing(rule.id)}
                  >
                    {isAdmin ? "Admin can Edit Info" : "Edit Info"}
                  </Button>

                  {idx === rulesList.length - 1 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-2 sm:mt-0 bg-blue-600 cursor-pointer px-4 sm:px-8 rounded font-semibold hover:bg-blue-700 w-full sm:w-auto">
                          Ideas For Rules
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] w-full sm:max-w-3xl md:max-w-4xl overflow-y-auto px-4">
                        <DialogHeader>
                          <DialogTitle className="text-lg sm:text-xl text-blue-900">
                            RULES FOR LADDER
                          </DialogTitle>
                        </DialogHeader>
                        <div>
                          <RulesForLadder />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-cyan-200 text-blue-900 text-xl sm:text-2xl font-bold px-2 py-2 rounded break-words">
                  {rule.title || "Ladder Rules"}
                </div>
                <p className="mt-2 text-base sm:text-md font-normal whitespace-pre-line break-words">
                  {rule.rules || "No rules available."}
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                  <Button
                    className="mt-2 sm:mt-0 bg-red-600 cursor-pointer px-4 sm:px-8 rounded font-semibold hover:bg-red-600 w-full sm:w-auto"
                    onClick={() => setIsEditing(rule.id)}
                  >
                    Admin can Edit Info
                  </Button>

                  {idx === rulesList.length - 1 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-2 sm:mt-0 bg-blue-600 cursor-pointer px-4 sm:px-8 rounded font-semibold hover:bg-blue-700 w-full sm:w-auto">
                          Ideas For Rules
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] w-full sm:max-w-3xl md:max-w-4xl overflow-y-auto px-4">
                        <DialogHeader>
                          <DialogTitle className="text-lg sm:text-xl text-blue-900">
                            RULES FOR LADDER
                          </DialogTitle>
                        </DialogHeader>
                        <div>
                          <RulesForLadder />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LadderRulesCard;

// ============================== => idea for rules calling

{
  /* ✅ Ideas For Rules Button → only one at bottom */
}
// <div className="flex">
//   <Dialog>
//     <DialogTrigger asChild>
//       <Button className="mt-3 bg-blue-600 cursor-pointer px-8 rounded-none font-semibold hover:bg-blue-700">
//         Ideas For Rules
//       </Button>
//     </DialogTrigger>
//     <DialogContent className="max-h-[90vh] overflow-y-scroll max-w-3xl">
//       <DialogHeader>
//         <DialogTitle className="text-xl text-blue-900">
//           RULES FOR LADDER
//         </DialogTitle>
//       </DialogHeader>
//       <div>
//         <RulesForLadder />
//       </div>
//     </DialogContent>
//   </Dialog>
// </div>
