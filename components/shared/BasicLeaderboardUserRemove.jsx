
"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // ✅ SHADCN BUTTON
import { postWithParams } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "react-toastify";
import { X, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";



const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BasicLeaderboardUserRemove = ({ ladderId, ladderType, myRank, onClose, onSuccessRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rankInput, setRankInput] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);




   const handleSelfRemove = async () => {
    if (!ladderId) {
      toast.warning("Invalid ladder!", { autoClose: 2000 });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ API CALL - Remove current logged-in user only
      const response = await postWithParams(API_ENDPOINTS.REMOVE_USER, {
        ladder_id: ladderId,
        rank: myRank,
      });

      if (response?.status === 200) {
        // Clear user session storage
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userData");

        onClose(); // Close dialog
        onSuccessRefresh(); // Refresh leaderboard
        
        toast.success("You have been removed from leaderboard! 👋", {
          position: "top-right",
          autoClose: 3000,
        });

        const activeLadderType = ladderType || searchParams.get("ladder_type") || searchParams.get("type") || "winlose";
        router.push(`/login-user?ladder_id=${ladderId}&ladder_type=${activeLadderType}`);
      } else {
        throw new Error(response?.message || "Failed to remove");
      }
    } catch (error) {
      console.error("❌ Remove Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to remove yourself");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckRank = () => {
    if (!rankInput) {
      toast.warning("Please enter your rank");
      return;
    }
    const val = Number(rankInput);
    if (val < 1) {
      toast.error("Rank must be 1 or greater");
      return;
    }

    if (Number(rankInput) !== Number(myRank)) {
      toast.error(" Rank does not match your current rank");
      return;
    }

    // ✅ Rank matched → open confirm dialog
    setShowConfirm(true);
  };


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md p-8 rounded-3xl bg-card border border-border shadow-2xl backdrop-blur-sm text-foreground"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center 
                       rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Remove Yourself</h2>
      </div>

      <div className="mb-6">
        <label className="block text-muted-foreground mb-2 text-sm font-semibold">
          Enter your current rank to confirm
        </label>
        <Input
          type="number"
          min="1"
          placeholder="Enter your rank"
          value={rankInput}
          onChange={(e) => {
            const val = e.target.value;
            if (val !== "") {
              const num = Number(val);
              if (num < 1) return;
            }
            setRankInput(val);
          }}
          className="h-12 text-lg bg-muted border-input text-foreground focus-visible:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Your current rank: #{myRank}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outline"
          className="flex-1 h-14 text-lg font-bold border-border bg-transparent text-foreground hover:bg-muted transition-colors rounded-xl"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleCheckRank}   // ✅ pehle sirf check hoga
          disabled={isLoading}
          className="flex-1 h-14 bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all rounded-xl shadow-md shadow-primary/10"
        >
          Confirm
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card text-foreground border border-border rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-foreground">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This will permanently remove you from this leaderboard.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
            <AlertDialogCancel className="bg-muted text-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl h-10 px-4">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleSelfRemove}   // ✅ final API call
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10 px-4"
            >
              Yes, remove me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default BasicLeaderboardUserRemove;
