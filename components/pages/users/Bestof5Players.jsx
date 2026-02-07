
// "use client";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { motion } from "framer-motion";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
// import { fetchGradebars } from "@/redux/slices/gradebarSlice";
// import { EditPlayer } from "@/components/shared/EditPlayer";
// import PlayerSearch from "./PlayerSearch";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// export default function Bestof5Players({ ladderId }) {
//   const dispatch = useDispatch();
  
//   const user = {
//   id: effectiveUserId,
//   user_type: effectiveUserType,
// };


//   const players =
//     useSelector((state) => state.player?.players?.[ladderId]?.data) || [];

//   const gradebarDetails =
//     useSelector((state) => state.gradebar?.gradebarDetails) || [];

//   const preset = useSelector((state) => state.gradebar?.preset || 7);

//   const ladderDetails =
//     useSelector(
//       (state) => state.player?.players?.[ladderId]?.ladderDetails
//     ) || {};

//   const ladderType = ladderDetails?.type;
//   const subscription = ladderDetails;

//   const [allowedUsers, setAllowedUsers] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPlayerId, setSelectedPlayerId] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [dialogMessage, setDialogMessage] = useState("");

//   // ================== SUBSCRIPTION LOGIC ==================
//   useEffect(() => {
//     const baseUsers = 10;
//     if (subscription) {
//       const expiry = new Date(subscription?.subscription_expired_date);
//       const now = new Date();
//       if (expiry > now) {
//         const extraUsers = subscription?.no_of_users
//           ? Number(subscription.no_of_users)
//           : 0;
//         setAllowedUsers(baseUsers + extraUsers);
//       } else {
//         setAllowedUsers(baseUsers);
//       }
//     } else {
//       setAllowedUsers(baseUsers);
//     }
//   }, [subscription]);

//   // ================== FETCH DATA ==================
//   useEffect(() => {
//     if (ladderId) {
//       dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
//       dispatch(fetchGradebars(ladderId));
//     }
//   }, [dispatch, ladderId]);

//   // ================== FILTERED PLAYERS ==================
//   const filteredPlayers = searchTerm
//     ? players.filter((p) =>
//         p.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : players;

//   // ================== GENERATE GRADES ==================
//   const generateGrades = (playersArr, gradebars, presetVal) => {
//     if (!playersArr || playersArr.length === 0) return [];
//     const groupSize = Number(presetVal) || 7;
//     const out = [];

//     for (let i = 0; i < playersArr.length; i += groupSize) {
//       const groupPlayers = playersArr.slice(i, i + groupSize);
//       const gradeIdx = Math.floor(i / groupSize);
//       const gradeLabel =
//         gradebars?.[gradeIdx]?.gradebar_name || `Minileague ${gradeIdx + 1}`;

//       out.push({
//         label: gradeLabel,
//         players: groupPlayers,
//       });
//     }
//     return out;
//   };

//   const grades = generateGrades(filteredPlayers, gradebarDetails, preset);

//   // ================== HANDLE PLAYER CLICK ==================
//   const handlePlayerClick = (player, globalIndex) => {
//     if (!user) {
//       setDialogMessage("Please login first");
//       setIsDialogOpen(true);
//       return;
//     }

//     const isAdmin = user?.user_type?.toLowerCase() === "admin";
//     const isCurrentUser = String(user?.id) === String(player.id);
//     const isAllowed = globalIndex < allowedUsers || isAdmin;

//     if (!isAllowed) {
//       toast.warning("Upgrade your subscription to access more players.");
//       return;
//     }

//     if (isAdmin || isCurrentUser) {
//       setSelectedPlayerId(player.id);
//       setIsModalOpen(true);
//     } else {
//       setDialogMessage("You can only edit your own profile");
//       setIsDialogOpen(true);
//     }
//   };

//   return (
//     <div className="w-full relative">
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

//       {/* LADDER TITLE */}
//       {ladderDetails?.name && (
//         <div className="py-4 text-center sm:text-left px-4">
//           <h2 className="text-2xl font-bold text-white">
//             {ladderDetails.name}
//           </h2>
//           <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
//             Admin: {ladderDetails.admin_name} ({ladderDetails.admin_phone})
//           </p>
//         </div>
//       )}

//       {/* SEARCH */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
//         <PlayerSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//       </div>

//       {/* NO PLAYERS */}
//       {grades.length === 0 && (
//         <p className="text-gray-500 text-center mt-6">No players found</p>
//       )}

//       {/* PLAYERS LIST */}
//       {grades.map((grade, gradeIndex) => (
//         <div key={gradeIndex} className="mt-8 px-4">
//           <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">
//             {grade.label}
//           </div>

