

// "use client";

// import Image from "next/image";
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
// import { setSelectedPlayer } from "@/redux/slices/leaderboardSlice";
// import { MinileagueEditPlayer } from "./MinileagueEditPlayer";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { fetchUserProfile } from "@/redux/slices/profileSlice";
// import { useSearchParams } from "next/navigation";
// import Logo from "@/public/logo1.png";
// import PlayerSearchInput from "./PlayerSearchInput";
// import LadderLinkPanel from "./LadderLinkPanel";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import axios from "axios";

// /* ================= Player Card ================= */
// const PlayerCard = ({
//   player,
//   rank,
//   canEdit,
//   isBlank,
//   onEdit,
//   groupSize,
// }) => {
//   if (isBlank) {
//     return (
//       <div
//         className="flex items-center justify-center min-h-[18vh] px-2 py-2 mb-3 rounded-lg shadow"
//         style={{ background: "#223848", border: "2px dashed #4eb0a2" }}
//       />
//     );
//   }

//   const playerImageUrl = player?.image
//     ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}`
//     : Logo;

//   const sectionStartRank =
//     Math.floor((rank - 1) / groupSize) * groupSize + 1;

//   const currentSectionRanks = Array.from(
//     { length: groupSize },
//     (_, i) => sectionStartRank + i
//   );

//   return (
//     <div
//       onClick={() => onEdit(player)}
//       className="flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow cursor-pointer hover:bg-[#143238] transition-all"
//       style={{ background: "#223848", border: "2px solid #4eb0a2" }}
//     >
//       <div className="flex-1 min-w-0">
//         <div className="flex w-full items-center mb-2">
//           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#48aaa8] border-2 border-white text-lg font-bold text-white mr-2">
//             {rank}
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="text-white text-sm font-semibold truncate">
//               {player?.name || "N/A"}
//             </div>
//             <div className="text-[#d4e5e8] text-xs truncate">
//               {player?.phone || "N/A"}
//             </div>
//           </div>

//           <div className="ml-2 w-14 text-center">
//             <span className="bg-[#1b4542] text-[#fdf7c3] px-3 py-1 rounded-full font-extrabold text-lg border border-white">
//               {player?.total_point || 0}
//             </span>
//           </div>
//         </div>

//         <div className="flex gap-1 mb-1 overflow-x-auto">
//           {currentSectionRanks.map((r) => (
//             <div
//               key={r}
//               className="w-7 h-6 flex items-center justify-center text-xs text-white rounded bg-[#28495e] border border-[#4eb0a2]"
//             >
//               {r}
//             </div>
//           ))}
//         </div>

//         <div className="flex gap-1 overflow-x-auto">
//           {currentSectionRanks.map((r) => {
//             const found = player.result_details?.find(
//               (i) => Number(i.rank) === Number(r)
//             );
//             return (
//               <div
//                 key={r}
//                 className={`w-7 h-7 flex items-center justify-center rounded font-bold border ${
//                   found
//                     ? "bg-white text-black border-[#7ea1af]"
//                     : "bg-[#7ea1af]/50 border-[#528189]"
//                 }`}
//               >
//                 {found?.point || ""}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="ml-3 w-20 h-20">
//         <Image
//           src={playerImageUrl}
//           alt={player?.name}
//           width={80}
//           height={80}
//           className="object-cover rounded"
//           unoptimized
//         />
//       </div>
//     </div>
//   );
// };

// /* ================= Main Component ================= */
// const MinileaguePlayers = ({ ladderType: parentLadderType }) => {
//   const dispatch = useDispatch();
//   const searchParams = useSearchParams();
//   const ladderId = searchParams.get("ladder_id");
//   const ladderTypeParam = searchParams.get("ladder_type");

//   const ladderType = ladderTypeParam || parentLadderType || "minileague";

//   const user = useSelector((state) => state.user?.user);
//   const sectionedPlayers =
//     useSelector((state) => state.minileague?.data) || [];

//   const [loadingPlayers, setLoadingPlayers] = useState(true);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedPlayerLocal, setSelectedPlayerLocal] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const isRefreshingRef = useRef(false);

//   // Section Size / Flexibility
//   const [sectionSize, setSectionSize] = useState(7);

