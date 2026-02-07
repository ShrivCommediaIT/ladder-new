// import React from "react";

// const RulesForLadder = () => {
//   return (
//     <div className="">
//       <div className="space-y-4 text-sm text-gray-800 leading-relaxed px-1">
//         {/* <h2 className="text-lg font-bold">RULES FOR LADDER</h2> */}

//         <p>
//           <strong>Ideas for Admin:</strong> <br />
//           Ladders may be run in several ways which are outlined below. It is
//           important that, you as admin, make it clear to players what “rules”
//           apply to your ladder that can be viewed in the “RULES” section on the
//           ladder page. You can choose your own rules and post them by editing
//           that section on your admin page.
//         </p>

//         <p>
//           It is worth motivating players to accept requests within 3 requests
//           and that any refusal after three requests will be reported to admin.
//         </p>

//         <h3 className="text-md font-semibold mt-4">
//           HERE ARE THE 5 MAIN WAYS TO RUN A LADDER AND ASSOCIATED RULES
//         </h3>

//         {/* (1) OPEN STYLE */}
//         <p>
//           <strong className="bg-yellow-300 px-1 py-1">(1) OPEN STYLE</strong>
//           <br />
//           No sections and no restrictions – anyone can challenge any one.
//           <br />
//           <strong>Pros:</strong>
//           <br />
//           (i) simple to understand and run
//           <br />
//           (ii) runs itself – minimal admin input
//           <br />
//           <strong>Cons:</strong>
//           <br />
//           (i) better players can get bothered by challenges from lower standard
//           players
//           <br />
//           (ii) with no “section” separations, there is little incentive for
//           middle and lower placed players
//           <br />
//         </p>
//         <p className="font-semibold">
//           <strong className="text-red-700">
//             COPY AND PASTE into RULES SECTION
//           </strong>
//           &nbsp; Any player may challenge any player above them
//         </p>

//         {/* (2) OPEN WITH CHALLENGES LIMITED */}
//         <p>
//           <strong className="bg-yellow-300 py-1 px-1">
//             (2) OPEN WITH CHALLENGES LIMITED
//           </strong>
//           <br />
//           Players may only challenge players so many places above them, for
//           example “no more than three, or five, or ten places above them”
//           <br />
//           <strong>Pros:</strong>
//           <br />
//           (i) Prevents better players from being bothered by lesser able players
//           <br />
//           <strong>Cons:</strong>
//           <br />
//           (i) Lower placed{" "}
//           <span className="text-red-500">
//             players with no immediate incentive
//           </span>
//           <br />
//         </p>

//         <p className="font-semibold">
//           <strong className="text-red-700">
//             COPY AND PASTE into RULES SECTION (amend number as desired)
//           </strong>
//           &nbsp;Players may not challenge any player more than five places above
//           them
//         </p>

//         {/* (3) WITH SECTIONS */}
//         <p>
//           <strong className="bg-yellow-300 py-1 px-1">
//             (3) WITH SECTIONS ALLOWING CHALLENGES INTO ONE SECTION ABOVE
//           </strong>{" "}
//           <span className="font-semibold">
//             - Players may challenge within their section and the one above.
//           </span>{" "}
//           <br />
//           The ladder is broken up into SECTIONS which separates players into
//           groups based roughly on standards (initially set up by admin).
//           <br />
//           <strong>Possible Names for Sections:</strong> <br />
//           <span className="font-semibold">Top :</span> (Top 10 / Top 20 Top 30
//           etc) <br /> <span className="font-semibold">STANDARDS :</span>{" "}
//           (Expert, Advanced, Intermediate, Beginning – variations of), <br />
//           <span className="font-semibold">GRADES (USA?) :</span> A+, A, A-, B+,
//           B, B- etc
//           <br />
//           <span className="font-semibold">BOX Numbers :</span> Box 1, Box 2, Box
//           3 etc
//           <br />
//           <strong>Pros:</strong>
//           <br />
//           (i) Gives ALL PLAYERS immediate achievable targets no matter where
//           they are on the ladder to top their section and/or improve their grade
//           (ii) Groups players into players of similar standards for better match
//           ups. (iii) Gives players an immediate target and motivation wherever
//           they are on the ladder
//           <br />
//         </p>

