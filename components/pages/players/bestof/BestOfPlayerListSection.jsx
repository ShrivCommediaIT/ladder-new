"use client";

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
  <span className="rounded bg-white/5 px-2 py-1 text-[11px] font-medium text-[var(--best-board-muted)]">
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
        width={38}
        height={38}
        className="h-10 w-10 rounded-full object-cover"
        unoptimized
      />
    );
  }

  if (!player?.image) {
    const colorClass = PLAYER_COLOR_CLASSES[(Number(rank) - 1) % PLAYER_COLOR_CLASSES.length];
    return (
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colorClass} text-sm font-bold text-white`}>
        {getPlayerInitials(player?.name)}
      </div>
    );
  }

  return <Image src={Logo} alt="Player" width={38} height={38} className="h-10 w-10 rounded-full object-cover" />;
};

const PlayerRow = ({ player, rank, canEdit, onOpenPlayer, onChallenge }) => (
  <div
    onClick={() => {
      if (!canEdit) {
        toast.warning("You may only tap on your name");
        return;
      }
      onOpenPlayer(player, "result");
    }}
    className={`group flex items-center justify-between rounded-xl border border-[var(--best-board-border)] bg-[var(--best-board-surface)] px-4 py-4 transition hover:border-[var(--best-board-border-strong)] ${canEdit ? "cursor-pointer" : "cursor-not-allowed"
      }`}
  >
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-[var(--best-board-muted)]">
        {rank}
      </div>
      <PlayerAvatar player={player} rank={rank} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-h5 font-semibold text-[var(--best-board-text)]">{player?.name || "N/A"}</p>
          {player?.age ? (
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--best-board-muted)]">
              {player.age}
            </span>
          ) : null}
          {player?.gender !== undefined && player?.gender !== null && player?.gender !== "" ? (
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--best-board-muted)]">
              {player.gender === "male" || player.gender === "Male" ? "M" : "F"}
            </span>
          ) : null}
        </div>
        <p className="truncate text-sm text-[var(--best-board-muted)]">{getPhoneText(player?.phone)}</p>
      </div>
    </div>

    <div className="ml-4 flex items-center gap-3">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChallenge(player);
        }}
        className="hidden rounded-lg border border-[var(--best-board-border-strong)] bg-[var(--best-board-accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--best-board-text)] transition group-hover:block cursor-pointer"
      >
        Challenge
      </button>
      <div onClick={(e) => e.stopPropagation()}>
        <PlayerStatusToggle player={player} user={false} />
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
