
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  createLadder,
  clearCreateLadderState,
} from "@/redux/slices/ladderSlice";
import { uploadCSV } from "@/redux/slices/leaderboardSlice";
import { setLadderId } from "@/redux/slices/userSlice";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";


// ⭐ MiniLeague Imports
import { importMiniLeague } from "@/redux/slices/minileagueSlice";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Link from "next/link";
import { Layers, Users, UploadCloud, ListChecks, Play, ShieldCheck, Sparkles, Target, FolderKanban, ArrowRight, Mail, Plus, Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";

const AdminQuickActions = dynamic(() => import("@/components/shared/AdminQuickActions"), { ssr: false });

const cardToneClasses = [
  "from-primary/20 via-primary/5 to-transparent",
  "from-secondary/18 via-secondary/5 to-transparent",
  "from-accent/24 via-accent/8 to-transparent",
  "from-primary/14 via-secondary/10 to-transparent",
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

const brandGradient = "var(--background-image-gradient-brand)";

const LadderList = dynamic(() => import("../LadderList"), { ssr: false });
const LadderInfo = dynamic(() => import("../LadderInfo"), { ssr: false });
import Navbar from "@/components/shared/Navbar";

import { motion, AnimatePresence } from "framer-motion";

import { importSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { importRoster } from "@/redux/slices/rosterSlice";
const CreatePanel = dynamic(() => import("@/components/shared/CreatePanel"), { ssr: false });

export default function SubAdminDashboard() {
  const [ladderName, setLadderName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [ladderType, setLadderType] = useState("winlose");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [withoutCsv, setWithoutCsv] = useState(false);




  const subAdmin =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("subAdmin") || "null")
      : null;

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          return parsed.user || parsed;
        } catch (err) {
          return null;
        }
      }
    }
    return null;
  });

  const { allLadders } = useSelector((state) => state.fetchLadder);

  const loading = useSelector((state) => state.createLadder?.loading);

  const dispatch = useDispatch();
  const router = useRouter();

  const activeLadders = useMemo(
    () => allLadders.filter((ladder) => ladder.created_by !== "demo" && ladder.type !== "roster"),
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
    // {
    //   title: "Roster Boards",
    //   value: rosterCount,
    //   detail: rosterCount > 0 ? "Player lists uploaded" : "Awaiting first upload",
    //   icon: Users,
    // },
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
          const parsed = JSON.parse(storedUser);
          const finalUser = parsed.user || parsed;
          setUser(finalUser);
        } catch (err) {
          console.error(err);
          setUser(null);
        }
      }
    }
  }, []);



  const checkCsvDuplicates = async (file) => {
    const Papa = (await import("papaparse")).default;
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
      e.target.value = "";

      toast.error(
        `Duplicate names found: ${[...new Set(result.duplicateNames)].join(", ")}`,
      );

      return;
    }

    setCsvFile(file);
    e.target.value = "";
  };

  const handleCreateLadder = async () => {
    if (!withoutCsv && duplicateWarning) {
      toast.warn("Please remove duplicate names first");
      return;
    }

    let cleanName = ladderName.trim();

    if (!subAdmin?.id || !cleanName || (!withoutCsv && !csvFile)) {
      toast.warn(
        withoutCsv
          ? "Please enter solution name and ensure login."
          : "Please enter solution name, upload CSV, and ensure login."
      );
      return;
    }

    const fullnameToCheck = subAdmin?.sport_name + " " + cleanName;
    if (ladderExists(fullnameToCheck)) {
      toast.error(`${fullnameToCheck} name already exists — choose another`);
      return;
    }

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
      if (!withoutCsv) {
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
      setWithoutCsv(false);

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
    if (!allLadders || !Array.isArray(allLadders)) return false;
    const laddarNames = allLadders.map((l) => l.name?.trim().toLowerCase());
    const cleanName = name.trim().toLowerCase();
    const nameExists = laddarNames.includes(cleanName);
    return nameExists;
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground mt-10 overflow-x-hidden">
      {/* ── Unified Navbar (Admin & Sub-Admin) ── */}
      <Navbar activeTab="dashboard" />

      <div className="absolute inset-0" style={{ background: "var(--page-glow-corners)" }} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--page-grid-overlay)", backgroundSize: "78px 78px" }} />

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
          className="overflow-hidden rounded-[24px] sm:rounded-[32px] border border-border bg-card p-4 sm:p-7 shadow-xl backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div
                className="inline-flex w-fit items-center gap-1.5 sm:gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.24em] text-primary"
              >
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary" />
                Sports Solutions Pro
              </div>

              <div className="space-y-3">
                <h1 className="text-h1 font-black tracking-tight text-foreground sm:text-h11">
                  Welcome back, {subAdminFirstName}
                </h1>
                <p className="max-w-2xl text-p2 leading-7 text-muted-foreground">
                  Manage competitions from your section admin dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <span className="font-medium text-muted-foreground">Section:</span>
                <span className="font-bold capitalize text-primary">{subAdmin?.sport_name || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map(({ title, value, detail, icon: Icon }, index) => (
              <div
                key={title}
                className={`relative overflow-hidden rounded-[22px] sm:rounded-[26px] border border-border bg-card p-4 sm:p-5 ${cardToneClasses[index] ? `bg-gradient-to-br ${cardToneClasses[index]}` : ""}`}
              >
                <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-black text-foreground">{value}</p>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                  </div>
                  <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      background: brandGradient,
                      boxShadow: "var(--brand-card-shadow)",
                    }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="space-y-6 min-w-0">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="overflow-hidden rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4 px-1 flex items-center justify-between">
                <div>
                  <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                    Solutions Available
                  </p>
                  <h2 className="mt-2 text-h2 font-bold text-foreground">
                    DEMO SOLUTIONS (Use to test)
                  </h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowDemo(!showDemo)}
                  className="text-white hover:opacity-90 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold shadow-sm hover:brightness-110 active:scale-95"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--primary), var(--secondary))"
                  }}
                >
                  {showDemo ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </Button>
              </div>
              <AnimatePresence initial={false}>
                {showDemo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <LadderInfo ladders={demoLadders} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="overflow-hidden rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4 px-1">
                <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Live Lists
                </p>
                <h2 className="mt-2 text-h2 font-bold text-foreground">
                  Manage existing competitions
                </h2>
              </div>
              <LadderList
                userId={subAdmin?.user_id}
                createdBy={subAdmin?.id}
              />
            </motion.section>
          </div>

          <div className="space-y-6 sticky top-24 z-40 min-w-0">
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="overflow-hidden rounded-[24px] sm:rounded-[30px] border border-primary/10 bg-card p-4 sm:p-6 backdrop-blur-xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--card), var(--primary) 2%)" }}
            >
              {user?.user_type !== "admin" && user?.role !== "admin" && (
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary">
                      Create Solution
                    </p>
                  </div>
                </div>
              )}

              <CreatePanel
                role={user?.user_type || user?.role || "subadmin"}
                ladderName={ladderName}
                setLadderName={setLadderName}
                ladderType={ladderType}
                setLadderType={setLadderType}
                csvFile={csvFile}
                handleFileChange={handleFileChange}
                handleCreate={handleCreateLadder}
                loading={loading}
                sportName={subAdmin?.sport_name}
                withoutCsv={withoutCsv}
                setWithoutCsv={setWithoutCsv}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="overflow-hidden rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 sm:p-6 backdrop-blur-xl"
            >
              <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                Support
              </p>
              <h2 className="mt-2 text-h2 font-bold text-foreground">
                Need help with your section?
              </h2>
              <p className="mt-3 text-p2 leading-6 text-muted-foreground">
                Reach out for help with custom workflows, imports, or competition setup
                tailored to your sport section.
              </p>

              <a
                href="mailto:support@sportssolutionspro.com"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-primary transition hover:bg-primary/20 max-w-full overflow-hidden"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">support@sportssolutionspro.com</span>
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
        <AdminQuickActions />
      </div>
    </div>
  );
}
