
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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

import LadderList from "../LadderList";
import LadderInfo from "../LadderInfo";
import SubAdminDetails from "./SubAdminDetails";

import { motion } from "framer-motion";

import { importSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { importRoster } from "@/redux/slices/rosterSlice";
import CreatePanel from "@/components/shared/CreatePanel";

export default function SubAdminDashboard() {
  const [ladderName, setLadderName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [ladderType, setLadderType] = useState("winlose");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showDemo, setShowDemo] = useState(true);

  const { allLadders } = useSelector((state) => state.fetchLadder);

  const dispatch = useDispatch();
  const router = useRouter();

  const loading = useSelector((state) => state.createLadder?.loading);

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          setUser(null);
        }
      }
    }
  }, []);
  


  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const finalUser = parsed.user || parsed; // Get direct user object
          setUser(finalUser);
        } catch (err) {
          console.error(err);
          setUser(null);
        }
      }
    }
  }, []);

  const demoLadders = allLadders?.filter(
    (ladder) => ladder.created_by === "demo"
  );

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

  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("subAdmin") || "null")
      : null;

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

  const handleCreateLadder = async () => {
    if (duplicateWarning) {
      toast.warn("Please remove duplicate names first");
      return;
    }

    const cleanName = ladderName.trim();

    if (!subAdmin?.id || !cleanName || !csvFile) {
      toast.warn("Please enter solution name, upload CSV, and ensure login.");
      return;
    }

    // duplicate name check (frontend)
    if (ladderExists(cleanName)) {
      toast.error("Solution name already exists — choose another");
      return;
    }
    console.log("ladderType:", ladderType);
    try {
      // CREATE LADDER
      const firstnameCapitalized = subAdmin.sport_name.charAt(0).toUpperCase() + subAdmin.sport_name.slice(1)

      const ladderResult = await dispatch(
        createLadder({
          user_id: subAdmin.user_id,
          created_by: subAdmin.id,
          name: firstnameCapitalized + " " + cleanName,
          type: ladderType,
        }),
      ).unwrap();

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
        toast.error("Ladder created but ID missing");
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

      // refresh ladder list (correct params)
      dispatch(
        fetchLadders({
          userId: subAdmin.user_id,
          created_by: subAdmin.id,
        }),
      );

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

  const ladderExists = (name) => {
    if (!allLadders) return false;

    const newName = name.trim().toLowerCase();

    return allLadders.some((l) => l.name?.trim().toLowerCase() === newName);
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
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* LEFT CONTENT */}
            <div className="min-w-0 flex-1">
              {/* RIGHT PROFILE */}
              <div className="flex justify-end items-center gap-4">
                <div>
                  <h1
                    className="text-xl sm:text-2xl font-extrabold 
                     bg-gradient-to-r from-cyan-300 to-fuchsia-300 
                     text-transparent bg-clip-text"
                  >
                    Sub-admin Dashboard
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm sm:text-base">
                    <span className="text-white/60">—</span>

                    <span className="text-[#F0ACFF] font-medium">Section:</span>

                    <p
                      className="
                      relative overflow-hidden
                      text-sm sm:text-lg font-semibold text-white/90 capitalize
                      px-4 py-1 rounded-md 
                      bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
                      backdrop-blur-md

                      transition-all duration-700 ease-out
                      hover:scale-[1.04]
                      hover:shadow-[0_0_20px_rgba(240,172,255,0.25)]
                    "
                    >
                      {subAdmin?.sport_name || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <SubAdminDetails />
                </div>
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
              Sub-admin Dashboard
            </h1>

            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-white/50">—</span>

              <p className="text-sm sm:text-lg text-[#F0ACFF] tracking-wide">
                Section:
              </p>

              <p
                className="
      relative overflow-hidden
      text-sm sm:text-lg font-semibold text-white/90 capitalize
      px-4 py-1 rounded-md 
      bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
      backdrop-blur-md

      transition-all duration-700 ease-out
      hover:scale-[1.04]
      hover:shadow-[0_0_20px_rgba(240,172,255,0.25)]
    "
              >
                {subAdmin?.sport_name || "N/A"}
              </p>
            </div>
          </div>

          <div>
            <SubAdminDetails />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-3 space-y-6">
            {/* LADDER TYPES */}
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between px-1 sm:px-2 pt-2 mb-6">

              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5" /> Solutions Available
              </h3>

               <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDemo(!showDemo)}
                className="text-xs border border-cyan-400/50 text-cyan-300 hover:bg-cyan-100 cursor-pointer"
              >
                {showDemo ? "Hide" : "Show"}
              </Button>
            </div>
              {showDemo && <LadderInfo  ladders={demoLadders} />}

            </div>

            {/* LADDER LIST */}
            <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
              <div className="max-h-[320px] overflow-y-auto">
                <LadderList
                  userId={subAdmin?.user_id}
                  createdBy={subAdmin?.id}
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE CREATE PANEL */}
          <CreatePanel
            role="subadmin"
            ladderName={ladderName}
            setLadderName={setLadderName}
            ladderType={ladderType}
            setLadderType={setLadderType}
            csvFile={csvFile}
            handleFileChange={handleFileChange}
            handleCreate={handleCreateLadder}
            loading={loading}
            sportName={subAdmin?.sport_name}
          />
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
                support@sportssolutionspro.com
              </a>
            </div>
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
