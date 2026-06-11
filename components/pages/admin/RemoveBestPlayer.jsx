"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { postWithParams } from "@/services/apiService";
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

  const handleRemove = async () => {
    const rankNum = Number(rank);
    
    if (!ladderId || rankNum <= 0) {
      toast.warning("Please enter valid rank!", { autoClose: 2000 });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ API CALL
      const response = await postWithParams(API_ENDPOINTS.REMOVE_USER, {
        ladder_id: ladderId,
        rank: rankNum,
      });

      if (response?.status === 200) {
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
      className="py-4 px-4 rounded-xl bg-card border border-border w-full text-center shadow-sm text-foreground"
    >
      <p className="text-start font-semibold mb-4 text-foreground text-lg">
        Remove player ranked number
      </p>

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
        placeholder="Enter rank"
        className="mb-6 text-lg font-semibold bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none h-12"
        disabled={isLoading}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button 
            className="w-full h-12 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg cursor-pointer"
            disabled={isLoading || !rank || Number(rank) <= 0}
          >
            {isLoading ? "Removing..." : `Remove Rank`}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-card border border-border text-foreground">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground">
              Player at <strong className="text-foreground">Rank {rank}</strong> will be 
              permanently removed from Ladder <strong className="text-foreground">#{ladderId}</strong>.
              <br /><br />
              <span className="text-destructive font-semibold">This action cannot be undone!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="h-12 cursor-pointer text-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90 text-white h-12 font-bold shadow-lg cursor-pointer"
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
