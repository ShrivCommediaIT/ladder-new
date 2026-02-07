// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// import { useDispatch, useSelector } from "react-redux";
// import { movePlayer, clearMoveResult } from "@/redux/slices/playerMovingSlice";
// import { toast } from "react-toastify";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
// import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
// import ChallengeNumberInput from "./ChallengeNumberInput";
// import MoveNumberInput from "./MoveNumberInput";
// import EditPlayerDetails from "./EditPlayerDetails";
// import PlayerImage from "./PlayerImage";
// import StatusPlayer from "./StatusPlayer";
// import PlayerStatsBox from "./PlayerStatsBox";
// import { ChevronDown } from "lucide-react";

// export const EditPlayer = ({
//   open = true,
//   onClose = () => {},
//   currentId = null, // ✅ always pass player.id here
//   setLoading = () => {},
// }) => {
//   const dispatch = useDispatch();

//   const playerId = currentId ? Number(currentId) : null;

//   const user = useSelector((state) => state?.user?.user || {});
//   const ladder_id = user?.ladder_id;

//   const players =
//     useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];

//   const selectedPlayer =
//     players.length > 0 && playerId
//       ? players.find((p) => Number(p.id) === playerId)
//       : null;

//   useEffect(() => {
//     if (open && ladder_id) {
//       dispatch(fetchLeaderboard({ ladder_id }));
//     }
//   }, [dispatch, ladder_id, open]);

//   const { loading, error: moveError, result } =
//     useSelector((state) => state?.playerMoving) || {};

//   useEffect(() => {
//     if (result?.success_message) {
//       dispatch(clearMoveResult());
//     }
//     if (moveError) {
//       toast.error(moveError);
//       dispatch(clearMoveResult());
//     }
//   }, [result, moveError, dispatch]);

//   const [selectedTab, setSelectedTab] = useState("result");

//   const tabs = [
//     { value: "result", label: "Result" },
//     { value: "status", label: "Status" },
//     { value: "edit", label: "Edit" },
//     { value: "load", label: "Upload" },
//     { value: "stats", label: "Stats" },
//     { value: "challenge", label: "Challenge" },
//   ];

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="w-full max-w-xl">
//         <DialogTitle>
//           <VisuallyHidden>Edit Player Modal</VisuallyHidden>
//         </DialogTitle>

//         <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
//           <Tabs value={selectedTab} onValueChange={setSelectedTab}  className="w-full">

//             {/* ✅ Desktop / Tablet Tabs */}
//             <div className="">
//               <TabsList className="lg:w-full sm:w-full md:w-full w-80 flex items-center justify-center bg-white ">
//                 {tabs.map((tab) => (
//                   <TabsTrigger
//                     key={tab.value}
//                     value={tab.value}
//                     className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg transition-all text-sm sm:text-base"
//                   >
//                     {tab.label}
//                   </TabsTrigger>
//                 ))}
//               </TabsList>
//             </div>

//             {/* ✅ Tab Content */}
//             <TabsContent value="result">
//               <MoveNumberInput
//                 onClose={onClose}
//                 currentId={playerId}
//                 currentRank={selectedPlayer?.rank}
//                 setLoading={setLoading}
//                 selectedPlayer={selectedPlayer}
//               />
//             </TabsContent>

//             <TabsContent value="challenge">
//               <ChallengeNumberInput
//                 selectedPlayer={selectedPlayer}
//                 challengedPlayer={""}
//                 setChallengedPlayer={() => {}}
//                 userId={user?.id}
//               />
//             </TabsContent>

//             <TabsContent value="edit">
//               <EditPlayerDetails userId={playerId} onClose={onClose} />
//             </TabsContent>

//             <TabsContent value="load">
//               <PlayerImage userId={playerId} onClose={onClose} />
//             </TabsContent>

//             <TabsContent value="status">
//               <StatusPlayer playerId={playerId} onClose={onClose} />
//             </TabsContent>

