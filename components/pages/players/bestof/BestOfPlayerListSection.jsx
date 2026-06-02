"use client";
import PlayerRankBadge from "@/components/shared/PlayerRankBadge";

import React from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, X } from "lucide-react";
import PlayerStatusToggle from "@/components/shared/PlayerStatusToggle";
import { toast } from "react-toastify";
import Logo from "@/public/logo1.png";
import {
  PLAYER_COLOR_CLASSES,
  getPhoneText,
  getPlayerImageUrl,
  getPlayerInitials,
} from "../../../shared/ladderUtils";

const SectionBadge = ({ count }) => (
  <span className="rounded bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] px-2 py-1 text-[11px] font-medium text-[var(--best-board-muted)]">
    {count} players
  </span>
);



const PlayerAvatar = ({ player, rank }) => {
  const imageUrl = getPlayerImageUrl(player);
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={player?.name || "Player"}
        width={64}
        height={64}
        className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shrink-0"
        unoptimized
      />
    );
  }

  if (!player?.image) {
    const colorClass = PLAYER_COLOR_CLASSES[(Number(rank) - 1) % PLAYER_COLOR_CLASSES.length];
    return (
      <div className={`flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-sm sm:text-base font-bold text-white shrink-0`}>
        {getPlayerInitials(player?.name)}
      </div>
    );
  }

  return <Image src={Logo} alt="Player" width={64} height={64} className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shrink-0" />;
};

const PlayerRow = ({ player, rank, canEdit, onOpenPlayer, onChallenge }) => (
  <div
    onClick={() => {
      onOpenPlayer(player, canEdit ? "result" : "stats");
    }}
    className="group flex flex-col rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] transition hover:border-[var(--best-board-border-strong)] cursor-pointer overflow-hidden"
  >
    {/* ── TOP STRIP ── */}
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center justify-between px-4 py-1.5 gap-2 border-b border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)]"
    >
      {/* Active Toggle Button (PlayerStatusToggle) */}
      <PlayerStatusToggle player={player} user={false} />

      {/* Age and Gender Badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {player?.age ? (
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]">
            Age : {player.age}
          </span>
        ) : null}
        {player?.gender !== undefined && player?.gender !== null && player?.gender !== "" ? (
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap bg-[var(--best-board-accent-soft)] border border-[var(--best-board-border-strong)] text-[var(--best-board-highlight)]">
            Gender: {player.gender === "male" || player.gender === "Male" ? "M" : "F"}
          </span>
        ) : null}
      </div>
    </div>

    {/* ── MAIN BODY ── */}
    <div className="flex items-center justify-between px-4 py-3 sm:py-4 gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <PlayerRankBadge rank={rank} />
        <PlayerAvatar player={player} rank={rank} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-h5 font-semibold text-[var(--best-board-text)] mb-0.5">{player?.name || "N/A"}</p>
          <p className="truncate text-sm text-[var(--best-board-muted)]">{getPhoneText(player?.phone)}</p>
        </div>
      </div>

      {/* Challenge Button */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChallenge(player);
          }}
          className="rounded-lg border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-[var(--best-board-text)] transition cursor-pointer hover:bg-[var(--best-board-border-strong)]/30"
        >
          Challenge
        </button>
      </div>
    </div>
  </div>
);

export default function BestOfPlayerListSection({
  mobileSection,
  loadingPlayers,
  reduxLoading,
  grades,
  refreshKey,
  editIndex,
  newName,
  setNewName,
  setEditIndex,
  setEditGradebarId,
  handleUpdateSection,
  user,
  groupSize,
  onOpenPlayer,
  onChallenge,
}) {
  return (
    <div className={`${mobileSection === "players" ? "block" : "hidden"} lg:block`}>
      {loadingPlayers || reduxLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl bg-[var(--best-board-surface)]" />
          ))}
        </div>
      ) : grades.length === 0 ? (
        <div className="best-board-card rounded-xl p-8 text-center text-sm text-[var(--best-board-muted)]">
          No players found.
        </div>
      ) : (
        <div className="space-y-7">
          {grades.map((section, gradeIndex) => (
            <div key={`${section.gradebarId}-${gradeIndex}`} className="space-y-3">
              <div className="best-board-section-banner flex items-center justify-between rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <p className="best-board-highlight text-h5 font-bold uppercase tracking-[0.18em]">
                    {editIndex === gradeIndex ? (
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateSection();
                          if (e.key === "Escape") setEditIndex(null);
                        }}
                        className="w-44 rounded border border-[var(--best-board-border)] bg-[var(--best-board-surface)] px-2 py-1 text-sm tracking-normal text-[var(--best-board-text)] outline-none"
                        autoFocus
                      />
                    ) : (
                      section.label
                    )}
                  </p>
                  <SectionBadge count={section.players.length} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (editIndex === gradeIndex) {
                      handleUpdateSection();
                      return;
                    }
                    setEditIndex(gradeIndex);
                    setNewName(section.label);
                    setEditGradebarId(section.gradebarId);
                  }}
                  className="best-board-action-surface inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>

              <div className="space-y-2">
                {section.players.map((player, playerIndex) => {
                  const canEdit =
                    ["admin", "sub_admin"].includes(user?.user_type?.toLowerCase()) ||
                    Number(user?.id) === Number(player?.user_id);
                  const rank = player?.rank || gradeIndex * groupSize + playerIndex + 1;

                  return (
                    <PlayerRow
                      key={`${player.id}-${rank}-${refreshKey}`}
                      player={player}
                      rank={rank}
                      canEdit={canEdit}
                      onOpenPlayer={onOpenPlayer}
                      onChallenge={onChallenge}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
