

"use client";

import React from "react";
import { motion } from "framer-motion";

const RulesForLadder = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-4xl mx-auto bg-gradient-to-b from-[#0f172a]/90 to-[#1e3a8a]/80 rounded-3xl shadow-2xl p-8 md:p-10 text-white leading-relaxed overflow-y-auto backdrop-blur-lg border border-white/20"
    >
      <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text tracking-wide">
        ⚖️ Rules for Ladder System
      </h1>

      <div className="space-y-6 text-base md:text-lg text-blue-100">
        <p>
          <strong className="text-cyan-300">Ideas for Admin:</strong> <br />
          Ladders may be run in several ways which are outlined below. It is
          important that you as admin make it clear to players what “rules”
          apply to your ladder in the{" "}
          <span className="font-semibold text-yellow-300">RULES section</span>{" "}
          on the ladder page. You can choose your own rules and post them by
          editing that section on your admin page.
        </p>

        <p className="text-blue-200 italic">
          💡 It is worth motivating players to accept requests within{" "}
          <span className="text-yellow-300 font-semibold">3 requests</span> — any
          refusal after three requests will be reported to admin.
        </p>

        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mt-8">
          📘 5 Main Ways to Run a Ladder and Their Rules
        </h3>

        {/* (1) OPEN STYLE */}
        <section className="bg-white/10 rounded-2xl p-5 shadow-md">
          <h4 className="text-lg font-bold text-yellow-300 mb-2">
            (1) OPEN STYLE
          </h4>
          <p>
            No sections and no restrictions – anyone can challenge anyone.
          </p>
          <ul className="list-disc list-inside mt-2 text-blue-100 space-y-1">
            <li>
              <strong>Pros:</strong> Simple to understand and run, minimal admin
              input.
            </li>
            <li>
              <strong>Cons:</strong> Better players can get too many challenges
              from lower-ranked players; little incentive for middle/bottom
              players.
            </li>
          </ul>
          <p className="mt-3 text-cyan-300 font-semibold">
            📋 <span className="text-red-400">COPY & PASTE:</span> Any player may
            challenge any player above them.
          </p>
        </section>

        {/* (2) OPEN WITH CHALLENGES LIMITED */}
        <section className="bg-white/10 rounded-2xl p-5 shadow-md">
          <h4 className="text-lg font-bold text-yellow-300 mb-2">
            (2) OPEN WITH CHALLENGES LIMITED
          </h4>
          <p>
            Players may challenge only a certain number of spots above them (e.g.
            3, 5, or 10 places).
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Prevents top players from being spammed by lower ones.</li>
            <li>
              <span className="text-red-300 font-semibold">
                Lower players may lose motivation if gap is large.
              </span>
            </li>
          </ul>
          <p className="mt-3 text-cyan-300 font-semibold">
            📋 <span className="text-red-400">COPY & PASTE:</span> Players may
            not challenge any player more than{" "}
            <span className="text-yellow-200">five places</span> above them.
          </p>
        </section>

        {/* (3) WITH SECTIONS */}
        <section className="bg-white/10 rounded-2xl p-5 shadow-md">
          <h4 className="text-lg font-bold text-yellow-300 mb-2">
            (3) WITH SECTIONS (Challenge One Above)
          </h4>
          <p>
            Players may challenge within their section and the one above. Ladder
            is divided by skill levels.
          </p>

          <div className="mt-2 space-y-1 text-blue-100">
            <p>
              <strong>Examples:</strong> Expert / Intermediate / Beginner,
              Grades: A+, A, B, etc.
            </p>
            <p>
              <strong>Pros:</strong> Fair matchups, clear goals for all players.
            </p>
          </div>

          <p className="mt-3 text-cyan-300 font-semibold">
            📋 <span className="text-red-400">COPY & PASTE:</span> Players may
            challenge anyone within their own section or the one above.
          </p>
        </section>

        {/* (4) WITH CONDITION */}
        <section className="bg-white/10 rounded-2xl p-5 shadow-md">
          <h4 className="text-lg font-bold text-yellow-300 mb-2">
            (4) WITH CONDITION (Top 3 Only)
          </h4>
          <p>
            Same as above, but only players in the{" "}
            <span className="text-yellow-200 font-semibold">top 3</span> of their
            section can challenge the next section.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Encourages competition within each section.</li>
            <li>Gives clear motivation for promotion.</li>
          </ul>
          <p className="mt-3 text-cyan-300 font-semibold">
            📋 <span className="text-red-400">COPY & PASTE:</span> Players may
            challenge anyone above them within their section and one above only
            if they are in the top three.
          </p>
        </section>

        {/* (5) GRADE SYSTEM */}
        <section className="bg-white/10 rounded-2xl p-5 shadow-md">
          <h4 className="text-lg font-bold text-yellow-300 mb-2">
            (5) GRADE SYSTEM (Promotion/Demotion)
          </h4>
          <p>
            Players can only challenge within their grade. At the end of each
            month, the top two are promoted and bottom two are demoted.
          </p>

          <ul className="list-disc list-inside mt-2 text-blue-100 space-y-1">
            <li>
              <strong>Pros:</strong> Motivation to rise while maintaining balance.
            </li>
            <li>
              <strong>Cons:</strong> Requires admin updates monthly.
            </li>
          </ul>

          <p className="mt-3 text-cyan-300 font-semibold">
            📋 <span className="text-red-400">COPY & PASTE:</span> Players may
            only challenge within their grade. Each month, top TWO are promoted,
            bottom TWO are demoted.
          </p>
        </section>
      </div>

      <div className="mt-10 text-center">
        <p className="text-blue-200 italic text-sm">
          🏆 Tip: Keep your ladder dynamic — motivate players and update rules
          regularly for fairness and fun!
        </p>
      </div>
    </motion.div>
  );
};

export default RulesForLadder;
