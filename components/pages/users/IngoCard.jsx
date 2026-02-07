
// import React from "react";

// const IngoCard = () => {
//   return (
//     <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 py-4 rounded-xl w-full">
//       {/* Left card */}
//       <div className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-center shadow-sm text-sm sm:text-base font-semibold">
//         Sections can be renamed <br /> and number of players in each changed
//       </div>

//       {/* Right card */}
//       <div className="flex-1 bg-yellow-400 hover:bg-yellow-500 cursor-pointer font-semibold rounded-xl px-4 py-3 text-center shadow-md text-sm sm:text-base">
//         Scroll down to and Click on <br />
//         Joe Bloggs and test functions
//       </div>
//     </div>
//   );
// };

// export default IngoCard;















// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// const IngoCard = () => {
//   return (
//     <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 py-4 rounded-xl w-full">
//       {/* Left card */}
//       <div className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-center shadow-sm text-sm sm:text-base font-semibold">
//         Sections can be renamed <br /> and number of players in each changed
//       </div>

//       {/* Right card with infinite flashing animation */}
//       <motion.div
//         className="flex-1 bg-yellow-400 hover:bg-yellow-500 cursor-pointer font-semibold rounded-xl px-4 py-3 text-center shadow-md text-sm sm:text-base"
//         animate={{ opacity: [1, 0.5, 1] }}
//         transition={{
//           duration: 2,
//           repeat: Infinity,
//           ease: "easeInOut",
//         }}
//       >
//         Scroll down to and Click on <br />
//         Joe Bloggs and test functions
//       </motion.div>
//     </div>
//   );
// };

// export default IngoCard;









"use client";

import React from "react";
import { motion } from "framer-motion";

const IngoCard = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 py-4 rounded-xl w-full">
      {/* Left card */}
      <div className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-center shadow-sm text-sm sm:text-base font-semibold">
        Sections can be renamed <br /> and number of players in each changed
      </div>

      {/* Right card with infinite flashing animation */}
      <motion.div
        className="flex-1 bg-yellow-400 hover:bg-yellow-500 cursor-pointer rounded-xl px-4 py-3 text-center shadow-md"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.p
          className="font-semibold text-sm sm:text-base"
          animate={{
            scale: [1, 1.02, 1],
            color: ["#111", "#111", "#111"], // flashing text color
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Scroll down to and Click on <br />
          Joe Bloggs and test functions
        </motion.p>
      </motion.div>
    </div>
  );
};

export default IngoCard;
