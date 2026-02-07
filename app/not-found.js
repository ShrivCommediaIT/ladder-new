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
        {/* Floating 404 circles */}
        {/* <motion.div
          className="absolute w-16 h-16 bg-cyan-500 rounded-full top-[-20px] left-[-20px] opacity-30"
          animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        /> */}
        {/* <motion.div
          className="absolute w-10 h-10 bg-purple-500 rounded-full bottom-[-10px] right-[-15px] opacity-30"
          animate={{ y: [0, 10, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        /> */}

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

        {/* <motion.p
          className="text-white/70 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Sorry, this page doesn't exist or you're not authorized to view it.
        </motion.p> */}

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

          {/* <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
          >
            Go Back
          </button> */}
        </motion.div>
      </motion.div>
    </div>
  );
}