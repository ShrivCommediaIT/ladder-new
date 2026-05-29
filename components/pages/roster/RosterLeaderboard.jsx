"use client";
import { API_ENDPOINTS, IMAGE_BASE_URL } from "@/constants/api";

import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import Logo from "@/public/logo1.png";
import PlayerSearchInput from "../players/PlayerSearchInput";
import RedeemModal from "./RedeemModal";
import { getRequest } from "@/services/apiService";
import EditPlayer from "../../shared/EditPlayer";
import PlayerStatusToggle from "../../shared/PlayerStatusToggle";
import ControlsSection from "@/components/shared/ControlsSection";
import InfoSection from "@/components/shared/InfoSection";
import LadderPageLayout from "@/components/shared/LadderPageLayout";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import MobileQuickActionsAndInvite from "@/components/shared/MobileQuickActionsAndInvite";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, RotateCcw, XCircle } from "lucide-react";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import AgeFilter from "@/components/shared/AgeFilter";



const PlayerRankBadge = ({ rank, sizeClass = "h-12 w-12 sm:h-16 sm:w-16", imgSize = 64, textClass = "text-xs sm:text-sm" }) => {
  const rankNum = Number(rank);
  let src = "/ranksImg/rank.png";
  let scaleClass = "scale-[1.22] group-hover:scale-[1.34]";
  if (rankNum === 1) {
    src = "/ranksImg/rank-1.png";
    scaleClass = "scale-100 group-hover:scale-110";
  } else if (rankNum === 2) {
    src = "/ranksImg/rank-2.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  } else if (rankNum === 3) {
    src = "/ranksImg/rank-3.png";
    scaleClass = "scale-[1.15] group-hover:scale-[1.26]";
  }

  return (
    <div className={`relative flex shrink-0 items-center justify-center select-none ${sizeClass}`}>
      <Image
        src={src}
        alt={`Rank ${rank}`}
        width={imgSize}
        height={imgSize}
        className={`object-contain transition-transform duration-200 ${scaleClass} ${sizeClass}`}
        unoptimized
      />
      <span className={`absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] ${textClass}`}>
        {rank}
      </span>
    </div>
  );
};

