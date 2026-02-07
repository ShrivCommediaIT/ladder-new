// "use client";

// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/navigation";

// import {
//   createLadder,
//   clearCreateLadderState,
// } from "@/redux/slices/ladderSlice";
// import { uploadCSV } from "@/redux/slices/leaderboardSlice";
// import { setLadderId } from "@/redux/slices/userSlice";
// import { fetchLadders } from "@/redux/slices/fetchLadderSlice";

// import { Card, CardContent } from "@/components/ui/card";

// // ⭐ MiniLeague Imports
// import { importMiniLeague } from "@/redux/slices/minileagueSlice";

// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import Link from "next/link";
// import { Layers, Users, UploadCloud, ListChecks, Play } from "lucide-react";

// import UserDetails from "@/components/shared/UserDetails";
// import LadderList from "./LadderList";
// import LadderInfo from "./LadderInfo";

// import { motion } from "framer-motion";

// import { importSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";

// export default function AdminPage() {
//   const [ladderName, setLadderName] = useState("");
//   const [csvFile, setCsvFile] = useState(null);
//   const [ladderType, setLadderType] = useState("winlose");

//     const { allLadders } = useSelector((state) => state.fetchLadder);

//   const dispatch = useDispatch();
//   const router = useRouter();

//   const loading = useSelector((state) => state.createLadder?.loading);

//   const [user, setUser] = useState(null);

//   const isAdmin = user?.user_type === "admin";
//   const isClubUser = user?.user_type === "user";

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       // Check for admin first
//       const storedAdmin = localStorage.getItem("userData");
//       if (storedAdmin) {
//         try {
//           const parsed = JSON.parse(storedAdmin);
//           const finalUser = parsed.user || parsed; // admin object
//           setUser(finalUser);
//           return; // admin found, return early
//         } catch (err) {
//           console.error(err);
//         }
//       }

//       // Check for subAdmin
//       const storedSubAdmin = localStorage.getItem("subAdmin");
//       if (storedSubAdmin) {
//         try {
//           const parsedSub = JSON.parse(storedSubAdmin);
//           const subAdminUser = parsedSub.user || parsedSub; // get subAdmin object
//           setUser(subAdminUser);
//         } catch (err) {
//           console.error(err);
//           setUser(null);
//         }
//       }
//     }
//   }, []);

//   const handleFileChange = (e) => {
//     if (e.target.files?.[0]) setCsvFile(e.target.files[0]);
//   };

//   // const handleCreateLadder = async () => {
//   //   if (!user?.id || !ladderName.trim() || !csvFile) {
//   //     toast.warn("Please enter solution name, upload CSV, and ensure login.");
//   //     return;
//   //   }

//   //   const userIdToSend = user?.id;

//   //   try {
//   //     // 1️⃣ Create Ladder
//   //     const ladderResult = await dispatch(
//   //       createLadder({
//   //         user_id: userIdToSend,
//   //         name: ladderName.trim(),
//   //         type: ladderType,
//   //       }),
//   //     ).unwrap();

//   //     dispatch(clearCreateLadderState());

//   //     const createdLadderId =
//   //       ladderResult?.data?.ladder_id || ladderResult?.data?.id;

//   //       // console.log("create ladder id : ", createdLadderId)

//   //     dispatch(setLadderId(createdLadderId));

//   //     // 2️⃣ CSV IMPORT — TYPE BASED
//   //     if (ladderType === "minileague") {
//   //       await dispatch(
//   //         importMiniLeague({
//   //           file: csvFile,
//   //           ladder_id: createdLadderId,
//   //           name: ladderName,
//   //           type: ladderType,
//   //         }),
//   //       ).unwrap();
//   //       toast.success("MiniLeague users imported!");
//   //     } else if (ladderType === "skill") {
//   //       await dispatch(
//   //         importSkillLeaderboard({
//   //           file: csvFile,
//   //           ladder_id: createdLadderId,
//   //         }),
//   //       ).unwrap();
//   //       toast.success("Skill leaderboard imported!");
//   //     } else {
//   //       await dispatch(
//   //         uploadCSV({
//   //           file: csvFile,
//   //           ladder_id: createdLadderId,
//   //           type: ladderType,
//   //         }),
//   //       ).unwrap();
//   //       toast.success("Users imported successfully!");
//   //     }

