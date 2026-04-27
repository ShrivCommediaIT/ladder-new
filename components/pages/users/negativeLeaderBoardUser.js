"use client";
import { IMAGE_BASE_URL } from "@/constants/api";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Logo from "@/public/logo1.png";
import { BasicLeaderboardUserEdit } from "@/components/shared/BasicLeaderboardUserEdit";
import PlayerSearchInput from "../players/PlayerSearchInput";
import BasicLeaderboardShort from "../admin/BasicLeaderboardShort";
import BasicLeaderboardUserRemove from "@/components/shared/BasicLeaderboardUserRemove";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Funnel, X } from "lucide-react";
import { fetchNegativeLeaderboard, setAppliedAge } from "@/redux/slices/negativeLeaderBoardSlice";
import PlayerEditInfoModel from "@/components/shared/playerEditInfoModel";
import AgeFilter from "@/components/shared/AgeFilter";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";

/* ---------------- PLAYER CARD ---------------- */
const PlayerCard = ({ player, overallRank, appliedAge, ageRank, onSkillClick, isEditable, loggedInUser }) => {
  const playerImageUrl = player?.image
    ? `${IMAGE_BASE_URL}/${player.image}`
    : Logo;

  const toTotalSeconds = (score) => {
    if (!score) return 0;
    const strScore = String(score);

    if (!strScore.includes(":")) {
      return Number(strScore) || 0;
    }

    const parts = strScore.split(":");
    let hh = 0, mm = 0, secMsStr = "0";

    if (parts.length === 3) {
      hh = Number(parts[0]);
      mm = Number(parts[1]);
      secMsStr = parts[2];
    } else if (parts.length === 2) {
      mm = Number(parts[0]);
      secMsStr = parts[1];
    } else {
      secMsStr = parts[0];
    }

    const [ss, ms = "0"] = secMsStr.split(".");

    const total =
      hh * 3600 +
      mm * 60 +
      Number(ss) +
      Number(ms.padEnd(2, "0").substring(0, 2)) / 100;

    return total;
  };


  return (
    <Card onClick={() => { onSkillClick(player.id, player.skills[0].skill_number) }} className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] overflow-hidden relative p-4 gap-0">
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="flex-1 min-w-0 curcer-pointer p-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10">
            <Image
              src={playerImageUrl}
              alt={player?.name}
              width={80}
              height={80}
              className="object-cover rounded"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
              {player?.name || "N/A"}
              {player.age && (
                <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">
                  {player.age}
                </p>
              )}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">
              {player?.phone || "N/A"}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            {Boolean(appliedAge) && (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                  {ageRank}
                </div>
                <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold mt-0.5 whitespace-nowrap">Age Rank</p>
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center font-bold text-black shadow-sm text-xs sm:text-sm">
                {overallRank}
              </div>
              <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-0.5 whitespace-nowrap">Overall Rank</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex  justify-between mr-1">
        <div className="flex flex-col items-center mr-1">
          <span className={` flex  justify-center  w-20 text-black px-4 py-1 rounded-sm font-semibold border ${player?.skills?.length > 0 &&
            Number(player.skills[0].target) > 0 &&
            toTotalSeconds(player?.scores?.[0]?.negative_ladder_score || "0") > 0 &&
            Number(player.skills[0].target) >= toTotalSeconds(player?.scores?.[0]?.negative_ladder_score || "0")
            ? "bg-green-500"
            : "bg-white"
            } ${player?.skills?.length > 0 && player?.scores?.[0]?.witness_by
              ? "underline decoration-black decoration-[3px] bg-green-400"
              : ""
            }`}>
            {toTotalSeconds(player && player?.scores[0]?.negative_ladder_score) || 0}
          </span>
        </div>
        {player && player?.skills?.length > 0 ? null : (
          <div className="h-7 p-3 bg-gray-800 rounded text-xs text-gray-400 flex items-center justify-center">
            No skills data
          </div>
        )}
      </div>
    </Card>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
const NegativeLeaderboardUser = ({ ladderId: propLadderId }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = propLadderId || searchParams.get("ladder_id");
  const { data = [], loading, appliedAge, appliedAgeType, appliedGender } = useSelector(
    (state) => state.negativeLeaderBoard || {},
  );
  const loggedInUser = useSelector((state) => state.user?.user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user") || sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setCurrentUserId(Number(parsedUser.id));
          }
        } catch (err) {
          console.error("Failed to parse user from sessionStorage", err);
        }
      }
    }
  }, []);

  // ALL STATES FIRST
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSkillNumber, setSelectedSkillNumber] = useState(null);
  const [selectedSkillActivityId, setSelectedSkillActivityId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSort, setOpenSort] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false); // FIXED: UNCOMMENTED
  const [showRemove, setShowRemove] = useState(false);
  const [selectedPositiveFilter, setSelectedPositiveFilter] = useState(0);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentUser = data.find((p) => p.id == currentUserId);
  const myRank = currentUser?.rank;

  // REFRESH KEY TO CONTROL RELOADS (STOPS INFINITE LOOP)
  const refreshKey = useRef(0);

  // REFRESH FUNCTION FIRST
  const refreshLeaderboard = useCallback(
    (skillNo = selectedPositiveFilter, age = appliedAge, ageType = appliedAgeType, gender = appliedGender) => {
      if (ladderId) {
        const payload = {
          ladder_id: ladderId,
          type: "negative",
          sortbyskillnumber: skillNo,
        };

        if (age > 0) {
          payload.dob = age;
          payload.age_type = ageType;
        }

        if (gender) {
          payload.gender = gender;
        }

        dispatch(fetchNegativeLeaderboard(payload)).finally(() => {
          setIsRefreshing(false);
        });
      }
    },
    [dispatch, ladderId, selectedPositiveFilter, appliedAge, appliedAgeType, appliedGender],
  );

  const handleAgeSearch = (age, ageType, gender) => {
    const ageNum = Number(age);
    dispatch(setAgeFilter({ age: ageNum, ageType, gender }));
    refreshLeaderboard(selectedPositiveFilter, ageNum, ageType, gender);
    setIsSorted(true);
  };

  // MANUAL REFRESH HANDLERS (only when explicitly called)
  const handleSelfRemove = useCallback(() => {
    setShowRemove(true);
  }, []);

  const handleRemoveClose = useCallback(() => {
    setShowRemove(false);
  }, []);

  const handleRemoveSuccess = useCallback(() => {
    setShowRemove(false);
    refreshLeaderboard(selectedSkillFilter);
  }, [refreshLeaderboard, selectedSkillFilter]);

  const handleSkillsUpdated = useCallback(
    (skillNo) => {
      setOpenSort(false);
      setIsSorted(true);
      refreshLeaderboard(skillNo);
    },
    [refreshLeaderboard],
  );

  const handleSortBySkill = useCallback(() => {
    setOpenSort(true);
  }, []);

  const handleClearAll = useCallback(() => {
    setIsSorted(false);
    setSelectedSkillFilter(0);
    dispatch(setAgeFilter({ age: 0, ageType: "under", gender: "" }));
    refreshLeaderboard(0, 0, "under", "");
  }, [refreshLeaderboard, dispatch]);

  const handleSkillClick = useCallback(
    (playerId, skillNumber) => {
      if (playerId != currentUserId) {
        setDialogMessage("You can only edit your own profile");
        setIsDialogOpen(true);
        return
      }

      const player = data.find((p) => p.id === playerId);
      if (!player) return;
      const skillObj = player.skills.find(
        (s) => s.skill_number === skillNumber,
      );
      if (!skillObj) return;
      setSelectedPlayerId(playerId);
      setSelectedSkillNumber(skillNumber);
      setSelectedSkillActivityId(skillObj.id);
      setOpenEdit(true);
    },
    [data, currentUserId],
  );

  const handleEditClose = useCallback(() => {
    setOpenEdit(false);
    setSelectedPlayerId(null);
    setSelectedSkillNumber(null);
    setSelectedSkillActivityId(null);
    refreshLeaderboard(selectedSkillFilter);
  }, [refreshLeaderboard, selectedSkillFilter]);

  // FIXED: ONLY LOAD ONCE WHEN ladderId CHANGES (NO INFINITE LOOP)
  useEffect(() => {
    if (ladderId) {
      refreshLeaderboard(0);
    }
  }, [ladderId]); // REMOVED refreshLeaderboard from deps

  const filteredPlayers = data.filter((player) => {
    if (!searchQuery) return true;
    const cleanName = player.name.replace(/\s+/g, "").toLowerCase();
    return cleanName.includes(searchQuery);
  });

  return (
    <>
      <main className="min-h-screen flex justify-center ">
        <div className="w-full max-w-2xl px-4 py-4 space-y-4">
          {/* {loading && <p className="text-white text-center py-8"></p>} */}

          {/* Search + Buttons */}
          <div className="flex flex-col sm:flex-col sm:items-start gap-2">
            {/* Search Input */}
            <div className="flex-1 w-full min-w-0">
              <PlayerSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className="flex-1 w-full min-w-0">


              {/* Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0">
                {!isSorted ? (
                  <Button
                    onClick={handleSortBySkill}
                    disabled={isRefreshing}
                    className="bg-[#005F5A] text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
                  >
                    <Funnel size={16} />
                    Sort Performance
                  </Button>
                ) : (
                  <Button
                    onClick={handleClearAll}
                    disabled={isRefreshing}
                    className="bg-red-600 text-white font-bold rounded-md px-4 py-2 flex items-center gap-2"
                  >
                    <Funnel size={16} />
                    Clear All
                  </Button>
                )}

                {currentUserId && (
                  <Button
                    onClick={handleSelfRemove}
                    disabled={isRefreshing}
                    className="bg-gradient-to-r from-red-500 to-red-500 hover:from-orange-600 hover:to-red-600 
                       text-white font-bold rounded-md px-4 py-2 flex items-center gap-2 shadow-lg"
                  >
                    <X size={16} className="w-4 h-4" />
                    Click here to leave this solution
                  </Button>
                )}
                <div className="h-10 w-full">
                  <AgeFilter onSearch={handleAgeSearch} user={true} />
                </div>
              </div>
            </div>

            {/* Player Cards */}
            <div className="space-y-2 mt-2 w-full">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
              ) : (
                filteredPlayers.map((player, index) => {
                  const isEditablePlayer = player.id === currentUserId;
                  return (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      overallRank={player.rank || index + 1}
                      appliedAge={appliedAge}
                      ageRank={index + 1}
                      onSkillClick={handleSkillClick}
                      isEditable={isEditablePlayer}
                      loggedInUser={loggedInUser}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={openSort} onOpenChange={setOpenSort}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <BasicLeaderboardShort
            ladderId={ladderId}
            onClose={() => {
              setOpenSort(false);
              setIsSorted(false);
            }}
            onSkillsUpdated={handleSkillsUpdated}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRemove} onOpenChange={setShowRemove}>
        <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center max-w-md">
          <BasicLeaderboardUserRemove
            ladderId={ladderId}
            myRank={myRank}
            onClose={handleRemoveClose}
            onSuccessRefresh={handleRemoveSuccess}
          />
        </DialogContent>
      </Dialog>

      <PlayerEditInfoModel
        isDialogOpen={isDialogOpen}
        dialogMessage={dialogMessage}
        setIsDialogOpen={setIsDialogOpen}
      />

      {openEdit && selectedPlayerId && selectedSkillNumber && (
        <BasicLeaderboardUserEdit
          open={openEdit}
          onClose={handleEditClose}
          currentId={selectedPlayerId}
          ladderId={ladderId}
          skillNumber={selectedSkillNumber}
          skillActivityId={selectedSkillActivityId}
        />
      )}
    </>
  );
};

export default NegativeLeaderboardUser;