//             <TabsContent value="stats">
//               <PlayerStatsBox userId={playerId} ladderId={ladder_id} />
//             </TabsContent>

//           </Tabs>
//         </motion.div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// ======================

// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// import { useDispatch, useSelector } from "react-redux";
// import { movePlayer, clearMoveResult } from "@/redux/slices/playerMovingSlice";
// import { toast } from "react-toastify";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
// import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
// import ChallengeNumberInput from "./ChallengeNumberInput";
// import MoveNumberInput from "./MoveNumberInput";
// import EditPlayerDetails from "./EditPlayerDetails";
// import PlayerImage from "./PlayerImage";
// import StatusPlayer from "./StatusPlayer";
// import PlayerStatsBox from "./PlayerStatsBox";
// import { ChevronDown } from "lucide-react";

// import PlayerBet from "./PlayerBet";

// export const EditPlayer = ({
//   open = true,
//   onClose = () => { },
//   currentId = null, // ✅ always pass player.id here
//   setLoading = () => { },
// }) => {
//   const dispatch = useDispatch();

//   const playerId = currentId ? Number(currentId) : null;

//   const user = useSelector((state) => state?.user?.user || {});
//   const ladder_id = user?.ladder_id;

//   const players =
//     useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];

//   const selectedPlayer =
//     players.length > 0 && playerId
//       ? players.find((p) => Number(p.id) === playerId)
//       : null;

//   useEffect(() => {
//     if (open && ladder_id) {
//       dispatch(fetchLeaderboard({ ladder_id }));
//     }
//   }, [dispatch, ladder_id, open]);

//   const { loading, error: moveError, result } =
//     useSelector((state) => state?.playerMoving) || {};

//   useEffect(() => {
//     if (result?.success_message) {
//       dispatch(clearMoveResult());
//     }
//     if (moveError) {
//       toast.error(moveError);
//       dispatch(clearMoveResult());
//     }
//   }, [result, moveError, dispatch]);

//   const [selectedTab, setSelectedTab] = useState("result");

//   const tabs = [
//     { value: "result", label: "Result" },
//     { value: "status", label: "Status" },
//     { value: "edit", label: "Edit" },
//     { value: "load", label: "Upload" },
//     { value: "stats", label: "Stats" },
//     { value: "challenge", label: "Challenge" },
//     { value: "bet", label: "Bet" }
//   ];

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="min-w-4xl border-none bg-blue-950 max-w-full ">
//         <DialogTitle>
//           <VisuallyHidden>Edit Player Modal</VisuallyHidden>
//         </DialogTitle>

//         <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
//           <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full ">

//             {/* ✅ Desktop / Tablet Tabs */}
//             <div className="">
//               <TabsList className="lg:w-full sm:w-full md:w-full w-80 flex items-center justify-center ">
//                 {tabs.map((tab) => (
//                   <TabsTrigger
//                     key={tab.value}
//                     value={tab.value}
//                     className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg transition-all text-sm sm:text-base"
//                   >
//                     {tab.label}
//                   </TabsTrigger>
//                 ))}
//               </TabsList>
//             </div>

//             {/* ✅ Tab Content */}
//             <TabsContent value="result">
//               <MoveNumberInput
//                 onClose={onClose}
//                 currentId={playerId}
//                 currentRank={selectedPlayer?.rank}
//                 setLoading={setLoading}
//                 selectedPlayer={selectedPlayer}
//               />
//             </TabsContent>

//             <TabsContent value="challenge">
//               <ChallengeNumberInput
//                 selectedPlayer={selectedPlayer}
//                 challengedPlayer={""}
//                 setChallengedPlayer={() => { }}
//                 userId={user?.id}
//               />
//             </TabsContent>

//             <TabsContent value="edit">
//               <EditPlayerDetails userId={playerId} onClose={onClose} />
//             </TabsContent>

