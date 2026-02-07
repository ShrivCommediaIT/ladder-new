"use client";

import { motion, AnimatePresence } from "framer-motion";

export const AnimatedSection = ({
  show,
  children,
  keyId,
}) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={keyId}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="will-change-transform"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