//           <div className="space-y-3">
//             {grade.players.map((player, pidx) => {
//               const globalIndex = gradeIndex * (Number(preset) || 7) + pidx;

//               const playerImageUrl = player.image
//                 ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}?t=${Date.now()}`
//                 : "/logo.jpg";

//               const canEdit =
//                 user?.user_type?.toLowerCase() === "admin" ||
//                 String(user?.id) === String(player.id);

//               const isAllowed = globalIndex < allowedUsers || canEdit;

//               return (
//                 <motion.div
//                   key={player.id || pidx}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3, delay: pidx * 0.03 }}
//                   onClick={() => handlePlayerClick(player, globalIndex)}
//                   className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all font-sans sm:px-4 sm:py-3 ${
//                     isAllowed && canEdit
//                       ? "cursor-pointer hover:bg-[#143238]"
//                       : "opacity-70 cursor-not-allowed"
//                   }`}
//                   style={{
//                     background: "#223848",
//                     border: "2px solid #4eb0a2",
//                   }}
//                 >
//                   {/* LEFT */}
//                   <div className="flex-1">
//                     <div className="flex w-full items-center mb-2">
//                       <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">
//                         {player.rank || globalIndex + 1}
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="text-white text-sm sm:text-base font-semibold truncate">
//                           {player?.name || "N/A"}
//                         </div>
//                         <div className="text-[#d4e5e8] text-xs truncate">
//                           {player?.phone || "N/A"}
//                         </div>
//                       </div>

//                       <div className="ml-2 w-14 sm:w-16 text-center flex-shrink-0">
//                         <span className="bg-[#1b4542] text-[#fdf7c3] px-2 sm:px-3 py-1 rounded-full font-extrabold text-lg sm:text-xl border border-white">
//                           {player.total_point || 0}
//                         </span>
//                       </div>
//                     </div>

//                     {/* SCORE BOXES */}
//                     {ladderType !== "best3" && (
//                       <div className="mt-1">
//                         <div className="flex gap-1 mb-1 overflow-x-auto">
//                           {(() => {
//                             const groupSize = Number(preset) || 7;
//                             const sectionStartRank =
//                               Math.floor(
//                                 (player.rank - 1) / groupSize
//                               ) *
//                                 groupSize +
//                               1;

//                             const currentSectionRanks = Array.from(
//                               { length: groupSize },
//                               (_, i) => sectionStartRank + i
//                             );

//                             return currentSectionRanks.map((headerRank) => (
//                               <div
//                                 key={headerRank}
//                                 className="w-6 h-5 sm:w-8 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold text-white rounded bg-[#28495e] border border-[#4eb0a2]"
//                               >
//                                 {headerRank}
//                               </div>
//                             ));
//                           })()}
//                         </div>

//                         <div className="flex gap-1 overflow-x-auto">
//                           {Array.from(
//                             { length: Number(preset) || 7 },
//                             (_, boxIdx) => {
//                               const groupSize = Number(preset) || 7;

//                               const sectionStartRank =
//                                 Math.floor(
//                                   (player.rank - 1) / groupSize
//                                 ) *
//                                   groupSize +
//                                 1;

//                               const actualRank =
//                                 sectionStartRank + boxIdx;

//                               const found =
//                                 player.result_details?.find(
//                                   (item) =>
//                                     Number(item.rank) ===
//                                     Number(actualRank)
//                                 );

//                               return (
//                                 <div
//                                   key={boxIdx}
//                                   className={`w-6 h-6 sm:w-8 sm:h-7 flex items-center justify-center border-b-2 rounded font-bold ${
//                                     found
//                                       ? "bg-white text-[#092733] border-[#7ea1af]"
//                                       : "bg-[#7ea1af] bg-opacity-50 border-[#528189] text-xs"
//                                   }`}
//                                 >
//                                   {found ? found.point : ""}
//                                 </div>
//                               );
//                             }
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* RIGHT AVATAR */}
//                   <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 shrink-0">
//                     <Image
//                       src={playerImageUrl}
//                       alt={player.name}
//                       width={96}
//                       height={96}
//                       className="object-cover w-full h-full rounded"
//                       unoptimized
//                     />
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       {/* EDIT MODAL */}
//       {isModalOpen && (
//         <EditPlayer
//           open={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           currentId={selectedPlayerId}
//         />
//       )}

//       {/* NOTICE DIALOG */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md w-full">
//           <DialogHeader>
//             <DialogTitle>Notice</DialogTitle>
//           </DialogHeader>
//           <p className="py-2 text-gray-800">{dialogMessage}</p>
//           <DialogFooter>
//             <Button onClick={() => setIsDialogOpen(false)}>OK</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }










// =================================================

