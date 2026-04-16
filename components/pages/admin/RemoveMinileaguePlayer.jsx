

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
  const [rank, setRank] = useState(0);
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
    if (!ladder_id || rank <= 0 || !selectedSection) {
      setAlertInfo({ open: true, title: "Validation Error", description: "Select section and enter valid rank.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      onClose?.();
      setOpenConfirm(false);

      const payload = {
        rank,
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
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 border border-gray-700"
    >
      <h2 className="text-xl font-bold text-white mb-4">Remove Player from Minileague</h2>

      <select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        className="mb-4 w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
      >
        <option value="">Select Section</option>
        {miniLeagueSections.map((sec) => (
          <option key={sec.section} value={sec.section}>
            {sec.section}
          </option>
        ))}
      </select>

      <Input
        type="number"
        value={rank}
        onChange={(e) => setRank(Number(e.target.value))}
        placeholder="Enter rank to remove"
        className="mb-4 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition"
      />

      {/* Confirm Remove Button */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <button
          onClick={() => setOpenConfirm(true)}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold hover:scale-105 transition-transform"
        >
          Remove Player
        </button>

        <AlertDialogContent className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This action cannot be undone. The player will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel disabled={isLoading} className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-300 text-black transition">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              {isLoading ? "Removing..." : "Confirm Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Alert for Success/Error */}
      <AlertDialog open={alertInfo.open} onOpenChange={() => setAlertInfo({ ...alertInfo, open: false })}>
        <AlertDialogContent className={`bg-gray-800 border rounded-2xl ${alertInfo.type === "error" ? "border-red-600" : "border-green-600"} shadow-lg`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-white font-bold">{alertInfo.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">{alertInfo.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction
              onClick={() => setAlertInfo({ ...alertInfo, open: false })}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition"
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
