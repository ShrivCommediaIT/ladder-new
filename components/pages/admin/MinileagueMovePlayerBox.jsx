

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moveToMiniLeague } from "@/redux/slices/minileagueMovingSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const MinileagueMovePlayerBox = ({ onCancel, onSuccessRefresh }) => {
  const [fromRank, setFromRank] = useState("");
  const [toRank, setToRank] = useState("");
  const [moveFromSection, setMoveFromSection] = useState("");
  const [moveToSection, setMoveToSection] = useState("");
  const [activeInput, setActiveInput] = useState("from");

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.minileaguePlayerMoving || {});
  const { data: sectionData } = useSelector((state) => state.minileague || {});

  const [localUser, setLocalUser] = useState(null);
  
  

  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");

  /* ✅ SECTION OPTIONS */
  const sectionOptions = useMemo(() => {
    return sectionData?.map((sec) => ({
      label: sec.section_name || sec.section || "Section",
      value: sec.section || sec.section_name,
    }));
  }, [sectionData]);

  const handleDigit = (digit) => {
    if (activeInput === "from") setFromRank((prev) => prev + digit);
    else setToRank((prev) => prev + digit);
  };

  const handleBackspace = () => {
    if (activeInput === "from") setFromRank((prev) => prev.slice(0, -1));
    else setToRank((prev) => prev.slice(0, -1));
  };

  /* ✅ FINAL MOVE HANDLER */
  const handleMove = async () => {
  const raw = JSON.parse(sessionStorage.getItem("subAdmin")) || JSON.parse(sessionStorage.getItem("adminDetails"))
       
    if (!fromRank || !toRank || !moveFromSection || !moveToSection) {
      toast.error("All fields are required");
      return;
    }

    const resultAction = await dispatch(
      moveToMiniLeague({
        user_id: raw?.user_id || raw?.id,
        ladder_id,
        move_to_rank: Number(toRank),
        move_from_rank: Number(fromRank),
        move_from_section: moveFromSection,
        move_to_section: moveToSection,
      })
    );

    if (moveToMiniLeague.fulfilled.match(resultAction)) {
      toast.success("Player moved successfully ");

      dispatch(fetchLeaderboard({ ladder_id, type: urlType }));
      dispatch(fetchMiniLeague({ ladder_id, type: "minileague" }));
      onSuccessRefresh?.();

      setFromRank("");
      setToRank("");
      setMoveFromSection("");
      setMoveToSection("");
      onCancel();
    } else {
      toast.error(resultAction.payload || "Move failed");
    }
  };

  return (
    <div className="max-w-sm max-h-[60vh] overflow-y-auto bg-[var(--best-board-surface)] border border-[var(--best-board-border)] p-5 rounded-xl shadow-xl">
      <h2 className="text-center font-bold mb-4 text-[var(--best-board-text)] text-base sm:text-lg tracking-wide">
        Enter Minileague Move Details
      </h2>

      {/* ✅ SECTION SELECT */}
      <div className="flex gap-2 mb-4">
        <select
          value={moveFromSection}
          onChange={(e) => setMoveFromSection(e.target.value)}
          className="w-full min-w-0 flex-1 border border-[var(--best-board-border)] rounded-lg py-2 px-3 text-sm text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] focus:outline-none focus:border-[var(--best-board-border-strong)] transition-all duration-200"
        >
          <option className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value="">
            From Section
          </option>
          {sectionOptions.map((sec, i) => (
            <option key={i} className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value={sec.value}>
              {sec.label}
            </option>
          ))}
        </select>

        <select
          value={moveToSection}
          onChange={(e) => setMoveToSection(e.target.value)}
          className="w-full min-w-0 flex-1 border border-[var(--best-board-border)] rounded-lg py-2 px-3 text-sm text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] focus:outline-none focus:border-[var(--best-board-border-strong)] transition-all duration-200"
        >
          <option className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value="">
            To Section
          </option>
          {sectionOptions.map((sec, i) => (
            <option key={i} className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value={sec.value}>
              {sec.label}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ RANK INPUTS */}
      <div className="flex gap-2 mb-4">
        <input
          readOnly
          value={fromRank}
          placeholder="From Rank"
          onFocus={() => setActiveInput("from")}
          className={`w-full min-w-0 flex-1 border rounded-lg text-center py-2.5 text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] placeholder:text-[var(--best-board-muted)] text-base font-semibold focus:outline-none transition-all duration-200 ${
            activeInput === "from"
              ? "border-[var(--best-board-border-strong)] ring-1 ring-[var(--best-board-border-strong)]"
              : "border-[var(--best-board-border)]"
          }`}
        />

        <input
          readOnly
          value={toRank}
          placeholder="To Rank"
          onFocus={() => setActiveInput("to")}
          className={`w-full min-w-0 flex-1 border rounded-lg text-center py-2.5 text-[var(--best-board-text)] bg-[var(--best-board-surface-soft)] placeholder:text-[var(--best-board-muted)] text-base font-semibold focus:outline-none transition-all duration-200 ${
            activeInput === "to"
              ? "border-[var(--best-board-border-strong)] ring-1 ring-[var(--best-board-border-strong)]"
              : "border-[var(--best-board-border)]"
          }`}
        />
      </div>

      {/* ✅ NUMBER PAD */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num.toString())}
            className="py-3 border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] hover:bg-[var(--best-board-surface-strong)] text-[var(--best-board-text)] rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95"
          >
            {num}
          </button>
        ))}
      </div>

      {/* ✅ ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleBackspace}
          className="w-full py-2.5 border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] hover:bg-[var(--best-board-surface-strong)] text-[var(--best-board-text)] rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95"
        >
          ⬅ Backspace
        </button>

        <button
          onClick={onCancel}
          className="w-full py-2.5 bg-[var(--best-board-danger)] text-white hover:brightness-110 rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95"
        >
          ✖ Cancel
        </button>

        <button
          onClick={handleMove}
          disabled={loading}
          className="w-full py-2.5 bg-[var(--best-board-success)] text-white hover:brightness-110 rounded-xl font-bold transition-all duration-200 text-base shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Moving..." : "✔ Move"}
        </button>
      </div>
    </div>
  );
};

export default MinileagueMovePlayerBox;