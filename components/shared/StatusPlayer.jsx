
// ===================== ==>

  "use client";

import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { changePlayerStatus } from "@/redux/slices/playerStatusSlice";
import { toast } from "react-toastify";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { motion, AnimatePresence } from "framer-motion";

const StatusPlayer = ({ playerId, onClose = () => {} }) => {
  const [status, setStatus] = useState("1");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 🔹 new state
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.playerStatus);

  const handleStatusUpdate = () => {
    if (!playerId) {
      toast.error("Player ID missing. Please refresh.");
      return;
    }

    setIsUpdating(true); 

    dispatch(changePlayerStatus({ user_id: playerId, player_status: status }))
      .unwrap()
      .then((res) => {
        // toast.success("Status updated successfully", {autoClose: true});

        // Close the parent modal
        onClose();

        setIsDialogOpen(false); // 🔹 close dialog on success
      })
      .catch((err) => {
        toast.error(err || "Failed to update status");
      })
      .finally(() => {
        setTimeout(() => {
          setIsUpdating(false);
        }, 1000);
      });
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Player Status</h3>

      <AnimatePresence>
        {isUpdating ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
            <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
          </motion.div>
        ) : (
          <RadioGroup
            key="real-content"
            value={status}
            onValueChange={setStatus}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="1"
                id="available"
                className={clsx(
                  "border-2",
                  status === "1" ? "border-green-600 bg-green-100" : ""
                )}
              />
              <Label htmlFor="available" className="text-base text-green-700">
                Available
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="2"
                id="injured"
                className={clsx(
                  "border-2",
                  status === "2" ? "border-red-600 bg-red-100" : ""
                )}
              />
              <Label htmlFor="injured" className="text-base text-red-700">
                Unavailable
              </Label>
            </div>
          </RadioGroup>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            disabled={loading}
            className="mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsDialogOpen(true)} // 🔹 open dialog on click
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the player's status to{" "}
              <strong>{status === "1" ? "Available" : "Unavailable"}</strong>.
              <br />
              You can always change it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-red-100 hover:bg-red-200 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              {loading ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StatusPlayer;



