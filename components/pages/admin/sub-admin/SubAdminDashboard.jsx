
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Layers, Users, UploadCloud, ListChecks, Play, ShieldCheck, Sparkles, Target, FolderKanban, ArrowRight, Mail, Plus } from "lucide-react";

const cardToneClasses = [
  "from-cyan-500/[0.22] via-cyan-500/[0.06] to-transparent",
  "from-blue-500/[0.18] via-blue-500/[0.06] to-transparent",
  "from-emerald-500/[0.18] via-emerald-500/[0.06] to-transparent",
  "from-fuchsia-500/[0.18] via-fuchsia-500/[0.06] to-transparent",
];

const startSteps = [
  {
    icon: Plus,
    title: "Create the solution",
    text: "Name your competition and upload the CSV to get the player list ready.",
  },
  {
    icon: UploadCloud,
    title: "Check your player data",
    text: "The uploader warns about duplicate names before anything is created.",
  },
  {
    icon: Target,
    title: "Launch competitions",
    text: "Open any competition from the list and manage rankings, results, and updates.",
  },
];

const brandGradient = "linear-gradient(135deg, #29abe2 0%, #1a3a8f 100%)";

import LadderList from "../LadderList";
import LadderInfo from "../LadderInfo";
import PlayerLevelNavbar from "@/components/shared/PlayerLevelNavbar";

import { motion } from "framer-motion";

import { importSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { importRoster } from "@/redux/slices/rosterSlice";
import CreatePanel from "@/components/shared/CreatePanel";

export default function SubAdminDashboard() {
  const [ladderName, setLadderName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [ladderType, setLadderType] = useState("winlose");
  const [duplicateWarning, setDuplicateWarning] = useState(null);



  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("subAdmin") || "null")
      : null;

  const [user, setUser] = useState(null);

  const { allLadders } = useSelector((state) => state.fetchLadder);

  const loading = useSelector((state) => state.createLadder?.loading);

  const dispatch = useDispatch();
  const router = useRouter();

  const activeLadders = useMemo(
    () => allLadders.filter((ladder) => ladder.created_by !== "demo"),
    [allLadders],
  );

  const demoLadders = useMemo(
    () => allLadders.filter((ladder) => ladder.created_by === "demo"),
    [allLadders],
  );

  const rosterCount = useMemo(
    () => activeLadders.filter((ladder) => ladder.type === "roster").length,
    [activeLadders],
  );

  const subAdminFirstName = subAdmin?.name?.trim()?.split(" ")[0] || "Sub-Admin";

  const overviewCards = [
    {
      title: "Competitions",
      value: activeLadders.length,
      detail:
        activeLadders.length > 0 ? "Ready to edit and manage" : "Create your first competition",
      icon: Layers,
    },
    {
      title: "Roster Boards",
      value: rosterCount,
      detail: rosterCount > 0 ? "Player lists uploaded" : "Awaiting first upload",
      icon: Users,
    },
    {
      title: "Demo Templates",
      value: demoLadders.length,
      detail: "Open these to explore the setup",
      icon: Sparkles,
    },
    {
      title: "Setup Status",
      value: csvFile ? "CSV Ready" : loading ? "Syncing" : "Live",
      detail: csvFile ? "Solution file is attached" : "Dashboard connected",
      icon: ShieldCheck,
    },
  ];

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#07111f] text-white">
      {/* ── Unified Navbar (Admin & Sub-Admin) ── */}
      <PlayerLevelNavbar activeTab="dashboard" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,114,255,0.15),transparent_45%),linear-gradient(180deg,#080c14_0%,#04060a_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:78px_78px]" />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="dark"
      />

      <div className="relative z-10 mx-auto w-full px-2.5 sm:px-8 lg:px-12 xl:px-16">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/10 bg-white/[0.06] p-4 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div
                className="inline-flex w-fit items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.24em]"
                style={{
                  borderColor: "rgba(41, 171, 226, 0.28)",
                  backgroundColor: "rgba(10, 24, 54, 0.88)",
                  color: "#7dd3fc",
                }}
              >
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-cyan-300" />
                Sports Solutions Pro
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-5xl">
                  Welcome back Sub Admin Dashboard, {subAdminFirstName}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Manage competitions for your section and keep your club's internal ladder system organized from your sub-admin workspace.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
                  <Layers className="h-4 w-4" />
                  Section: {subAdmin?.sport_name || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map(({ title, value, detail, icon: Icon }, index) => (
              <div
                key={title}
                className={`relative overflow-hidden rounded-[22px] sm:rounded-[26px] border border-white/10 bg-[#07152b]/[0.86] p-4 sm:p-5 ${cardToneClasses[index] ? `bg-gradient-to-br ${cardToneClasses[index]}` : ""}`}
              >
                <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <p className="text-3xl font-black text-white">{value}</p>
                    <p className="text-sm text-slate-300">{detail}</p>
                  </div>
                  <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      background: brandGradient,
                      boxShadow: "0 14px 28px rgba(41, 171, 226, 0.22)",
                    }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-[24px] sm:rounded-[30px] border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                    Workspace Flow
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    How to get a new competition ready
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                  <FolderKanban className="h-4 w-4" />
                  {activeLadders.length > 0 ? "Section active" : "Fresh setup"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {startSteps.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-white/10 bg-[#071325]/[0.88] p-5"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(41,171,226,0.24), rgba(26,58,143,0.42))",
                      }}
                    >
                      <Icon className="h-5 w-5 text-cyan-200" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="rounded-[24px] sm:rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4 px-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Solutions Available
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Competition types you can create
                </h2>
              </div>
              <LadderInfo ladders={allLadders} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="rounded-[24px] sm:rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4 px-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                  Live Lists
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Manage existing competitions
                </h2>
              </div>
              <LadderList
                userId={subAdmin?.user_id}
                createdBy={subAdmin?.id}
              />
            </motion.section>
          </div>

          <div className="space-y-6 sticky top-[80px] self-start z-40">
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-[24px] sm:rounded-[30px] border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                    Create Solution
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Upload your players and start fast
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Add the competition name, upload the CSV, then jump straight into the
                    player list editor.
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: brandGradient,
                    boxShadow: "0 14px 28px rgba(41, 171, 226, 0.22)",
                  }}
                >
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>

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
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="rounded-[24px] sm:rounded-[30px] border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Support
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Need help with your section?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Reach out for help with custom workflows, imports, or competition setup
                tailored to your sport section.
              </p>

              <a
                href="mailto:support@sportssolutionspro.com"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18"
              >
                <Mail className="h-4 w-4" />
                support@sportssolutionspro.com
              </a>
            </motion.section>

            {duplicateWarning && (
              <Alert className="border-red-500/35 bg-red-500/10 text-red-50">
                <AlertTitle>Duplicate players detected</AlertTitle>
                <AlertDescription className="mt-2 text-red-100/90">
                  {[...new Set(duplicateWarning.duplicateNames)].join(", ")}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      <footer className="relative z-10 px-4 pb-8 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full border border-white/10 bg-black/55 text-white shadow-lg">
          <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">
                Sports Solutions Pro Sub-Admin Workspace
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Competition setup, ranking control, and player organization for your section.
              </p>
            </div>
            <p className="text-sm text-cyan-300">
              {activeLadders.length > 0
                ? `${activeLadders.length} competition${activeLadders.length === 1 ? "" : "s"} currently available`
                : "No competitions created yet"}
            </p>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
