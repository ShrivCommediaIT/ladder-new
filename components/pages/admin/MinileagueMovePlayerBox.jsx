

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
        const raw = localStorage.getItem("userData");
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











// ============================= 1111111111111111111

// "use client";

// import React, { useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { moveToMiniLeague } from "@/redux/slices/minileagueMovingSlice";
// import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
// import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
// import { toast } from "react-toastify";
// import { useSearchParams } from "next/navigation";

// const MinileagueMovePlayerBox = ({ onCancel }) => {
//   const [fromRank, setFromRank] = useState("");
//   const [toRank, setToRank] = useState("");
//   const [moveFromSection, setMoveFromSection] = useState("");
//   const [moveToSection, setMoveToSection] = useState("");
//   const [activeInput, setActiveInput] = useState<"from" | "to">("from");

//   const dispatch = useDispatch();
//   const { loading } = useSelector(
//     (state) => state.minileaguePlayerMoving || {}
//   );
//   const { data: sectionData } = useSelector(
//     (state) => state.minileague || {}
//   );
//   const user = useSelector((state) => state.user?.user || {});
//   const user_id = user?.user_id;

//   const searchParams = useSearchParams();
//   const ladder_id = searchParams.get("ladder_id");

//   /* SECTION OPTIONS */
//   const sectionOptions = useMemo(
//     () =>
//       sectionData?.map((sec) => ({
//         label: sec.section_name || sec.section || "Section",
//         value: sec.section || sec.section_name,
//       })),
//     [sectionData]
//   );

//   const handleDigit = (digit) => {
//     if (activeInput === "from") setFromRank((prev) => prev + digit);
//     else setToRank((prev) => prev + digit);
//   };

//   const handleBackspace = () => {
//     if (activeInput === "from") setFromRank((prev) => prev.slice(0, -1));
//     else setToRank((prev) => prev.slice(0, -1));
//   };

//   const handleMove = async () => {
//     if (!fromRank || !toRank || !moveFromSection || !moveToSection) {
//       toast.error("All fields are required");
//       return;
//     }

//     const resultAction = await dispatch(
//       moveToMiniLeague({
//         user_id,
//         ladder_id,
//         move_to_rank: Number(toRank),
//         move_from_rank: Number(fromRank),
//         move_from_section: moveFromSection,
//         move_to_section: moveToSection,
//       })
//     );

//     if (moveToMiniLeague.fulfilled.match(resultAction)) {
//       toast.success("Player moved successfully ");
//       dispatch(fetchLeaderboard({ ladder_id }));
//       dispatch(fetchMiniLeague({ ladder_id, type: "minileague" }));

//       setFromRank("");
//       setToRank("");
//       setMoveFromSection("");
//       setMoveToSection("");
//       onCancel();
//     } else {
//       toast.error((resultAction).payload || "Move failed");
//     }
//   };

//   return (
//     <div
//       className="
//         max-w-sm w-full mx-auto
//         rounded-2xl
//         border border-white/10
//         bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90
//         shadow-[0_0_30px_rgba(15,23,42,0.9)]
//         backdrop-blur-xl
//         p-4
//         text-slate-100
//       "
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <div>
//           <h2 className="text-sm sm:text-base font-semibold tracking-tight">
//             Move Player in Mini League
//           </h2>
//           <p className="text-[11px] text-slate-400">
//             Select sections and ranks to move the player.
//           </p>
//         </div>
//         <span className="rounded-full bg-amber-500/15 text-amber-300 text-[10px] px-2 py-1 font-medium border border-amber-500/40">
//           Move
//         </span>
//       </div>