//             <TabsContent value="load">
//               <PlayerImage userId={playerId} onClose={onClose} />
//             </TabsContent>

//             <TabsContent value="status">
//               <StatusPlayer playerId={playerId} onClose={onClose} />
//             </TabsContent>

//             <TabsContent value="stats">
//               <PlayerStatsBox userId={playerId} ladderId={ladder_id} />
//             </TabsContent>

//             <TabsContent value="bet">
//               <PlayerBet ladderId={ladder_id} selectedPlayer={selectedPlayer} />
//             </TabsContent>

//           </Tabs>
//         </motion.div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// ========================

// "use client";

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// // Import Select components for Mobile Tabs
// import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
// import { useDispatch, useSelector } from "react-redux";
// import { movePlayer, clearMoveResult } from "@/redux/slices/playerMovingSlice";
// import { toast } from "react-toastify";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
// import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
// import ChallengeNumberInput from "./ChallengeNumberInput";
// import MoveNumberInput from "./MoveNumberInput";
// import EditPlayerDetails from "./EditPlayerDetails";
// import PlayerImage from "./PlayerImage";
// import StatusPlayer from "./StatusPlayer";
// import PlayerStatsBox from "./PlayerStatsBox";
// import { ChevronDown } from "lucide-react";

// import PlayerBet from "./PlayerBet";

// export const EditPlayer = ({
//   open = true,
//   onClose = () => { },
//   currentId = null, // ✅ always pass player.id here
//   setLoading = () => { },
// }) => {
//   const dispatch = useDispatch();

//   const playerId = currentId ? Number(currentId) : null;

//   const user = useSelector((state) => state?.user?.user || {});
//   const ladder_id = user?.ladder_id;

//   const players =
//     useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];

//   const selectedPlayer =
//     players.length > 0 && playerId
//       ? players.find((p) => Number(p.id) === playerId)
//       : null;

//   useEffect(() => {
//     if (open && ladder_id) {
//       dispatch(fetchLeaderboard({ ladder_id }));
//     }
//   }, [dispatch, ladder_id, open]);

//   const { loading, error: moveError, result } =
//     useSelector((state) => state?.playerMoving) || {};

//   useEffect(() => {
//     if (result?.success_message) {
//       // toast.success(result.success_message); // Toast is better managed outside the component for global state
//       dispatch(clearMoveResult());
//     }
//     if (moveError) {
//       toast.error(moveError);
//       dispatch(clearMoveResult());
//     }
//   }, [result, moveError, dispatch]);

//   const [selectedTab, setSelectedTab] = useState("result");

//   const tabs = [
//     { value: "result", label: "Result" },
//     { value: "challenge", label: "Challenge" },
//     { value: "status", label: "Status" },
//     { value: "stats", label: "Stats" },
//     // { value: "bet", label: "Bet" },
//     { value: "edit", label: "Edit" },
//     { value: "load", label: "Upload" },
//   ];

//   // Function to handle Enter key press (Optional but good practice)
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       // Trigger the default action for the current tab, if any.
//       // Not strictly necessary here but useful in forms.
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       {/* ✅ Dark Mode Styling:
//         - bg-gray-900 for dark background.
//         - border-gray-700 for subtle border.
//         - max-w-4xl for larger modal on desktop.
//       */}
//       <DialogContent
//         className="min-w-full md:min-w-[700px] lg:min-w-[900px] border border-gray-700 bg-gray-900 text-gray-100 rounded-xl max-w-4xl "
//         onKeyDown={handleKeyDown}
//       >
//         <DialogTitle className="text-2xl font-bold text-violet-400 border-b border-gray-800 ">
//           {selectedPlayer ? `Edit Player: ${selectedPlayer.name} (Rank: ${selectedPlayer.rank})` : "Edit Player"}
//         </DialogTitle>

//         <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-2">

//           <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">

