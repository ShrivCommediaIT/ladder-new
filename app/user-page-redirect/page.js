"use client";

import { ToastContainer, toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { getRequest } from "@/services/apiService";
import { setUser } from "@/redux/slices/userSlice";

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
  const router = useRouter();

  // ---------------- URL PARAMS ----------------
  const ladderId = searchParams.get("ladder_id");
  const ladderType = searchParams.get("ladder_type") || searchParams.get("type")

  const [mobileSection, setMobileSection] = useState("players");
  const [isDesktop, setIsDesktop] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isIframe, setIsIframe] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // User Action Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // ---------------- FRAME BREAKOUT & CENTRALIZED PAYMENT RETURN ----------------
  useEffect(() => {
    if (typeof window !== "undefined" && window.top !== window.self) {
      setIsIframe(true);
    }
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    const paymentSuccess = searchParams.get("payment_success");
    const isSuccess = paymentStatus === "success" || paymentSuccess === "true";

    // Only handle payment completion in page.js if it is NOT the main tab redirect.
    // Main tab redirects are handled directly by the leaderboard components to preserve score posting.
    const isMainTabRedirect = typeof window !== "undefined" && !window.opener && window.top === window.self;

    if (isSuccess && typeof window !== "undefined" && !isMainTabRedirect && !paymentProcessing) {
      setPaymentProcessing(true);

      const processPaymentCompletion = async () => {
        toast.info("Payment completed! Updating status...");
        
        let parsedUser = null;
        try {
          const storedUser = sessionStorage.getItem("user") || localStorage.getItem("paypal_user_backup");
          if (storedUser) {
            parsedUser = JSON.parse(storedUser);
          }
        } catch (e) {
          console.error("Failed to parse user session", e);
        }

        if (parsedUser && parsedUser.id) {
          try {
            await getRequest("/user/updatePlayerPaymentStatus", {
              payment_status: 1,
              id: parsedUser.id,
              user_id: parsedUser.user_id || parsedUser.id
            });

            parsedUser.payment_status = 1;
            sessionStorage.setItem("user", JSON.stringify(parsedUser));
            localStorage.setItem("paypal_user_backup", JSON.stringify(parsedUser));
            dispatch(setUser(parsedUser));
            toast.success("Payment status updated successfully!");
          } catch (e) {
            console.error("Failed to update status on return redirect", e);
          }
        }

        // Broadcast success to parent tab
        try {
          const channel = new BroadcastChannel("paypal_payment_channel");
          channel.postMessage({ status: "success" });
          channel.close();
        } catch (e) {
          console.error("Failed to post message to BroadcastChannel:", e);
        }

        // Clean up URL query parameters so we don't trigger success again
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("payment_status");
          url.searchParams.delete("payment_success");
          window.history.replaceState({}, document.title, url.toString());
        }

        // If running in a separate tab or popup (not inside an iframe), close it or set processing to false as fallback
        if (window.top === window.self) {
          setTimeout(() => {
            try {
              window.close();
            } catch (err) {
              console.error("Failed to close window", err);
            }
            // Set processing to false as a fallback so the main tab renders the leaderboard!
            setPaymentProcessing(false);
          }, 1500);
        } else {
          // If it's inside an iframe, just set processing to false (it will be closed by the parent tab anyway)
          setPaymentProcessing(false);
        }
      };

      processPaymentCompletion();
    }
  }, [searchParams, dispatch, paymentProcessing]);

  // ---------------- REDIRECT FALLBACK FOR PAYPAL RETURN ----------------
  useEffect(() => {
    if (!ladderId) {
      try {
        let finalLadderId = null;
        let finalLadderType = null;

        if (typeof window !== "undefined") {
          finalLadderId = localStorage.getItem("paypal_redirect_ladder_id");
          finalLadderType = localStorage.getItem("paypal_redirect_ladder_type");
        }

        if (!finalLadderId || !finalLadderType) {
          const storedUser = sessionStorage.getItem("user") || (typeof window !== "undefined" ? localStorage.getItem("paypal_user_backup") : null);
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            finalLadderId = parsed.ladder_id;
            finalLadderType = parsed.ladder_type;
          }
        }

        if (finalLadderId && finalLadderType) {
          const paymentStatus = searchParams.get("payment_status");
          const paymentSuccess = searchParams.get("payment_success");
          let target = `/user-page-redirect?ladder_id=${finalLadderId}&ladder_type=${finalLadderType}`;
          if (paymentStatus) target += `&payment_status=${paymentStatus}`;
          if (paymentSuccess) target += `&payment_success=${paymentSuccess}`;
          router.replace(target);
        }
      } catch (e) {
        console.error("Redirect fallback error", e);
      }
    }
  }, [ladderId, searchParams, router]);

  // ---------------- GET USER FROM LOCALSTORAGE ----------------
  useEffect(() => {
    try {
      let storedUser = sessionStorage.getItem("user");
      if (!storedUser && typeof window !== "undefined") {
        storedUser = localStorage.getItem("paypal_user_backup");
        if (storedUser) {
          sessionStorage.setItem("user", storedUser);
        }
      }
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

  // Resolve current user rank from Redux based on active ladder type
  const winlosePlayers = useSelector((state) => state.player?.players?.[Number(ladderId)]?.data) || [];
  const positivePlayers = useSelector((state) => state.positiveLeaderBoard?.data) || [];
  const negativePlayers = useSelector((state) => state.negativeLeaderBoard?.data) || [];
  const skillPlayers = useSelector((state) => state.skillLeaderboard?.data) || [];
  const rosterPlayers = useSelector((state) => state.rosterLeaderboard?.data) || [];
  const minileagueData = useSelector((state) => state.minileague?.data || []);

  const players = (() => {
    if (ladderType === "positive") return positivePlayers;
    if (ladderType === "negative") return negativePlayers;
    if (ladderType === "skill") return skillPlayers;
    if (ladderType === "roster") return rosterPlayers;
    return winlosePlayers;
  })();

  const currentUser = (() => {
    if (!loggedInUserId) return null;
    if (ladderType === "minileague") {
      for (let i = 0; i < minileagueData.length; i++) {
        const users = minileagueData[i]?.users_record || minileagueData[i]?.users || [];
        const found = users.find((p) => Number(p.id || p.user_id) === Number(loggedInUserId));
        if (found) return found;
      }
    } else {
      return players.find(
        (p) =>
          Number(p.id) === Number(loggedInUserId) ||
          (p.user_id && Number(p.user_id) === Number(loggedInUserId))
      );
    }
    return null;
  })();

  const myRank = (() => {
    if (!currentUser) return "-";
    if (currentUser.rank) return currentUser.rank;
    
    if (ladderType === "minileague") {
      for (let i = 0; i < minileagueData.length; i++) {
        const users = minileagueData[i]?.users_record || minileagueData[i]?.users || [];
        const idx = users.findIndex((p) => Number(p.id || p.user_id) === Number(loggedInUserId));
        if (idx !== -1) return idx + 1;
      }
    } else {
      const idx = players.findIndex(
        (p) =>
          Number(p.id) === Number(loggedInUserId) ||
          (p.user_id && Number(p.user_id) === Number(loggedInUserId))
      );
      if (idx !== -1) return idx + 1;
    }
    return "-";
  })();

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
  if (isIframe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4 text-center">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-lg font-medium">Processing payment completion...</p>
          <p className="text-sm text-gray-400">This window will close automatically shortly.</p>
        </div>
      </div>
    );
  }

  if (paymentProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4 text-center">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-lg font-medium text-green-400">Payment Completed Successfully!</p>
          <p className="text-sm text-gray-400">Updating status and returning to game tab...</p>
          <button
            onClick={() => {
              try {
                window.close();
              } catch (e) {
                console.error("Manual close blocked:", e);
              }
            }}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition cursor-pointer"
          >
            Close Tab
          </button>
        </div>
      </div>
    );
  }

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
        {/* Mobile/Tablet tab switcher */}
        <div className="mb-4 flex gap-2 lg:hidden mt-5">
          {[
            { id: "players", label: "Players" },
            { id: "info", label: "Info" },
          ].map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setMobileSection(section.id)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${mobileSection === section.id
                  ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] text-white font-semibold"
                  : "border-[var(--best-board-border)] bg-[var(--best-board-surface)] text-[var(--best-board-text)] hover:bg-[var(--best-board-surface-soft)]"
                }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="grid items-start gap-6 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_360px] xl:grid-cols-[minmax(0,0.86fr)_400px]">
          <AnimatePresence>
            {(mobileSection === "players" || isDesktop) && (
              <motion.div
                key="ladder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
                <MobileQuickActionsAndInvite
                  // inviteUrl={inviteUrl}
                  quickActions={mergedQuickActions}
                />
                {renderPlayers()}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(mobileSection === "info" || isDesktop) && (
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
                  mobileSection={mobileSection}
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
            ladderType={ladderType}
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
