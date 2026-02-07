 
// "use client";

// import { useSelector } from "react-redux";
// import { useSearchParams } from "next/navigation";

// // import PlayersLists1 from "../players/PlayersLists1";
// import DummyPlayerList from "@/components/shared/DummyPlayerList";
// import PlayerHeading from "../players/PlayerHeading";
// import AdminButton from "./AdminButton";
// import AdminEditPhone from "@/components/shared/AdminEditPhone";
// import UserDetails from "@/components/shared/UserDetails";
// import ActivityLog from "../players/ActivityList";

// // Welcome info box
// const WelcomeBox = ({ showIdeas }) => {
//   const userType = useSelector((state) => state.user?.user?.user_type);
//   const isAdmin = userType?.toLowerCase() === "admin";

//   return (
//     <div className="p-4 rounded-xl bg-transparent">
//       <h2 className="bg-cyan-300 text-blue-900 font-bold px-3 py-1 rounded">
//         Welcome to Your Club Ladder
//       </h2>

//       <p className="mt-3 text-sm text-gray-900">
//         It is designed to be run by the players who can move their rankings
//         after a win to a player above them, get challenge info and edit their
//         details.
//       </p>
//       <p className="mt-3 text-sm text-gray-900">Look after it and enjoy!</p>

//       <hr className="my-4 border-t border-gray-400" />

//       <div className="flex space-x-2 justify-end">
//         <button
//           className={`px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold
//           ${!isAdmin ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
//           disabled={!isAdmin}
//         >
//           Edit
//         </button>

//         {showIdeas && (
//           <button
//             className={`px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold
//             ${!isAdmin ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
//             disabled={!isAdmin}
//           >
//             Ideas For Rules
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const DemoPage = () => {
//   const user = useSelector((state) => state.user?.user);
//   const userType = user?.user_type;
//   const isAdmin = userType?.toLowerCase() === "admin";

//   const searchParams = useSearchParams();
//   const urlLadderId = searchParams.get("ladder_id");
//   const ladderId = urlLadderId ? Number(urlLadderId) : Number(user?.ladder_id);

//   // Override user name for demo
//   const demoUser = { ...user, name: " Joe Bloggs" };

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-r from-purple-200 via-pink-200 to-pink-300">
//       {/* Top bar */}
//       <div className="flex items-start justify-between gap-4 mb-6">
//         <div className="flex-1">
//           {/* <PlayerHeading /> */}
//           <PlayerHeading demoLadderName="Demo Club Ladder" />

//         </div>
//         <div className="shrink-0">
//           <UserDetails user={demoUser} />
//         </div>
//       </div>

//       {/* Main grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2">
//           <DummyPlayerList  />
//         </div>

//         <div className="space-y-6">
//           {isAdmin ? (
//             <AdminEditPhone disabled={true} />
//           ) : (
//             <div className="opacity-50 pointer-events-none">
//               <AdminEditPhone disabled={true} />
//             </div>
//           )}

//           <div className="opacity-50 pointer-events-none">
//             <AdminButton />
//           </div>

//           <WelcomeBox showIdeas={false} />
//           <WelcomeBox showIdeas={true} />

//           <ActivityLog ladderId={ladderId} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DemoPage;


import React from 'react'

const DemoPage = () => {
  return (
    <div>DemoPage</div>
  )
}

export default DemoPage