//             {/* ---------------------------------------------------------------------------------- */}
//             {/* ✅ Tabs List (Desktop/Tablet) */}
//             {/* ---------------------------------------------------------------------------------- */}
//             <div className="hidden sm:block">
//               <TabsList className="w-full flex justify-start h-auto  bg-gray-800 rounded-lg shadow-inner">
//                 {tabs.map((tab) => (
//                   <TabsTrigger
//                     key={tab.value}
//                     value={tab.value}
//                     // ✅ Premium Dark Mode Tabs Styling
//                     className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 rounded-md transition-all duration-300
//                                data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg
//                                hover:bg-gray-700 hover:text-white"
//                   >
//                     {tab.label}
//                   </TabsTrigger>
//                 ))}
//               </TabsList>
//             </div>

//             {/* ---------------------------------------------------------------------------------- */}
//             {/* ✅ Select Dropdown (Mobile View) */}
//             {/* ---------------------------------------------------------------------------------- */}
//             <div className="sm:hidden mb-4">
//               <Select value={selectedTab} onValueChange={setSelectedTab}>
//                 <SelectTrigger
//                   className="w-full bg-gray-800 text-white border-gray-700 focus:ring-violet-500 focus:border-violet-500 rounded-lg"
//                   icon={<ChevronDown className="h-4 w-4 opacity-70" />}
//                 >
//                   <SelectValue placeholder="Select Tab" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-gray-800 text-white border-gray-700">
//                   {tabs.map((tab) => (
//                     <SelectItem
//                       key={tab.value}
//                       value={tab.value}
//                       className="hover:bg-violet-600 focus:bg-violet-600 focus:text-white"
//                     >
//                       {tab.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* ---------------------------------------------------------------------------------- */}
//             {/* ✅ Tab Content */}
//             {/* ---------------------------------------------------------------------------------- */}
//             <div className="mt-4 p-4 bg-gray-800/70 border border-gray-700 rounded-xl shadow-2xl">
//               <TabsContent value="result">
//                 <MoveNumberInput
//                   onClose={onClose}
//                   currentId={playerId}
//                   currentRank={selectedPlayer?.rank}
//                   setLoading={setLoading}
//                   selectedPlayer={selectedPlayer}
//                 />
//               </TabsContent>

//               <TabsContent value="challenge">
//                 <ChallengeNumberInput
//                   selectedPlayer={selectedPlayer}
//                   challengedPlayer={""}
//                   setChallengedPlayer={() => { }}
//                   userId={user?.id}
//                 />
//               </TabsContent>

//               <TabsContent value="edit">
//                 <EditPlayerDetails userId={playerId} onClose={onClose} />
//               </TabsContent>

//               <TabsContent value="load">
//                 <PlayerImage userId={playerId} onClose={onClose} />
//               </TabsContent>

//               <TabsContent value="status">
//                 <StatusPlayer playerId={playerId} onClose={onClose} />
//               </TabsContent>

//               <TabsContent value="stats">
//                 <PlayerStatsBox userId={playerId} ladderId={ladder_id} />
//               </TabsContent>

//               {/* <TabsContent value="bet">
//                 <PlayerBet ladderId={ladder_id} selectedPlayer={selectedPlayer} />
//               </TabsContent> */}
//             </div>