//   // Section Modal
//   const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
//   const [currentSectionName, setCurrentSectionName] = useState("");
//   const [newSectionName, setNewSectionName] = useState("");
//   const [newSectionSize, setNewSectionSize] = useState(7);
//   const [updating, setUpdating] = useState(false);


 


//   useEffect(() => {
//     if (user?.id) dispatch(fetchUserProfile(user.id));
//   }, [user, dispatch]);

//   const refreshLeaderboard = useCallback(async () => {
//     if (!ladderId || isRefreshingRef.current) return;
//     isRefreshingRef.current = true;
//     setLoadingPlayers(true);
//     try {
//       await dispatch(
//         fetchMiniLeague({ ladder_id: ladderId, ladderType: "minileague" })
//       );
//     } finally {
//       setLoadingPlayers(false);
//       isRefreshingRef.current = false;
//     }
//   }, [ladderId, dispatch]);

//   useEffect(() => {
//     refreshLeaderboard();
//   }, [refreshLeaderboard]);

//   const handleEditPlayer = useCallback(
//     (player) => {
//       dispatch(
//         setSelectedPlayer({
//           ...player,
//           sectionIndex: player.sectionIndex ?? 0,
//           ladder_id: Number(ladderId),
//         })
//       );
//       setSelectedPlayerLocal(player);
//       setIsOpen(true);
//     },
//     [ladderId, dispatch]
//   );

//   const updateSectionName = async (currentName, updateName) => {
//     try {
//       const res = await axios.post(
//         "https://ne-games.com/leaderBoard/api/user/minileagueupdateGradebarName",
//         null,
//         {
//           params: {
//             ladder_id: ladderId,
//             current_name: currentName,
//             update_name: updateName,
//           },
//           headers: {
//             APPKEY:
//               "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//           },
//         }
//       );
//       if (res.data?.status) refreshLeaderboard();
//     } catch (error) {
//       console.error(error);
//     }
//   };




  
//   const invertRanking = useSelector(
//   (state) => state.player.invertRanking
// );

// const processedSections = invertRanking
//   ? [...sectionedPlayers].reverse()
//   : sectionedPlayers;


//   const searchPlayers = React.useMemo(() => {
//   const q = searchQuery.trim().toLowerCase();
//   if (!q) return [];

//   const list = [];

//   processedSections.forEach((sec, sidx) => {
//     (sec?.users_record || []).forEach((p) => {
//       if (p?.name?.toLowerCase().includes(q)) {
//         list.push({ ...p, sectionIndex: sidx });
//       }
//     });
//   });

//   return list; // order same as API
// }, [processedSections, searchQuery]);


// const finalSections = React.useMemo(() => {
//   const q = searchQuery.trim().toLowerCase();

//   // no search → original data exactly same
//   if (!q) {
//     return processedSections.map((sec) => ({
//       label: sec?.section,
//       players: sec?.users_record || [],
//       blankCount: Math.max(
//         0,
//         sectionSize - (sec?.users_record?.length || 0)
//       ),
//     }));
//   }

//   // search mode → filter only
//   const matched = [];
//   const unmatched = [];

//   processedSections.forEach((sec) => {
//     const players =
//       sec?.users_record?.filter((p) =>
//         p?.name?.toLowerCase().includes(q)
//       ) || [];

//     const sectionObj = {
//       label: sec?.section,
//       players,
//       blankCount: Math.max(0, sectionSize - players.length),
//     };

//     if (players.length > 0) matched.push(sectionObj);
//     else unmatched.push(sectionObj);
//   });

//   // ✅ matched sections top pe
//   return [...matched, ...unmatched];
// }, [processedSections, searchQuery, sectionSize]);


//   return (
//     <div className="space-y-6">
//       <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
//       <LadderLinkPanel ladderId={ladderId} ladderType={ladderType} />
//       <ToastContainer />

//       {loadingPlayers ? (
//         Array.from({ length: 6 }).map((_, i) => (
//           <Skeleton key={i} className="h-16 w-full" />
//         ))
//       ) : (
//         finalSections.map((section, idx) => (
//           <div key={idx}>
//             <div className="bg-[#143238] text-white px-3 py-2 rounded mb-2 font-bold flex justify-between items-center">
//               <span>{section.label}</span>

