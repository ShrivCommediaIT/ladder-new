"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { importRoster } from "@/redux/slices/rosterSlice";
import Papa from "papaparse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  createLadder,
} from "@/redux/slices/ladderSlice";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";

import { Card, CardContent } from "@/components/ui/card";

// ⭐ MiniLeague Imports

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Layers, Users, UploadCloud, ListChecks, Play } from "lucide-react";

import UserDetails from "@/components/shared/UserDetails";
import LadderList from "./LadderList";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AdminImportantInfo from "./info/AdminImportantInfo";
import AdminHideShowInfo from "./info/AdminHideShowInfo";
import DemoLadder from "./DemoLadder";
import CreatePanel from "@/components/shared/CreatePanel";
import BespokeFooter from "@/components/shared/BespokeFooter";

export default function AdminPage() {
  const [ladderName, setLadderName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [openQuickDesktop, setOpenQuickDesktop] = useState(false);
  const [openQuickMobile, setOpenQuickMobile] = useState(false);

  const { allLadders } = useSelector((state) => state.fetchLadder);

  const dispatch = useDispatch();
  const router = useRouter();

  const loading = useSelector((state) => state.createLadder?.loading);

  const [admin, setAdmin] = useState(null);


  useEffect(() => {
      const storedAdmin = sessionStorage.getItem("adminDetails");
      if (storedAdmin) {
        try {
          const parsed = JSON.parse(storedAdmin);
          setAdmin(parsed);
          return; 
        } catch (err) {
          console.error(err);
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

const handleCreateRoster = async () => {
  const ladderType = "roster";

  // ✅ CSV duplicate check
  if (duplicateWarning) {
    toast.warn("Please remove duplicate names first");
    return;
  }

  const cleanName = ladderName.trim();

  // ✅ basic validation
  if (!admin?.id || !cleanName || !csvFile) {
    toast.warn("Please enter roster name, upload CSV, and ensure login.");
    return;
  }

  // ✅ duplicate ladder name check
  if (ladderExists(cleanName)) {
    toast.error(`${cleanName} name already exists — choose another`);
    return;
  }

  try {
    // ✅ CREATE LADDER
    const ladderResult = await dispatch(
      createLadder({
        user_id: admin.id,
        name: cleanName,
        type: ladderType,
      })
    ).unwrap();

    // ✅ SAFE ID extraction (same as subadmin)
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
      toast.error("Roster created but ID missing");
      return;
    }

    // ✅ IMPORT ROSTER CSV
    await dispatch(
      importRoster({
        file: csvFile,
        ladder_id: createdLadderId,
      })
    ).unwrap();

    toast.success("Roster created successfully!");

    // ✅ refresh list (same pattern)
    dispatch(
      fetchLadders({
        userId: admin.id,
      })
    );

    // ✅ reset state
    setLadderName("");
    setCsvFile(null);

    // ✅ redirect (optional but recommended)
    setTimeout(() => {
      router.push(
        `/player-list?ladder_id=${createdLadderId}&type=roster`
      );
    }, 800);

  } catch (error) {
    console.error(error);

    const msg =
      error?.response?.data?.error_message ||
      error?.message ||
      "Create failed";

    if (msg.toLowerCase().includes("exist")) {
      toast.error("Roster name already exists");
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
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 ">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text">
              Admin Dashboard
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-lg text-white">
              <p>Getting Started</p>
              <span>Quick Quide</span>

              {/* INFO POPOVER */}
              <Popover
                open={openQuickMobile}
                onOpenChange={setOpenQuickMobile}
              >
                <PopoverTrigger asChild>
                  <button className="underline text-cyan-300 cursor-pointer">
                    Quick Guide
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="center"
                  sideOffset={10}
                  className="w-[90vw] sm:w-xl bg-gray-300 border-slate-700
    text-slate-900 px-2 py-4 rounded-lg shadow-2xl backdrop-blur-md"
                >
                  <AdminImportantInfo
                    onClose={() => setOpenQuickMobile(false)}
                  />
                </PopoverContent>
              </Popover>

              {/* RIGHT SIDE — USER DETAILS */}
              <div className="self-start sm:self-auto">
                <UserDetails />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 pb-8 sm:pb-8">
        {/* DESKTOP HEADER */}
        <div className="hidden sm:flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text">
              Admin Dashboard
            </h1>

            <div className="flex items-center gap-1">
              <p className="text-lg text-white">Getting Started</p> -

              <Popover
                open={openQuickDesktop}
                onOpenChange={setOpenQuickDesktop}
              >
                <PopoverTrigger asChild>
                  <button className="underline text-cyan-300 cursor-pointer">
                    Quick Guide
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="center"
                  sideOffset={10}
                  className="w-[90vw] sm:w-xl bg-gray-300 border-slate-700
    text-slate-900 px-2 py-4 rounded-lg shadow-2xl backdrop-blur-md"
                >
                  <AdminImportantInfo
                    onClose={() => setOpenQuickDesktop(false)}
                  />
                </PopoverContent>
              </Popover>

            </div>
          </div>

          <div>
            <UserDetails />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-3 space-y-6">
            {/* LADDER TYPES */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">

              <DemoLadder userId={admin?.id} />

            </div>

            {/* LADDER LIST */}
            <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
              <div className="">
                <LadderList userId={admin?.id} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE CREATE PANEL */}
          <div className="lg:col-span-2 max-h-auto border-white/10 p-4 sm:p-6 rounded-md">


            <div className="flex items-center justify-start gap-4 ">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Competitions Information
              </h3>

              <Popover open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setSolutionsOpen(!solutionsOpen)}
                    className="cursor-pointer underline text-cyan-300 text-sm"
                  >
                    {solutionsOpen ? "Hide" : "Show"}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="center"
                  className="w-[90vw] sm:w-lg bg-gray-300 border-slate-700 text-slate-900 px-3 py-4 rounded-lg shadow-2xl z-50 backdrop-blur-md"
                >

                  <div className="text-sm">
                    <AdminHideShowInfo isModel={false} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="text-white mt-12">
              <CreatePanel
                role="admin"
                ladderName={ladderName}
                setLadderName={setLadderName}
                ladderType="roster"
                setLadderType={() => { }}
                csvFile={csvFile}
                handleFileChange={handleFileChange}
                handleCreate={handleCreateRoster}
                loading={loading}
              />
            </div>
          </div>


        </div>
      </div>

      <BespokeFooter />

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