//           </Tabs>
//         </motion.div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// final fix and optimized

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { clearMoveResult } from "@/redux/slices/playerMovingSlice";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import ChallengeNumberInput from "./ChallengeNumberInput";
import MoveNumberInput from "./MoveNumberInput";
import EditPlayerDetails from "./EditPlayerDetails";
import PlayerImage from "./PlayerImage";
import StatusPlayer from "./StatusPlayer";
import PlayerStatsBox from "./PlayerStatsBox";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const EditPlayer = ({
  open = true,
  onClose = () => {},
  currentId = null,
  setLoading = () => {},
}) => {
  const dispatch = useDispatch();

  const searchParams = useSearchParams()

  const ladder_id =
  searchParams.get("ladder_type")?.toLowerCase() || "minileague";

  const userData =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem("userData") ||
            localStorage.getItem("subAdmin") ||
            "{}",
        )
      : {};

  let userId = null;

  if (userData.user_type === "admin") {
     userId = userData.id || userData.user_id;
  } else if (userData.user_type === "sub_admin") {
    userId = userData.user_id;
  } else {
    userId = userData.id || null;
  }

  const playerId = currentId ? Number(currentId) : null;

  const playersStore = useSelector((state) => state.player?.players || {});
  const {
    loading,
    error: moveError,
    result,
  } = useSelector((state) => state?.playerMoving) || {};

  // ✅ FIND SELECTED PLAYER SAFELY
  const selectedPlayer = Object.values(playersStore)
    .flatMap((g) => g?.data || [])
    .find((p) => Number(p.id) === playerId);

  // ✅ CORRECT LADDER ID (REAL FIX)
  // const ladder_id = selectedPlayer?.ladder_id;

  // ✅ MODAL OPEN PAR LATEST DATA LOAD
  useEffect(() => {
    if (open && ladder_id) {
      dispatch(fetchLeaderboard({ ladder_id }));
    }
  }, [dispatch, ladder_id, open]);

  // ✅ 🔥 REAL-TIME UPDATE AFTER MOVE / RESULT
  useEffect(() => {
    if (result?.success_message) {
      toast.success(result.success_message);

      if (ladder_id) {
        dispatch(fetchLeaderboard({ ladder_id })); // ✅ INSTANT REFRESH
      }

      dispatch(clearMoveResult());
    }

    if (moveError) {
      toast.error(moveError);
      dispatch(clearMoveResult());
    }
  }, [result, moveError, dispatch, ladder_id]);

  const [selectedTab, setSelectedTab] = useState("result");

  const tabs = [
    { value: "result", label: "Result" },
    { value: "challenge", label: "Challenge" },
    // { value: "status", label: "Status" },
    { value: "stats", label: "Stats" },
    { value: "edit", label: "Edit" },
    { value: "load", label: "Upload" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-full md:min-w-[700px] lg:min-w-[900px] border border-gray-700 bg-gray-900 text-gray-100 rounded-xl max-w-4xl">
        <DialogTitle className="text-2xl font-bold text-violet-400 border-b border-gray-800">
          {selectedPlayer
            ? `Edit Player: ${selectedPlayer.name} (Rank: ${selectedPlayer.rank})`
            : "Edit Player"}
        </DialogTitle>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2"
        >
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            {/* ✅ DESKTOP TABS */}
            <div className="hidden sm:block">
              <TabsList className="w-full bg-gray-800 rounded-lg">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 px-4 py-2 text-sm text-gray-300 
                    data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* ✅ MOBILE DROPDOWN */}
            <div className="sm:hidden mb-4">
              <Select value={selectedTab} onValueChange={setSelectedTab}>
                <SelectTrigger className="w-full bg-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ TAB CONTENT */}
            <div className="mt-4 p-4 border border-gray-700 rounded-xl">
              <TabsContent value="result">
                <MoveNumberInput
                  onClose={onClose}
                  currentId={playerId}
                  currentRank={selectedPlayer?.rank}
                  setLoading={setLoading}
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                />
              </TabsContent>

              <TabsContent value="challenge">
                <ChallengeNumberInput
                  selectedPlayer={selectedPlayer}
                  userId={userId}
                />
              </TabsContent>

              <TabsContent value="edit">
                <EditPlayerDetails userId={playerId} onClose={onClose} />
              </TabsContent>

              <TabsContent value="load">
                <PlayerImage userId={playerId} onClose={onClose} />
              </TabsContent>

              {/* <TabsContent value="status">
                <StatusPlayer playerId={playerId} onClose={onClose} />
              </TabsContent> */}

              <TabsContent value="stats">
                <PlayerStatsBox userId={playerId} ladderId={ladder_id} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
