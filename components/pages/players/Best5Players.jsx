"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import {
  fetchLeaderboard,
  setAgeFilter,
  setSelectedPlayer,
} from "@/redux/slices/leaderboardSlice";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import { fetchGradebars, resetGradebar } from "@/redux/slices/gradebarSlice";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { EditPlayer } from "./EditPlayer";
import AddRemoveBox from "@/components/pages/admin/AddRemoveBox";
import UploadPlayerLists from "@/components/pages/uploadCsv/UploadPlayerLists";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ControlsSection from "../../shared/ControlsSection";
import BestOfPlayerListSection from "./bestof/BestOfPlayerListSection";
import InfoSection from "../../shared/InfoSection";
import LadderPageLayout from "../../shared/LadderPageLayout";
import PlayerSearchInput from "./PlayerSearchInput";
import { ArrowDownUp, Plus, RotateCcw, XCircle } from "lucide-react";
import AgeFilter from "@/components/shared/AgeFilter";
import MobileQuickActionsAndInvite from "@/components/shared/MobileQuickActionsAndInvite";


const MOBILE_SECTIONS = [
  { id: "toolbar", label: "Tools" },
  { id: "players", label: "Players" },
  { id: "info", label: "Info" },
];

const Best5Players = ({ ladderId: propLadderId, searchValue = "", onSearchChange }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const urlType = searchParams.get("type") || searchParams.get("ladder_type") || "best5";

  const user = useSelector((state) => state.user?.user);
  const activityState = useSelector((state) => state.activity);
  const {
    players,
    selectedPlayer,
    loading: reduxLoading,
    appliedAge,
    appliedAgeType,
    appliedGender,
  } = useSelector((state) => state.player);
  const { gradebarDetails, gradebar } = useSelector((state) => state.gradebar);

  const numericLadderId = Number(ladderId);
  const playerState = players?.[numericLadderId] || {};
  const ladderDetails = playerState?.ladderDetails || {};
  const playerList = playerState?.data || [];
  const ladderType = ladderDetails?.type || urlType;

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [localGradebars, setLocalGradebars] = useState([]);
  const [groupSize, setGroupSize] = useState(7);
  const [internalSearch, setInternalSearch] = useState("");
  const [sortMode, setSortMode] = useState("rank");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const [editGradebarId, setEditGradebarId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalTab, setModalTab] = useState("result");
  const [mobileSection, setMobileSection] = useState("players");
  const [ageFilterResetSignal, setAgeFilterResetSignal] = useState(0);
  const hasFilters = (appliedAge && appliedAge !== 0) || (appliedGender && appliedGender !== "");
  const [resetOpen, setResetOpen] = useState(false);
  const [addRemoveOpen, setAddRemoveOpen] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const isRefreshingRef = useRef(false);

  const effectiveSearch = typeof onSearchChange === "function" ? searchValue : internalSearch;
  const setEffectiveSearch = typeof onSearchChange === "function" ? onSearchChange : setInternalSearch;

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProfile(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (Array.isArray(gradebarDetails)) {
      setLocalGradebars(gradebarDetails);
    }
    if (gradebar?.preset) {
      setGroupSize(Number(gradebar.preset));
    }
  }, [gradebar, gradebarDetails]);

  useEffect(() => {
    dispatch(setSelectedPlayer(null));
  }, [dispatch, ladderId]);

  const refreshLeaderboard = useCallback(
    async (age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
      if (!ladderId || isRefreshingRef.current) return;

      isRefreshingRef.current = true;
      setLoadingPlayers(true);
      setRefreshKey((current) => current + 1);

      try {
        const payload = { ladder_id: ladderId, type: urlType };
        if (age > 0) {
          payload.dob = age;
          payload.age_type = ageType;
        }
        if (gender) {
          payload.gender = gender;
        }

        await Promise.all([
          dispatch(fetchGradebars(ladderId)),
          dispatch(fetchLeaderboard(payload)),
          dispatch(fetchUserActivity({ ladder_id: Number(ladderId) })),
        ]);
      } finally {
        setLoadingPlayers(false);
        setTimeout(() => {
          isRefreshingRef.current = false;
        }, 700);
      }
    },
    [appliedAge, appliedAgeType, appliedGender, dispatch, ladderId, urlType],
  );

  useEffect(() => {
    if (!ladderId) return;
    const hasData = (players?.[numericLadderId]?.data || []).length > 0;
    if (hasData) {
      setLoadingPlayers(false);
      return;
    }
    refreshLeaderboard();
  }, [ladderId, numericLadderId, players, refreshLeaderboard]);

  const filteredPlayers = useMemo(() => {
    const cleanedSearch = effectiveSearch;
    let nextPlayers = playerList;

    if (cleanedSearch) {
      nextPlayers = playerList.filter((player) => {
        const cleanName = (player?.name || "").replace(/\s+/g, "").toLowerCase();
        return cleanName.includes(cleanedSearch);
      });
    }

    const uniquePlayers = Array.from(new Map(nextPlayers.map((player) => [player.id, player])).values());

    if (sortMode === "name") {
      return [...uniquePlayers].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    }

    return [...uniquePlayers].sort((a, b) => Number(a?.rank || 0) - Number(b?.rank || 0));
  }, [playerList, effectiveSearch, sortMode]);

  const grades = useMemo(() => {
    const output = [];
    const size = Number(groupSize) || 7;

    for (let index = 0; index < filteredPlayers.length; index += size) {
      const gradeIndex = Math.floor(index / size);
      const sectionPlayers = filteredPlayers.slice(index, index + size);
      const gradebarItem = localGradebars?.[gradeIndex];

      output.push({
        label: gradebarItem?.gradebar_name || `Section ${gradeIndex + 1}`,
        gradebarId: gradebarItem?.id ?? `temp-${gradeIndex}`,
        players: sectionPlayers,
      });
    }

    return output;
  }, [filteredPlayers, groupSize, localGradebars]);

  const openPlayerModal = useCallback(
    (player, initialTab = "result") => {
      dispatch(setSelectedPlayer({ ...player, ladder_id: ladderId }));
      setModalTab(initialTab);
      setIsOpen(true);
    },
    [dispatch, ladderId],
  );

  const handleChallenge = (player) => openPlayerModal(player, "challenge");

  const handlePresetChange = async (value) => {
    setGroupSize(value);
    if (!ladderId || !user?.id) return;

    try {
      await dispatch(
        resetGradebar({
          user_id: user.id,
          ladder_id: ladderId,
          gradebar_id: gradebar?.id,
          preset: value,
          gradebar_name: "Minileague",
        }),
      ).unwrap();
      refreshLeaderboard();
    } catch {
      toast.error("Failed to update sections.");
    }
  };

  const handleUpdateSection = async () => {
    if (!newName.trim() || !editGradebarId) {
      toast.error("Section name required.");
      return;
    }

    try {
      if (String(editGradebarId).startsWith("temp-")) {
        const data = await postRequest("/user/creategradeBar", {
          user_id: user?.id,
          ladder_id: ladderId,
          preset: groupSize,
          gradebar_name: newName.trim(),
        });
        if (data?.status !== 200) {
          toast.error(data?.message || "Failed to create section");
          return;
        }
      } else {
        const data = await postRequest("/user/updateGradebarName", {
          gradebar_details_id: editGradebarId,
          name: newName.trim(),
        });
        if (!data?.success) {
          toast.error(data?.message || "Failed to rename section");
          return;
        }
      }

      toast.success("Section updated.");
      setEditIndex(null);
      setEditGradebarId(null);
      refreshLeaderboard();
    } catch {
      toast.error("Server error");
    }
  };

  const handleResetBoard = async () => {
    setResetLoading(true);
    try {
      await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
      setResetOpen(false);
      setOpenUploadDialog(true);
      toast.success("Leaderboard reset successfully.");
      refreshLeaderboard();
    } catch {
      toast.error("Failed to reset leaderboard.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleAgeSearch = useCallback((age, ageType, gender) => {
    const ageNum = age ? Number(age) : 0;
    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(ageNum, ageType, gender);
  }, [dispatch, refreshLeaderboard]);

  const handleDeleteActivity = async (id) => {
    try {
      await getRequest(API_ENDPOINTS.ACTIVITY_DELETE, { id });
      dispatch(fetchUserActivity({ ladder_id: Number(ladderId) }));
    } catch {
      toast.error("Failed to delete activity.");
    }
  };

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
      : "";

  const activityItems = activityState?.data?.data || [];
  const quickActions = useMemo(() => {
    const isMiniLeague = ladderType === "minileague";
    const isSkillBoard = ["skill", "positive", "negative"].includes(ladderType);
    const isRoster = ladderType === "roster";

    return [
      {
        id: "reset",
        label: isMiniLeague ? "Zero All" : "Reset",
        icon: RotateCcw,
        onClick: () => setResetOpen(true),
        hidden: isRoster,
      },
      {
        id: "add-remove",
        label: isRoster ? "Add / Remove" : "Add / Move",
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
          dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
          setAgeFilterResetSignal((p) => p + 1);
          refreshLeaderboard(0, "", "");
        },
        hidden: !hasFilters,
      },
    ];
  }, [appliedAge, appliedGender, ladderType, ageFilterResetSignal, hasFilters, handleAgeSearch, refreshLeaderboard, dispatch]);

  return (
    <LadderPageLayout
      key={refreshKey}
      controls={
        <ControlsSection
          mobileSection={mobileSection}
          setMobileSection={setMobileSection}
          mobileSections={MOBILE_SECTIONS}
          resetOpen={resetOpen}
          setResetOpen={setResetOpen}
          addRemoveOpen={addRemoveOpen}
          setAddRemoveOpen={setAddRemoveOpen}
          refreshLeaderboard={refreshLeaderboard}
          ladderId={ladderId}
          sortMode={sortMode}
          setSortMode={setSortMode}
          sortOpen={sortOpen}
          setSortOpen={setSortOpen}
          filterOpen={false}
          setFilterOpen={() => { }}
          appliedAge={0}
          appliedGender=""
          groupSize={groupSize}
          onPresetChange={handlePresetChange}
          showFilter={false}
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
          setSortOpen={setSortOpen}
          setFilterOpen={() => { }}
          activityItems={activityItems}
          handleDeleteActivity={handleDeleteActivity}
          contactOpen={contactOpen}
          resetOpen={resetOpen}
          handleResetBoard={handleResetBoard}
          resetTitle="Do you want to reset ?"
          resetDescription="This will completely DELETE the entire leaderboard. All data will be lost !"
          resetConfirmLabel={resetLoading ? "Processing..." : "Confirm"}
          resetConfirmDisabled={resetLoading}
          quickActions={quickActions}
        />
      }
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className={`${mobileSection === "info" ? "hidden" : "block"} min-w-0 space-y-4`}>
        <MobileQuickActionsAndInvite inviteUrl={inviteUrl} quickActions={quickActions} />
        <PlayerSearchInput value={effectiveSearch} onChange={setEffectiveSearch} />
        <BestOfPlayerListSection
          mobileSection={mobileSection}
          loadingPlayers={loadingPlayers}
          reduxLoading={reduxLoading}
          grades={grades}
          refreshKey={refreshKey}
          editIndex={editIndex}
          newName={newName}
          setNewName={setNewName}
          setEditIndex={setEditIndex}
          setEditGradebarId={setEditGradebarId}
          handleUpdateSection={handleUpdateSection}
          user={user}
          groupSize={groupSize}
          onOpenPlayer={openPlayerModal}
          onChallenge={handleChallenge}
        />
      </div>



      {selectedPlayer ? (
        <EditPlayer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          currentId={selectedPlayer?.id}
          initialTab={modalTab}
        />
      ) : null}

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
              refreshLeaderboard();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Upload CSV after reset */}
      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogContent className="bg-gray-400 rounded-lg border border-[#313546] sm:max-w-xl">
          <UploadPlayerLists
            ladderId={ladderId}
            ladderType={ladderType}
            onSuccessClose={() => {
              setOpenUploadDialog(false);
              refreshLeaderboard();
              dispatch(fetchGradebars(ladderId));
              toast.success("Players uploaded successfully!");
            }}
          />
        </DialogContent>
      </Dialog>
    </LadderPageLayout>
  );
};

export default Best5Players;
