"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { sanitizeHtml } from "@/lib/utils";

const LadderRuleCardUser = ({ ladderIdProp }) => {
  const searchParams = useSearchParams();
  const ladderId = ladderIdProp || searchParams.get("id") || searchParams.get("ladder_id");

  const [loading, setLoading] = useState(true);
  const [openRuleIds, setOpenRuleIds] = useState([]);
  const [rulesList, setRulesList] = useState([]);

  useEffect(() => {
    if (!ladderId) return;

    const fetchRules = async () => {
      try {
        const res = await getRequest(API_ENDPOINTS.GET_RULES_SUGGESTION, { ladder_id: ladderId });

        if (res.status === 200 && Array.isArray(res.data)) {
          setRulesList(res.data);
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
      <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg">
        <div className="mb-4 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/12 via-secondary/12 to-primary/8 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
            INFORMATION / RULES
          </p>
        </div>
        <div className="space-y-4 w-full">
          <Skeleton className="h-14 w-full rounded-xl bg-muted animate-pulse" />
          <Skeleton className="h-14 w-full rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg">
      <div className="mb-4 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/12 via-secondary/12 to-primary/8 px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
          INFORMATION / RULES
        </p>
      </div>

      <div className="space-y-4 w-full">
        {rulesList.length === 0 ? (
          <p className="text-sm text-[var(--best-board-muted)] text-center py-4">
            No rules available.
          </p>
        ) : (
          rulesList.map((rule) => {
            const isOpen = openRuleIds.includes(rule.id);

            return (
              <div key={rule.id} className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm transition-all duration-300">
                <div
                  className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/15 via-secondary/20 to-primary/10 px-4 py-4 text-foreground shadow-sm flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => toggleRule(rule.id)}
                >
                  <span className="text-h5 font-semibold text-[var(--best-board-text)]">{rule.title || "Ladder Rules"}</span>
                  <div className="flex">
                    <span className="cursor-pointer text-primary p-2 rounded-md hover:bg-primary/10 transition-colors">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="pt-2">
                    <div
                      className="mt-2 max-h-[380px] overflow-y-auto rounded-2xl border border-border bg-background/70 p-5 text-sm sm:text-base text-foreground space-y-3 leading-relaxed shadow-inner"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(rule.rules) || "No rules available.",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LadderRuleCardUser;
