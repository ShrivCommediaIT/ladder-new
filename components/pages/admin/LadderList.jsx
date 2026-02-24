
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { fetchLadders } from "@/redux/slices/fetchLadderSlice";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// import { motion } from "framer-motion";
// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
//   AlertDialogTitle,
//   AlertDialogDescription,
// } from "@/components/ui/alert-dialog";

// import { fetchLadderByUserId } from "@/redux/slices/ladderSlice";
// import { ListChecks } from "lucide-react";

// const LadderList = ({ userId, createdBy }) => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const printRef = useRef(null);

//   const [deleteLadderId, setDeleteLadderId] = useState(null);
//   const [deleteLadderName, setDeleteLadderName] = useState("");
//   const [seeAll, setSeeAll] = useState(false);

//   const { allLadders, loading, error } = useSelector(
//     (state) => state.fetchLadder,
//   );

//   const subAdmin =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("subAdmin") || "null")
//       : null;

//   const admin =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("userData") || "null")
//       : null;


//   useEffect(() => {
//     if (!userId) return;

//     if (admin?.user_type === "admin") {
//       dispatch(fetchLadderByUserId({ userId: admin.id }));
//     } else if (subAdmin?.user_type === "sub_admin") {
//       dispatch(
//         fetchLadders({
//           userId: subAdmin.user_id,
//           created_by: subAdmin.id,
//         }),
//       );
//     }
//   }, [userId, dispatch]);

//   const handleEditClick = (ladderId, ladderType) => {
//     router.push(`/player-list?ladder_id=${ladderId}&type=${ladderType}`);
//   };

//   const handleDelete = async (ladderId) => {
//     try {
//       await axios.get(
//         "https://ne-games.com/leaderBoard/api/user/Deleteleaderboard",
//         {
//           params: { ladder_id: ladderId },
//           headers: {
//             APPKEY: "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (admin?.user_type === "admin") {
//         dispatch(fetchLadderByUserId({ userId: admin.id }));
//       } else if (subAdmin?.user_type === "sub_admin") {
//         dispatch(
//           fetchLadders({
//             userId: subAdmin.user_id,
//             created_by: subAdmin.id,
//           }),
//         );
//       }
//     } catch (error) {
//       console.error("Delete failed:", error?.response?.data || error.message);
//     } finally {
//       setDeleteLadderId(null);
//     }
//   };

//   const initialLadders = allLadders?.slice(0, 5);
//   const visibleLadders = seeAll ? allLadders : initialLadders;

//   return (
//     <div className="w-full px-2 sm:px-0">
//       <motion.div
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >
//         <div ref={printRef} className="rounded-2xl backdrop-blur-xl shadow-2xl w-full">
//           <div className="space-y-4 text-white">
            
//             {/* Header Section */}
//             <div className="flex items-center justify-between px-1 sm:px-2 pt-2">
//               <h3 className="text-base sm:text-lg font-semibold text-cyan-300 flex items-center gap-2">
//                 <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
//                 Your Solutions
//               </h3>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="cursor-pointer text-teal-400 bg-teal-none border-teal-400/50 hover:text-white hover:bg-teal-400/10 h-8 sm:h-10 px-4 sm:px-8 text-xs sm:text-sm"
//                 onClick={() => setSeeAll((prev) => !prev)}
//               >
//                 {seeAll ? "Show Less" : "See All"}
//               </Button>
//             </div>

//             <Separator className="bg-white/10" />

//             {/* Content States */}
//             {loading && (
//               <p className="text-xs sm:text-sm text-white/50 animate-pulse px-2">
//                 Loading ladders...
//               </p>
//             )}

//             {error && <p className="text-xs sm:text-sm text-red-400 px-2">Error: {error}</p>}

//             {!loading && allLadders?.length === 0 && (
//               <p className="text-xs sm:text-sm text-white/50 px-2">No ladders created yet.</p>
//             )}

