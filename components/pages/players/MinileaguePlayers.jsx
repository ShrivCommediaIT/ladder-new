"use client";
"use client";
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
import Minileague from "./Minileague";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlayerSearch from "../users/PlayerSearch";
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
      <div
        className="flex items-center justify-center min-h-[18vh] px-2 py-2 mb-3 rounded-lg shadow"
        style={{ background: "var(--best-board-surface)", border: "2px dashed var(--best-board-border-strong)" }}
      />
    );
  }

  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  const sectionStartRank =
    Math.floor((rank - 1) / groupSize) * groupSize + 1;

  const currentSectionRanks = Array.from(
    { length: groupSize },
    (_, i) => sectionStartRank + i
  );

  return (
    <div
      onClick={() => onEdit(player)}
      className="mb-3 cursor-pointer rounded-lg shadow transition-all hover:bg-[var(--best-board-surface-soft)]"
      style={{ background: "var(--best-board-surface)", border: "2px solid var(--best-board-border-strong)" }}
    >
      <div className="flex justify-between items-start mb-1 px-1 mt-1">
        <PlayerStatusToggle player={player} user={false} />
      </div>

      <div className="flex items-center justify-between px-2 py-2 ">
        <div className="flex-1 min-w-0">
          <div className="flex w-full items-center mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#48aaa8] border-2 border-white text-lg font-bold text-white mr-2">
              {rank}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-white flex items-center gap-2 text-sm font-semibold truncate">
                {player?.name || "N/A"}
                {player.age && (
                  <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">
                    {player.age}
                  </p>
                )}
                {player.gender && (
                  <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">
                    {player.gender == "male" ? "M" : "F"}
                  </p>
                )}
              </div>
              <div className="text-[#d4e5e8] text-xs truncate">
                {player?.phone || "N/A"}
              </div>
            </div>

            <div className="ml-2 w-14 text-center">
              <span className="bg-[#1b4542] text-[#fdf7c3] px-3 py-1 rounded-full font-extrabold text-lg border border-white">
                {player?.total_point || 0}
              </span>
            </div>
          </div>

          <div className="flex gap-1 mb-1 overflow-x-auto">
            {currentSectionRanks.map((r) => (
              <div
                key={r}
                className="w-7 h-6 flex items-center justify-center text-xs text-white rounded bg-[#28495e] border border-[#4eb0a2]"
              >
                {r}
              </div>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {currentSectionRanks.map((r) => {
              const found = player.result_details?.find(
                (i) => Number(i.rank) === Number(r)
              );
              return (
                <div
                  key={r}
                  className={`w-7 h-7 flex items-center justify-center rounded font-bold border ${found
                    ? "bg-white text-black border-[#7ea1af]"
                    : "bg-[#7ea1af]/50 border-[#528189]"
                    }`}
                >
                  {found?.point || ""}
                </div>
              );
            })}
          </div>
        </div>

        <div className="ml-3 w-20 h-20">
          <Image
            src={playerImageUrl}
            alt={player?.name}
            width={80}
            height={80}
            className="object-cover rounded"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
};

/* ================= Main Component ================= */
const MinileaguePlayers = ({ ladderType: parentLadderType }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const ladderTypeParam = searchParams.get("ladder_type");

  const ladderType = ladderTypeParam || parentLadderType || "minileague";

  const user = useSelector((state) => state.user?.user);
  const activityState = useSelector((state) => state.activity);
  const { data: sectionedPlayers, appliedAge, appliedAgeType, appliedGender } =
    useSelector((state) => state.minileague || {});

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
  const hasFilters = (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "");
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
      : "";

  // Section Size / Flexibility
  const [sectionSize, setSectionSize] = useState(7);

  // Section Modal
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
    if (appliedGender) {
      payload.gender = appliedGender;
    }
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
      const res = await postWithParams(API_ENDPOINTS.MINILEAGUE_UPDATE_GRADEBAR_NAME, {
        ladder_id: ladderId,
        current_name: currentName,
        update_name: updateName,
      });
      if (res?.status) refreshLeaderboard();
    } catch (error) {
      console.error(error);
    }
  };



  // Trust server-side ordering from API
  const processedSections = sectionedPlayers;


  const searchPlayers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const list = [];

    processedSections.forEach((sec, sidx) => {
      (sec?.users_record || []).forEach((p) => {
        if (p?.name?.toLowerCase().includes(q)) {
          list.push({ ...p, sectionIndex: sidx });
        }
      });
    });

    return list; // order same as API
  }, [processedSections, searchQuery]);


  const finalSections = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    //  NORMAL MODE — unchanged
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

    // SEARCH MODE
    const sections = [];

    processedSections.forEach((sec) => {
      const allPlayers = sec?.users_record || [];

      const startsWith = allPlayers
        .filter((p) =>
          p?.name?.toLowerCase().startsWith(q)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      const contains = allPlayers
        .filter(
          (p) =>
            !p?.name?.toLowerCase().startsWith(q) &&
            p?.name?.toLowerCase().includes(q)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      const players = [...startsWith, ...contains];

      if (players.length > 0) {
        sections.push({
          label: sec?.section,
          players,
          blankCount: 0,
        });
      }
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
    [dispatch, ladderId],
  );

  const handleResetBoard = useCallback(
    async () => {
      try {
        await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
        setResetOpen(false);
        refreshLeaderboard();
      } catch (error) {
        console.error("Failed to reset leaderboard", error);
      }
    },
    [ladderId, refreshLeaderboard],
  );

  const activityItems = activityState?.data?.data || [];
  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = age ? Number(age) : 0;
    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
  };

  const quickActions = [
    { id: "reset", label: "Zero All", icon: RotateCcw, onClick: () => setResetOpen(true) },
    { id: "add-remove", label: "Add / Move", icon: Plus, onClick: () => setAddRemoveOpen(true) },
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
      <div className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0`}>
        <div className="flex flex-col gap-2">
          <PlayerSearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <ToastContainer />


        {loadingPlayers ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))
        ) : finalSections.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
        ) : (
          finalSections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <div className="mb-2 flex items-center justify-between rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] px-3 py-2 font-bold text-[var(--best-board-text)]">
                <span>{section.label}</span>

                {user?.user_type === "admin" && (
                  <Button
                    className="text-xs bg-transparent border border-[var(--best-board-border)] hover:bg-[var(--best-board-surface-soft)] text-white"
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
                      user?.user_type === "admin" || user?.id === player?.user_id
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

      <MinileagueEditPlayer
        open={isOpen}
        currentId={selectedPlayerLocal?.id}
        sectionIndex={selectedPlayerLocal?.sectionIndex ?? 0}
        ladderId={ladderId}
        onClose={() => setIsOpen(false)}
      />

      {/* Section Settings Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent className="bg-[#0f2a2d] text-white">
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
              <Button onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
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
        <DialogContent className="best-board-card border-[var(--best-board-border)] text-white sm:max-w-2xl">
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
