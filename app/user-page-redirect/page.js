"use client";

import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

import UserDetailsTypeUser from "@/components/shared/UserDetailsTypeUser";
import MinileaguePlayers from "@/components/pages/users/MinileaguePlayers";
import InfoBar from "@/components/pages/users/InfoBar";
import { Button } from "@/components/ui/button";
import PlayersList from "@/components/pages/users/PlayersList";
import BasicLeaderboardUser from "@/components/pages/users/BasicLeaderboardUser";
import RosterLeaderboardUser from "@/components/pages/users/RosterLeaderboardUser";
import InfoSection from "@/components/shared/InfoSection";
import { EditPlayer } from "@/components/shared/EditPlayer";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, XCircle } from "lucide-react";

import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import PositiveLeaderboard from "@/components/pages/players/PositiveLeaderBoard";
import PositiveLeaderboardUser from "@/components/pages/users/positiveLeaderBoardUser";
import NegativeLeaderboardUser from "@/components/pages/users/negativeLeaderBoardUser";
import MobileQuickActionsAndInvite from "@/components/shared/MobileQuickActionsAndInvite";

function UserPageRedirectRouter() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // ---------------- URL PARAMS ----------------
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type") || searchParams.get("type")

  const [isLadderView, setIsLadderView] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // User Action Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // ---------------- GET USER FROM LOCALSTORAGE ----------------
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
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
  const loggedInUserId = user?.id || (!isNaN(Number(user?.user_id)) ? Number(user?.user_id) : null);

  // Resolve current user rank from Redux
  const players =
    useSelector((state) => state.player?.players?.[Number(ladderId)]?.data) || [];
  const minileagueData = useSelector((state) => state.minileague?.data || []);
  const rosterData = useSelector((state) => state.rosterLeaderboard?.data || []);

  const currentUser = (() => {
    if (!loggedInUserId) return null;
    if (ladderType === "minileague") {
      for (let i = 0; i < minileagueData.length; i++) {
        const users = minileagueData[i]?.users_record || minileagueData[i]?.users || [];
        const found = users.find((p) => Number(p.id || p.user_id) === Number(loggedInUserId));
        if (found) return found;
      }
    } else if (ladderType === "roster") {
      return rosterData.find((p) => Number(p.id) === Number(loggedInUserId));
    } else {
      return players.find((p) => Number(p.id) === Number(loggedInUserId));
    }
    return null;
  })();

  const myRank = currentUser?.rank || "-";

  // Invite URL and User Quick Actions
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
    : "";

  const quickActions = [];
  if (loggedInUserId && currentUser) {
    quickActions.push({
      id: "leave-ladder",
      label: "Leave Ladder",
      icon: XCircle,
      tone: "danger",
      onClick: () => setIsLeaveDialogOpen(true),
    });
  }



  const isMiniLeague = ladderType === "minileague";
  const isSkill = ladderType === "skill";
  const isPositive = ladderType === "positive";
  const isNegative = ladderType === "negative";

  // ---------------- FETCH DATA REMOVED ----------------
  // Redundant fetch removed because child components (MinileaguePlayers, BasicLeaderboardUser, etc.) 
  // handle their own data fetching including specific filters like age and gender.

  const [extraActions, setExtraActions] = useState([]);

  // ---------------- PLAYERS RENDER ----------------
  const renderPlayers = () => {
    if (isMiniLeague) {
      return (
        <MinileaguePlayers
          ladderId={ladderId}
          editableUserId={loggedInUserId}
          onActionsChanged={setExtraActions}
        />
      );
    }

    if (isSkill) {
      return (
        <BasicLeaderboardUser
          ladderId={ladderId}
          onActionsChanged={setExtraActions}
        />
      );
    }

    if (isPositive) {
      return (
        <PositiveLeaderboardUser
          ladderId={ladderId}
          ladderType={ladderType}
          onActionsChanged={setExtraActions}
        />
      );
    }

    if (isNegative) {
      return (
        <NegativeLeaderboardUser
          ladderId={ladderId}
          ladderType={ladderType}
          onActionsChanged={setExtraActions}
        />
      );
    }

    const isRoster = ladderType === "roster";

    if (isRoster) {
      return (
        <RosterLeaderboardUser
          ladderId={ladderId}
          editableUserId={loggedInUserId}
        />
      );
    }

    return (
      <PlayersList
        ladderId={ladderId}
        ladderType={ladderType}
        editableUserId={loggedInUserId}
        onActionsChanged={setExtraActions}
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

  const baseActions = [];
  if (loggedInUserId) {
    baseActions.push({
      id: "leave-ladder",
      label: "Leave Ladder",
      icon: XCircle,
      tone: "danger",
      onClick: () => setIsLeaveDialogOpen(true),
    });
  }

  const mergedQuickActions = [...baseActions, ...extraActions];

  return (
    <div className="ladder-shell flex flex-col min-h-screen">
      <main className="w-full px-1 pb-6 sm:px-6 lg:px-10 py-4">
        <div className="grid items-start gap-6 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_360px] xl:grid-cols-[minmax(0,0.86fr)_400px]">
          <AnimatePresence>
            {isLadderView && (
              <motion.div
                key="ladder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
                <MobileQuickActionsAndInvite
                  inviteUrl={inviteUrl}
                  quickActions={mergedQuickActions}
                />
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
                className="flex flex-col gap-4 lg:sticky lg:top-[5.2rem] lg:self-start"
              >
                <InfoSection
                  userLevel={true}
                  ladderType={ladderType}
                  user={user}
                  inviteUrl={inviteUrl}
                  quickActions={mergedQuickActions}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>


      <ToastContainer />

      {isEditModalOpen && (
        <EditPlayer
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            if (ladderId && ladderType) {
              dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
            }
          }}
          currentId={loggedInUserId}
          ladder_id={ladderId}
          ladder_type={ladderType}
          userLevel={true}
        />
      )}

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <BasicLeaderboardUserRemove
            ladderId={ladderId}
            myRank={myRank}
            onClose={() => setIsLeaveDialogOpen(false)}
            onSuccessRefresh={() => {
              setIsLeaveDialogOpen(false);
              if (ladderId && ladderType) {
                dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserPageRedirectRouter;