//   //     // 3️⃣ Fetch updated ladder list
//   //     dispatch(fetchLadders(userIdToSend));

//   //     // 4️⃣ Reset form
//   //     setLadderName("");
//   //     setCsvFile(null);
//   //     setLadderType("winlose");

//   //     // 5️⃣ Redirect
//   //     setTimeout(() => {
//   //       router.push(
//   //         `/player-list?ladder_id=${createdLadderId}&type=${ladderType}`,
//   //       );
//   //     }, 900);
//   //   } catch (error) {
//   //     console.error(error);
//   //     toast.error("Something went wrong");
//   //   }
//   // };

// // ✅ duplicate name check helper
// const ladderExists = (name) => {
//   if (!allLadders || !Array.isArray(allLadders)) return false;
//   return allLadders.some(
//     (l) => l?.name?.toLowerCase().trim() === name.toLowerCase().trim()
//   );
// };

// const handleCreateLadder = async () => {
//   const cleanName = ladderName.trim();

//   if (!user?.id || !cleanName || !csvFile) {
//     toast.warn("Please enter solution name, upload CSV, and ensure login.");
//     return;
//   }

//   // ✅ FRONTEND DUPLICATE CHECK
//   if (ladderExists(cleanName)) {
//     toast.error("Solution name already exists — choose another");
//     return;
//   }

//   try {
//     // ✅ CREATE LADDER
//     const ladderResult = await dispatch(
//       createLadder({
//         user_id: user.id,
//         created_by: user.id,
//         name: cleanName,
//         type: ladderType,
//       })
//     ).unwrap();

//     console.log("CREATE RESULT =", ladderResult);

//     const createdLadderId =
//       ladderResult?.data?.ladder_id ||
//       ladderResult?.data?.id ||
//       ladderResult?.ladder_id ||
//       ladderResult?.id;

//     if (!createdLadderId) {
//       toast.error("Solution created but ID missing");
//       return;
//     }

//     dispatch(setLadderId(createdLadderId));
//     dispatch(clearCreateLadderState());

//     toast.success("Solution created!");

//     // ✅ IMPORT CSV BASED ON TYPE
//     if (ladderType === "minileague") {
//       await dispatch(
//         importMiniLeague({
//           file: csvFile,
//           ladder_id: createdLadderId,
//           name: cleanName,
//           type: ladderType,
//         })
//       ).unwrap();

//       toast.success("MiniLeague users imported!");
//     }

//     else if (ladderType === "skill") {
//       await dispatch(
//         importSkillLeaderboard({
//           file: csvFile,
//           ladder_id: createdLadderId,
//         })
//       ).unwrap();

//       toast.success("Skill leaderboard imported!");
//     }

//     else {
//       await dispatch(
//         uploadCSV({
//           file: csvFile,
//           ladder_id: createdLadderId,
//           type: ladderType,
//         })
//       ).unwrap();

//       toast.success("Users imported successfully!");
//     }

//     // ✅ refresh ladder list
//     dispatch(fetchLadders(user.id));

//     // ✅ reset
//     setLadderName("");
//     setCsvFile(null);
//     setLadderType("winlose");

//     // ✅ redirect
//     setTimeout(() => {
//       router.push(
//         `/player-list?ladder_id=${createdLadderId}&type=${ladderType}`
//       );
//     }, 800);

//   } catch (error) {
//     console.error(error);

//     const msg =
//       error?.response?.data?.error_message ||
//       error?.message ||
//       "Create failed";

