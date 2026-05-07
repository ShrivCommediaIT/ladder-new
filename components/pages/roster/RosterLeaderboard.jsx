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
import LadderLinkPanel from "../players/LadderLinkPanel";
import RedeemModal from "./RedeemModal";
import { getRequest } from "@/services/apiService";
import EditPlayer from "../../shared/EditPlayer";
import PlayerStatusToggle from "../../shared/PlayerStatusToggle";
import ControlsSection from "@/components/shared/ControlsSection";
import InfoSection from "@/components/shared/InfoSection";
import LadderPageLayout from "@/components/shared/LadderPageLayout";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Filter, Plus } from "lucide-react";

const FilterDialog = ({
  open,
  onOpenChange,
  defaultAge,
  defaultAgeType,
  defaultGender,
  onApply,
  onClear,
}) => {
  const [age, setAge] = useState(defaultAge ? String(defaultAge) : "");
  const [ageType, setAgeType] = useState(defaultAgeType || "");
  const [gender, setGender] = useState(defaultGender || "");

  useEffect(() => {
    if (open) {
      setAge(defaultAge ? String(defaultAge) : "");
      setAgeType(defaultAgeType || "");
      setGender(defaultGender || "");
    }
  }, [defaultAge, defaultAgeType, defaultGender, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="best-board-card border-[var(--best-board-border)] text-[var(--best-board-text)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Age / Gender Filter</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-semibold">Gender</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setGender((current) => (current === item.value ? "" : item.value))}
                  className={`rounded-lg border px-4 py-2 text-sm ${gender === item.value
                    ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)]"
                    : "border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)]"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Age Type</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Under", value: "under" },
                { label: "Over", value: "over" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setAgeType((current) => (current === item.value ? "" : item.value))}
                  className={`rounded-lg border px-4 py-2 text-sm ${ageType === item.value
                    ? "border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)]"
                    : "border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)]"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Age</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="Enter age"
              className="w-full rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setAge("");
                setAgeType("");
                setGender("");
                onClear();
                onOpenChange(false);
              }}
              className="flex-1 rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] px-4 py-2 text-sm font-medium"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                if (age && !ageType) {
                  toast.error("Select age type first.");
                  return;
                }
                if (!age && !gender) {
                  toast.error("Choose at least one filter.");
                  return;
                }
                onApply(age ? Number(age) : 0, ageType, gender);
                onOpenChange(false);
              }}
              className="flex-1 rounded-lg border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-4 py-2 text-sm font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      className="best-board-card mb-3 flex cursor-pointer flex-col overflow-hidden rounded-lg border border-[var(--best-board-border-strong)] bg-[var(--best-board-surface)] transition-colors hover:bg-[var(--best-board-surface-soft)]"
    >
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={false} />
      </div>

      <div className="flex items-center justify-between px-3 py-4">
        {/* ===== DESKTOP VIEW (1024px+) ===== */}
        <div className="hidden md:flex items-center w-full">
          {/* Rank + Name */}
          <div className="flex gap-3 items-center flex-shrink-0 w-[35%]">
            {/* Avatar */}
            <div className="flex-shrink-0 flex justify-end">
              <div className="w-10 h-10 rounded border border-[#4eb0a2] flex items-center justify-center overflow-hidden flex-shrink-0">
                {playerImageUrl ? (
                  <Image src={playerImageUrl} alt={player.name} width={40} height={40} className="object-cover" unoptimized />
                ) : (
                  <div className="text-[#48aaa8] text-[9px] text-center leading-tight font-medium">your<br />avatar</div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center min-w-0">
                <div className="text-white font-semibold text-sm truncate">{player?.name ?? "N/A"}</div>
                {player?.age && (
                  <div className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-5">
                    {player.age}
                  </div>
                )}
                 {player.gender && (
                  <p className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-1">
                    {player.gender == "male" ?"M":"F"}
                  </p>
                )}
              </div>
              <div className="text-gray-300 text-xs truncate flex items-center gap-2">
                <span>{player?.phone ?? "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Status + Tokens */}
          <div className="flex flex-col gap-1 flex-shrink-0 w-[35%]">
            <div className="border border-white text-white text-xs px-2 py-0.5 w-fit">
              {"status : " + player?.token_status ?? "Status: Club Icon"}
            </div>
            <div className="text-white text-sm">
              Tokens - {player?.today_token ?? "N/A"}{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRedeemClick(player);
                }}
                className="text-[#48aaa8] font-semibold cursor-pointer hover:underline"
              >
                Redeem
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex-shrink-0 w-[15%] text-white text-xs">
            Total = {player?.total_token ?? "N/A"}
          </div>

          <div className="w-8 h-8 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
            {rank}
          </div>

        </div>

        {/* ===== MOBILE / TABLET VIEW (below 1024px) ===== */}
        <div className="flex md:hidden items-center justify-between w-full gap-2">

          {/* Left: Rank + Name + Phone + Redeem */}
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-1">
              {rank}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="border border-white text-white text-[10px] px-1.5 py-0.5 w-fit mb-1 leading-tight">
                {"status : " + player?.token_status ?? "Status: Club Legend"}
              </div>
              <div className="flex items-center min-w-0">
                <div className="text-white font-bold text-xs truncate">{player?.name ?? "N/A"}</div>
                {player?.age && (
                  <div className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit ml-2">
                    {player.age}
                  </div>
                )}
              </div>
              <div className="text-gray-300 text-[10px] truncate flex items-center gap-1.5">
                <span>{player?.phone ?? "N/A"}</span>
              </div>
              <div className="text-white text-[11px] mt-0.5">
                {player?.today_token ?? "N/A"} to{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRedeemClick(player);
                  }}
                  className="text-[#48aaa8] font-semibold cursor-pointer hover:underline"
                >
                  Redeem
                </span>
              </div>
            </div>
          </div>

          {/* Center: Total Tokens */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="text-white text-[10px] font-medium text-center leading-tight">Total<br />Tokens</div>
            <div className="bg-white text-black font-bold text-base px-3 py-0.5 mt-1 min-w-[44px] text-center rounded-sm">
              {player?.total_token ?? "N/A"}
            </div>
          </div>

          {/* Right: Avatar */}
          <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
            {playerImageUrl ? (
              <Image src={playerImageUrl} alt={player.name} width={44} height={44} className="object-cover" unoptimized />
            ) : (
              <div className="text-[#48aaa8] text-[9px] text-center leading-tight font-medium">your<br />avatar</div>
            )}
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
  const cleaned = searchQuery.toLowerCase().trim();

  let working = data || [];

  // step 1 — filter if search present
  if (cleaned) {
    working = working.filter((p) =>
      p.name?.toLowerCase().includes(cleaned),
    );
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

  // ✅ group by gradebar preset (roster section)
  const groupSize = 6;

  const sections = [];
  for (let i = 0; i < sortedPlayers.length; i += groupSize) {
    sections.push({
      label:
        gradebarDetails?.[i / groupSize]?.gradebar_name ||
        `Section ${i / groupSize + 1}`,
      players: sortedPlayers.slice(i, i + groupSize),
    });
  }

  const handleRedeemClick = async (player) => {
    setSelectedPlayer(player);
    setRedeemOpen(true);
    setLoadingHistory(true);

    try {
      const admin = JSON.parse(sessionStorage.getItem("adminDetails"));

      const data = await getRequest("/user/tokenHistory", {
        user_id: player.name,
        admin_id: admin.id
      });

      if (data.status === true) {
        setHistoryData(data.data || []);
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

  const activityItems = activityState?.data?.data || [];
  const quickActions = [
    {
      id: "add-remove",
      label: "Add / Remove",
      icon: Plus,
      onClick: () => setAddRemoveOpen(true),
    },
    {
      id: "filter",
      label: "Filter",
      icon: Filter,
      onClick: () => setFilterOpen(true),
      tone: appliedAge || appliedGender ? "accent" : "default",
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
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        appliedAge={appliedAge}
        appliedGender={appliedGender}
        groupSize={1}
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
          setFilterOpen={() => {}}
          activityItems={activityItems}
          handleDeleteActivity={handleDeleteActivity}
          contactOpen={contactOpen}
          resetOpen={resetOpen}
          handleResetBoard={() => {}}
          resetDescription="This roster view does not support a full ladder reset from this screen."
          quickActions={quickActions}
        />
      }
    >
      <ToastContainer />
        <div className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0`}>
          <div>
            <LadderLinkPanel ladderId={ladderId} ladderType={ladderType} />
          </div>

          <input
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-3 w-full rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface)] px-3 py-2 text-[var(--best-board-text)]"
          />

          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="mt-3 h-16 w-full rounded-md" />
            ))}

          {error && <div className="mt-3 text-red-400">{error}</div>}

          {!loading && sections.length === 0 ? (
            <div className="best-board-card mt-3 rounded-xl px-6 py-10 text-center font-bold text-[var(--best-board-muted)]">No players found</div>
          ) : (
            !loading &&
            sections.map((section, idx) => (
              <div key={idx} className="mt-3">
                {section.players.map((player, i) => (
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
            )))}
        </div>
      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        defaultAge={appliedAge}
        defaultAgeType={appliedAgeType}
        defaultGender={appliedGender}
        onApply={(age, ageType, gender) => {
          setAppliedAge(age);
          setAppliedAgeType(ageType);
          setAppliedGender(gender);
        }}
        onClear={() => {
          setAppliedAge(0);
          setAppliedAgeType("");
          setAppliedGender("");
        }}
      />
      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        player={selectedPlayer}
        history={historyData}
        loading={loadingHistory}
      />

      {/* Edit Player Modal */}
      <EditPlayer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        currentId={editPlayerId}
        ladderId={ladderId}
      />
    </LadderPageLayout>

  );
};

export default RosterLeaderboard;
