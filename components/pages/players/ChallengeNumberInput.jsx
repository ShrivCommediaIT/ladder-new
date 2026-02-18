

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import gsap from "gsap";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";

import { fetchUserByRank } from "@/redux/slices/fetchUserByRank";
import {
  challengeToPlayer,
  resetChallengeStatus,
} from "@/redux/slices/challengeSlice";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { useSearchParams } from "next/navigation";
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

const Challenge = ({ userId }) => {
  const [challengeNumber, setChallengeNumber] = useState("");
  const [localLoading, setLocalLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();

  const { loading: challengeLoading, error: challengeError } = useSelector(
    (state) => state.challenge
  );
  const { user: challengedPlayer, loading: playerLoading } = useSelector(
    (state) => state.userByRank
  );

  const searchParams = useSearchParams();
  const ladderId = searchParams.get("ladder_id");
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // ✨ GSAP entry animation
  useEffect(() => {
    if (!localLoading && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [localLoading]);

  useEffect(() => {
    if (challengeNumber && ladderId) {
      dispatch(fetchUserByRank({ rank: challengeNumber, ladder_id: ladderId }));
    }
  }, [challengeNumber, ladderId, dispatch]);

  const handleKeyClick = (num) => {
    if (challengeNumber.length < 4) {
      setChallengeNumber((prev) => prev + num);
      gsap.fromTo(
        ".digit-display",
        { scale: 1.2, color: "#38bdf8" },
        { scale: 1, color: "#fff", duration: 0.3 }
      );
    }
  };

  const handleBackspace = () => {
    setChallengeNumber((prev) => prev.slice(0, -1));
  };

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!challengeNumber || !userId) return;
    setShowConfirm(true);
  };

  const confirmChallenge = async () => {
    setShowConfirm(false);
    toast.info("Sending challenge...", { autoClose: 800 });

    try {
      await dispatch(
        challengeToPlayer({
          user_id: userId,
          challenge_to_rank: challengeNumber,
        })
      ).unwrap();

      await dispatch(fetchUserActivity({ ladder_id: ladderId }));
      toast.success(`Challenge sent to rank ${challengeNumber}`);
      setChallengeNumber("");
    } catch (err) {
      toast.error(`${challengeError || "Something went wrong"}`);
    } finally {
      dispatch(resetChallengeStatus());
    }
  };

  if (localLoading) {
    return (
      <div className="w-full h-auto flex items-center justify-center bg-gray-900 rounded-xl shadow-md">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <>
      {/* 🔥 Confirm Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="z-50 bg-white shadow-xl scale-95 animate-in fade-in-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will send a challenge to rank{" "}
              <span className="font-bold text-blue-600">
                {challengeNumber}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-red-100 cursor-pointer hover:bg-red-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmChallenge}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✨ Main UI */}
      <motion.div
        ref={containerRef}
        layout
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex items-center justify-center max-h-[60vh] overflow-hidden p-4 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800 rounded-xl shadow-xl"
      >
        <motion.form
          onSubmit={handleOpenConfirm}
          className="space-y-4 mt-4 text-white w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
     

          <motion.div
            className="flex justify-center mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: 0, duration: 0.6 }}
          >
            <input
              type="text"
              value={challengeNumber}
              placeholder="Enter Rank"
              readOnly
              className="w-40 border-2 border-zinc-100 digit-display text-center px-4 py-1 text-xl rounded-md text-gray-100 shadow-lg "
            />
          </motion.div>

          {/* 📱 Player Phone Section */}
          <div className="text-sm text-center flex flex-col gap-1 items-center">
            <p className="text-gray-300">Their number will appear below:</p>
            <motion.span
              className="relative font-semibold border shadow-md px-8 py-2 rounded-md text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-blue-900"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {playerLoading ? "Loading..." : challengedPlayer?.phone ?? "N/A"}
              {!playerLoading && challengedPlayer?.phone && (
                <Copy
                  className="w-4 h-4 text-white cursor-pointer hover:text-sky-300 transition-all"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(challengedPlayer.phone)
                      .then(() =>
                        toast.success("Phone number copied!", {
                          autoClose: 2000,
                        })
                      )
                      .catch(() => toast.error("Failed to copy!"));
                  }}
                />
              )}
            </motion.span>
          </div>

          {/* 🔢 Number Pad */}
          <motion.div
            className="grid grid-cols-5 gap-2 mt-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
              <motion.button
                key={num}
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => handleKeyClick(num)}
                className="py-2 rounded-md border border-gray-600 bg-gray-800 text-lg font-medium text-white cursor-pointer hover:bg-violet-600 transition-all shadow-md"
              >
                {num}
              </motion.button>
            ))}

            <motion.button
              type="button"
              whileTap={{ scale: 0.9, backgroundColor: "#581c87" }}
              onClick={handleBackspace}
              className="col-span-5 py-2 rounded-md border text-lg font-medium text-white bg-blue-950 hover:bg-violet-700 cursor-pointer shadow-lg"
            >
              ⌫ Backspace
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </>
  );
};

export default Challenge;