//     if (msg.toLowerCase().includes("exist")) {
//       toast.error("Solution name already exists");
//     } else {
//       toast.error(msg);
//     }
//   }
// };

//   return (
//     <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#05070f] via-[#0c1224] to-black text-white">
//       <ToastContainer
//         position="top-right"
//         autoClose={2500}
//         hideProgressBar
//         theme="dark"
//       />

//       {/* HEADER MOBILE */}
//       <div className="sticky top-0 z-20 sm:hidden flex justify-between px-4 py-3 bg-black/70 backdrop-blur-xl border-b border-white/10">
//         <div>
//           <h1 className="text-lg font-bold text-cyan-300">Admin Dashboard</h1>
//           {/* <p className="text-xs text-white/50">Manage your ladders</p> */}
//         </div>
//         <div>
//           <UserDetails />
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 pb-8 sm:pb-8">
//         {/* DESKTOP HEADER */}
//         <div className="hidden sm:flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text">
//             Admin Dashboard
//           </h1>
//           <div>
//             <UserDetails />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//           {/* LEFT SIDE */}
//           <div className="lg:col-span-3 space-y-6">
//             {/* LADDER TYPES */}
//             <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
//               <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-3">
//                 <Layers className="h-5 w-5" /> Solutions Available
//               </h3>
//               <LadderInfo />

//               {/* DEMO SECTION */}
//               {/* <motion.div
//                 initial={{ opacity: 0, y: 12 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
//               >
//                 <h3 className="text-sm font-semibold text-white flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-cyan-400  animate-pulse" />
//                   Demo Solutions
//                 </h3>

//                 <div className="grid gap-2">
//                   <Link
//                     target="_blank"
//                     href="/demo-login?autoLogin=true&demoType=winlose"
//                     className="flex justify-between border border-cyan-400/20 rounded-xl px-4 py-2 text-sm"
//                   >
//                     Win / Lose Ladder <Play className="w-4 h-4" />
//                   </Link>
//                   <Link
//                     target="_blank"
//                     href="/demo-login?autoLogin=true&demoType=best3"
//                     className="flex justify-between border border-cyan-400/20 rounded-xl px-4 py-2 text-sm"
//                   >
//                     Best of 3 Ladder <Play className="w-4 h-4" />
//                   </Link>
//                   <Link
//                     target="_blank"
//                     href="/demo-login?autoLogin=true&demoType=best5"
//                     className="flex justify-between border border-cyan-400/20 rounded-xl px-4 py-2 text-sm"
//                   >
//                     Best of 5 Ladder <Play className="w-4 h-4" />
//                   </Link>
//                 </div>

//               </motion.div> */}
//             </div>

//             {/* LADDER LIST */}
//             <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
//               {/* <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2 mb-3">
//                 <ListChecks className="h-5 w-5" />
//                 Your Solutions
//               </h3> */}
//               <div className="">
//                 <LadderList userId={user?.id} />
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE CREATE PANEL */}
//           <div className="lg:col-span-2 bg-white/5 border max-h-[500px] border-white/10 backdrop-blur-xl p-4 sm:p-6 rounded-3xl">
//             <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-4">
//               <Users className="h-5 w-5" /> Create a Solution
//             </h3>

//             <div className="space-y-4">
//               {/* LADDER NAME */}
//               <div>
//                 <Label className="text-md text-white">Name : <span className="text-xs text-gray-300">Example: Hockey - Under 16s Challenge</span></Label>
//                 <Input
//                   value={ladderName}
//                   onChange={(e) => setLadderName(e.target.value)}
//                   className="mt-1 h-11 rounded-xl bg-white/10 border-white/10 text-white"
//                   placeholder="Enter - Sport Then Title of Solution"
//                 />
//               </div>

