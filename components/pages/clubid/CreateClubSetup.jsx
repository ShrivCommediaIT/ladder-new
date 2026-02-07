// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import MasterAdminClubId from "./MasterAdminClubId";
// import AdminClubId from "./AdminClubId";
// import { adminPage } from "@/helper/RouteName";
// import { Info } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import UserDetails from "@/components/shared/UserDetails";

// export default function CreateClubSetup() {
//   const [activeTab, setActiveTab] = useState("master");
//   const router = useRouter();

//   const handleCreate = () => {
//     router.push(adminPage);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] pb-24">
//       {/* Glow */}
//       <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
//       <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />

//       {/* <div className="fixed top-4 right-4 z-30 sm:block">
//         <UserDetails />
//       </div> */}

//       {/* TOP BAR */}
//       <div className="relative z-10 flex flex-col items-center gap-6 p-4 pt-8  sm:pt-12">
//         <h1 className="text-xl md:text-xl xl:text-3xl mr-8 font-extrabold text-white">
//           Sports Solutions Pro
//         </h1>

//         {/* Tabs */}
//         <div className="flex gap-3 bg-white/10 backdrop-blur px-2 py-2 rounded-2xl border border-white/10">
//           <button
//             onClick={() => setActiveTab("master")}
//             className={`px-6 py-2 rounded-xl text-sm font-semibold transition
//               ${
//                 activeTab === "master"
//                   ? "bg-white text-black shadow"
//                   : "text-white hover:bg-white/10"
//               }`}
//           >
//             Master Admin
//           </button>

//           <button
//             onClick={() => setActiveTab("admin")}
//             className={`px-6 py-2 rounded-xl text-sm font-semibold transition
//               ${
//                 activeTab === "admin"
//                   ? "bg-white text-black shadow"
//                   : "text-white hover:bg-white/10"
//               }`}
//           >
//             Sub Admin
//           </button>

//           <button className="grid place-items-center h-8 w-8 rounded-full cursor-pointer bg-white/10 text-cyan-300 hover:scale-110 transition">
//             <Info className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* FULL PAGE CONTENT */}
//       <div className="relative z-10">
//         {activeTab === "master" ? <MasterAdminClubId /> : <AdminClubId />}
//       </div>

//       {/*  BOTTOM FIXED CREATE BUTTON */}
//       <div className="fixed bottom-0 left-0 w-full flex items-center justify-center z-20 p-4 bg-gradient-to-t from-black/60 to-transparent backdrop-blur">
//         <button
//           onClick={handleCreate}
//           className="w-full sm:w-xl py-2 rounded-md text-md font-bold cursor-pointer text-white
//           bg-teal-800
//           shadow-xl shadow-teal-500/30
//           transform transition-all duration-300
//           hover:scale-[1.02] hover:shadow-teal-500/50
//           active:scale-95 animate-pulse"
//         >
//           Go to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// }

// =======================================

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import MasterAdminClubId from "./MasterAdminClubId";
// import AdminClubId from "./AdminClubId";
// import { adminPage } from "@/helper/RouteName";
// import { Info } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// export default function CreateClubSetup() {
//   const [activeTab, setActiveTab] = useState("master");
//   const router = useRouter();

//   const handleCreate = () => {
//     router.push(adminPage);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] pb-24">
//       {/* Glow */}
//       <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
//       <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />

//       {/* TOP BAR */}
//       <div className="relative z-10 flex flex-col items-center gap-6 p-4 pt-8 sm:pt-12">
//         <h1 className="text-xl md:text-xl xl:text-3xl mr-8 font-extrabold text-white">
//           Sports Solutions Pro
//         </h1>

//         {/* Tabs with Tooltip */}
//         <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-2 py-2 rounded-2xl border border-white/10">
//           <button
//             onClick={() => setActiveTab("master")}
//             className={`px-6 py-2 rounded-xl text-sm font-semibold transition
//               ${
//                 activeTab === "master"
//                   ? "bg-white text-black shadow"
//                   : "text-white hover:bg-white/10"
//               }`}
//           >
//             Master Admin
//           </button>

//           <button
//             onClick={() => setActiveTab("admin")}
//             className={`px-6 py-2 rounded-xl text-sm font-semibold transition
//               ${
//                 activeTab === "admin"
//                   ? "bg-white text-black shadow"
//                   : "text-white hover:bg-white/10"
//               }`}
//           >
//             Sub Admin
//           </button>