// ✅ Player Card
const PlayerCard = ({ player, rank, onRedeemClick, onEditClick, currentUser }) => {

  const playerImageUrl = player.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  return (
    <div
      onClick={() => onEditClick(player)}
      className="mb-3 rounded-xl transition-all duration-200 group overflow-hidden cursor-pointer"
      style={{
        background: "var(--best-board-surface)",
        border: "1px solid var(--best-board-border-strong)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── TOP STRIP: toggle + status + age/gender chips ── */}
      <div
        className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2"
        style={{
          borderBottom: "1px solid var(--best-board-border)",
          background: "var(--secondary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={false} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player?.token_status && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full best-board-tag-soft"
            >
              Status: {player.token_status}
            </span>
          )}
          {player.age !== null && player.age !== undefined && player.age !== "" && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent"
            >
              Age : {player.age}
            </span>
          )}
          {!!player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent"
            >
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">

        {/* LEFT SECTION: rank badge + name/phone/tokens */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <PlayerRankBadge
              rank={rank}
              sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
              imgSize={56}
              textClass="text-[10px] sm:text-xs md:text-sm"
            />
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            {/* Player name */}
            <div
              className="text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight best-board-text"
            >
              {player?.name || "N/A"}
            </div>

            {/* Phone */}
            <div
              className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight best-board-muted"
            >
              {player?.phone || "N/A"}
            </div>

            {/* Tokens Section */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs best-board-muted">Today:</span>
                <span
                  className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded best-board-tag-soft"
                >
                  {player?.today_token ?? "0"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeemClick(player);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold text-xs sm:text-sm cursor-pointer underline decoration-cyan-400 decoration-[1.5px]"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT SECTION: total tokens badge + avatar ── */}
        <div
          className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total Tokens badge */}
          <div
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[48px] sm:w-[56px] md:w-[60px]"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-sm sm:text-base md:text-lg font-black leading-none w-full text-center truncate"
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_token ?? 0}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: "var(--best-board-muted)" }}
            >
              Tokens
            </span>
          </div>

          {/* Player avatar */}
          <div
            className="rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 w-[52px] h-[52px] sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
            style={{ border: "1px solid var(--best-board-border-strong)" }}
          >
            <Image
              src={playerImageUrl}
              alt={player?.name || "Player"}
              width={72}
              height={72}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              unoptimized
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT — ROSTER ONLY
const RosterLeaderboard = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const ladderType = searchParams.get("type");

  const { data, ladderDetails, gradebarDetails, loading, error } = useSelector(
    (state) => state.rosterLeaderboard,
  );
  const currentUser = useSelector((state) => state.user?.user);
  const activityState = useSelector((state) => state.activity);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editPlayerId, setEditPlayerId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSection, setMobileSection] = useState("players");
  const [contactOpen, setContactOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [addRemoveOpen, setAddRemoveOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("rank");
  const [appliedAge, setAppliedAge] = useState(0);
  const [appliedAgeType, setAppliedAgeType] = useState("");
  const [appliedGender, setAppliedGender] = useState("");
  const [ageFilterResetSignal, setAgeFilterResetSignal] = useState(0);
  const hasFilters = (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "");
  const refreshRef = useRef(false);
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=roster`
      : "";

  // ✅ Fetch roster leaderboard only
  const loadRoster = useCallback(() => {
    if (!ladderId ?? refreshRef.current) return;
    refreshRef.current = true;

    Promise.all([
      dispatch(
        fetchRosterLeaderboard({
          ladder_id: ladderId,
          ...(appliedAge > 0 ? { dob: appliedAge, age_type: appliedAgeType } : {}),
          ...(appliedGender ? { gender: appliedGender } : {}),
        }),
      ),
      dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })),
    ]).finally(() => {
      setTimeout(() => (refreshRef.current = false), 1000);
    });
  }, [ladderId, dispatch, appliedAge, appliedAgeType, appliedGender]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);


  // ✅ search + alphabet priority sort
  const cleaned = searchQuery;

  let working = data || [];

  // step 1 — filter if search present
  if (cleaned) {
    working = working.filter((p) => {
      const cleanName = (p.name || "").replace(/\s+/g, "").toLowerCase();
      return cleanName.includes(cleaned);
    });
  }

  // step 2 — unique
  const uniquePlayers = Array.from(
    new Map(working.map((p) => [p.id, p])).values(),
  );

  // step 3 — alphabet priority + token sort + rank sort
  const sortedPlayers = [...uniquePlayers]
    .sort((a, b) => {
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";

      // ⭐ priority: startsWith searched letter
      if (cleaned) {
        const aStarts = aName.startsWith(cleaned);
        const bStarts = bName.startsWith(cleaned);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }
      if (sortMode === "name") {
        return aName.localeCompare(bName);
      }
      return Number(a?.rank || 0) - Number(b?.rank || 0);
    });

  // Removed section chunking to display flat list of players

  const handleRedeemClick = async (player) => {
    setSelectedPlayer(player);
    setRedeemOpen(true);
    setLoadingHistory(true);

    try {
      const admin = JSON.parse(sessionStorage.getItem("adminDetails"));

      const res = await getRequest("/user/tokenHistory", {
        user_id: player.name,
        admin_id: admin.id
      });

      if (res.status === true) {
        setHistoryData(res.data || []);

      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error(err);
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleEditClick = (player) => {
    setEditPlayerId(player.id);
    setEditOpen(true);
  };

  const handleDeleteActivity = async (id) => {
    try {
      await getRequest(API_ENDPOINTS.ACTIVITY_DELETE, { id });
      dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  const handleResetBoard = async () => {
    try {
      await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
      toast.success("Leaderboard reset successfully.");
      setResetOpen(false);
      loadRoster();
    } catch (error) {
      toast.error("Failed to reset leaderboard.");
    }
  };

  const activityItems = activityState?.data?.data || [];
  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : 0;
    setAppliedAge(ageNum);
    setAppliedAgeType(ageType);
    setAppliedGender(gender);
  };

  const quickActions = [
    {
      id: "reset",
      label: "Reset",
      icon: RotateCcw,
      onClick: () => setResetOpen(true),
    },
    {
      id: "add-remove",
      label: "Add / Remove",
      icon: Plus,
      onClick: () => setAddRemoveOpen(true),
    },
    {
      id: "age-filter",
      node: (
        <AgeFilter
          onSearch={handleAgeSearch}
          user={false}
          resetSignal={ageFilterResetSignal}
          isActive={hasFilters}
        />
      ),
    },
    {
      id: "clear",
      label: "Clear All",
      icon: XCircle,
      tone: "danger",
      onClick: () => {
        setAppliedAge(0);
        setAppliedAgeType("");
        setAppliedGender("");
        setAgeFilterResetSignal((p) => p + 1);
      },
      hidden: !hasFilters,
    },
  ];


  return (
    <LadderPageLayout
      className="space-y-5"
      controls={
        <ControlsSection
          mobileSection={mobileSection}
          setMobileSection={setMobileSection}
          mobileSections={[
            { id: "toolbar", label: "Tools" },
            { id: "players", label: "Players" },
            { id: "info", label: "Info" },
          ]}
          resetOpen={resetOpen}
          setResetOpen={setResetOpen}
          addRemoveOpen={addRemoveOpen}
          setAddRemoveOpen={setAddRemoveOpen}
          refreshLeaderboard={loadRoster}
          ladderId={ladderId}
          sortMode={sortMode}
          setSortMode={setSortMode}
          sortOpen={sortOpen}
          setSortOpen={setSortOpen}
          filterOpen={false}
          setFilterOpen={() => { }}
          appliedAge={0}
          appliedGender=""
          groupSize={1}
          showFilter={false}
          showReset={false}
          showSort={false}
          showSectionSize={false}
        />
      }
      sidebar={
        <InfoSection
          mobileSection={mobileSection}
          ladderType="roster"
          user={currentUser}
          inviteUrl={inviteUrl}
          setContactOpen={setContactOpen}
          setResetOpen={setResetOpen}
          setAddRemoveOpen={setAddRemoveOpen}
          setSortOpen={setSortOpen}
          setFilterOpen={() => { }}
          activityItems={activityItems}
          handleDeleteActivity={handleDeleteActivity}
          contactOpen={contactOpen}
          resetOpen={resetOpen}
          handleResetBoard={handleResetBoard}
          resetDescription="This will reset the current roster data."
          quickActions={quickActions}
        />
      }
    >
      <ToastContainer />
      <div className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0`}>
        <MobileQuickActionsAndInvite inviteUrl={inviteUrl} quickActions={quickActions} />
        <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />

        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-16 w-full rounded-md" />
          ))}

        {error && <div className="mt-3 text-red-400">{error}</div>}

        {!loading && sortedPlayers.length === 0 ? (
          <div className="best-board-card mt-3 rounded-xl px-6 py-10 text-center font-bold text-[var(--best-board-muted)]">No players found</div>
        ) : (
          !loading && (
            <div className="space-y-3 mt-3">
              {sortedPlayers.map((player, i) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={player.rank || i + 1}
                  onRedeemClick={handleRedeemClick}
                  onEditClick={handleEditClick}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )
        )}
      </div>

      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        player={selectedPlayer}
        data={historyData}
        loading={loadingHistory}
        onRedeemSuccess={() => {
          handleRedeemClick(selectedPlayer);
          loadRoster();
        }}
      />

      {/* Edit Player Modal */}
      <EditPlayer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentId={editPlayerId}
        ladderId={ladderId}
        ladder_type="roster"
      />

      {/* Add / Remove Dialog */}
      <Dialog open={addRemoveOpen} onOpenChange={setAddRemoveOpen}>
        <DialogContent className="best-board-card border-[var(--best-board-border)] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add / Remove Players</DialogTitle>
          </DialogHeader>
          <AddRemoveBox
            ladderId={ladderId}
            onSuccessRefresh={() => {
              setAddRemoveOpen(false);
              loadRoster();
            }}
          />
        </DialogContent>
      </Dialog>
    </LadderPageLayout>

  );
};

export default RosterLeaderboard;
