

// "use client";

// import { ToastContainer } from "react-toastify";
// import { useSelector, useDispatch } from "react-redux";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useSearchParams } from "next/navigation";

// import LadderRuleCardUser from "@/components/pages/users/LadderRuleCardUser";
// import UserHeading from "@/components/pages/users/UserHeading";
// import UserDetailsTypeUser from "@/components/shared/UserDetailsTypeUser";
// import ContactAdmin from "@/components/shared/ContactAdmin";
// import MinileaguePlayers from "@/components/pages/users/MinileaguePlayers";
// import InfoBar from "@/components/pages/users/InfoBar";
// import { Button } from "@/components/ui/button";
// import ActivityLogUser from "@/components/shared/ActivityLogUser";
// import PlayersList from "@/components/pages/users/PlayersList";
// import BasicLeaderboardUser from "@/components/pages/users/BasicLeaderboardUser";

// import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
// import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

// function UserPageRedirectRouter() {
//   const dispatch = useDispatch();
//   const searchParams = useSearchParams();

//   const [isLadderView, setIsLadderView] = useState(true);
//   const [isDesktop, setIsDesktop] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
 


//   // ---------------- GET USER FROM LOCALSTORAGE ----------------
//   useEffect(() => {
//   try {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   } catch (e) {
//     console.error("Invalid user in localStorage");
//   } finally {
//     setLoading(false); // important
//   }
// }, []);


//   // ---------------- SCREEN SIZE ----------------
//   useEffect(() => {
//     const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
//     checkScreen();
//     window.addEventListener("resize", checkScreen);
//     return () => window.removeEventListener("resize", checkScreen);
//   }, []);

//   // ---------------- REDUX (leaderboard / minileague only) ----------------
//   const playersState = useSelector((state) => state.players);
//   const miniLeagueState = useSelector((state) => state.minileague);

//   const loggedInUserId = user?.user_id;

//   // ---------------- URL PARAMS ----------------
//   const urlLadderId = searchParams.get("ladderId");
//   const urlLadderType = searchParams.get("ladder_type");

//   const ladderId = urlLadderId || user?.ladder_id;
//   const ladderType = urlLadderType || user?.ladder_type || "winlose"; // default

//   const isMiniLeague = ladderType === "minileague";
//   const isSkill = ladderType === "skill";

//   // ---------------- FETCH DATA ----------------
//   useEffect(() => {
//     if (!ladderId || !ladderType) return;

//     if (isMiniLeague) {
//       dispatch(fetchMiniLeague({ ladder_id: ladderId, type: "minileague" }));
//     } else {
//       dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
//     }
//   }, [dispatch, ladderId, ladderType, isMiniLeague]);

//   // ---------------- PLAYERS RENDER ----------------
//   const renderPlayers = () => {
//     if (isMiniLeague) {
//       return (
//         <MinileaguePlayers
//           ladderId={ladderId}
//           editableUserId={loggedInUserId}
//         />
//       );
//     }

//     if (isSkill) {
//       return <BasicLeaderboardUser ladderId={ladderId} />;
//     }

//     return (
//       <PlayersList
//         ladderId={ladderId}
//         editableUserId={loggedInUserId}
//       />
//     );
//   };

//   // ---------------- GUARDS ----------------
//   if (loading) {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
//       Loading your account…
//     </div>
//   );
// }

// if (!user) {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
//       User not found. Please login again.
//     </div>
//   );
// }


//   if (!ladderId) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
//         No ladder assigned. Please contact admin.
//       </div>
//     );
//   }

//   // ---------------- UI ----------------
//   return (
//     <div className="flex flex-col bg-gray-800 min-h-screen">
//       <header className="sticky top-0 z-50 backdrop-blur-md">
//         <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
//           <UserHeading />

//           <div className="flex items-center gap-36 md:gap-4 lg:gap-4 sm:gap-4">
//             <Button
//               size="sm"
//               onClick={() => setIsLadderView((v) => !v)}
//               className="py-2 px-3 bg-gray-700 shadow border-gray-700 text-white cursor-pointer"
//             >
//               {isLadderView ? "Ladder ON" : "Ladder OFF"}
//             </Button>

