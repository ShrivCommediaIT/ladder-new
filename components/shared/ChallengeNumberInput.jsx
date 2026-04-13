"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react"; 
import { useSearchParams } from "next/navigation";

import { fetchUserByRank } from "@/redux/slices/fetchUserByRank";
import {
  challengeToPlayer,
  resetChallengeStatus,
} from "@/redux/slices/challengeSlice";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
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

  const searchParams = useSearchParams();

const ladderId = searchParams.get("ladder_id");
const ladderType = searchParams.get("ladder_type");

  const dispatch = useDispatch();

  const { loading: challengeLoading, error: challengeError } = useSelector(
    (state) => state.challenge
  );

  const { user: challengedPlayer, loading: playerLoading } = useSelector(
    (state) => state.userByRank
  );


  useEffect(() => {
    const timer = setTimeout(() => setLocalLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);


useEffect(() => {
  if (challengeNumber && ladderId) {
    dispatch(
      fetchUserByRank({
        rank: Number(challengeNumber),
        ladder_id: ladderId,
      })
    );
  }
}, [challengeNumber, ladderId, dispatch]);

  const handleKeyClick = (num) => {
    if (challengeNumber.length < 4) {
      setChallengeNumber((prev) => prev + num);
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
      toast.success(`\u2705 Challenge sent to rank ${challengeNumber}`);
      setChallengeNumber("");
    } catch (err) {
      toast.error(`\u274C ${challengeError || "Something went wrong"}`);
    } finally {
      dispatch(resetChallengeStatus());
    }
  };

  if (localLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow-md">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

return (
  <>
    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogContent className="z-50 w-[95vw] max-w-md bg-white shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base">
            This will send a challenge to rank{" "}
            <span className="font-bold text-blue-600">
              {challengeNumber}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="bg-red-100 hover:bg-red-200 w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmChallenge}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Scroll Wrapper */}
    <div className="w-full flex justify-center px-2 sm:px-4 overflow-y-auto max-h-[90vh]">
      <motion.div
        layout
        className="w-full max-w-md p-4 sm:p-6 border rounded-xl bg-gray-800 dark:bg-gray-900 shadow-lg"
      >
        <form onSubmit={handleOpenConfirm} className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg text-center font-semibold mb-2">
              I want to challenge number
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={challengeNumber}
                placeholder="Enter Rank"
                readOnly
                className="w-full sm:w-auto flex-1 rounded-md text-center px-3 py-2 border text-base sm:text-lg"
              />

              <Button
                className="w-full sm:w-auto cursor-pointer"
                type="button"
                variant="destructive"
                onClick={() => setChallengeNumber("")}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-center text-gray-200 mt-4 flex flex-col gap-3 items-center">
              Their number will appear for you to copy & paste
              <span className="relative font-semibold text-blue-600 border shadow-md px-4 py-1 w-full sm:w-48 text-center text-base sm:text-lg flex items-center justify-center gap-2">
                {playerLoading
                  ? "Loading..."
                  : challengedPlayer?.phone ?? "N/A"}

                {!playerLoading && challengedPlayer?.phone && (
                  <Copy
                    className="w-5 h-5 text-gray-600 cursor-pointer hover:text-black"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(challengedPlayer.phone)
                        .then(() => toast.success("Phone number copied!"))
                        .catch(() => toast.error("Failed to copy!"));
                    }}
                  />
                )}
              </span>
            </p>
          </div>

          {/* Responsive keypad */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyClick(num)}
                className="py-2 rounded-md border text-base sm:text-lg font-medium hover:bg-gray-500 dark:hover:bg-gray-800"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleBackspace}
              className="col-span-5 py-2 rounded-md border text-base sm:text-lg font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
            >
              X backspace
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  </>
);


};

export default Challenge;
