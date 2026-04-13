

// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "../ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Skeleton } from "@/components/ui/skeleton";

// const APPKEY =
//   "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// const PlayerPerformationRanking = ({ ladderId }) => {
//   const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
//   const [rankList, setRankList] = useState([]);
//   const [rankLoading, setRankLoading] = useState(true);
//   const [rankError, setRankError] = useState("");

//   useEffect(() => {
//     const fetchRankList = async () => {
//       if (!ladderId) return setRankLoading(false);
//       try {
//         const res = await axios.get(
//           `https://ne-games.com/leaderBoard/api/user/rank/list?ladder_id=${ladderId}`,
//           { headers: { "Content-Type": "application/json", APPKEY } }
//         );
//         setRankList(res.data?.data || []);
//       } catch (err) {
//         setRankError(err.response?.data?.message || "Failed to fetch rank list");
//       } finally {
//         setRankLoading(false);
//       }
//     };
//     fetchRankList();
//   }, [ladderId]);

//   return (
//     <div className="mb-4">
//       <Button onClick={() => setIsStatsModalOpen(true)}>
//         See Player’s Stats Ranked
//       </Button>

//       <AnimatePresence>
//         {isStatsModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
//           >
//             <motion.div
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//               transition={{ duration: 0.3 }}
//               className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]"
//             >
//               <button
//                 onClick={() => setIsStatsModalOpen(false)}
//                 className="absolute top-1 right-2 text-red-600 w-8 h-8 bg-red-200 rounded-full dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold text-xl"
//               >
//                 ✕
//               </button>

//               <h2 className="text-lg font-bold text-center mt-2 mb-4 text-gray-800 ">
//                 Player Performance Stats Rankings
//               </h2>
              

//               {rankLoading ? (
//                 <div className="space-y-4">
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <Skeleton key={i} className="h-8 w-full rounded-md" />
//                   ))}
//                 </div>
//               ) : rankError ? (
//                 <p className="text-center text-red-600">{rankError}</p>
//               ) : rankList.length === 0 ? (
//                 <p className="text-center text-gray-600 dark:text-gray-400">
//                   You need three results to appear here.
//                 </p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <Table className="w-full table-auto border border-gray-200 dark:border-gray-700">
//                     <TableHeader className="bg-gray-100 dark:bg-gray-800">
//                       <TableRow>
//                         <TableHead className="text-left w-12 text-gray-700 dark:text-gray-200">
//                           #
//                         </TableHead>
//                         <TableHead className="text-left text-gray-700 dark:text-gray-200">
//                           Name
//                         </TableHead>
//                         <TableHead className="text-center text-gray-700 dark:text-gray-200">
//                           Played
//                         </TableHead>
//                         <TableHead className="text-center text-gray-700 dark:text-gray-200">
//                           Won
//                         </TableHead>
//                         <TableHead className="text-center text-gray-700 dark:text-gray-200">
//                           Win %
//                         </TableHead>
//                         <TableHead className="text-center text-gray-700 dark:text-gray-200">
//                           Points
//                         </TableHead>
//                         <TableHead className="text-center text-gray-700 dark:text-gray-200">
//                           Avg Points
//                         </TableHead>
//                       </TableRow>
//                     </TableHeader>

//                     <TableBody>
//                       {rankList.map((player, index) => (
//                         <TableRow
//                           key={player.id}
//                           className="hover:bg-gray-50 dark:hover:bg-gray-800"
//                         >
//                           <TableCell className="text-gray-800 dark:text-gray-200">
//                             {index + 1}
//                           </TableCell>
//                           <TableCell className="capitalize text-gray-800 dark:text-gray-200">
//                             {player.name || "Unknown"}
//                           </TableCell>
//                           <TableCell className="text-center text-gray-800 dark:text-gray-200">
//                             {player.total_game ?? 0}
//                           </TableCell>
//                           <TableCell className="text-center text-gray-800 dark:text-gray-200">
//                             {player.total_win ?? 0}
//                           </TableCell>
//                           <TableCell className="text-center text-gray-800 dark:text-gray-200">
//                             {player.total_game > 0
//                               ? ((player.total_win / player.total_game) * 100).toFixed(0)
//                               : 0}
//                             %
//                           </TableCell>
//                           <TableCell className="text-center text-gray-800 dark:text-gray-200">
//                             {player.total_point ?? 0}
//                           </TableCell>
//                           <TableCell className="text-center text-gray-800 dark:text-gray-200">
//                             {player.total_game > 0
//                               ? (player.total_point / player.total_game).toFixed(2)
//                               : "0.00"}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default PlayerPerformationRanking;





// ====================== 111111111111111111111
"use client";

import React, { useEffect, useState } from "react";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";



const PlayerPerformationRanking = ({ ladderId }) => {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [rankList, setRankList] = useState([]);
  const [rankLoading, setRankLoading] = useState(true);
  const [rankError, setRankError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRankList = async () => {
      if (!ladderId) return setRankLoading(false);
      try {
        const res = await getRequest(API_ENDPOINTS.RANK_LIST, { ladder_id: ladderId });
        setRankList(res?.data || []);
      } catch (err) {
        setRankError(err.response?.data?.message || "Failed to fetch rank list");
      } finally {
        setRankLoading(false);
      }
    };
    fetchRankList();
  }, [ladderId]);

  // 🔍 Search logic (trim + lowercase)
  const filteredRankList = rankList.filter((player) =>
    (player.name || "")
      .toLowerCase()
      .trim()
      .includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="mb-4">
      <Button onClick={() => setIsStatsModalOpen(true)}>
        See Player’s Stats Ranked
      </Button>

      <AnimatePresence>
        {isStatsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="absolute top-1 right-2 text-red-600 w-8 h-8 bg-red-200 rounded-full font-bold text-xl"
              >
                ✕
              </button>

              <h2 className="text-lg font-bold text-center mt-2 mb-4 text-gray-800">
                Player Performance Stats Rankings
              </h2>

              {/* 🔍 Search Input */}
              <input
                type="text"
                placeholder="Search player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 px-4 py-2 border-2 border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />

              {rankLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-md" />
                  ))}
                </div>
              ) : rankError ? (
                <p className="text-center text-red-600">{rankError}</p>
              ) : rankList.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">
                  You need three results to appear here.
                </p>
              ) : (
                <>
                  {filteredRankList.length === 0 && searchTerm && (
                    <p className="text-center text-gray-500 mb-2">
                      No player found.
                    </p>
                  )}

                  <div className="overflow-x-auto">
                    <Table className="w-full table-auto border border-gray-200 dark:border-gray-700">
                      <TableHeader className="bg-gray-100 dark:bg-gray-800">
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-center">Played</TableHead>
                          <TableHead className="text-center">Won</TableHead>
                          <TableHead className="text-center">Win %</TableHead>
                          <TableHead className="text-center">Points</TableHead>
                          <TableHead className="text-center">
                            Avg Points
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredRankList.map((player, index) => (
                          <TableRow key={player.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="capitalize">
                              {player.name || "Unknown"}
                            </TableCell>
                            <TableCell className="text-center">
                              {player.total_game ?? 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {player.total_win ?? 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {player.total_game > 0
                                ? (
                                    (player.total_win /
                                      player.total_game) *
                                    100
                                  ).toFixed(0)
                                : 0}
                              %
                            </TableCell>
                            <TableCell className="text-center">
                              {player.total_point ?? 0}
                            </TableCell>
                            <TableCell className="text-center">
                              {player.total_game > 0
                                ? (
                                    player.total_point /
                                    player.total_game
                                  ).toFixed(2)
                                : "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerPerformationRanking;
