"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";
import { IMAGE_BASE_URL } from "@/constants/api";

import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMiniLeague, setAgeFilter } from "@/redux/slices/minileagueSlice";
import { setSelectedPlayer } from "@/redux/slices/leaderboardSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { MinileagueEditPlayer } from "./MinileagueEditPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { postWithParams } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import PlayerSearchInput from "./PlayerSearchInput";
import ControlsSection from "@/components/shared/ControlsSection";
import InfoSection from "@/components/shared/InfoSection";
import LadderPageLayout from "@/components/shared/LadderPageLayout";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { getRequest } from "@/services/apiService";
import { Plus, RotateCcw, XCircle } from "lucide-react";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import AgeFilter from "@/components/shared/AgeFilter";
import MobileQuickActionsAndInvite from "@/components/shared/MobileQuickActionsAndInvite";

/* ================= Rank Badge ================= */


/* ================= Player Card ================= */
const PlayerCard = ({
  player,
  rank,
  canEdit,
  isBlank,
  onEdit,
  groupSize,
  currentUser,
}) => {
  if (isBlank) {
    return (
      <div className="flex items-center justify-center min-h-[12vh] sm:min-h-[15vh] px-2 py-2 mb-3 rounded-xl bg-[var(--best-board-surface)] border-2 border-dashed border-[var(--best-board-border-strong)]" />
    );
  }

  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  const sectionStartRank = Math.floor((rank - 1) / groupSize) * groupSize + 1;
  const currentSectionRanks = Array.from(
    { length: groupSize },
    (_, i) => sectionStartRank + i
  );

  return (
    <div
      onClick={() => onEdit(player)}
      className="mb-3 cursor-pointer rounded-xl transition-all duration-200 group overflow-hidden bg-[var(--best-board-surface)] border border-[var(--best-board-border-strong)] shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
    >
      {/* ── TOP STRIP: toggle + age/gender chips ── */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-1.5 gap-2 border-b border-[var(--best-board-border)] bg-primary">
        {/* PlayerStatusToggle */}
        <PlayerStatusToggle player={player} user={false} />

        {/* Age + gender chips */}
        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
          {player.age !== null && player.age !== undefined && player.age !== "" && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-white text-dark-theme border border-white/20"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Age : {player.age}
            </span>
          )}
          {player.gender && (
            <span
              className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-white text-dark-theme border border-white/20"
              style={{
                background: "var(--best-board-accent-soft)",
                color: "white",
                border: "1px solid var(--best-board-border-strong)",
              }}
            >
              Gender: {player.gender === "male" ? "M" : "F"}
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="flex items-stretch px-2 sm:px-3 py-2 sm:py-2.5 gap-2 sm:gap-3">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">

          <PlayerRankBadge
            rank={rank}
            sizeClass="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
            imgSize={56}
            textClass="text-[10px] sm:text-xs md:text-sm"
          />

          <div className="flex-1 min-w-0">
            {/* Player name */}
            <div className="text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight text-[var(--best-board-text)]">
              {player?.name || "N/A"}
            </div>

            {/* Phone / ID */}
            <div className="text-[10px] sm:text-xs truncate mb-1.5 sm:mb-2 leading-tight text-[var(--best-board-muted)]">
              {player?.phone || "N/A"}
            </div>

            {/* GW RANK NUMBER ROW */}
            <div className="flex gap-0.5 sm:gap-1 mb-1 overflow-x-auto pb-0.5 scrollbar-none">
              {currentSectionRanks.map((r) => (
                <div
                  key={r}
                  className="w-6 h-5 sm:w-7 sm:h-6 flex-shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold rounded transition-colors bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]"
                >
                  {r}
                </div>
              ))}
            </div>

            {/* GW POINTS RESULT ROW */}
            <div className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {currentSectionRanks.map((r) => {
                const found = player.result_details?.find(
                  (i) => Number(i.rank) === Number(r)
                );
                return (
                  <div
                    key={r}
                    className={`w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center rounded text-[9px] sm:text-xs font-bold transition-all ${found
                        ? "bg-[var(--best-board-surface-strong)] border border-[var(--best-board-border-strong)] text-[var(--best-board-text)] shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
                        : "bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] text-[var(--best-board-muted)]"
                      }`}
                  >
                    {found?.point ?? ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: points badge + avatar */}
        <div
          className="flex flex-col items-center justify-between gap-1.5 sm:gap-2 pl-2 sm:pl-3 flex-shrink-0"
          style={{ borderLeft: "1px solid var(--best-board-border)" }}
        >
          {/* Total Points badge */}
               <span
              className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: "var(--best-board-muted)" }}
            >
              Total Points
            </span>
          <div
            className="flex flex-col items-center justify-center rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 w-[44px] sm:w-[52px] md:w-[72px] h-10"
            style={{
              background: "var(--best-board-accent-soft)",
              border: "1px solid var(--best-board-border-strong)",
            }}
          >
            <span
              className="text-[7px]  md:text-[10px] font-black leading-none w-full text-center truncate "
              style={{ color: "var(--best-board-highlight)" }}
            >
              {player?.total_point || 0}
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

/* ================= Main Component (unchanged) ================= */
const MinileaguePlayers = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");

  const ladderType = "minileague";

  const user = useSelector((state) => state.user?.user);
  const activityState = useSelector((state) => state.activity);
  const {
    data: sectionedPlayers,
    appliedAge,
    appliedAgeType,
    appliedGender,
  } = useSelector((state) => state.minileague || {});

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayerLocal, setSelectedPlayerLocal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isRefreshingRef = useRef(false);
  const [mobileSection, setMobileSection] = useState("players");
  const [contactOpen, setContactOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [addRemoveOpen, setAddRemoveOpen] = useState(false);
  const [ageFilterResetSignal, setAgeFilterResetSignal] = useState(0);
  const hasFilters =
    (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "");
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
      : "";

  const [sectionSize, setSectionSize] = useState(7);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [currentSectionName, setCurrentSectionName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionSize, setNewSectionSize] = useState(7);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.id) dispatch(fetchUserProfile(user.id));
  }, [user, dispatch]);

  const refreshLeaderboard = useCallback(async () => {
    if (!ladderId || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setLoadingPlayers(true);
    const payload = { ladder_id: ladderId, type: "minileague" };
    if (appliedAge > 0) {
      payload.dob = appliedAge;
      payload.age_type = appliedAgeType;
    }
    if (appliedGender) payload.gender = appliedGender;
    try {
      await Promise.all([
        dispatch(fetchMiniLeague(payload)),
        dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })),
      ]);
    } finally {
      setLoadingPlayers(false);
      isRefreshingRef.current = false;
    }
  }, [ladderId, dispatch, appliedAge, appliedAgeType, appliedGender]);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleEditPlayer = useCallback(
    (player) => {
      dispatch(
        setSelectedPlayer({
          ...player,
          sectionIndex: player.sectionIndex ?? 0,
          ladder_id: Number(ladderId),
        })
      );
      setSelectedPlayerLocal(player);
      setIsOpen(true);
    },
    [ladderId, dispatch]
  );

  const updateSectionName = async (currentName, updateName) => {
    try {
      const res = await postWithParams(
        API_ENDPOINTS.MINILEAGUE_UPDATE_GRADEBAR_NAME,
        {
          ladder_id: ladderId,
          current_name: currentName,
          update_name: updateName,
        }
      );
      if (res?.status) refreshLeaderboard();
    } catch (error) {
      console.error(error);
    }
  };

  const processedSections = sectionedPlayers;

  const finalSections = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return processedSections.map((sec) => ({
        label: sec?.section,
        players: sec?.users_record || [],
        blankCount: Math.max(
          0,
          sectionSize - (sec?.users_record?.length || 0)
        ),
      }));
    }

    const sections = [];
    processedSections.forEach((sec) => {
      const allPlayers = sec?.users_record || [];
      const startsWith = allPlayers
        .filter((p) => p?.name?.toLowerCase().startsWith(q))
        .sort((a, b) => a.name.localeCompare(b.name));
      const contains = allPlayers
        .filter(
          (p) =>
            !p?.name?.toLowerCase().startsWith(q) &&
            p?.name?.toLowerCase().includes(q)
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      const players = [...startsWith, ...contains];
      if (players.length > 0)
        sections.push({ label: sec?.section, players, blankCount: 0 });
    });
    return sections;
  }, [processedSections, searchQuery, sectionSize]);

  const handleDeleteActivity = useCallback(
    async (id) => {
      try {
        await getRequest(API_ENDPOINTS.ACTIVITY_DELETE, { id });
        dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
      } catch (error) {
        console.error("Failed to delete activity", error);
      }
    },
    [dispatch, ladderId]
  );

  const handleResetBoard = useCallback(async () => {
    try {
      await getRequest(API_ENDPOINTS.RESET_MINILEAGUE_SCORE, {
        ladder_id: ladderId,
      });
      setResetOpen(false);
      refreshLeaderboard();
    } catch (error) {
      console.error("Failed to reset minileague", error);
    }
  }, [ladderId, refreshLeaderboard]);

  const activityItems = activityState?.data?.data || [];

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : 0;
    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
  };

  const quickActions = [
    {
      id: "reset",
      label: "Zero All",
      icon: RotateCcw,
      onClick: () => setResetOpen(true),
    },
    {
      id: "add-remove",
      label: "Add / Remove / Move",
      icon: Plus,
      onClick: () => setAddRemoveOpen(true),
    },
    // {
    //   id: "age-filter",
    //   node: (
    //     <AgeFilter
    //       onSearch={handleAgeSearch}
    //       user={false}
    //       resetSignal={ageFilterResetSignal}
    //       isActive={hasFilters}
    //     />
    //   ),
    // },
    {
      id: "clear",
      label: "Clear All",
      icon: XCircle,
      tone: "danger",
      onClick: () => {
        dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
        setAgeFilterResetSignal((p) => p + 1);
      },
      hidden: !hasFilters,
    },
  ];

  return (
    <LadderPageLayout
      className="space-y-6"
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
          refreshLeaderboard={refreshLeaderboard}
          ladderId={ladderId}
          sortMode="rank"
          setSortMode={() => { }}
          sortOpen={false}
          setSortOpen={() => { }}
          filterOpen={false}
          setFilterOpen={() => { }}
          appliedAge={0}
          appliedGender=""
          groupSize={1}
          showSort={false}
          showFilter={false}
          showSectionSize={false}
          resetLabel="Zero All"
          addRemoveLabel="Add / Move"
        />
      }
      sidebar={
        <InfoSection
          mobileSection={mobileSection}
          ladderType={ladderType}
          user={user}
          inviteUrl={inviteUrl}
          setContactOpen={setContactOpen}
          setResetOpen={setResetOpen}
          setAddRemoveOpen={setAddRemoveOpen}
          setSortOpen={() => { }}
          setFilterOpen={() => { }}
          activityItems={activityItems}
          handleDeleteActivity={handleDeleteActivity}
          contactOpen={contactOpen}
          resetOpen={resetOpen}
          handleResetBoard={handleResetBoard}
          resetDescription="This will reset the current minileague data."
          quickActions={quickActions}
        />
      }
    >
      <div
        className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0`}
      >
        <MobileQuickActionsAndInvite
          inviteUrl={inviteUrl}
          quickActions={quickActions}
        />
        <div className="flex flex-col gap-2">
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <ToastContainer />

        {loadingPlayers ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-3" />
          ))
        ) : finalSections.length === 0 ? (
          <div
            className="text-center py-10 font-bold"
            style={{ color: "var(--best-board-muted)" }}
          >
            No players found
          </div>
        ) : (
          finalSections.map((section, idx) => (
            <div key={idx} className="mb-4">
              {/* Section header */}
              <div
                className="mb-2 flex items-center justify-between rounded-xl px-2 sm:px-3 py-2 font-bold text-sm sm:text-base"
                style={{
                  border: "1px solid var(--best-board-border)",
                  background: "var(--best-board-surface-soft)",
                  color: "var(--best-board-text)",
                }}
              >
                <span>{section.label}</span>
                {user?.user_type === "admin" && (
                  <Button
                    className="text-xs h-7 sm:h-8 px-2 sm:px-3"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--best-board-border)",
                      color: "var(--best-board-text)",
                    }}
                    onClick={() => {
                      setCurrentSectionName(section.label);
                      setNewSectionName(section.label);
                      setNewSectionSize(sectionSize);
                      setIsSectionModalOpen(true);
                    }}
                  >
                    ✏️ Settings
                  </Button>
                )}
              </div>

              {section.players.map((player, pidx) => {
                const globalIndex = idx * sectionSize + pidx;
                return (
                  <PlayerCard
                    key={player.id}
                    player={{ ...player, sectionIndex: idx }}
                    rank={player.rank || globalIndex + 1}
                    canEdit={
                      user?.user_type === "admin" ||
                      user?.id === player?.user_id
                    }
                    groupSize={sectionSize}
                    onEdit={handleEditPlayer}
                    currentUser={user}
                  />
                );
              })}

              {Array.from({ length: section.blankCount }).map((_, i) => (
                <PlayerCard key={i} isBlank />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Edit player modal */}
      <MinileagueEditPlayer
        open={isOpen}
        currentId={selectedPlayerLocal?.id}
        sectionIndex={selectedPlayerLocal?.sectionIndex ?? 0}
        ladderId={ladderId}
        onClose={() => setIsOpen(false)}
      />

      {/* Section Settings Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="bg-[#0f2a2d] text-white max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Section Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label>Section Name</label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
            <div>
              <label>Section Size</label>
              <Input
                disabled
                type="number"
                min={1}
                max={20}
                value={newSectionSize}
                onChange={(e) => setNewSectionSize(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsSectionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!newSectionName.trim()) return toast.error("Enter name");
                  setUpdating(true);
                  await updateSectionName(currentSectionName, newSectionName);
                  setSectionSize(newSectionSize);
                  setUpdating(false);
                  setIsSectionModalOpen(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Remove Dialog */}
      <Dialog open={addRemoveOpen} onOpenChange={setAddRemoveOpen}>
        <DialogContent
          className="border text-white max-w-[90vw] sm:max-w-2xl"
          style={{
            background: "var(--best-board-surface)",
            borderColor: "var(--best-board-border)",
          }}
        >
          <DialogHeader>
            <DialogTitle>Add / Move Players</DialogTitle>
          </DialogHeader>
          <AddRemoveBox
            ladderId={ladderId}
            onSuccessRefresh={() => {
              setAddRemoveOpen(false);
              refreshLeaderboard();
            }}
          />
        </DialogContent>
      </Dialog>
    </LadderPageLayout>
  );
};

export default MinileaguePlayers;
