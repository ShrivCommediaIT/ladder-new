"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#050816]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative min-h-screen w-full text-center bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center flex-col shadow-2xl"
      >
        <motion.h1
          className="text-8xl font-extrabold text-cyan-400 mb-4"
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-2xl font-semibold text-white mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Page Not Found
        </motion.h2>
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}