//           {/* --- INFO TOOLTIP START --- */}
//           <TooltipProvider delayDuration={100}>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <button className="grid place-items-center h-8 w-8 rounded-full cursor-pointer bg-white/10 text-cyan-300 hover:scale-110 transition outline-none">
//                   <Info className="w-4 h-4" />
//                 </button>
//               </TooltipTrigger>
//               <TooltipContent
//                 side="top"
//                 className="max-w-md bg-[#1A1A42] border-slate-700 text-slate-100 p-2 rounded-xl shadow-2xl"
//               >
//                 <div className="space-y-2">
//                   <p className="font-bold text-cyan-400 text-xs tracking-wider uppercase">
//                     Very Important
//                   </p>
//                   <p className="text-[13px] leading-relaxed">
//                     Subadmin access allows administrators from different
//                     sporting sections to independently create solutions that
//                     relate to their sections effectively creating a separate
//                     working subadmin area.
//                   </p>
//                   <p className="text-[13px] leading-relaxed pt-1 border-t border-white/10">
//                     All solutions from all sections will be automatically
//                     visible in the main admin dashboard and appear automatically
//                     in the APP.
//                   </p>

//                   <p className="text-[13px] leading-relaxed pt-1 border-t border-white/10">
//                    Create Subadmin Pins and inform administrators from different sections of their access pins
//                   </p>
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//           {/* --- INFO TOOLTIP END --- */}
//         </div>
//       </div>

//       {/* FULL PAGE CONTENT */}
//       <div className="relative z-10">
//         {activeTab === "master" ? <MasterAdminClubId /> : <AdminClubId />}
//       </div>

//       {/* BOTTOM FIXED CREATE BUTTON */}
//       <div className="fixed bottom-0 left-0 w-full flex items-center justify-center z-20 p-4 bg-gradient-to-t from-black/60 to-transparent backdrop-blur">
//         <button
//           onClick={handleCreate}
//           className="w-full sm:w-xl py-2 rounded-md text-md font-bold cursor-pointer text-white
//           bg-teal-800
//           shadow-xl shadow-teal-500/30
//           transform transition-all duration-300
//           hover:scale-[1.02] hover:shadow-teal-500/50
//           active:scale-95 animate-pulse"
//         >
//           Go to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// }






// ===========================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MasterAdminClubId from "./MasterAdminClubId";
import AdminClubId from "./AdminClubId";
import { adminPage } from "@/helper/RouteName";
import { Info, X } from "lucide-react"; // X icon for close button
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CreateClubSetup() {
  const [activeTab, setActiveTab] = useState("master");
  const router = useRouter();

  const handleCreate = () => {
    router.push(adminPage);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] pb-24">
      {/* Glow effects */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-600/30 blur-3xl" />

      {/* TOP BAR */}
      <div className="relative z-10 flex flex-col items-center gap-6 p-4 pt-8 sm:pt-12">
        <h1 className="text-xl md:text-xl xl:text-3xl mr-8 font-extrabold text-white">
          Sports Solutions Pro
        </h1>

        {/* Tabs with Popover for Mobile & Desktop Click */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-2 py-2 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("master")}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === "master"
                  ? "bg-white text-black shadow"
                  : "text-white hover:bg-white/10"
              }`}
          >
            Master Admin
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === "admin"
                  ? "bg-white text-black shadow"
                  : "text-white hover:bg-white/10"
              }`}
          >
            Sub Admin
          </button>

          {/* --- INFO POPOVER START --- */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="grid place-items-center h-8 w-8 rounded-full cursor-pointer bg-white/10 text-cyan-300 hover:scale-110 transition outline-none">
                <Info className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="w-[90vw] sm:w-96 bg-[#1A1A42] border-slate-700 text-slate-100 p-5 rounded-2xl shadow-2xl z-50 backdrop-blur-md"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <p className="font-bold text-cyan-400 text-xs tracking-wider uppercase">
                    Very Important
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-slate-200">
                    Subadmin access allows administrators from different
                    sporting sections to independently create solutions that
                    relate to their sections effectively creating a separate
                    working subadmin area.
                  </p>
                  
                  <p className="text-[13px] leading-relaxed text-slate-300 italic">
                    All solutions from all sections will be automatically
                    visible in the main admin dashboard and appear automatically
                    in the APP.
                  </p>

                  <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                    <p className="text-[13px] leading-relaxed text-cyan-200 font-medium">
                      Create Subadmin Pins and inform administrators from different sections of their access pins.
                    </p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* --- INFO POPOVER END --- */}
        </div>
      </div>

      {/* FULL PAGE CONTENT */}
      <div className="relative z-10">
        {activeTab === "master" ? <MasterAdminClubId /> : <AdminClubId />}
      </div>

      {/* BOTTOM FIXED CREATE BUTTON */}
      <div className="fixed bottom-0 left-0 w-full flex items-center justify-center z-20 p-4 bg-gradient-to-t from-black/60 to-transparent backdrop-blur">
        <button
          onClick={handleCreate}
          className="w-full sm:w-xl py-2 rounded-md text-md font-bold cursor-pointer text-white
          bg-teal-800
          shadow-xl shadow-teal-500/30
          transform transition-all duration-300
          hover:scale-[1.02] hover:shadow-teal-500/50
          active:scale-95 animate-pulse"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}