"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { EditPlayer } from "@/components/shared/EditPlayer";
import PlayerSearch from "./PlayerSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function Bestof5Players() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // ✅ ladder params
  const ladderId = searchParams.get("ladder_id");
  const ladderTypeFromParams = searchParams.get("type");

  // ✅ user from localStorage
  const userData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "{}")
      : {};

  let effectiveUserId = null;
  let effectiveUserType = userData?.user_type || null;

  if (effectiveUserType === "admin") {
    effectiveUserId = userData?.id;
  } else if (effectiveUserType === "sub_admin") {
    effectiveUserId = userData?.user_id;
  }

  const user = {
    id: effectiveUserId,
    user_type: effectiveUserType,
  };

  // ✅ redux data
  const players =
    useSelector((state) => state.player?.players?.[ladderId]?.data) || [];

  const gradebarDetails =
    useSelector((state) => state.gradebar?.gradebarDetails) || [];

  const preset = useSelector((state) => state.gradebar?.preset || 7);

  const ladderDetails =
    useSelector(
      (state) => state.player?.players?.[ladderId]?.ladderDetails
    ) || {};

  const ladderType = ladderTypeFromParams || ladderDetails?.type;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  // ================== FETCH DATA ==================
  useEffect(() => {
    if (ladderId) {
      dispatch(fetchLeaderboard({ ladder_id: Number(ladderId), type: ladderType }));
      dispatch(fetchGradebars(Number(ladderId)));
    }
  }, [dispatch, ladderId, ladderType]);

  // ================== FILTER ==================
  const filteredPlayers = searchTerm
    ? players.filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : players;

  // ================== GRADES ==================
  const generateGrades = (playersArr, gradebars, presetVal) => {
    if (!playersArr || playersArr.length === 0) return [];
    const groupSize = Number(presetVal) || 7;
    const out = [];

    for (let i = 0; i < playersArr.length; i += groupSize) {
      const groupPlayers = playersArr.slice(i, i + groupSize);
      const gradeIdx = Math.floor(i / groupSize);
      const gradeLabel =
        gradebars?.[gradeIdx]?.gradebar_name || `Minileague ${gradeIdx + 1}`;

      out.push({
        label: gradeLabel,
        players: groupPlayers,
      });
    }
    return out;
  };

  const grades = generateGrades(filteredPlayers, gradebarDetails, preset);

  // ================== CLICK ==================
  const handlePlayerClick = (player) => {
    if (!user?.id) {
      setDialogMessage("Please login first");
      setIsDialogOpen(true);
      return;
    }

    const isAdmin = user?.user_type?.toLowerCase() === "admin";
    const isCurrentUser = String(user?.id) === String(player.id);

    if (isAdmin || isCurrentUser) {
      setSelectedPlayerId(player.id);
      setIsModalOpen(true);
    } else {
      toast.warning("You can only edit your own profile");
    }
  };

  return (
    <div className="w-full relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* TITLE */}
      {ladderDetails?.name && (
        <div className="py-4 text-center sm:text-left px-4">
          <h2 className="text-2xl font-bold text-white">
            {ladderDetails.name}
          </h2>
        </div>
      )}

      {/* SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {grades.length === 0 && (
        <p className="text-gray-500 text-center mt-6">No players found</p>
      )}

      {/* PLAYERS */}
      {grades.map((grade, gradeIndex) => (
        <div key={gradeIndex} className="mt-8 px-4">
          <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold">
            {grade.label}
          </div>

          <div className="space-y-3">
            {grade.players.map((player, pidx) => {
              const isAdmin = user?.user_type?.toLowerCase() === "admin";
              const isCurrentUser = String(user?.id) === String(player.id);
              const canEdit = isAdmin || isCurrentUser;

              const playerImageUrl = player.image
                ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${player.image}`
                : "/logo.jpg";

              return (
                <motion.div
                  key={player.id || pidx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => canEdit && handlePlayerClick(player)}
                  className={`flex items-center justify-between px-2 py-2 mb-3 rounded-lg shadow transition-all ${
                    canEdit
                      ? "cursor-pointer hover:bg-[#143238]"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  style={{
                    background: "#223848",
                    border: "2px solid #4eb0a2",
                  }}
                >
                  <div className="flex-1 text-white font-semibold">
                    {player?.name}
                  </div>

                  <div className="w-20 h-20 flex items-center justify-center ml-3">
                    <Image
                      src={playerImageUrl}
                      alt={player.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full rounded"
                      unoptimized
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* EDIT */}
      {isModalOpen && (
        <EditPlayer
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentId={selectedPlayerId}
        />
      )}

      {/* DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-gray-800">{dialogMessage}</p>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

