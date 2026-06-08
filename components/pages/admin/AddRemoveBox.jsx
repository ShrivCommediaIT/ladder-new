
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import RemovePlayerBox from "./RemovePlayerBox";
import AddPlayer from "./AddPlayer";
import MovePlayerBox from "./MovePlayerBox";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const AddRemoveBox = ({ ladderId, onSuccessRefresh }) => {
  const searchParams = useSearchParams();
  const currentLadderId = ladderId || searchParams.get("ladder_id");
  const ladderType = searchParams.get("type");

  // Show Move for ALL types EXCEPT skill
  const showMove = ladderType !== "skill";

  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const handleDialogClose = (setter) => () => setter(false);

  const handleAddClose = () => {
    setAddOpen(false);
    onSuccessRefresh?.();
  };

  const handleRemoveClose = () => {
    setRemoveOpen(false);
    onSuccessRefresh?.();
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={modalVariants}
      className="w-full max-w-lg mx-auto border border-border rounded-2xl py-7 px-4 sm:px-8
                     bg-card backdrop-blur-md shadow-2xl space-y-7"
    >
      {/* Add - ALWAYS SHOW */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <span className="text-lg font-extrabold text-foreground tracking-wide">
          Add
        </span>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAddOpen(true)}
              className="px-5 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 shadow-md rounded-full text-sm font-semibold text-primary transition-all"
            >
              Select
            </motion.button>
          </DialogTrigger>
          <AnimatePresence>
            {addOpen && (
              <DialogContent className="sm:max-w-xl w-full rounded-2xl shadow-2xl bg-card border border-border text-foreground">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={modalVariants}
                >
                  <DialogTitle className="sr-only">Add Player</DialogTitle>
                  <AddPlayer
                    ladderId={currentLadderId}
                    onClose={handleAddClose}
                    onSuccessRefresh={onSuccessRefresh}
                  />
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>

      {/* Remove - ALWAYS SHOW */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <span className="text-lg font-extrabold text-foreground tracking-wide">
          Remove
        </span>
        <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRemoveOpen(true)}
              className="px-5 py-2 bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 shadow-md rounded-full text-sm font-semibold text-destructive transition-all"
            >
              Select
            </motion.button>
          </DialogTrigger>
          <AnimatePresence>
            {removeOpen && (
              <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl bg-card border border-border text-foreground">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={modalVariants}
                >
                  <DialogTitle className="sr-only">Remove Player</DialogTitle>
                  <RemovePlayerBox
                    onClose={handleRemoveClose}
                    onSuccessRefresh={onSuccessRefresh}
                    ladderId={currentLadderId}
                  />
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>

      {/* Move - SHOW FOR minileague, best5, best3, winlose (NOT skill, roster, positive, negative) */}
      {(showMove && ladderType != "roster" && ladderType != "positive" && ladderType != "negative") && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-extrabold text-foreground tracking-wide">
            Move
          </span>
          <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMoveOpen(true)}
                className="px-5 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 shadow-md rounded-full text-sm font-semibold text-amber-600 dark:text-amber-400 transition-all"
              >
                Select
              </motion.button>
            </DialogTrigger>
            <AnimatePresence>
              {moveOpen && (
                <DialogContent className="overflow-y-auto bg-transparent border-none">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={modalVariants}
                  >
                    <DialogTitle className="sr-only">Move Player</DialogTitle>
                    <MovePlayerBox
                      onCancel={handleDialogClose(setMoveOpen)}
                      ladderId={currentLadderId}
                      onSuccessRefresh={onSuccessRefresh}
                    />
                  </motion.div>
                </DialogContent>
              )}
            </AnimatePresence>
          </Dialog>
        </div>
      )}
    </motion.div>
  );
};

export default AddRemoveBox;
