"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Video, 
  ArrowLeft, 
  ExternalLink, 
  Activity,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getRequest, postUrlEncoded } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const brandGradient = "var(--background-image-gradient-brand)";
const subtleButtonClass =
  "flex items-center justify-center gap-2 rounded-xl border border-border bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] px-4 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-[color:color-mix(in_srgb,var(--card),var(--primary)_8%)]";

export default function VerifyScoresPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem("adminDetails");
    if (!storedAdmin) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(storedAdmin);
      const requiredAdminId = Number(String(process.env.NEXT_PUBLIC_ADMIN_ID || "").trim());
      const adminId = Number(parsed?.id || parsed?.user_id);
      if (adminId !== requiredAdminId) {
        router.push("/admin-page");
        return;
      }
      setAdmin(parsed);
    } catch (e) {
      router.push("/");
    }
  }, [router]);

  const fetchVerifications = useCallback(async () => {
    if (!admin) return;
    try {
      setLoading(true);
      const res = await getRequest(`${API_ENDPOINTS.GET_PREPOST_RESULTS}?per_page=10&page=${currentPage}`);
      if (res?.status === 200 || res?.status === "success") {
        const responseData = res?.data;
        
        if (responseData && Array.isArray(responseData)) {
          // Flat array fallback
          setPendingVerifications(responseData);
          setTotalPages(1);
          setTotalCount(responseData.length);
        } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
          // Paginated structure
          setPendingVerifications(responseData.data);
          setTotalPages(responseData.last_page || 1);
          setTotalCount(responseData.total || responseData.data.length);
          if (responseData.data.length === 0 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
          }
        } else {
          setPendingVerifications([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } else {
        setPendingVerifications([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to load verifications", err);
      setPendingVerifications([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [admin, currentPage]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((p, idx) => (
      <button
        key={idx}
        onClick={() => typeof p === "number" && handlePageClick(p)}
        disabled={p === "..."}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all sm:h-10 sm:w-10 ${p === currentPage
          ? "scale-105 text-white font-bold"
          : p === "..."
            ? "cursor-default text-muted-foreground"
            : "border border-border bg-[var(--input-bg)] text-foreground hover:bg-muted"
          }`}
        style={
          p === currentPage
            ? {
                backgroundImage: brandGradient,
                boxShadow: "var(--brand-button-shadow)",
              }
            : undefined
        }
      >
        {p}
      </button>
    ));
  };

  const handleVerifyAction = async (item, action) => {
    try {
      const statusValue = action === "approve" ? 1 : 2;
      const statusUrl = `user/prepostUpdateStatus?id=${item.id}&verified_status=${statusValue}`;
      
      const statusRes = await getRequest(statusUrl);
      if (statusRes?.status === 200 || statusRes?.status === "success") {
        if (action === "approve") {
          let targetUrl = "user/postResultSkillboard";
          const ladderType = String(item.ladder_type || "").toLowerCase().trim();
          if (ladderType === "negative" || String(item.score).includes(":")) {
            targetUrl = "user/postResultNegativeSkillboard";
          }

          const params = new URLSearchParams();
          params.append("user_id", String(item.user_id));
          params.append("skill_activity_id", String(item.skill_activity_id));
          params.append("score", String(item.score));
          params.append("witness_by", String(item.witness_by || ""));
          params.append("best_result", String(item.best_result || item.score));
          params.append("admin_id", String(admin?.id || ""));
          params.append("ladder_id", String(item.ladder_id));
          params.append("user_name", String(item.user_name || ""));

          const postRes = await postUrlEncoded(targetUrl, params);

          if (postRes?.status === 200 || postRes?.status === "success") {
            toast.success(`Approved score of ${item.score} for ${item.user_name || `Player ID: ${item.user_id}`} successfully!`);
          } else {
            toast.error(postRes?.error_message || "Failed to post score live.");
            return;
          }
        } else {
          toast.info(`Rejected score of ${item.score} for ${item.user_name || `Player ID: ${item.user_id}`}.`);
        }

        await fetchVerifications();
      } else {
        toast.error(statusRes?.error_message || "Failed to update verification status.");
      }
    } catch (error) {
      console.error("Failed to verify score:", error);
      toast.error("An error occurred during verification.");
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground mt-10 overflow-x-hidden">
      <Navbar activeTab="dashboard" />
      <div className="absolute inset-0" style={{ background: "var(--page-glow-corners)" }} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--page-grid-overlay)", backgroundSize: "78px 78px" }} />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="dark"
      />

      <div className="relative z-10 mx-auto w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-amber-500" />
              Score Verification
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Review and verify score submissions containing video performance evidence.
            </p>
          </div>
        </div>

        {/* Content Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[24px] border border-border bg-card shadow-xl backdrop-blur-2xl p-6"
        >
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">
              <Activity className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              Loading pending verification queue...
            </div>
          ) : pendingVerifications.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-xl text-foreground">All caught up!</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  No score submissions require video verification at the moment.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                      <th className="py-4 px-4">Player</th>
                      <th className="py-4 px-4">Ladder</th>
                      <th className="py-4 px-4">Skill Activity</th>
                      <th className="py-4 px-4 text-center">Score</th>
                      <th className="py-4 px-4">Verification Video</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <AnimatePresence initial={false}>
                      {pendingVerifications.map((item) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -50, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm hover:bg-muted/10 transition-colors"
                        >
                          <td className="py-4 px-4 font-bold text-foreground">
                            {item.user_name || `Player ID: ${item.user_id}`}
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {item.ladder_name || `Ladder ID: ${item.ladder_id}`}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-foreground">
                              {item.skill_number ? `Skill #${item.skill_number}` : `ID: ${item.skill_activity_id}`}
                            </div>
                            {item.skill_description && (
                              <div className="text-xs text-muted-foreground mt-0.5 max-w-[240px] truncate">
                                {item.skill_description}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center font-extrabold text-primary">
                            {item.score}
                          </td>
                          <td className="py-4 px-4">
                            {item.witness_by ? (
                              <a
                                href={item.witness_by}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                              >
                                <Video className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                                Watch Performance
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-destructive font-semibold">No URL Provided</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-2.5">
                              {Number(item.verified_status) !== 1 && (
                                <button
                                  onClick={() => handleVerifyAction(item, 'reject')}
                                  className="border border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 text-destructive dark:text-red-400 font-bold py-1.5 px-3.5 rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                              )}
                              {Number(item.verified_status) === 1 ? (
                                <button
                                  disabled
                                  className="bg-transparent text-emerald-600 dark:text-emerald-400 font-bold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-not-allowed border border-transparent"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Approved
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVerifyAction(item, 'approve')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid View */}
              <div className="grid gap-4 md:hidden">
                <AnimatePresence initial={false}>
                  {pendingVerifications.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl border border-border bg-card p-4 space-y-4 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-foreground text-base">
                            {item.user_name || `Player ID: ${item.user_id}`}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.ladder_name || `Ladder ID: ${item.ladder_id}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Score</div>
                          <div className="font-black text-lg text-primary mt-0.5">{item.score}</div>
                        </div>
                      </div>

                      <div className="border-t border-border/60 pt-3 space-y-2">
                        <div className="text-xs">
                          <span className="text-muted-foreground font-semibold">Skill: </span>
                          <span className="text-foreground font-bold">
                            {item.skill_number ? `Skill #${item.skill_number}` : `ID: ${item.skill_activity_id}`}
                          </span>
                          {item.skill_description && (
                            <span className="text-muted-foreground block text-[11px] mt-0.5 pl-0">
                              {item.skill_description}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          {item.witness_by ? (
                            <a
                              href={item.witness_by}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline py-1"
                            >
                              <Video className="h-4 w-4 flex-shrink-0 text-red-500" />
                              Watch Performance
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-destructive font-semibold">No URL Provided</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-border/40">
                        {Number(item.verified_status) !== 1 && (
                          <button
                            onClick={() => handleVerifyAction(item, 'reject')}
                            className="flex-1 border border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 text-destructive dark:text-red-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}
                        {Number(item.verified_status) === 1 ? (
                          <button
                            disabled
                            className="flex-1 bg-transparent text-emerald-600 dark:text-emerald-400 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-transparent"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyAction(item, 'approve')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {totalCount > 0 && !loading && (
                <div className={`mt-6 flex flex-col items-center gap-4 border-t border-border/70 pt-6 sm:flex-row ${totalPages > 1 ? "justify-between" : "justify-center"}`}>
                  {totalPages > 1 && (
                    <button
                      onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`${subtleButtonClass} h-10 w-full px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {renderPageNumbers()}
                  </div>

                  {totalPages > 1 && (
                    <button
                      onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`${subtleButtonClass} h-10 w-full px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
