// "use client";

// import React from "react";

// const InfoNotesUser = () => {
//   return (
//     <div className="w-full flex justify-center">
//       <div className="bg-white dark:bg-gray-900 border border-black rounded-md px-4 py-2 shadow-sm">
//         <p className="text-sm font-medium text-black dark:text-white">
//           <span className="font-bold">Note:</span>{" "}
//           Number of players in each  
//         </p>
//         <p>
//             section can be changed by admin
//         </p>
//       </div>
//     </div>
//   );
// };

// export default InfoNotesUser;








"use client";

import React from "react";

const InfoNotesUser = () => {
  return (
    <div className="w-full flex justify-center px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-3 sm:p-4 md:p-4 max-w-md md:max-w-lg lg:max-w-xl w-full">
        <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
          <span className="font-semibold">Note:</span>{" "}
          Number of players in each <br /> section can be changed by admin.
        </p>
      </div>
    </div>
  );
};

export default InfoNotesUser;
