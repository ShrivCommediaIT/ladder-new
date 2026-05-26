

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp } from "lucide-react";



const DummyUserRules = ({ ladderId }) => {
  const [isEditingIndex, setIsEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [rules, setRules] = useState([]);
  const [tempTitle, setTempTitle] = useState("");
  const [tempContent, setTempContent] = useState("");
  const [openRuleIds, setOpenRuleIds] = useState([]); // default: all closed

  const userType = useSelector((state) => state.user?.user?.user_type);
  const userEmail = useSelector((state) => state.user?.user?.user_id);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const res = await getRequest(API_ENDPOINTS.GET_RULES_SUGGESTION, { ladder_id: ladderId });
        if (res.status === 200 && Array.isArray(res.data)) {
          setRules(res.data);
          setOpenRuleIds([]); // keep all rules closed by default
        }
      } catch (error) {
        console.error("Error fetching rules:", error);
      } finally {
        setLoading(false);
      }
    };
    if (ladderId) fetchRules();
  }, [ladderId]);

  const handleEdit = (index) => {
    setIsEditingIndex(index);
    setTempTitle(rules[index].title || "");
    setTempContent(rules[index].rules || "");
  };

  const handleSave = (index) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      title: tempTitle,
      rules: tempContent,
    };
    setRules(updatedRules);
    setIsEditingIndex(null);
    setShowSuccessDialog(true);
  };

  const handleCancel = () => {
    setIsEditingIndex(null);
  };

  const toggleRule = (index) => {
    setOpenRuleIds((prev) =>
      prev.includes(index)
        ? prev.filter((id) => id !== index)
        : [...prev, index]
    );
  };

  if (loading) return <p className="text-[var(--best-board-muted)]">Loading rules...</p>;

  return (
    <div className="space-y-6 w-full sm:px-4 md:px-0 max-w-md mt-4 sm:mt-0 md:mt-0 bg-[var(--best-board-surface)] border border-[var(--best-board-border)] rounded-2xl p-4 shadow-md">
      {rules.map((rule, index) => {
        const isOpen = openRuleIds.includes(index);

        return (
          <div key={index} className="space-y-2 w-full rounded">
            {isEditingIndex === index && userType === "admin" ? (
              <div className="space-y-3 w-full">
                <Input
                  className="text-lg sm:text-xl font-bold text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] focus:ring-2 focus:ring-[var(--primary)] w-full"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                />
                <Textarea
                  className="w-full bg-[var(--best-board-surface-soft)] text-[var(--best-board-text)] border border-[var(--best-board-border)] focus:ring-2 focus:ring-[var(--primary)]"
                  rows={4}
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                  <Button
                    onClick={() => handleSave(index)}
                    className="mt-2 sm:mt-0 bg-[var(--primary)] cursor-pointer px-6 sm:px-8 rounded font-semibold hover:opacity-90 w-full sm:w-auto text-white"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    className="mt-2 sm:mt-0 bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] cursor-pointer px-6 sm:px-8 rounded font-semibold hover:bg-[var(--best-board-surface-strong)] w-full sm:w-auto text-[var(--best-board-text)]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="bg-[var(--best-board-surface-soft)] flex items-center justify-between gap-2 shadow p-4 text-[var(--best-board-text)] text-lg sm:text-xl font-bold rounded border border-[var(--best-board-border)]">
                  <span className="break-words">{rule.title || "No Title"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRule(index)}
                    className="flex items-center gap-1 text-[var(--primary)] hover:text-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--best-board-border)]"
                  >
                    <span className="text-xs cursor-pointer">
                      {isOpen ? "CLOSE" : "OPEN"}
                    </span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>

                {isOpen && (
                  <div>
                    <p className="mt-2 bg-[var(--best-board-surface-strong)] p-4 font-medium rounded shadow text-base sm:text-lg text-[var(--best-board-text)] whitespace-pre-line break-words max-h-[380px] overflow-y-auto border border-[var(--best-board-border)]">
                      {rule.rules || "No content available."}
                    </p>
                  </div>
                )}

                {(userType === "admin" || userEmail === "joebloggs@gmail.com") && (
                  <div className="flex justify-end mt-3">
                    {userEmail === "joebloggs@gmail.com" ? (
                      <AlertDialog>
                        <AlertDialogContent className="bg-gray-800 border-cyan-600">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-400">
                              Only Admin can edit
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <p className="text-gray-300">
                            You do not have permission to edit the rules.
                          </p>
                          <AlertDialogFooter>
                            <Button
                              className="bg-cyan-600 text-white hover:bg-cyan-700"
                            >
                              OK
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        <Button
                          size="sm"
                          className="bg-red-700 hover:bg-red-800 py-3 px-4 cursor-pointer rounded text-white text-xs"
                        >
                          Admin <br /> can Edit info
                        </Button>
                      </AlertDialog>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEdit(index)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        Admin can Edit info
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-gray-800 border-cyan-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-400">
              Content Changes Successful
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-gray-300">
            Your rule changes have been updated successfully!
          </p>
          <AlertDialogFooter>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-cyan-600 text-white hover:bg-cyan-700"
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DummyUserRules;