//             {/* Ladder List Items */}
//             <div
//               className={`space-y-3 transition-all duration-300 ${
//                 seeAll ? "max-h-[60vh] overflow-y-auto pr-1 sm:pr-2" : "h-auto"
//               }`}
//             >
//               {visibleLadders?.map((ladder, index) => (
//                 <motion.div
//                   key={ladder.id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-black/40 border border-white/10 p-3 sm:px-4 sm:py-3 gap-3"
//                 >
//                   {/* Left Side: S.No and Name */}
//                   <div className="flex items-center gap-3 min-w-0">
//                     <span className="text-cyan-500/70 font-mono text-xs sm:text-sm w-5">
//                       {index + 1}.
//                     </span>
//                     <span className="font-medium text-white text-sm sm:text-base truncate">
//                       {ladder.name}
//                     </span>
//                   </div>

//                   {/* Right Side: Action Buttons */}
//                   <div className="flex items-center gap-2 justify-end sm:justify-start">
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       className="flex-1 sm:flex-none text-cyan-300 border border-cyan-300/30 px-4 sm:px-6 hover:bg-cyan-300/10 cursor-pointer hover:text-white h-8 sm:h-9 text-xs sm:text-sm"
//                       onClick={() => handleEditClick(ladder.id, ladder.type)}
//                     >
//                       Edit
//                     </Button>

//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           className="flex-1 sm:flex-none text-red-400 border border-red-400/30 px-4 sm:px-6 hover:bg-red-400/10 h-8 sm:h-9 text-xs sm:text-sm cursor-pointer hover:text-red-400"
//                           onClick={() => {
//                             setDeleteLadderId(ladder.id);
//                             setDeleteLadderName(ladder.name);
//                           }}
//                         >
//                           Delete
//                         </Button>
//                       </AlertDialogTrigger>

//                       <AlertDialogContent className="w-[90%] max-w-md bg-[#0b1020] border border-white/10 text-white rounded-lg">
//                         <AlertDialogHeader>
//                           <AlertDialogTitle className="text-sm sm:text-lg">
//                             Delete <span className="text-red-400 font-bold">{deleteLadderName}</span>?
//                           </AlertDialogTitle>
//                           <AlertDialogDescription className="text-white/70 text-xs sm:text-sm">
//                             This action cannot be undone.
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter className="flex-row gap-2 mt-4 sm:mt-0">
//                           <AlertDialogCancel
//                             className="flex-1 sm:flex-none text-gray-800 text-xs sm:text-sm"
//                             onClick={() => setDeleteLadderId(null)}
//                           >
//                             Cancel
//                           </AlertDialogCancel>
//                           <AlertDialogAction
//                             onClick={() => handleDelete(deleteLadderId)}
//                             className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
//                           >
//                             Delete
//                           </AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default LadderList;












// =================================================== 1111111111111111111111111111

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";
import { useRouter } from "next/navigation";
import axios from "axios";

import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { fetchLadderByUserId } from "@/redux/slices/ladderSlice";
import { ListChecks } from "lucide-react";

const LadderList = ({ userId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const printRef = useRef(null);

  const [deleteLadderId, setDeleteLadderId] = useState(null);
  const [deleteLadderName, setDeleteLadderName] = useState("");
  const [seeAll, setSeeAll] = useState(false);

  const { allLadders, loading, error } = useSelector(
    (state) => state.fetchLadder,
  );

  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("subAdmin") || "null")
      : null;

  const admin =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "null")
      : null;

  useEffect(() => {
    if (!userId) return;

    if (admin?.user_type === "admin") {
      dispatch(fetchLadderByUserId({ userId: admin.id }));
    } else if (subAdmin?.user_type === "sub_admin") {
      dispatch(
        fetchLadders({
          userId: subAdmin.user_id,
          created_by: subAdmin.id,
        }),
      );
    }
  }, [userId, dispatch]);

  const handleEditClick = (ladderId, ladderType) => {
    router.push(`/player-list?ladder_id=${ladderId}&type=${ladderType}`);
  };

  const handleDelete = async (ladderId) => {
    try {
      await axios.get(
        "https://ne-games.com/leaderBoard/api/user/Deleteleaderboard",
        {
          params: { ladder_id: ladderId },
          headers: {
            APPKEY:
              "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
            "Content-Type": "application/json",
          },
        },
      );

      if (admin?.user_type === "admin") {
        dispatch(fetchLadderByUserId({ userId: admin.id }));
      } else if (subAdmin?.user_type === "sub_admin") {
        dispatch(
          fetchLadders({
            userId: subAdmin.user_id,
            created_by: subAdmin.id,
          }),
        );
      }
    } catch (error) {
      console.error("Delete failed:", error?.response?.data || error.message);
    } finally {
      setDeleteLadderId(null);
    }
  };


