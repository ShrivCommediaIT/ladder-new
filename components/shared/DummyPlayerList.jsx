"use client";
import { IMAGE_BASE_URL } from "@/constants/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchGradebars } from "@/redux/slices/gradebarSlice";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { fetchNegativeLeaderboard } from "@/redux/slices/negativeLeaderBoardSlice";
import { fetchPositiveLeaderboard } from "@/redux/slices/positiveLeaderBoardSlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import Logo from "@/public/logo.jpg";
import PlayerPerformationRanking from "./PlayerPerformationRanking";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import PlayerStatusToggle from "./PlayerStatusToggle";

/* ─────────────────────────────────────────────
   1. DEFAULT CARD  (bestof5 / best5 / best3 / winlose)
───────────────────────────────────────────── */
const DefaultPlayerCard = ({ player, rank }) => {
  const src = player.image ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}` : Logo;
  return (
    <div
      className="flex flex-col mb-3 rounded-lg shadow font-sans cursor-default"
      style={{ background: "#223848", border: "2px solid #4eb0a2" }}
    >
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex-1">
        <div className="flex w-full items-center mb-2">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
              {player?.name || "N/A"}
              {player.age && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">{player.age}</p>}
              {player.gender && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">{player.gender === "male" ? "M" : "F"}</p>}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">{player?.phone || "N/A"}</div>
          </div>
        </div>
      </div>
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 shrink-0">
        <Image src={src} alt={player.name} width={96} height={96} className="object-cover w-full h-full rounded" unoptimized />
      </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   2. MINILEAGUE CARD
───────────────────────────────────────────── */
const MinileaguePlayerCard = ({ player, rank, groupSize }) => {
  const src = player?.image ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}` : Logo;
  const sectionStart = Math.floor((rank - 1) / groupSize) * groupSize + 1;
  const sectionRanks = Array.from({ length: groupSize }, (_, i) => sectionStart + i);
  return (
    <div
      className="flex flex-col mb-3 rounded-lg shadow font-sans"
      style={{ background: "#223848", border: "2px solid #4eb0a2" }}
    >
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex w-full items-center mb-2 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#48aaa8] border-2 border-white text-lg sm:text-2xl font-bold text-white mr-2 shrink-0">{rank}</div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate max-w-[160px] sm:max-w-[240px]">
              {player?.name || "N/A"}
              {player.age && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-8">{player.age}</p>}
              {player.gender && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">{player.gender === "male" ? "M" : "F"}</p>}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">{player?.phone || "N/A"}</div>
          </div>
          <div className="ml-2 w-14 sm:w-16 text-center flex-shrink-0">
            <span className="bg-[#1b4542] text-[#fdf7c3] px-2 sm:px-3 py-1 rounded-full font-extrabold text-lg sm:text-xl border border-white">{player?.total_point || 0}</span>
          </div>
        </div>
        <div className="mt-1">
          <div className="flex gap-1 mb-1 overflow-x-auto">
            {sectionRanks.map(r => (
              <div key={r} className="w-6 h-5 sm:w-8 sm:h-6 flex items-center justify-center text-xs font-bold text-white rounded bg-[#28495e] border border-[#4eb0a2]">{r}</div>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {sectionRanks.map(r => {
              const found = player.result_details?.find(i => Number(i.rank) === Number(r));
              return (
                <div key={r} className={`w-6 h-6 sm:w-8 sm:h-7 flex items-center justify-center border-b-2 rounded font-bold ${found ? "bg-white text-[#092733] border-[#7ea1af]" : "bg-[#7ea1af] bg-opacity-50 border-[#528189] text-xs"}`}>
                  {found ? found.point : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ml-3 flex-shrink-0">
        <Image src={src} alt={player?.name} width={96} height={96} className="object-cover w-full h-full rounded" unoptimized />
      </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   3. SKILL / POSITIVE / NEGATIVE CARD
───────────────────────────────────────────── */
const SkillPlayerCard = ({ player, rank, showRanks = true, isNegative = false }) => {
  const src = player?.image ? `${IMAGE_BASE_URL}/${player.image}` : Logo;

  const getScore = (scores, skills, skillNumber, isInverted) => {
    const scoreObj = scores?.find(s => s.skill_number === skillNumber);
    const skillObj = skills?.find(s => s.skill_number === skillNumber);
    const score = scoreObj ? Number(scoreObj.best_score) : 0;
    const target = skillObj?.target != null ? Number(skillObj.target) : null;
    let isTargetAchieved = false;
    if (target && target !== 0 && score !== 0 && !isNaN(target) && !isNaN(score)) {
      if (isNegative) {
        isTargetAchieved = isInverted ? score <= target : score >= target;
      } else {
        isTargetAchieved = isInverted ? score >= target : score <= target;
      }
    }
    return { score: Math.abs(score), isTargetAchieved };
  };

  const getRank = (ranks, skillNumber) => {
    const r = ranks?.find(r => r.skill_number === skillNumber);
    return r ? r.rank : "-";
  };

  return (
    <Card className="w-full rounded-2xl shadow-lg border border-teal-400/80 bg-[#163344] mb-3 overflow-hidden">
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="p-2 sm:p-3">
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
            <Image src={src} alt={player?.name} width={80} height={80} className="object-cover rounded" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
              {player?.name || "N/A"}
              {player.age && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-5">{player.age}</p>}
              {player.gender && <p className="text-white border border-white px-2 py-0.5 text-xs font-semibold rounded shrink-0 w-fit ml-1">{player.gender === "male" ? "M" : "F"}</p>}
            </div>
            <div className="text-[#d4e5e8] text-xs truncate">{player?.phone || "N/A"}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <span className="bg-yellow-200 text-black px-3 sm:px-4 py-0.5 sm:py-1 rounded-sm font-bold border text-xs sm:text-sm">{Math.abs(player.total_point || 0)}</span>
              <p className="text-[9px] text-white mt-1 font-semibold">Total Pts</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center font-bold text-black text-xs sm:text-sm">{rank}</div>
              <p className="text-[8px] sm:text-[9px] text-white font-semibold mt-1 whitespace-nowrap">Overall Rank</p>
            </div>
          </div>
        </div>

        {player.skills?.length > 0 ? (
          <>
            <div className="flex gap-[3px] overflow-x-auto pb-1 mb-1">
              {player.skills.map((skill, i) => (
                <div key={i} className="min-w-[24px] h-6 flex items-center justify-center text-[10px] text-black rounded bg-white relative">
                  {skill.skill_sign === "-" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[12px] font-extrabold text-white leading-none">−</span>}
                  {skill.skill_number}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px] overflow-x-auto pb-1 mb-1">
              {player.skills.map((skill, i) => {
                const { score, isTargetAchieved } = getScore(player.scores || [], player.skills || [], skill.skill_number, player.isInverted);
                return (
                  <div key={i} className={`min-w-[24px] h-6 flex items-center justify-center text-[10px] rounded font-medium border shadow-sm ${isTargetAchieved ? "bg-green-400 text-black" : "bg-yellow-200 text-black"}`}>
                    {score}
                  </div>
                );
              })}
            </div>
            {showRanks && (
              <div className="flex gap-[3px] overflow-x-auto pb-1">
                {player.skills.map((skill, i) => (
                  <div key={i} className="min-w-[24px] h-6 flex items-center justify-center rounded font-bold text-[10px] bg-blue-200 text-black shadow-sm border border-gray-200">
                    {getRank(player.ranks || [], skill.skill_number)}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-7 bg-gray-800 rounded text-xs text-gray-400 flex items-center justify-center">No skills data</div>
        )}
      </div>
      </div>
    </Card>
  );
};

/* ─────────────────────────────────────────────
   4. ROSTER CARD
───────────────────────────────────────────── */
const RosterPlayerCard = ({ player, rank }) => {
  const src = player.image ? `${IMAGE_BASE_URL}/${player.image}` : Logo;
  return (
    <div className="flex flex-col mb-3 rounded-lg bg-[#1a2f3d] border border-[#4eb0a2] overflow-hidden">
      <div
        className="flex justify-between items-center px-4 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <PlayerStatusToggle player={player} user={true} />
      </div>
      <div className="flex items-center justify-between px-3 py-3 gap-3">
        <div className="w-7 h-7 rounded-full bg-[#48aaa8] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">{rank}</div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="border border-white text-white text-[10px] px-1.5 py-0.5 w-fit mb-1">{"status : " + (player?.token_status || "Newcomer")}</div>
          <div className="flex items-center gap-1 flex-wrap">
            <div className="text-white font-bold text-sm truncate">{player?.name ?? "N/A"}</div>
            {player?.age && (
              <span className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit">{player.age}</span>
            )}
            {player?.gender && (
              <span className="text-white border border-white px-1.5 py-0.5 text-[10px] leading-none font-semibold rounded shrink-0 w-fit">{player.gender === "male" ? "M" : "F"}</span>
            )}
          </div>
          <div className="text-gray-300 text-xs truncate">{player?.phone ?? "N/A"}</div>
          <div className="text-white text-[11px] mt-0.5">
            {player?.today_token ?? 0} Tokens{" "}
            <span className="text-[#48aaa8] font-semibold ml-1">Redeem</span>
          </div>
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-white text-[10px] font-medium text-center leading-tight">Total<br />Tokens</div>
          <div className="bg-white text-black font-bold text-base px-3 py-0.5 mt-1 min-w-[44px] text-center rounded-sm">{player?.total_token ?? 0}</div>
        </div>
        <div className="w-11 h-11 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#223848] border border-[#4eb0a2]">
          <Image src={src} alt={player.name} width={44} height={44} className="object-cover" unoptimized />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function DummyPlayerList({ ladderId }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Get ladder_type from URL
  const ladderTypeFromUrl = searchParams.get("ladder_type") || searchParams.get("type");

  // Redux data
  const ladderDetails = useSelector(state => state.player?.players?.[ladderId]?.ladderDetails || null);
  
  // Determine active type (URL param > API type > Default)
  const type = (ladderTypeFromUrl || ladderDetails?.type || "bestof5").toLowerCase();
  const ladderType = type;

  const preset = useSelector(state => state.gradebar?.preset || 10);
  const gradebarDetails = useSelector(state => state.gradebar?.gradebarDetails || []);

  // Standard leaderboard players (bestof5, minileague-mode, roster)
  const standardPlayers = useSelector(state => state.player?.players?.[ladderId]?.data || []);

  // Skill leaderboard
  const skillData = useSelector(state => state.skillLeaderboard?.data || []);

  // Positive leaderboard
  const positiveData = useSelector(state => state.positiveLeaderBoard?.data || []);

  // Negative leaderboard
  const negativeData = useSelector(state => state.negativeLeaderBoard?.data || []);

  // Roster leaderboard
  const rosterData = useSelector(state => state.rosterLeaderboard?.data || []);

  // Minileague
  const minileagueSections = useSelector(state => state.minileague?.data || []);
  const minileagueLadderDetails = useSelector(state => state.minileague?.ladderDetails || null);

  // Specific slice details
  const skillLadderDetails = useSelector(state => state.skillLeaderboard?.ladderDetails || null);
  const positiveLadderDetails = useSelector(state => state.positiveLeaderBoard?.ladderDetails || null);
  const negativeLadderDetails = useSelector(state => state.negativeLeaderBoard?.ladderDetails || null);
  const rosterLadderDetails = useSelector(state => state.rosterLeaderboard?.ladderDetails || null);

  const displayLadderDetails = 
    type === "minileague" ? minileagueLadderDetails :
    type === "skill" ? skillLadderDetails :
    type === "positive" ? positiveLadderDetails :
    type === "negative" ? negativeLadderDetails :
    type === "roster" ? rosterLadderDetails :
    ladderDetails;

  useEffect(() => {
    if (!ladderId) return;

    if (type === "minileague") {
      dispatch(fetchMiniLeague({ ladder_id: ladderId }));
    } else if (type === "skill") {
      dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
      dispatch(fetchGradebars(ladderId));
    } else if (type === "positive") {
      dispatch(fetchPositiveLeaderboard({ ladder_id: ladderId, type: "positive" }));
      dispatch(fetchGradebars(ladderId));
    } else if (type === "negative") {
      dispatch(fetchNegativeLeaderboard({ ladder_id: ladderId, type: "negative" }));
      dispatch(fetchGradebars(ladderId));
    } else if (type === "roster") {
      dispatch(fetchRosterLeaderboard({ ladder_id: ladderId, type: "roster" }));
      dispatch(fetchGradebars(ladderId));
    } else {
      dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderType }));
      dispatch(fetchGradebars(ladderId));
    }
  }, [ladderId, dispatch, type]);

  const generateGrades = (playersArr, gradebars, groupSize) => {
    if (!playersArr?.length) return [];
    const size = Number(groupSize) || 10;
    const out = [];
    for (let i = 0; i < playersArr.length; i += size) {
      const idx = Math.floor(i / size);
      out.push({
        label: gradebars?.[idx]?.gradebar_name || `Minileague ${idx + 1}`,
        players: playersArr.slice(i, i + size),
      });
    }
    return out;
  };



  /* ── MINILEAGUE ── */
  if (type === "minileague") {
    const groupSize = Number(preset) || 10;
    const filteredSections = minileagueSections.map(sec => ({
      label: sec?.section || `Section ${sec.id || ""}`,
      players: searchTerm
        ? (sec?.users_record || []).filter(p => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        : (sec?.users_record || []),
    }));

    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-white">{displayLadderDetails.name}</h2>
            <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
              Admin: {displayLadderDetails.admin_name} ({displayLadderDetails.admin_phone})
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
          <PlayerPerformationRanking ladderId={ladderId} />
        </div>
        {filteredSections.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
        ) : (
          <div className="space-y-8 sm:px-4">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="mt-4 px-4">
                <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">{section.label}</div>
                <div className="space-y-3">
                  {section.players.map((player, pidx) => (
                    <MinileaguePlayerCard key={player.id || pidx} player={player} rank={player.rank || (idx * groupSize + pidx + 1)} groupSize={groupSize} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── SKILL ── */
  if (type === "skill") {
    const filtered = skillData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-white">{displayLadderDetails.name}</h2>
            <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
              Admin: {displayLadderDetails.admin_name} ({displayLadderDetails.admin_phone})
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((player, idx) => (
              <SkillPlayerCard key={player.id || idx} player={{...player, isInverted: displayLadderDetails?.inverted == 0}} rank={player.rank || idx + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── POSITIVE ── */
  if (type === "positive") {
    const filtered = positiveData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-white">{displayLadderDetails.name}</h2>
            <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
              Admin: {displayLadderDetails.admin_name} ({displayLadderDetails.admin_phone})
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((player, idx) => (
              <SkillPlayerCard key={player.id || idx} player={{...player, isInverted: displayLadderDetails?.inverted == 0}} rank={player.rank || idx + 1} showRanks={false} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── NEGATIVE ── */
  if (type === "negative") {
    const filtered = negativeData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-white">{displayLadderDetails.name}</h2>
            <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
              Admin: {displayLadderDetails.admin_name} ({displayLadderDetails.admin_phone})
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]" />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
        ) : (
          <div className="px-4 space-y-2">
            {filtered.map((player, idx) => (
              <SkillPlayerCard key={player.id || idx} player={{...player, isInverted: displayLadderDetails?.inverted == 0}} rank={player.rank || idx + 1} showRanks={false} isNegative={true} />
            ))}
          </div>
        )}
      </div>
    );
  }


  /* ── ROSTER ── */
  if (type === "roster") {
    const filtered = rosterData.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const groupSize = 7;
    const sections = [];
    for (let i = 0; i < filtered.length; i += groupSize) {
      sections.push({
        players: filtered.slice(i, i + groupSize),
        startIdx: i,
      });
    }
    return (
      <div>
        {displayLadderDetails?.name && (
          <div className="py-4 text-center sm:text-start px-4">
            <h2 className="text-2xl font-bold text-white">{displayLadderDetails.name}</h2>
            <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
              Admin: {displayLadderDetails.admin_name} ({displayLadderDetails.admin_phone})
            </p>
          </div>
        )}
        <div className="mb-6 px-4">
          <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]" />
        </div>
        {sections.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
        ) : (
          sections.map((section, idx) => (
            <div key={idx} className="mb-8 px-4">
              <div className="space-y-3">
                {section.players.map((player, pidx) => (
                  <RosterPlayerCard
                    key={player.id || pidx}
                    player={player}
                    rank={player.rank || (section.startIdx + pidx + 1)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  /* ── DEFAULT: bestof5 / best5 / best3 / winlose ── */
  const filteredPlayers = standardPlayers
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.rank - b.rank);

  const grades = generateGrades(filteredPlayers, gradebarDetails, preset);

  return (
    <div>
      {displayLadderDetails?.name && (
        <div className="py-4 text-center sm:text-start px-4">
          <h2 className="text-2xl font-bold text-white">{displayLadderDetails.name}</h2>
          <p className="text-gray-200 text-md border-b-2 border-amber-500 py-1 font-semibold">
            Admin Details: {displayLadderDetails.admin_name} ({displayLadderDetails.admin_phone})
          </p>
        </div>
      )}

      <div className="mb-6 px-4">
        <input type="text" placeholder="Search players..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-[#223848] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4eb0a2]" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-4">
        <PlayerPerformationRanking ladderId={ladderId} />
      </div>

      {grades.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">No players found</div>
      ) : (
        <div className="space-y-8 sm:px-4 md:px-4">
          {grades.map((grade, index) => (
            <div key={index}>
              <div className="mb-3 sticky top-0 bg-[#223848] px-4 py-2 rounded-lg shadow-lg text-xl text-white font-bold tracking-wide z-10">{grade.label}</div>
              <div className="space-y-3">
                {grade.players.map((player, pidx) => (
                  <DefaultPlayerCard key={player.id || pidx} player={player} rank={player.rank || pidx + 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
