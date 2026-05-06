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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ControlsSection from "../../shared/ControlsSection";
import BestOfPlayerListSection from "./bestof/BestOfPlayerListSection";
import InfoSection from "../../shared/InfoSection";
import { formatLadderType } from "../../shared/ladderUtils";

const MOBILE_SECTIONS = [
  { id: "toolbar", label: "Tools" },
  { id: "players", label: "Players" },
  { id: "info", label: "Info" },
];

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [addRemoveOpen, setAddRemoveOpen] = useState(false);
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
    const cleanedSearch = effectiveSearch.toLowerCase().trim();
    let nextPlayers = playerList;

    if (cleanedSearch) {
      nextPlayers = playerList.filter((player) =>
        player?.name?.toLowerCase().includes(cleanedSearch),
      );
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
    try {
      await getRequest(API_ENDPOINTS.RESET_LEADERBOARD, { ladder_id: ladderId });
      toast.success("Leaderboard reset successfully.");
      setResetOpen(false);
      refreshLeaderboard();
    } catch {
      toast.error("Failed to reset leaderboard.");
    }
  };

  const handleApplyFilter = (age, ageType, gender) => {
    dispatch(setAgeFilter({ age, ageType, gender }));
    refreshLeaderboard(age, ageType, gender);
  };

  const handleClearFilter = () => {
    dispatch(setAgeFilter({ age: 0, ageType: "", gender: "" }));
    refreshLeaderboard(0, "", "");
  };

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
  return (
    <div className="best-board-page min-h-screen" key={refreshKey}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
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
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          appliedAge={appliedAge}
          appliedGender={appliedGender}
          groupSize={groupSize}
          onPresetChange={handlePresetChange}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_360px] xl:grid-cols-[minmax(0,0.86fr)_400px]">
          <div className="min-w-0">
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

          <InfoSection
            mobileSection={mobileSection}
            ladderType={ladderType}
            user={user}
            inviteUrl={inviteUrl}
            setContactOpen={setContactOpen}
            setResetOpen={setResetOpen}
            setAddRemoveOpen={setAddRemoveOpen}
            setSortOpen={setSortOpen}
            setFilterOpen={setFilterOpen}
            activityItems={activityItems}
            handleDeleteActivity={handleDeleteActivity}
            contactOpen={contactOpen}
            resetOpen={resetOpen}
            handleResetBoard={handleResetBoard}
          />
        </div>
      </div>

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        defaultAge={appliedAge}
        defaultAgeType={appliedAgeType}
        defaultGender={appliedGender}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
      />

      {selectedPlayer ? (
        <EditPlayer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          currentId={selectedPlayer?.id}
          initialTab={modalTab}
        />
      ) : null}
    </div>
  );
};

export default Best5Players;
