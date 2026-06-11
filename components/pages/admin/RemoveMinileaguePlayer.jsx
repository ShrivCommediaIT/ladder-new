

'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const RemoveMinileaguePlayer = ({ onClose, onSuccessRefresh }) => {
  const [rank, setRank] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ open: false, title: "", description: "", type: "success" });

  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");
  const miniLeagueSections = useSelector((state) => state.minileague.data) || [];

  useEffect(() => {
    if (ladder_id) dispatch(fetchMiniLeague({ ladder_id }));
  }, [ladder_id, dispatch]);

  const handleRemove = async () => {
    if (!ladder_id || Number(rank) <= 0 || !selectedSection) {
      setAlertInfo({ open: true, title: "Validation Error", description: "Select section and enter valid rank.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      onClose?.();
      setOpenConfirm(false);

      const payload = {
        rank: Number(rank),
        section: selectedSection,
        removalReason: "Removed via admin panel",
      };

      await postRequest(
        `${API_ENDPOINTS.REMOVE_USER_MINILEAGUE}?ladder_id=${ladder_id}`,
        payload
      );

      dispatch(fetchMiniLeague({ ladder_id }));
      dispatch(fetchUserActivity({ ladder_id }));
      onSuccessRefresh?.(); // ✅ Refresh callback

      setAlertInfo({ open: true, title: "Success", description: `Player removed successfully!`, type: "success" });
    } catch (err) {
      console.error(err);
      setAlertInfo({ open: true, title: "Error", description: "Failed to remove player.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-2xl bg-[var(--best-board-surface)] border border-[var(--best-board-border)] text-[var(--best-board-text)]"
    >
      <h2 className="text-xl font-bold text-[var(--best-board-text)] mb-4">Remove Player from Minileague</h2>

      <select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        className="mb-4 w-full min-w-0 px-3 py-2 rounded-lg bg-[var(--best-board-surface-soft)] border border-[var(--best-board-border)] text-[var(--best-board-text)] focus:outline-none focus:border-[var(--best-board-border-strong)] focus:ring-1 focus:ring-[var(--best-board-border-strong)] transition-all duration-200"
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
        placeholder="Enter rank to remove"
        className="mb-4 w-full min-w-0 bg-[var(--best-board-surface-soft)] text-[var(--best-board-text)] border border-[var(--best-board-border)] rounded-lg focus-visible:ring-[var(--best-board-border-strong)] focus-visible:border-[var(--best-board-border-strong)] placeholder:text-[var(--best-board-muted)] transition-all duration-200"
      />

      {/* Confirm Remove Button */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <button
          onClick={() => setOpenConfirm(true)}
          className="w-full py-2.5 rounded-xl bg-[var(--best-board-danger)] text-white font-semibold hover:brightness-110 shadow-sm active:scale-95 transition-all duration-200"
        >
          Remove Player
        </button>

        <AlertDialogContent className="bg-[var(--best-board-surface)] border border-[var(--best-board-border)] rounded-2xl shadow-xl text-[var(--best-board-text)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-[var(--best-board-text)]">Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--best-board-muted)]">
              This action cannot be undone. The player will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel disabled={isLoading} className="px-4 py-2 rounded-lg border border-[var(--best-board-border)] hover:bg-[var(--best-board-surface-soft)] text-[var(--best-board-text)] transition bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[var(--best-board-danger)] text-white hover:brightness-110 transition"
            >
              {isLoading ? "Removing..." : "Confirm Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Alert for Success/Error */}
      <AlertDialog open={alertInfo.open} onOpenChange={() => setAlertInfo({ ...alertInfo, open: false })}>
        <AlertDialogContent className={`bg-[var(--best-board-surface)] border rounded-2xl ${alertInfo.type === "error" ? "border-[var(--best-board-danger)]" : "border-[var(--best-board-success)]"} shadow-lg text-[var(--best-board-text)]`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-[var(--best-board-text)] font-bold">{alertInfo.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--best-board-muted)]">{alertInfo.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction
              onClick={() => setAlertInfo({ ...alertInfo, open: false })}
              className="px-4 py-2 rounded-lg bg-[var(--best-board-accent)] text-white hover:brightness-110 transition"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default RemoveMinileaguePlayer;