//               {/* TYPE SELECT */}
//               <div>
//                 <Label className="text-md text-white">Choose Type : </Label>
//                 <select
//                   value={ladderType}
//                   onChange={(e) => setLadderType(e.target.value)}
//                   className="mt-1 h-11 w-full rounded-xl bg-white/10 border border-white/10 px-3 text-white"
//                 >
//                   <option className="bg-black" value="winlose">
//                     Win / Lose Ladder
//                   </option>
//                   <option className="bg-black" value="best3">
//                     Best of 3 Ladder
//                   </option>
//                   <option className="bg-black" value="best5">
//                     Best of 5 Ladder
//                   </option>
//                   <option className="bg-black" value="minileague">
//                     MiniLeagues
//                   </option>
//                   <option className="bg-black" value="skill">
//                     Skills/Performance Leaderboards
//                   </option>
//                       <option className="bg-black" value="skill">
//                     Skills/Performance Leaderboards
//                   </option>
//                 </select>
//               </div>

//               {/* CSV UPLOAD */}
//               <div>
//                 <Label className="text-md text-white">Players CSV</Label>
//                 <label className="group flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
//                   <div className="pointer-events-none flex flex-col items-center gap-2">
//                     <UploadCloud className="w-6 h-6 text-cyan-300" />
//                     <p className="text-xs text-white/70">Click or drag CSV</p>
//                   </div>

//                   <Input
//                     type="file"
//                     accept=".csv"
//                     onChange={handleFileChange}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   />
//                 </label>

//                 {csvFile && (
//                   <div className="flex justify-between mt-2 bg-black/30 border border-white/10 px-3 py-2 rounded-xl">
//                     <span className="text-[11px] text-cyan-300 truncate">
//                       {csvFile.name}
//                     </span>
//                     <span className="text-[10px] text-green-400 font-semibold">
//                       Ready
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* BUTTON */}
//               <Button
//                 onClick={handleCreateLadder}
//                 disabled={!ladderName || !csvFile || loading}
//                 className="w-full h-12 rounded-2xl text-base font-bold bg-gray-800 border-t border-b border-cyan-500 shadow-xl active:scale-95"
//               >
//                 {loading ? "Creating..." : "Create Solution"}
//               </Button>
//             </div>

//             {/* <div className="mt-12 flex items-center rounded-md shadow justify-center bg-slate-900">
//               <GenerateAccessCodes />
//             </div> */}
//           </div>
//         </div>
//       </div>

//       <footer className="w-full bg-black/80 text-white p-6 sm:p-10">
//         <Card className="bg-gray-900/90 border border-white/10 shadow-lg">
//           <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
//             {/* Left Section */}
//             <div className="text-center sm:text-left">
//               <p className="text-sm text-gray-300 sm:text-base font-medium">
//                 For any bespoke needs
//               </p>
//               <a
//                 href="mailto:support@sportssolutionspro.com"
//                 className="mt-1 inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base font-semibold"
//               >
//                 {/* <Envelope className="w-4 h-4 mr-2" /> */}
//                 support@sportssolutionspro.com
//               </a>
//             </div>

//             {/* Right Section (Optional, you can add links or copyright) */}
//             {/* <div className="text-sm sm:text-base text-gray-400 text-center sm:text-right">
//             &copy; {new Date().getFullYear()} Sports Solutions Pro. All rights
//             reserved.
//           </div> */}
//           </CardContent>
//         </Card>
//       </footer>
//     </div>
//   );
// }

// ====================================== work with roster ===============

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { importRoster } from "@/redux/slices/rosterSlice";
import Papa from "papaparse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  createLadder,
  clearCreateLadderState,
} from "@/redux/slices/ladderSlice";
import { uploadCSV } from "@/redux/slices/leaderboardSlice";
import { setLadderId } from "@/redux/slices/userSlice";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";

import { Card, CardContent } from "@/components/ui/card";

// ⭐ MiniLeague Imports
import { importMiniLeague } from "@/redux/slices/minileagueSlice";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Link from "next/link";
import { Layers, Users, UploadCloud, ListChecks, Play } from "lucide-react";