const filteredLadders = allLadders?.filter(
  (ladder) => ladder.created_by !== "demo"
);

const initialLadders = filteredLadders?.slice(0, 5);
const visibleLadders = seeAll ? filteredLadders : initialLadders;

  return (
    <div className="w-full px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          ref={printRef}
          className="rounded-2xl backdrop-blur-xl shadow-2xl w-full"
        >
          <div className="space-y-4 text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-2">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                Your Solutions
              </h3>

              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-teal-400 bg-slate-800 border-teal-400/50 hover:text-white hover:bg-teal-400/10 h-8 sm:h-10 px-4 sm:px-8 text-xs sm:text-sm"
                onClick={() => setSeeAll((prev) => !prev)}
              >
                {seeAll ? "Show Less" : "See All"}
              </Button>
            </div>

            <Separator className="bg-white/10" />

            {loading && (
              <p className="text-xs sm:text-sm text-white/50 animate-pulse px-2">
                Loading ladders...
              </p>
            )}

            {error && (
              <p className="text-xs sm:text-sm text-red-400 px-2">
                Error: {error}
              </p>
            )}

            {!loading && allLadders?.length === 0 && (
              <p className="text-xs sm:text-sm text-white/50 px-2">
                No ladders created yet.
              </p>
            )}

            {/* Ladder List */}
            <div
              className={`space-y-3 transition-all duration-300 ${
                seeAll
                  ? "max-h-[60vh] overflow-y-auto pr-1 sm:pr-2"
                  : "h-auto"
              }`}
            >
              {visibleLadders?.map((ladder, index) => {
                const isDemo = ladder.created_by === "demo";

                return (
                  <motion.div
                    key={ladder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-xl p-3 sm:px-4 sm:py-3 gap-3
                      ${
                        isDemo
                          ? "bg-yellow-500/10 border border-cyan-400"
                          : "bg-black/40 border border-white/10"
                      }`}
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-cyan-500/70 font-mono text-xs sm:text-sm w-5">
                        {index + 1}.
                      </span>

                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-white text-sm sm:text-base truncate">
                          {ladder.name}
                        </span>

                        {isDemo && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500 text-black">
                            DEMO
                          </span>
                        )}
                      </div>
                    </div>

                   {/* Right */}
<div className="flex items-center gap-2 justify-end sm:justify-start">
  <Button
    size="sm"
    variant="ghost"
    className={`flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm
      ${
        isDemo
          ? "text-cyan-300 border border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white"
          : "text-cyan-300 border border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
      }`}
    onClick={() =>
      handleEditClick(ladder.id, ladder.type)
    }
  >
    Edit
  </Button>

  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        size="sm"
        variant="ghost"
        className={`flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm cursor-pointer
          ${
            isDemo
              ? "text-red-400 border border-red-500 hover:bg-red-300"
              : "text-red-400 border border-red-400/30 hover:bg-red-400/50"
          }`}
        onClick={() => {
          setDeleteLadderId(ladder.id);
          setDeleteLadderName(ladder.name);
        }}
      >
        Delete
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent className="w-[90%] max-w-md bg-[#0b1020] border border-white/10 text-white rounded-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>
          Delete{" "}
          <span className="text-red-400 font-bold">
            {deleteLadderName}
          </span>
          ?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={() => setDeleteLadderId(null)}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={() =>
            handleDelete(deleteLadderId)
          }
          className="bg-red-600 hover:bg-red-700"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>

                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LadderList;
