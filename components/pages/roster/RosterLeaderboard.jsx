"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
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
        <PlayerStatusToggle player={player} user={false} showTokenStatus={true} />

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {player.age !== null && player.age !== undefined && player.age !== "" && (
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent">
              Age : {player.age}
            </span>
          )}
          {!!player.gender && (
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent">
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
          {player.country && (
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap best-board-tag-accent">
              {player.country}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">

        {/* LEFT SECTION: rank badge + name/phone/tokens */}
        <div className="flex items-stretch sm:items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
          <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
            {/* MOBILE: flat color rank box, no icon/image */}
            <div
              className="sm:hidden flex items-center justify-center h-12 w-12 rounded-lg"
              style={{ background: "var(--best-board-highlight)" }}
            >
              <span
                className="text-xl font-black leading-none"
                style={{ color: "var(--best-board-surface)" }}
              >
                {rank}
              </span>
            </div>

            {/* DESKTOP/TABLET: original badge component, unchanged */}
            <div className="hidden sm:block">
              <PlayerRankBadge
                rank={rank}
                sizeClass="h-12 w-12 md:h-14 md:w-14"
                imgSize={56}
                textClass="text-xs md:text-sm"
              />
            </div>
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            {/* Player name */}
            <div className="text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight best-board-text">
              {player?.name || "N/A"}
            </div>

            {/* Phone */}
            <div className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight best-board-muted">
              {player?.phone || "N/A"}
            </div>

            {/* Tokens — MOBILE: stacked Today/redeem + Today/total rows */}
            <div className="flex flex-col gap-1 sm:hidden">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeemClick(player);
                }}
              >
                <span className="text-[10px] best-board-muted">Today:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded best-board-tag-soft">
                  {player?.today_token ?? "0"}
                </span>
                <span className="text-[10px] font-bold text-cyan-400">to redeem</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] best-board-muted">Today:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded best-board-tag-soft">
                  {player?.total_token ?? 0}
                </span>
                <span className="text-[10px] best-board-muted">In Total</span>
              </div>
            </div>

            {/* Tokens — DESKTOP/TABLET: original single row + Redeem link */}
            <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs best-board-muted">Today:</span>
                <span className="text-sm font-bold px-2 py-0.5 rounded best-board-tag-soft">
                  {player?.today_token ?? "0"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeemClick(player);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold text-sm cursor-pointer underline decoration-cyan-400 decoration-[1.5px]"
              >
                Redeem
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT SECTION: total tokens badge + avatar ── */}
        <div
          className="flex flex-col items-stretch sm:items-center justify-center sm:justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total Tokens badge — desktop/tablet only, folded into the left rows on mobile */}
          <div
            className="hidden sm:flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[48px] sm:w-[56px] md:w-[60px]"
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

          {/* Player avatar — real photo on every breakpoint, just resized for mobile */}
          <div
            className="rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 w-20 h-full sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
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
  const [appliedCountry, setAppliedCountry] = useState("");
  const [ageFilterResetSignal, setAgeFilterResetSignal] = useState(0);
  const hasFilters = (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "") || (appliedCountry && appliedCountry !== "");
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
          ...(appliedCountry ? { country: appliedCountry } : {}),
        }),
      ),
      dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })),
    ]).finally(() => {
      setTimeout(() => (refreshRef.current = false), 1000);
    });
  }, [ladderId, dispatch, appliedAge, appliedAgeType, appliedGender, appliedCountry]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);


  // ✅ search + alphabet priority sort
  const cleaned = (searchQuery || "").replace(/\s+/g, "").toLowerCase();

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
  const handleAgeSearch = (age, ageType, gender, country) => {
    const ageNum = age ? Number(age) : 0;
    setAppliedAge(ageNum);
    setAppliedAgeType(ageType);
    setAppliedGender(gender);
    setAppliedCountry(country || "");
  };

  const quickActions = [
    {
      id: "age-filter",
      node: (
        <AgeFilter
          onSearch={handleAgeSearch}
          user={false}
          resetSignal={ageFilterResetSignal}
          isActive={hasFilters}
          defaultAge={appliedAge}
          defaultAgeType={appliedAgeType}
          defaultGender={appliedGender}
          defaultCountry={appliedCountry}
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
        setAppliedCountry("");
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
