"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { postRequest, postWithParams } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { CheckCircle, AlertCircle } from "lucide-react";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const RemovePlayerBox = ({ onClose, onSuccessRefresh }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const typeFromParams = searchParams.get("type");

  // Determine ladder type
  const playerLadderType = useSelector(
    (state) => state.player?.players?.[ladderId]?.ladderDetails?.type
  );
  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type
  );
  const ladderType = typeFromParams || playerLadderType || miniLeagueLadderType;
  const isMiniLeague = ladderType === "minileague";

  // Form State
  const [rank, setRank] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  // Redux miniLeague data for section select dropdown
  const miniLeagueSections = useSelector((state) => state.minileague?.data) || [];

  useEffect(() => {
    if (isMiniLeague && ladderId) {
      dispatch(fetchMiniLeague({ ladder_id: ladderId }));
    }
  }, [isMiniLeague, ladderId, dispatch]);

  const handleRemove = async () => {
    const rankNum = Number(rank);

    if (!ladderId || rankNum <= 0) {
      toast.warning("Please enter valid rank!", { autoClose: 2000 });
      return;
    }

    if (isMiniLeague && !selectedSection) {
      toast.warning("Please select a section!", { autoClose: 2000 });
      return;
    }

    setIsLoading(true);

    try {
      if (isMiniLeague) {
        const payload = {
          rank: rankNum,
          section: selectedSection,
          removalReason: "Removed via admin panel",
        };

        await postRequest(
          `${API_ENDPOINTS.REMOVE_USER_MINILEAGUE}?ladder_id=${ladderId}`,
          payload
        );

        toast.success(`Player removed successfully! 🎉`);
        dispatch(fetchMiniLeague({ ladder_id: ladderId }));
        dispatch(fetchUserActivity({ ladder_id: ladderId }));
        onSuccessRefresh?.();
      } else {
        const response = await postWithParams(API_ENDPOINTS.REMOVE_USER, {
          ladder_id: ladderId,
          rank: rankNum,
        });

        if (response?.status === 200 || response?.status === "200") {
          toast.success(`Player at rank ${rankNum} removed successfully! 🎉`);
          onSuccessRefresh?.();
        } else {
          throw new Error(response?.error_message || response?.message || "Failed to remove player");
        }
      }

      setRank("");
      setSelectedSection("");
      onClose?.();
    } catch (error) {
      console.error("❌ Remove Error:", error.response?.data || error);
      const errMsg = error.response?.data?.error_message || error.response?.data?.message || error.message || "Failed to remove player";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
      setOpenConfirm(false);
    }
  };

  const isButtonDisabled = isLoading || !rank || Number(rank) <= 0 || (isMiniLeague && !selectedSection);

  // Dynamic CSS classes/styles
  const wrapperClass = isMiniLeague
    ? "w-full max-w-md mx-auto p-6 rounded-2xl bg-[var(--best-board-surface)] text-[var(--best-board-text)]"
    : "py-4 px-4 rounded-xl bg-card text-foreground text-center w-full";

  const selectClass = isMiniLeague
    ? "mb-4 w-full min-w-0 px-3 py-2 rounded-lg bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] text-[var(--best-board-text)] focus:outline-none focus:border-[var(--best-board-border-strong)] focus:ring-1 focus:ring-[var(--best-board-border-strong)] transition-all duration-200"
    : "";

  const inputClass = isMiniLeague
    ? "mb-4 w-full min-w-0 bg-[var(--best-board-surface-soft)] text-[var(--best-board-text)] border border-[var(--best-board-border)] rounded-lg focus-visible:ring-[var(--best-board-border-strong)] focus-visible:border-[var(--best-board-border-strong)] placeholder:text-[var(--best-board-muted)] transition-all duration-200"
    : "mb-6 text-lg font-semibold bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none h-12";

  const buttonClass = isMiniLeague
    ? "w-full py-2.5 rounded-xl bg-[var(--best-board-danger)] hover:brightness-110 text-white font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    : "w-full h-12 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg cursor-pointer";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.4 }}
      className={wrapperClass}
    >
      <h2 className={`text-xl font-bold mb-4 ${isMiniLeague ? "text-start" : "text-center"}`}>
        {isMiniLeague ? "Remove Player from Minileague" : "Remove Player"}
      </h2>

      {!isMiniLeague && (
        <p className="text-start font-semibold mb-4 text-foreground text-sm">
          Remove player ranked number
        </p>
      )}

      {isMiniLeague && (
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className={selectClass}
        >
          <option className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value="">
            Select Section
          </option>
          {miniLeagueSections.map((sec) => (
            <option key={sec.section} className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value={sec.section}>
              {sec.section}
            </option>
          ))}
        </select>
      )}

      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={rank}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          if (val === "") {
            setRank("");
          } else {
            const num = parseInt(val, 10);
            if (num > 0) {
              setRank(String(num));
            }
          }
        }}
        placeholder={isMiniLeague ? "Enter rank to remove" : "Enter rank"}
        className={inputClass}
        disabled={isLoading}
      />

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogTrigger asChild>
          <button
            onClick={() => setOpenConfirm(true)}
            className={buttonClass}
            disabled={isButtonDisabled}
          >
            {isLoading ? "Removing..." : "Remove Player"}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-card border border-border text-foreground rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <AlertDialogTitle className="text-lg font-bold">Confirm Removal</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              {isMiniLeague ? (
                <>
                  This action cannot be undone. Player at <strong className="text-foreground">Rank {rank}</strong> in section <strong className="text-foreground">{selectedSection}</strong> will be permanently removed.
                </>
              ) : (
                <>
                  Player at <strong className="text-foreground">Rank {rank}</strong> will be permanently removed from Ladder <strong className="text-foreground">#{ladderId}</strong>.
                  <br /><br />
                  <span className="text-destructive font-semibold">This action cannot be undone!</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel
              onClick={() => setOpenConfirm(false)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground transition bg-transparent h-10 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-bold h-10 shadow-lg cursor-pointer flex items-center justify-center"
            >
              {isLoading ? "Removing..." : "Remove Player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default RemovePlayerBox;
