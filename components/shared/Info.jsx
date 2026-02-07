// import Link from 'next/link'
// import React from 'react'

// const Info = () => {
//   return (
//     <div>
//         <div className=''>
//             <span className='bg-black text-white px-2 py-2 rounded '>First time here ?</span>
//             <Link href="/info-notes" className=' text-blue-700 underline hover:bg-gray-100 duration-300 transition-all  px-4 py-2 rounded'>
//             Click for info</Link>
//         </div>
//     </div>
//   )
// }

// export default Info












// ================= ==>
  // Last wla 

//   import Link from "next/link";
// import React from "react";

// const Info = () => {
//   return (
//     <div className="w-full flex justify-center mt-4">
//       <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
//         <span className="bg-black text-white px-3 py-2 rounded text-sm sm:text-base text-center">
//           First time here ?
//         </span>
//         <Link
//           href="/info-notes"
//           className="text-blue-700 underline hover:bg-gray-100 duration-300 transition-all px-3 py-2 rounded text-sm sm:text-base text-center"
//         >
//           Click for info
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Info;







// Deepak code

import Link from "next/link";
import React from "react";

const Info = () => {
  return (
    <div className="bg-blue-500 text-center rounded px-2">
      <p className="text-white">First time?</p>
      <Link
        href="/info-notes"
        className="text-white"
      >
        Info
      </Link>
    </div>
  );
};

export default Info;