import UserDetails from "@/components/shared/UserDetails";
import LadderList from "./LadderList";
import LadderInfo from "./LadderInfo";

import { motion } from "framer-motion";

import { importSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";

export default function AdminPage() {
  const [ladderName, setLadderName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [ladderType, setLadderType] = useState("winlose");
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const { allLadders } = useSelector((state) => state.fetchLadder);

  const dispatch = useDispatch();
  const router = useRouter();

  const loading = useSelector((state) => state.createLadder?.loading);

  const [user, setUser] = useState(null);

  const isAdmin = user?.user_type === "admin";
  const isClubUser = user?.user_type === "user";

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for admin first
      const storedAdmin = localStorage.getItem("userData");
      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin);
          const finalUser = parsed.user || parsed; // admin object
          setUser(finalUser);
          return; // admin found, return early
        } catch (err) {
          console.error(err);
        }
      }

      // Check for subAdmin
      const storedSubAdmin = localStorage.getItem("subAdmin");
      if (storedSubAdmin) {
        try {
          const parsedSub = JSON.parse(storedSubAdmin);
          const subAdminUser = parsedSub.user || parsedSub; // get subAdmin object
          setUser(subAdminUser);
        } catch (err) {
          console.error(err);
          setUser(null);
        }
      }
    }
  }, []);

  const checkCsvDuplicates = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: (results) => {
          const rows = results.data || [];

          if (!rows.length) {
            resolve({ duplicateNames: [] });
            return;
          }

          // 🔍 auto detect name column
          const headers = Object.keys(rows[0]);

          const nameKey = headers.find((h) => h.includes("name")) || headers[0];

          const seen = new Set();
          const duplicates = [];

          for (const row of rows) {
            const raw = row[nameKey];

            if (!raw) continue;

            const normalized = raw
              .toString()
              .trim()
              .replace(/\s+/g, " ")
              .toLowerCase();

            if (seen.has(normalized)) {
              duplicates.push(raw);
            } else {
              seen.add(normalized);
            }
          }

          console.log("Duplicate names →", duplicates);

          resolve({ duplicateNames: duplicates });
        },
        error: reject,
      });
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDuplicateWarning(null);

    const result = await checkCsvDuplicates(file);

    if (result.duplicateNames.length > 0) {
      setDuplicateWarning(result);
      setCsvFile(null);

      toast.error(
        `Duplicate names found: ${[...new Set(result.duplicateNames)].join(", ")}`,
      );

      return;
    }

    setCsvFile(file);
  };

  // duplicate name check helper
  const ladderExists = (name) => {
    if (!allLadders || !Array.isArray(allLadders)) return false;
    return allLadders.some(
      (l) => l?.name?.toLowerCase().trim() === name.toLowerCase().trim(),
    );
  };

  const handleCreateLadder = async () => {
    if (duplicateWarning) {
      toast.warn("Please remove duplicate names first");
      return;
    }

    const cleanName = ladderName.trim();

    if (!user?.id || !cleanName || !csvFile) {
      toast.warn("Please enter solution name, upload CSV, and ensure login.");
      return;
    }

    // FRONTEND DUPLICATE CHECK
    if (ladderExists(cleanName)) {
      toast.error("Solution name already exists — choose another");
      return;
    }

    try {
      // CREATE LADDER
      const ladderResult = await dispatch(
        createLadder({
          user_id: user.id,
          created_by: user.id,
          name: cleanName,
          type: ladderType,
        }),
      ).unwrap();

      // SAFE LADDER ID EXTRACTOR
      const createdLadderId =
        ladderResult?.data?.ladder_id ??
        ladderResult?.data?.id ??
        ladderResult?.data?.data?.ladder_id ??
        ladderResult?.data?.data?.id ??
        ladderResult?.ladder_id ??
        ladderResult?.id ??
        ladderResult?.insertId ??
        ladderResult?.ladder?.id;

      if (!createdLadderId) {
        toast.error("Solution created but ID missing");
        return;
      }

      dispatch(setLadderId(createdLadderId));
      dispatch(clearCreateLadderState());

      toast.success("Solution created!");

      // IMPORT CSV BASED ON TYPE
      if (ladderType === "minileague") {
        await dispatch(
          importMiniLeague({
            file: csvFile,
            ladder_id: createdLadderId,
            name: cleanName,
            type: ladderType,
          }),
        ).unwrap();

        toast.success("MiniLeague users imported!");
      } else if (ladderType === "skill") {
        await dispatch(
          importSkillLeaderboard({
            file: csvFile,
            ladder_id: createdLadderId,
          }),
        ).unwrap();

        toast.success("Skill leaderboard imported!");
      } else if (ladderType === "roster") {
        await dispatch(
          importRoster({
            file: csvFile,
            ladder_id: createdLadderId,
          }),
        ).unwrap();

        toast.success("Roster imported!");
      } else {
        await dispatch(
          uploadCSV({
            file: csvFile,
            ladder_id: createdLadderId,
            type: ladderType,
          }),
        ).unwrap();

        toast.success("Users imported successfully!");
      }

      // refresh ladder list
      dispatch(fetchLadders(user.id));

      // reset
      setLadderName("");
      setCsvFile(null);
      setLadderType("winlose");

      // redirect
      setTimeout(() => {
        router.push(
          `/player-list?ladder_id=${createdLadderId}&type=${ladderType}`,
        );
      }, 800);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.error_message ||
        error?.message ||
        "Create failed";

      if (msg.toLowerCase().includes("exist")) {
        toast.error("Solution name already exists");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#05070f] via-[#0c1224] to-black text-white">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="dark"
      />

      {/* HEADER MOBILE */}
      <div className="sticky top-0 z-20 sm:hidden flex justify-between px-4 py-3 bg-black/70 backdrop-blur-xl border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold text-cyan-300">Admin Dashboard</h1>
          {/* <p className="text-xs text-white/50">Manage your ladders</p> */}
        </div>
        <div>
          <UserDetails />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 pb-8 sm:pb-8">
        {/* DESKTOP HEADER */}
        <div className="hidden sm:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text">
            Admin Dashboard
          </h1>
          <div>
            <UserDetails />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-3 space-y-6">
            {/* LADDER TYPES */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5" /> Solutions Available
              </h3>
              <LadderInfo />

              {/* DEMO SECTION */}
              {/* <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400  animate-pulse" />
                  Demo Solutions
                </h3>

                <div className="grid gap-2">
                  <Link
                    target="_blank"
                    href="/demo-login?autoLogin=true&demoType=winlose"
                    className="flex justify-between border border-cyan-400/20 rounded-xl px-4 py-2 text-sm"
                  >
                    Win / Lose Ladder <Play className="w-4 h-4" />
                  </Link>
                  <Link
                    target="_blank"
                    href="/demo-login?autoLogin=true&demoType=best3"
                    className="flex justify-between border border-cyan-400/20 rounded-xl px-4 py-2 text-sm"
                  >
                    Best of 3 Ladder <Play className="w-4 h-4" />
                  </Link>
                  <Link
                    target="_blank"
                    href="/demo-login?autoLogin=true&demoType=best5"
                    className="flex justify-between border border-cyan-400/20 rounded-xl px-4 py-2 text-sm"
                  >
                    Best of 5 Ladder <Play className="w-4 h-4" />
                  </Link>
                </div>

               
              </motion.div> */}
            </div>

            {/* LADDER LIST */}
            <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
              {/* <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2 mb-3">
                <ListChecks className="h-5 w-5" />
                Your Solutions
              </h3> */}
              <div className="">
                <LadderList userId={user?.id} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE CREATE PANEL */}
          <div className="lg:col-span-2 bg-white/5 border max-h-[500px] border-white/10 backdrop-blur-xl p-4 sm:p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" /> Create a Solution
            </h3>

            <div className="space-y-4">
              {/* LADDER NAME */}
              <div>
                <Label className="text-md text-white">
                  Name :{" "}
                  <span className="text-xs text-gray-300">
                    Example: Hockey - Under 16s Challenge
                  </span>
                </Label>
                <Input
                  value={ladderName}
                  onChange={(e) => setLadderName(e.target.value)}
                  className="mt-1 h-11 rounded-xl bg-white/10 border-white/10 text-white"
                  placeholder="Enter - Sport Then Title of Solution"
                />
              </div>

              {/* TYPE SELECT */}
              <div>
                <Label className="text-md text-white">Choose Type : </Label>
                <select
                  value={ladderType}
                  onChange={(e) => setLadderType(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl bg-white/10 border border-white/10 px-3 text-white"
                >
                  <option className="bg-black" value="winlose">
                    Win / Lose Ladder
                  </option>
                  <option className="bg-black" value="best3">
                    Best of 3 Ladder
                  </option>
                  <option className="bg-black" value="best5">
                    Best of 5 Ladder
                  </option>
                  <option className="bg-black" value="minileague">
                    MiniLeagues
                  </option>
                  <option className="bg-black" value="skill">
                    Skills/Performance Leaderboards
                  </option>
                  <option className="bg-black" value="roster">
                    Roster
                  </option>
                </select>
              </div>

              {/* CSV UPLOAD */}
              <div>
                <Label className="text-md text-white">Players CSV</Label>
                <label className="group flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
                  <div className="pointer-events-none flex flex-col items-center gap-2">
                    <UploadCloud className="w-6 h-6 text-cyan-300" />
                    <p className="text-xs text-white/70">Click or drag CSV</p>
                  </div>

                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>

                {csvFile && (
                  <div className="flex justify-between mt-2 bg-black/30 border border-white/10 px-3 py-2 rounded-xl">
                    <span className="text-[11px] text-cyan-300 truncate">
                      {csvFile.name}
                    </span>
                    <span className="text-[10px] text-green-400 font-semibold">
                      Ready
                    </span>
                  </div>
                )}
              </div>

              {/* BUTTON */}
              <Button
                onClick={handleCreateLadder}
                disabled={!ladderName || !csvFile || loading}
                className="w-full h-12 rounded-2xl text-base font-bold bg-gray-800 border-t border-b border-cyan-500 shadow-xl active:scale-95"
              >
                {loading ? "Creating..." : "Create Solution"}
              </Button>
            </div>

            {/* <div className="mt-12 flex items-center rounded-md shadow justify-center bg-slate-900">
              <GenerateAccessCodes />
            </div> */}
          </div>
        </div>
      </div>

      <footer className="w-full bg-black/80 text-white p-6 sm:p-10">
        <Card className="bg-gray-900/90 border border-white/10 shadow-lg">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            {/* Left Section */}
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-300 sm:text-base font-medium">
                For any bespoke needs
              </p>
              <a
                href="mailto:support@sportssolutionspro.com"
                className="mt-1 inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base font-semibold"
              >
                {/* <Envelope className="w-4 h-4 mr-2" /> */}
                support@sportssolutionspro.com
              </a>
            </div>

            {/* Right Section (Optional, you can add links or copyright) */}
            {/* <div className="text-sm sm:text-base text-gray-400 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Sports Solutions Pro. All rights
            reserved.
          </div> */}
          </CardContent>
        </Card>
      </footer>

          {duplicateWarning && (
              <Alert className="mt-4 border-red-500/40 bg-red-500/10">
                <AlertTitle>Duplicate Players Detected</AlertTitle>
                <AlertDescription>
                  {duplicateWarning.duplicateNames.length > 0 && (
                    <div>
                      Names:{" "}
                      {[...new Set(duplicateWarning.duplicateNames)].join(", ")}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
    </div>
  );
}
