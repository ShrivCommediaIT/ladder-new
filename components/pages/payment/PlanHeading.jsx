"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LadderBenefits from "./LadderBenefits";
import Image from "next/image";
import topLogo from "@/public/topLogo.png";

export default function PlanHeading() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center text-white">
      {/* BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/homeVideo.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* TOP LOGO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0 z-10"
      ></motion.div>

      {/* MAIN CONTENT */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl w-full px-6 sm:px-10 py-10 mt-20 text-center bg-white/0 border border-white/80 rounded-2xl shadow-2xl"
      >
        <h1 className="text-4xl sm:text-3xl font-extrabold uppercase tracking-wide mb-4 text-white drop-shadow-lg">
          Online Sports Solutions
        </h1>

        <p className="text-sm sm:text-lg bg-[#2A4151] rounded-lg shadow py-4 font-semibold mb-2 text-white">
          Automated Ladders, Minileagues, Leaderboards, Skills & Performance
          Challenge Boards and so much more
        </p>

        <p className="text-xl sm:text-2xl font-semibold mb-2 text-white">
          Create and Test for Free Now!
        </p>

        {/* Upload Info */}
        <div className="">
          {/* <p className="text-lg sm:text-xl font-medium text-gray-100">
            Upload an <span className="text-yellow-300 font-semibold">EXCEL CSV</span> file of your players’ details <br />
            to see exactly how it would look and feel for you.
          </p>

          <p className="font-semibold text-red-400">
            No CSV file to hand? - Check out our "demo" ladder
          </p> */}

          {/* Animated Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex justify-center"
          >
            <Link
              href="/register-page"
              className="relative inline-flex items-center justify-center px-10 py-3 text-lg font-bold text-white  rounded-full overflow-hidden transition-all duration-300 shadow-lg"
            >
              <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10">Click Here</span>

              {/* Animated glow ring */}
              <motion.span
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-40"
              ></motion.span>
            </Link>
          </motion.div>

          {/* <p className="text-sm sm:text-base text-gray-200 italic">
            <span className="font-semibold text-yellow-200">Note:</span> Your free ladder only allows you to test functionality
            of the top ten players listed
          </p> */}
        </div>
      </motion.section>

      {/* CONTACT */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-8 text-gray-200"
      >
        {/* <p className="text-sm sm:text-base">
          Contact:{" "}
          <span className="underline text-blue-300 cursor-pointer">
            support@sportssolutionspro.com
          </span>
        </p> */}
      </motion.section>

      {/* BENEFITS SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 w-full mt-10 px-6 sm:px-12"
      ></motion.section>
    </main>
  );
}