//               {user?.user_type === "admin" && (
//                 <Button
//                   className="text-xs"
//                   onClick={() => {
//                     setCurrentSectionName(section.label);
//                     setNewSectionName(section.label);
//                     setNewSectionSize(sectionSize);
//                     setIsSectionModalOpen(true);
//                   }}
//                 >
//                   ✏️ Settings
//                 </Button>
//               )}
//             </div>

//             {section.players.map((player, pidx) => {
//               const globalIndex = idx * sectionSize + pidx;
//               return (
//                 <PlayerCard
//                   key={player.id}
//                   player={{ ...player, sectionIndex: idx }}
//                   rank={player.rank || globalIndex + 1}
//                   isAllowed={true} // ✅ Everyone allowed now
//                   canEdit={
//                     user?.user_type === "admin" || user?.id === player?.user_id
//                   }
//                   groupSize={sectionSize}
//                   onEdit={handleEditPlayer}
//                 />
//               );
//             })}

//             {Array.from({ length: section.blankCount }).map((_, i) => (
//               <PlayerCard key={i} isBlank />
//             ))}
//           </div>
//         ))
//       )}

//       <MinileagueEditPlayer
//         open={isOpen}
//         currentId={selectedPlayerLocal?.id}
//         sectionIndex={selectedPlayerLocal?.sectionIndex ?? 0}
//         ladderId={ladderId}
//         onClose={() => setIsOpen(false)}
//       />

//       {/* Section Settings Modal */}
//       <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
//         <DialogContent className="bg-[#0f2a2d] text-white">
//           <DialogHeader>
//             <DialogTitle>Section Settings</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div>
//               <label>Section Name</label>
//               <Input
//                 value={newSectionName}
//                 onChange={(e) => setNewSectionName(e.target.value)}
//               />
//             </div>

//             <div>
//               <label>Section Size</label>
//               <Input
//                 disabled
//                 type="number"
//                 min={1}
//                 max={20}
//                 value={newSectionSize}
//                 onChange={(e) => setNewSectionSize(Number(e.target.value))}
//               />
//             </div>

//             <div className="flex justify-end gap-2">
//               <Button onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
//               <Button
//                 onClick={async () => {
//                   if (!newSectionName.trim()) return alert("Enter name");
//                   setUpdating(true);
//                   await updateSectionName(currentSectionName, newSectionName);
//                   setSectionSize(newSectionSize);
//                   setUpdating(false);
//                   setIsSectionModalOpen(false);
//                 }}
//               >
//                 Save
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default MinileaguePlayers;














// ======================================== search input component ========================================



"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { setSelectedPlayer } from "@/redux/slices/leaderboardSlice";
import { MinileagueEditPlayer } from "./MinileagueEditPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import LadderLinkPanel from "./LadderLinkPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Minileague from "./Minileague";
import MinileagueSearch from "./MinileagueSearch";