//         <p>
//           <span className="text-red-600 font-semibold">
//             EXAMPLE OF RULE TO ENTER INTO THE RULES SECTION THAT PLAYERS CAN SEE
//           </span>{" "}
//           <span className="text-red-600">(copy and paste if you like):</span>{" "}
//           <span className="font-semibold">
//             Players may challenge anyone within their own section or the one
//             above but no higher.
//           </span>
//         </p>

//         {/* (4) WITH CONDITION */}
//         <p className="font-semibold">
//           <strong className="bg-yellow-300 py-1 px-1">
//             (4) AS (3) ABOVE{" "}
//             <span className="text-red-600">WITH CONDITION</span>
//           </strong>
//           &nbsp;- Players may challenge within their section and the one above
//           but only if they are in the top three of their section (can vary that
//           number).
//           <br />
          
//         </p>

//         <p>
//           <strong>Pros:</strong> <br />
//           (i) Gives ALL PLAYERS immediate achievable targets no matter where
//           they are on the ladder to top their grade and/or improve their grade.{" "}
//           <br />
//           (ii) Groups players into players of similar standards for better match
//           ups. <br />
//           (iii) Gives players an immediate target and motivation wherever they
//           are on the ladder. <br />
//           (iv) Extra motivation within the grade to get into the top three.
//         </p>

//         <p className="font-semibold">
//           <span className="text-red-600 font-semibold">
//             COPY AND PASTE into RULES SECTION
//           </span>{" "}
//           Players may challenge anyone above them within their own section and
//           the one above (but no higher sections) if, and only if, they are in
//           the top three of their section.
//         </p>

//         {/* (5) GRADE SYSTEM */}
//         <p>
//           <strong className="bg-yellow-300 py-1 px-1">
//             (5) WITH GRADE SEPARATIONS ALLOWING CHALLENGES ONLY WITHIN THEIR
//             GRADE
//           </strong>
//           <br />
//           <span className="font-semibold uppercase">
//             With monthly promotion and demotion of top and bottom two – nearest
//             thing to standard minileagues.
//           </span>
//           <br />
//           The ladder is broken up into SECTIONS which separates players into
//           groups based roughly on standards (initially set up by admin).
//           <br />
//           <br />
//           <span className="font-semibold">
//             After play on the last day of each month,
//           </span>{" "}
//           admin promotes the top 2 from each grade to the grade above and
//           demotes the bottom 2 to the grade below.
//           <br />
//           <strong>Pros:</strong>
//           <br />
//           (i) Gives ALL PLAYERS immediate achievable targets no matter where
//           they are on the ladder to top their grade and potentially improve
//           their grade. <br />
//           (ii) Groups players into players of similar standards for better match
//           ups. <br />
//           (iii) Gives players an immediate target and motivation wherever they
//           are in the ladder both with ambition of promotion and with fear of
//           demotion.
//           <br />
//           <strong>Cons:</strong>
//           <br />
//           <span className="font-semibold">(i) Important admin involvement at end of month.</span>
//           <br /> 
//           (ii) Locks players
//           into a grade when maybe they are better or worse than that grade, so
//           lacking the flexibility of the style (3) above.
//           <br />
        
//         </p>

//         <p className="font-semibold">
//             <strong className="text-red-700">
//             COPY AND PASTE into RULES SECTION :
//           </strong>
//           &nbsp;Players may only challenge within their grade. At the end of each
//           month, the top TWO players promoted to the grade above and bottom TWO
//           players demoted to the grade below. This will be done on the last day
//           of each month with the rankings that admin can see at that time.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RulesForLadder;






// ========================

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
