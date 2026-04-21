
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
  // PROPS ACCEPT
  const searchParams = useSearchParams();
  const currentLadderId = ladderId || searchParams.get("ladder_id"); // Fallback
  const ladderType = searchParams.get("type");

  // ✅ FIXED: Show Move for ALL types EXCEPT skill
  const showMove = ladderType !== "skill"; // minileague, best5, best3, winlose - SHOW MOVE

  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const handleDialogClose = (setter) => () => setter(false);

  const handleAddClose = () => {
    setAddOpen(false);
    onSuccessRefresh?.(); // Extra refresh on manual close
  };

  const handleRemoveClose = () => {
    setRemoveOpen(false);
    onSuccessRefresh?.(); // Refresh on manual close
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={modalVariants}
      className="w-full max-w-lg mx-auto border border-teal-900 rounded-2xl py-7 px-4 sm:px-8
                     backdrop-blur-md shadow-2xl space-y-7"
    >
      {/* Add - ALWAYS SHOW */}
      <div className="flex items-center justify-between gap-4 border-b border-[#2c3149] pb-3">
        <span className="text-lg font-extrabold text-white tracking-wide">
          Add
        </span>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#0B1922" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAddOpen(true)}
              className="px-5 py-2 bg-[#0B1922] shadow-md rounded-full text-sm font-semibold text-white transition-all"
            >
              Select
            </motion.button>
          </DialogTrigger>
          <AnimatePresence>
            {addOpen && (
              <DialogContent className="sm:max-w-xl w-full rounded-2xl shadow-2xl bg-[#0B1922] border border-[#1a1f2b]">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={modalVariants}
                >
                  <DialogTitle className="sr-only">Add Player</DialogTitle>
                  {/*  REFRESH CALLBACK FORWARDED */}
                  <AddPlayer
                    ladderId={currentLadderId}
                    onClose={handleAddClose}
                    onSuccessRefresh={onSuccessRefresh} // CHAIN COMPLETE
                  />
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>

      {/* Remove - ALWAYS SHOW */}
      <div className="flex items-center justify-between gap-4 border-b border-[#2c3149] pb-3">
        <span className="text-lg font-extrabold text-white tracking-wide">
          Remove
        </span>
        <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#0B1922" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRemoveOpen(true)}
              className="px-5 py-2 bg-[#0B1922] shadow-md rounded-full text-sm font-semibold text-white transition-all"
            >
              Select
            </motion.button>
          </DialogTrigger>
          <AnimatePresence>
            {removeOpen && (
              <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl bg-[#0B1922] text-white">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={modalVariants}
                >
                  <DialogTitle className="sr-only">Remove Player</DialogTitle>

                  <RemovePlayerBox
                    onClose={handleRemoveClose} // Proper close handler
                    onSuccessRefresh={onSuccessRefresh}
                    ladderId={currentLadderId}
                  />
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>

      {/* Move - SHOW FOR minileague, best5, best3, winlose (NOT skill) */}
      {(showMove && ladderType != "roster" && ladderType != "positive" && ladderType != "negative")  && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-lg font-extrabold text-white tracking-wide">
            Move
          </span>
          <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#d9a72c" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMoveOpen(true)}
                className="px-5 py-2 bg-[#0B1922] shadow-md rounded-full text-sm font-semibold text-white transition-all"
              >
                Select
              </motion.button>
            </DialogTrigger>
            <AnimatePresence>
              {moveOpen && (
                <DialogContent className=" overflow-y-auto bg-tansparent border-none ">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    // exit="exit"
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