//       {/* Sections */}
//       <div className="grid grid-cols-2 gap-2 mb-3">
//         <div className="space-y-1">
//           <p className="text-[11px] text-slate-300">From Section</p>
//           <select
//             value={moveFromSection}
//             onChange={(e) => setMoveFromSection(e.target.value)}
//             className="
//               w-full h-9 rounded-md
//               border border-slate-700/80
//               bg-slate-900/70
//               text-xs text-slate-100
//               px-2.5
//               focus:outline-none focus:ring-2 focus:ring-amber-500/70
//             "
//           >
//             <option className="bg-slate-900" value="">
//               Select
//             </option>
//             {sectionOptions?.map((sec, i) => (
//               <option key={i} value={sec.value} className="bg-slate-900">
//                 {sec.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-1">
//           <p className="text-[11px] text-slate-300">To Section</p>
//           <select
//             value={moveToSection}
//             onChange={(e) => setMoveToSection(e.target.value)}
//             className="
//               w-full h-9 rounded-md
//               border border-slate-700/80
//               bg-slate-900/70
//               text-xs text-slate-100
//               px-2.5
//               focus:outline-none focus:ring-2 focus:ring-amber-500/70
//             "
//           >
//             <option className="bg-slate-900" value="">
//               Select
//             </option>
//             {sectionOptions?.map((sec, i) => (
//               <option key={i} value={sec.value} className="bg-slate-900">
//                 {sec.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Ranks */}
//       <div className="grid grid-cols-2 gap-2 mb-3">
//         <button
//           type="button"
//           onClick={() => setActiveInput("from")}
//           className={`
//             h-9 rounded-lg border text-xs font-medium
//             flex items-center justify-center
//             ${
//               activeInput === "from"
//                 ? "border-amber-400 bg-amber-500/10 text-amber-200"
//                 : "border-slate-700 bg-slate-900/70 text-slate-200"
//             }
//           `}
//         >
//           From Rank: {fromRank || "--"}
//         </button>

//         <button
//           type="button"
//           onClick={() => setActiveInput("to")}
//           className={`
//             h-9 rounded-lg border text-xs font-medium
//             flex items-center justify-center
//             ${
//               activeInput === "to"
//                 ? "border-amber-400 bg-amber-500/10 text-amber-200"
//                 : "border-slate-700 bg-slate-900/70 text-slate-200"
//             }
//           `}
//         >
//           To Rank: {toRank || "--"}
//         </button>
//       </div>

//       {/* Compact number pad */}
//       <div
//         className="
//           grid grid-cols-3 gap-1.5 mb-3
//         "
//       >
//         {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
//           <button
//             key={num}
//             type="button"
//             onClick={() => handleDigit(num.toString())}
//             className="
//               h-8 sm:h-9
//               rounded-lg
//               text-xs sm:text-sm font-semibold
//               bg-slate-800/80
//               border border-slate-700/70
//               shadow-sm
//               hover:bg-slate-700
//               active:scale-95
//               transition
//             "
//           >
//             {num}
//           </button>
//         ))}
//       </div>

//       {/* Actions */}
//       <div className="flex flex-col sm:flex-row gap-1.5">
//         <button
//           type="button"
//           onClick={handleBackspace}
//           className="
//             w-full h-8 sm:h-9 rounded-md
//             bg-slate-700/80 text-[11px] sm:text-xs text-slate-100
//             hover:bg-slate-600
//             flex items-center justify-center
//           "
//         >
//           ⬅ Backspace
//         </button>

//         <button
//           type="button"
//           onClick={onCancel}
//           className="
//             w-full h-8 sm:h-9 rounded-md
//             bg-red-500/90 text-[11px] sm:text-xs text-white font-semibold
//             hover:bg-red-600
//           "
//         >
//           ✖ Cancel
//         </button>

//         <button
//           type="button"
//           onClick={handleMove}
//           disabled={loading}
//           className="
//             w-full h-8 sm:h-9 rounded-md
//             bg-emerald-500 text-[11px] sm:text-xs text-slate-950 font-semibold
//             hover:bg-emerald-600
//             disabled:opacity-60
//           "
//         >
//           {loading ? "Moving..." : "✔ Move"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MinileagueMovePlayerBox;
