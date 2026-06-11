"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { moveToMiniLeague } from "@/redux/slices/minileagueMovingSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, X } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const MovePlayerBox = ({ onCancel, onSuccessRefresh }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const typeFromParams = searchParams.get("type") || searchParams.get("ladder_type");

  // Determine ladder type
  const playerLadderType = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails?.type
  );
  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type
  );
  const ladderType = typeFromParams || playerLadderType || miniLeagueLadderType;
  const isMiniLeague = ladderType === "minileague";

  // Form State
  const [fromRank, setFromRank] = useState("");
  const [toRank, setToRank] = useState("");
  const [moveFromSection, setMoveFromSection] = useState("");
  const [moveToSection, setMoveToSection] = useState("");
  const [activeInput, setActiveInput] = useState("from");
  const [loading, setLoading] = useState(false);

  // User details
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("userData");
      if (raw) {
        setLocalUser(JSON.parse(raw));
      }
    }
  }, []);

  // Fetch sections if minileague
  const { data: sectionData } = useSelector((state) => state.minileague || {});
  const movingSliceLoading = useSelector((state) => state.minileaguePlayerMoving?.loading);
  const isMoving = isMiniLeague ? movingSliceLoading : loading;

  useEffect(() => {
    if (isMiniLeague && ladderId) {
      dispatch(fetchMiniLeague({ ladder_id: ladderId }));
    }
  }, [isMiniLeague, ladderId, dispatch]);

  const sectionOptions = useMemo(() => {
    return (sectionData || []).map((sec) => ({
      label: sec.section_name || sec.section || "Section",
      value: sec.section || sec.section_name,
    }));
  }, [sectionData]);

  /* ------------ NUMPAD HANDLERS ------------ */
  const handleDigit = (digit) => {
    if (activeInput === "from") {
      if (digit === "0" && fromRank === "") return;
      setFromRank((prev) => prev + digit);
    } else {
      if (digit === "0" && toRank === "") return;
      setToRank((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (activeInput === "from") {
      setFromRank((prev) => prev.slice(0, -1));
    } else {
      setToRank((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setFromRank("");
    setToRank("");
  };

  /* ------------ MOVE HANDLER ------------ */
  const handleMove = async () => {
    if (!fromRank || !toRank) {
      toast.error("Enter both ranks");
      return;
    }

    const fromRankNum = Number(fromRank);
    const toRankNum = Number(toRank);

    if (fromRankNum <= 0 || toRankNum <= 0) {
      toast.error("Please enter valid ranks");
      return;
    }

    try {
      setLoading(true);
      const urlType = searchParams.get("type") || searchParams.get("ladder_type");

      if (isMiniLeague) {
        if (!moveFromSection || !moveToSection) {
          toast.error("Please select both sections");
          return;
        }

        const rawAuth = JSON.parse(sessionStorage.getItem("subAdmin")) || JSON.parse(sessionStorage.getItem("adminDetails"));
        const user_id = rawAuth?.user_id || rawAuth?.id;

        const resultAction = await dispatch(
          moveToMiniLeague({
            user_id,
            ladder_id: ladderId,
            move_to_rank: toRankNum,
            move_from_rank: fromRankNum,
            move_from_section: moveFromSection,
            move_to_section: moveToSection,
          })
        );

        if (moveToMiniLeague.fulfilled.match(resultAction)) {
          toast.success("Player moved successfully 🎉");
          dispatch(fetchLeaderboard({ ladder_id: ladderId, type: urlType }));
          dispatch(fetchMiniLeague({ ladder_id: ladderId, type: "minileague" }));
          onSuccessRefresh?.();

          // Reset fields
          setFromRank("");
          setToRank("");
          setMoveFromSection("");
          setMoveToSection("");
          onCancel?.();
        } else {
          toast.error(resultAction.payload || "Move failed");
        }
      } else {
        const user_id = localUser?.id;

        const response = await getRequest(API_ENDPOINTS.MOVE_TO, {
          user_id,
          move_from_user_id: fromRank,
          move_to_rank: toRank,
          move_from_rank: fromRank,
          ladder_id: ladderId,
        });

        if (response?.status === 200 || response?.status === "200") {
          toast.success("Player moved successfully 🎉");
          await dispatch(fetchLeaderboard({ ladder_id: ladderId, type: urlType || ladderType }));
          onSuccessRefresh?.();

          setFromRank("");
          setToRank("");
          onCancel?.();
        } else {
          toast.error(response?.data?.message || "Move failed");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Move failed");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = fromRank && toRank && (!isMiniLeague || (moveFromSection && moveToSection));

  // Dynamic CSS classes/styles
  const wrapperClass = isMiniLeague
    ? "w-full max-w-md mx-auto p-6 rounded-2xl bg-[var(--best-board-surface)] border border-[var(--best-board-border)] text-[var(--best-board-text)] max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin"
    : "w-full max-w-md mx-auto p-6 rounded-2xl bg-card border border-border text-foreground";

  const selectClass = "w-full min-w-0 flex-1 border border-[var(--best-board-border)] rounded-lg py-2 px-3 text-sm text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] focus:outline-none focus:border-[var(--best-board-border-strong)] transition-all duration-200";

  const inputClass = isMiniLeague
    ? "w-full min-w-0 flex-1 border rounded-lg text-center py-2.5 text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] placeholder:text-[var(--best-board-muted)] text-base font-bold focus:outline-none transition-all duration-200"
    : "text-center text-xl font-bold cursor-pointer bg-input-theme-bg text-foreground placeholder:text-muted-foreground transition-all duration-200 border w-full h-12 rounded-xl focus:outline-none";

  const numpadButtonClass = isMiniLeague
    ? "py-3 border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] hover:bg-[var(--best-board-surface-strong)] text-[var(--best-board-text)] rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95 cursor-pointer"
    : "h-12 text-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground bg-secondary text-secondary-foreground";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.4 }}
      className={wrapperClass}
    >
      <h2 className={`text-xl font-bold mb-1 text-center`}>
        Move Player
      </h2>
      <p className="text-muted-foreground text-xs text-center mb-4">
        {isMiniLeague ? "Enter Minileague Move Details" : "Enter ranks to swap players"}
      </p>

      {/* Section Dropdown Selectors (Minileague Only) */}
      {isMiniLeague && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-[var(--best-board-muted)]">From Section</label>
            <select
              value={moveFromSection}
              onChange={(e) => setMoveFromSection(e.target.value)}
              className={selectClass}
            >
              <option className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value="">
                Select Section
              </option>
              {sectionOptions.map((sec, i) => (
                <option key={i} className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value={sec.value}>
                  {sec.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-[11px] text-[var(--best-board-muted)]">To Section</label>
            <select
              value={moveToSection}
              onChange={(e) => setMoveToSection(e.target.value)}
              className={selectClass}
            >
              <option className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value="">
                Select Section
              </option>
              {sectionOptions.map((sec, i) => (
                <option key={i} className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value={sec.value}>
                  {sec.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Rank Inputs */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 space-y-1">
          {isMiniLeague && <label className="text-[11px] text-[var(--best-board-muted)]">From Rank</label>}
          <Input
            readOnly
            value={fromRank}
            placeholder="From Rank"
            onClick={() => setActiveInput("from")}
            onFocus={() => setActiveInput("from")}
            className={`${inputClass} ${
              activeInput === "from"
                ? isMiniLeague
                  ? "border-[var(--best-board-border-strong)] ring-1 ring-[var(--best-board-border-strong)]"
                  : "border-primary ring-2 ring-primary/20"
                : isMiniLeague
                ? "border-[var(--best-board-border)]"
                : "border-input-theme-border"
            }`}
          />
        </div>

        <div className="flex-1 space-y-1">
          {isMiniLeague && <label className="text-[11px] text-[var(--best-board-muted)]">To Rank</label>}
          <Input
            readOnly
            value={toRank}
            placeholder="To Rank"
            onClick={() => setActiveInput("to")}
            onFocus={() => setActiveInput("to")}
            className={`${inputClass} ${
              activeInput === "to"
                ? isMiniLeague
                  ? "border-[var(--best-board-border-strong)] ring-1 ring-[var(--best-board-border-strong)]"
                  : "border-primary ring-2 ring-primary/20"
                : isMiniLeague
                ? "border-[var(--best-board-border)]"
                : "border-input-theme-border"
            }`}
          />
        </div>
      </div>

      {/* Virtual Numpad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            type="button"
            key={num}
            onClick={() => handleDigit(num.toString())}
            className={numpadButtonClass}
            variant={isMiniLeague ? "none" : "secondary"}
          >
            {num}
          </Button>
        ))}

        {/* Backspace Button */}
        <Button
          type="button"
          onClick={handleBackspace}
          className={
            isMiniLeague
              ? "py-3 border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] hover:bg-[var(--best-board-surface-strong)] text-[var(--best-board-text)] rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
              : "h-12 cursor-pointer transition-all duration-200 hover:bg-muted bg-transparent border border-input-theme-border"
          }
          variant={isMiniLeague ? "none" : "outline"}
        >
          <ArrowLeft size={18} className={isMiniLeague ? "text-[var(--best-board-text)]" : "text-foreground"} />
        </Button>

        {/* Zero Button */}
        <Button
          type="button"
          onClick={() => handleDigit("0")}
          className={numpadButtonClass}
          variant={isMiniLeague ? "none" : "secondary"}
        >
          0
        </Button>

        {/* Clear Button */}
        <Button
          type="button"
          onClick={handleClear}
          className={
            isMiniLeague
              ? "py-3 border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] hover:bg-[var(--best-board-surface-strong)] text-[var(--best-board-text)] rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
              : "h-12 cursor-pointer transition-all duration-200 hover:bg-destructive/90 bg-destructive text-white"
          }
          variant={isMiniLeague ? "none" : "destructive"}
        >
          <X size={18} />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className={
            isMiniLeague
              ? "flex-1 h-10 text-xs text-[var(--best-board-text)] border-[var(--best-board-border)] hover:bg-[var(--best-board-surface-soft)] rounded-lg cursor-pointer bg-transparent"
              : "flex-1 cursor-pointer h-10"
          }
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleMove}
          disabled={!isFormValid || isMoving}
          className={
            isMiniLeague
              ? "flex-1 h-10 bg-[var(--best-board-success)] hover:bg-[var(--best-board-success)]/90 text-xs font-semibold text-white px-4 hover:brightness-110 rounded-lg transition-all cursor-pointer"
              : "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer h-10"
          }
        >
          {isMoving ? "Moving..." : "Move Player"}
        </Button>
      </div>
    </motion.div>
  );
};

export default MovePlayerBox;
