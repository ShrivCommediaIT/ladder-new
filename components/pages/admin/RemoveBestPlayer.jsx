"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import axios from "axios";
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
import { useDispatch } from "react-redux";
import { CheckCircle, AlertCircle } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const RemoveBestPlayer = ({ ladderId, onClose, onSuccessRefresh }) => {
  const [rank, setRank] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

  const handleRemove = async () => {
    const rankNum = Number(rank);
    
    if (!ladderId || rankNum <= 0) {
      toast.warning("Please enter valid rank!", { autoClose: 2000 });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ API CALL
      const response = await axios.post(
        `https://ne-games.com/leaderBoard/api/user/removeUser`,
        {},
        {
          params: { ladder_id: ladderId, rank: rankNum },
          headers: { APPKEY },
        }
      );

      if (response.data?.status === 200) {
        // ✅ INSTANT CLOSE + REFRESH
        onClose?.(); // Close Remove dialog
        onSuccessRefresh?.(); // Refresh leaderboard
        
        // Success feedback
        toast.success(`Player at rank ${rankNum} removed successfully! 🎉`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Reset form
        setRank("");
      } else {
        throw new Error(response.data?.message || "Failed to remove player");
      }
    } catch (error) {
      console.error("❌ Remove Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to remove player");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.5 }}
      className="py-4 px-4 rounded-md bg-[#0B1922] w-full text-center shadow-sm"
    >
      <p className="text-start font-semibold mb-4 text-white text-lg">
        Remove player ranked number
      </p>

      <Input
        type="number"
        value={rank}
        onChange={(e) => setRank(e.target.value)}
        placeholder="Enter rank"
        min="1"
        className="mb-6 text-lg font-semibold bg-white/10 border-2 border-white/30 rounded-xl focus:border-teal-400"
        disabled={isLoading}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button 
            className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                       text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            disabled={isLoading || !rank || Number(rank) <= 0}
          >
            {isLoading ? "Removing..." : `Remove Rank`}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-[#0B1922] border-teal-900 text-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-300">
              Player at <strong className="text-white">Rank {rank}</strong> will be 
              permanently removed from Ladder <strong>#{ladderId}</strong>.
              <br /><br />
              <span className="text-red-400 font-semibold">This action cannot be undone!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="bg-gray-800 hover:bg-gray-700 border-gray-600 h-12 text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isLoading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                         h-12 font-bold shadow-lg text-white"
            >
              {isLoading ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Player"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default RemoveBestPlayer;
