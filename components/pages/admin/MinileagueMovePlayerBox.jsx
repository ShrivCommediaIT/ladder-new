

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moveToMiniLeague } from "@/redux/slices/minileagueMovingSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const MinileagueMovePlayerBox = ({ onCancel }) => {
  const [fromRank, setFromRank] = useState("");
  const [toRank, setToRank] = useState("");
  const [moveFromSection, setMoveFromSection] = useState("");
  const [moveToSection, setMoveToSection] = useState("");
  const [activeInput, setActiveInput] = useState("from");

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.minileaguePlayerMoving || {});
  const { data: sectionData } = useSelector((state) => state.minileague || {});

      const [localUser, setLocalUser] = useState(null);
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const raw = sessionStorage.getItem("userData");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setLocalUser(parsed);
            console.log("local user loaded:", parsed);
          } catch (e) {
            console.error("Invalid userData in localStorage");
          }
        }
      }
    }, []);
  
     const user_id = localUser?.id;

  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");

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

    if (!fromRank || !toRank || !moveFromSection || !moveToSection) {
      toast.error("All fields are required");
      return;
    }

    const resultAction = await dispatch(
      moveToMiniLeague({
        user_id,
        ladder_id,
        move_to_rank: Number(toRank),
        move_from_rank: Number(fromRank),
        move_from_section: moveFromSection,
        move_to_section: moveToSection,
      })
    );

    if (moveToMiniLeague.fulfilled.match(resultAction)) {
      toast.success("Player moved successfully ");

      dispatch(fetchLeaderboard({ ladder_id }));
      dispatch(fetchMiniLeague({ ladder_id, type: "minileague" }));

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

    <div className="max-w-sm max-h-[60vh] overflow-y-auto bg-gray-800 p-4 rounded-md">
      <h2 className="text-center font-semibold mb-4 text-gray-300 text-base sm:text-lg">
        Enter Minileague Move Details
      </h2>

      {/* ✅ SECTION SELECT */}
      <div className="flex gap-2 mb-4">
        <select
          value={moveFromSection}
          onChange={(e) => setMoveFromSection(e.target.value)}
          className="flex-1 border rounded-md py-1 px-2 text-gray-300 bg-gray-800 text-sm"
        >
          <option value="">From Section</option>
          {sectionOptions.map((sec, i) => (
            <option key={i} value={sec.value}>
              {sec.label}
            </option>
          ))}
        </select>

        <select
          value={moveToSection}
          onChange={(e) => setMoveToSection(e.target.value)}
          className="flex-1 border rounded-md py-2 px-2 text-sm text-gray-300 bg-gray-800"
        >
          <option value="">To Section</option>
          {sectionOptions.map((sec, i) => (
            <option key={i} value={sec.value}>
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
          className={`max-w-36 flex-1 border rounded-md text-center py-2 text-gray-300 text-base ${
            activeInput === "from" ? "border-purple-300" : "border-gray-300"
          }`}
        />

        <input
          readOnly
          value={toRank}
          placeholder="To Rank"
          onFocus={() => setActiveInput("to")}
          className={`max-w-36 flex-1 border rounded-md text-center py-2 text-gray-300 text-base ${
            activeInput === "to" ? "border-purple-300" : "border-gray-300"
          }`}
        />
      </div>

      {/* ✅ NUMBER PAD */}
      <div className="grid grid-cols-3 gap-2 mb-4 ">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num.toString())}
            className="py-3 bg-gray-300 rounded-md font-medium hover:bg-gray-200 text-base"
          >
            {num}
          </button>
        ))}
      </div>

      {/* ✅ ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleBackspace}
          className="w-full py-2 bg-gray-300 rounded-md text-base"
        >
          ⬅ Backspace
        </button>

        <button
          onClick={onCancel}
          className="w-full py-2 bg-red-500 text-white rounded-md text-base"
        >
          ✖ Cancel
        </button>

        <button
          onClick={handleMove}
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white rounded-md text-base disabled:opacity-60"
        >
          {loading ? "Moving..." : "✔ Move"}
        </button>
      </div>
    </div>
  );
};

export default MinileagueMovePlayerBox;