//             <UserDetailsTypeUser ladderType={ladderType} />
//           </div>
//         </div>
//       </header>

//       <div className="px-4 py-2">
//         <InfoBar />
//       </div>

//       <main className="flex flex-col lg:flex-row lg:w-full gap-4">
//         <AnimatePresence>
//           {isLadderView && (
//             <motion.div
//               key="ladder"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//               className="flex-1"
//             >
//               {renderPlayers()}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {(!isLadderView || isDesktop) && (
//             <motion.div
//               key="sidebar"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//               className="flex flex-col flex-1 gap-4"
//             >
//               <ContactAdmin />
//               <LadderRuleCardUser />
//               <ActivityLogUser ladderId={ladderId} />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>

//       <ToastContainer />
//     </div>
//   );
// }

// export default UserPageRedirectRouter;












// ================================ working old

"use client";

import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import LadderRuleCardUser from "@/components/pages/users/LadderRuleCardUser";
import UserHeading from "@/components/pages/users/UserHeading";
import UserDetailsTypeUser from "@/components/shared/UserDetailsTypeUser";
import ContactAdmin from "@/components/shared/ContactAdmin";
import MinileaguePlayers from "@/components/pages/users/MinileaguePlayers";
import InfoBar from "@/components/pages/users/InfoBar";
import { Button } from "@/components/ui/button";
import ActivityLogUser from "@/components/shared/ActivityLogUser";
import PlayersList from "@/components/pages/users/PlayersList";
import BasicLeaderboardUser from "@/components/pages/users/BasicLeaderboardUser";

import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

function UserPageRedirectRouter() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [isLadderView, setIsLadderView] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- GET USER FROM LOCALSTORAGE ----------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Invalid user in localStorage");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------- SCREEN SIZE ----------------
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ---------------- USER ID (only localStorage) ----------------
  const loggedInUserId = user?.user_id || user?.id || null;

  // ---------------- URL PARAMS ----------------
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type");

  const isMiniLeague = ladderType === "minileague";
  const isSkill = ladderType === "skill";

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    if (!ladderId || !ladderType) return;

    if (isMiniLeague) {
      dispatch(fetchMiniLeague({ ladder_id: Number(ladderId), type: "minileague" }));
    } else {
      dispatch(fetchLeaderboard({ ladder_id: Number(ladderId), type: ladderType }));
    }
  }, [dispatch, ladderId, ladderType, isMiniLeague]);

  // ---------------- PLAYERS RENDER ----------------
  const renderPlayers = () => {
    if (isMiniLeague) {
      return (
        <MinileaguePlayers
          ladderId={ladderId}
          editableUserId={loggedInUserId}
        />
      );
    }

    if (isSkill) {
      return <BasicLeaderboardUser ladderId={ladderId} />;
    }

    return (
      <PlayersList
        ladderId={ladderId}
        editableUserId={loggedInUserId}
      />
    );
  };

  // ---------------- GUARDS ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
        Loading your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
        User not found. Please login again.
      </div>
    );
  }

  if (!ladderId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
        No ladder selected.
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col bg-gray-800 min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-md">
        <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <UserHeading />

          <div className="flex items-center gap-4">
            <Button
              size="sm"
              onClick={() => setIsLadderView((v) => !v)}
              className="py-2 px-3 bg-gray-700 shadow border-gray-700 text-white cursor-pointer"
            >
              {isLadderView ? "Ladder ON" : "Ladder OFF"}
            </Button>

            <UserDetailsTypeUser ladderType={ladderType} />
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <InfoBar />
      </div>

      <main className="flex flex-col lg:flex-row lg:w-full gap-4">
        <AnimatePresence>
          {isLadderView && (
            <motion.div
              key="ladder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {renderPlayers()}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(!isLadderView || isDesktop) && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1 gap-4"
            >
              <ContactAdmin />
              <LadderRuleCardUser />
              <ActivityLogUser ladderId={ladderId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ToastContainer />
    </div>
  );
}

export default UserPageRedirectRouter;