/* ================= Player Card ================= */
const PlayerCard = ({
  player,
  rank,
  canEdit,
  isBlank,
  onEdit,
  groupSize,
}) => {
  if (isBlank) {
    return (
      <div
        className="flex items-center justify-center min-h-[18vh] px-2 py-2 mb-3 rounded-lg shadow"
        style={{ background: "#223848", border: "2px dashed #4eb0a2" }}
      />
    );
  }

  const playerImageUrl = player?.image
    ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}`
    : Logo;

  const sectionStartRank =
    Math.floor((rank - 1) / groupSize) * groupSize + 1;

  const currentSectionRanks = Array.from(
    { length: groupSize },
    (_, i) => sectionStartRank + i
  );

  return (
    <div
      onClick={() => onEdit(player)}
      className="flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow cursor-pointer hover:bg-[#143238] transition-all"
      style={{ background: "#223848", border: "2px solid #4eb0a2" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex w-full items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#48aaa8] border-2 border-white text-lg font-bold text-white mr-2">
            {rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">
              {player?.name || "N/A"}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>

          <div className="ml-2 w-14 text-center">
            <span className="bg-[#1b4542] text-[#fdf7c3] px-3 py-1 rounded-full font-extrabold text-lg border border-white">
              {player?.total_point || 0}
            </span>
          </div>
        </div>

        <div className="flex gap-1 mb-1 overflow-x-auto">
          {currentSectionRanks.map((r) => (
            <div
              key={r}
              className="w-7 h-6 flex items-center justify-center text-xs text-white rounded bg-[#28495e] border border-[#4eb0a2]"
            >
              {r}
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {currentSectionRanks.map((r) => {
            const found = player.result_details?.find(
              (i) => Number(i.rank) === Number(r)
            );
            return (
              <div
                key={r}
                className={`w-7 h-7 flex items-center justify-center rounded font-bold border ${
                  found
                    ? "bg-white text-black border-[#7ea1af]"
                    : "bg-[#7ea1af]/50 border-[#528189]"
                }`}
              >
                {found?.point || ""}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ml-3 w-20 h-20">
        <Image
          src={playerImageUrl}
          alt={player?.name}
          width={80}
          height={80}
          className="object-cover rounded"
          unoptimized
        />
      </div>
    </div>
  );
};

/* ================= Main Component ================= */
const MinileaguePlayers = ({ ladderType: parentLadderType }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderTypeParam = searchParams.get("ladder_type");

  const ladderType = ladderTypeParam || parentLadderType || "minileague";

  const user = useSelector((state) => state.user?.user);
  const sectionedPlayers =
    useSelector((state) => state.minileague?.data) || [];

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayerLocal, setSelectedPlayerLocal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isRefreshingRef = useRef(false);

  // Section Size / Flexibility
  const [sectionSize, setSectionSize] = useState(7);

  // Section Modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [currentSectionName, setCurrentSectionName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionSize, setNewSectionSize] = useState(7);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.id) dispatch(fetchUserProfile(user.id));
  }, [user, dispatch]);

  const refreshLeaderboard = useCallback(async () => {
    if (!ladderId || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setLoadingPlayers(true);
    try {
      await dispatch(
        fetchMiniLeague({ ladder_id: ladderId, ladderType: "minileague" })
      );
    } finally {
      setLoadingPlayers(false);
      isRefreshingRef.current = false;
    }
  }, [ladderId, dispatch]);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleEditPlayer = useCallback(
    (player) => {
      dispatch(
        setSelectedPlayer({
          ...player,
          sectionIndex: player.sectionIndex ?? 0,
          ladder_id: Number(ladderId),
        })
      );
      setSelectedPlayerLocal(player);
      setIsOpen(true);
    },
    [ladderId, dispatch]
  );

  const updateSectionName = async (currentName, updateName) => {
    try {
      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/minileagueupdateGradebarName",
        null,
        {
          params: {
            ladder_id: ladderId,
            current_name: currentName,
            update_name: updateName,
          },
          headers: {
            APPKEY:
              "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
          },
        }
      );
      if (res.data?.status) refreshLeaderboard();
    } catch (error) {
      console.error(error);
    }
  };



  const invertRanking = useSelector(
  (state) => state.player.invertRanking
);

const processedSections = invertRanking
  ? [...sectionedPlayers].reverse()
  : sectionedPlayers;


  const searchPlayers = React.useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return [];

  const list = [];

  processedSections.forEach((sec, sidx) => {
    (sec?.users_record || []).forEach((p) => {
      if (p?.name?.toLowerCase().includes(q)) {
        list.push({ ...p, sectionIndex: sidx });
      }
    });
  });

  return list; // order same as API
}, [processedSections, searchQuery]);


// const finalSections = React.useMemo(() => {
//   const q = searchQuery.trim().toLowerCase();

//   // ✅ NO SEARCH → EXACT SAME OUTPUT
//   if (!q) {
//     return processedSections.map((sec) => ({
//       label: sec?.section,
//       players: sec?.users_record || [],
//       blankCount: Math.max(
//         0,
//         sectionSize - (sec?.users_record?.length || 0)
//       ),
//     }));
//   }

//   // ✅ SEARCH MODE
//   const sections = [];

//   processedSections.forEach((sec) => {
//     const allPlayers = sec?.users_record || [];

//     // 🔥 startsWith match first
//     const startsWith = allPlayers.filter((p) =>
//       p?.name?.toLowerCase().startsWith(q)
//     );

//     // then contains match
//     const contains = allPlayers.filter(
//       (p) =>
//         !p?.name?.toLowerCase().startsWith(q) &&
//         p?.name?.toLowerCase().includes(q)
//     );

//     const players = [...startsWith, ...contains];

//     // ✅ hide empty sections during search
//     if (players.length > 0) {
//       sections.push({
//         label: sec?.section,
//         players,
//         blankCount: 0, // ✅ hide blanks during search
//       });
//     }
//   });

//   return sections;
// }, [processedSections, searchQuery, sectionSize]);


const finalSections = React.useMemo(() => {
  const q = searchQuery.trim().toLowerCase();

  // ✅ NORMAL MODE — unchanged
  if (!q) {
    return processedSections.map((sec) => ({
      label: sec?.section,
      players: sec?.users_record || [],
      blankCount: Math.max(
        0,
        sectionSize - (sec?.users_record?.length || 0)
      ),
    }));
  }

  // ✅ SEARCH MODE
  const sections = [];

  processedSections.forEach((sec) => {
    const allPlayers = sec?.users_record || [];

    const startsWith = allPlayers
      .filter((p) =>
        p?.name?.toLowerCase().startsWith(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    const contains = allPlayers
      .filter(
        (p) =>
          !p?.name?.toLowerCase().startsWith(q) &&
          p?.name?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    const players = [...startsWith, ...contains];

    if (players.length > 0) {
      sections.push({
        label: sec?.section,
        players,
        blankCount: 0, // hide blanks in search
      });
    }
  });

  return sections;
}, [processedSections, searchQuery, sectionSize]);


  return (
    <div className="space-y-6">
      <MinileagueSearch value={searchQuery} onChange={setSearchQuery} />
      <LadderLinkPanel ladderId={ladderId} ladderType={ladderType} />
      <ToastContainer />

      {loadingPlayers ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))
      ) : (
        finalSections.map((section, idx) => (
          <div key={idx}>
            <div className="bg-[#143238] text-white px-3 py-2 rounded mb-2 font-bold flex justify-between items-center">
              <span>{section.label}</span>

              {user?.user_type === "admin" && (
                <Button
                  className="text-xs"
                  onClick={() => {
                    setCurrentSectionName(section.label);
                    setNewSectionName(section.label);
                    setNewSectionSize(sectionSize);
                    setIsSectionModalOpen(true);
                  }}
                >
                  ✏️ Settings
                </Button>
              )}
            </div>

            {section.players.map((player, pidx) => {
              const globalIndex = idx * sectionSize + pidx;
              return (
                <PlayerCard
                  key={player.id}
                  player={{ ...player, sectionIndex: idx }}
                  rank={player.rank || globalIndex + 1}
                  isAllowed={true} // ✅ Everyone allowed now
                  canEdit={
                    user?.user_type === "admin" || user?.id === player?.user_id
                  }
                  groupSize={sectionSize}
                  onEdit={handleEditPlayer}
                />
              );
            })}

            {Array.from({ length: section.blankCount }).map((_, i) => (
              <PlayerCard key={i} isBlank />
            ))}
          </div>
        ))
      )}

      <MinileagueEditPlayer
        open={isOpen}
        currentId={selectedPlayerLocal?.id}
        sectionIndex={selectedPlayerLocal?.sectionIndex ?? 0}
        ladderId={ladderId}
        onClose={() => setIsOpen(false)}
      />

      {/* Section Settings Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="bg-[#0f2a2d] text-white">
          <DialogHeader>
            <DialogTitle>Section Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label>Section Name</label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>

            <div>
              <label>Section Size</label>
              <Input
                disabled
                type="number"
                min={1}
                max={20}
                value={newSectionSize}
                onChange={(e) => setNewSectionSize(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!newSectionName.trim()) return alert("Enter name");
                  setUpdating(true);
                  await updateSectionName(currentSectionName, newSectionName);
                  setSectionSize(newSectionSize);
                  setUpdating(false);
                  setIsSectionModalOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinileaguePlayers;




