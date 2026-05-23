"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowRight,
  CircleHelp,
  FolderKanban,
  Layers3,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Users2,
} from "lucide-react";
import { motion } from "framer-motion";

import { importRoster } from "@/redux/slices/rosterSlice";
import { createLadder } from "@/redux/slices/ladderSlice";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";
import PlayerLevelNavbar from "@/components/shared/PlayerLevelNavbar";
import LadderList from "./LadderList";
import DemoLadder from "./DemoLadder";
import CreatePanel from "@/components/shared/CreatePanel";
import AdminImportantInfo from "./info/AdminImportantInfo";
import AdminHideShowInfo from "./info/AdminHideShowInfo";
import BespokeFooter from "@/components/shared/BespokeFooter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const cardToneClasses = [
  "from-primary/20 via-primary/5 to-transparent",
  "from-secondary/18 via-secondary/5 to-transparent",
  "from-accent/24 via-accent/8 to-transparent",
  "from-primary/14 via-secondary/10 to-transparent",
];

const startSteps = [
  {
    icon: Plus,
    title: "Create the roster",
    text: "Name your club roster and upload the CSV to get the player list ready.",
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

export default function AdminPage() {
  const [ladderName, setLadderName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [solutionsInfoOpen, setSolutionsInfoOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const loading = useSelector((state) => state.createLadder?.loading);
  const { allLadders = [], loading: laddersLoading } = useSelector(
    (state) => state.fetchLadder,
  );

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem("adminDetails");
    if (!storedAdmin) return;

    try {
      setAdmin(JSON.parse(storedAdmin));
    } catch (error) {
      console.error(error);
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    if (!admin?.id) return;
    dispatch(fetchLadders({ userId: admin.id }));
  }, [admin?.id, dispatch]);

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

  const adminFirstName = admin?.name?.trim()?.split(" ")[0] || "Admin";

  const overviewCards = [
    {
      title: "Club Competitions",
      value: activeLadders.length,
      detail:
        activeLadders.length > 0 ? "Ready to edit and manage" : "Create your first roster",
      icon: Layers3,
    },
    {
      title: "Roster Boards",
      value: rosterCount,
      detail: rosterCount > 0 ? "Player lists uploaded" : "Awaiting first upload",
      icon: Users2,
    },
    {
      title: "Demo Templates",
      value: demoLadders.length,
      detail: "Open these to explore the setup",
      icon: Sparkles,
    },
    {
      title: "Setup Status",
      value: csvFile ? "CSV Ready" : laddersLoading ? "Syncing" : "Live",
      detail: csvFile ? "Roster file is attached" : "Dashboard connected",
      icon: ShieldCheck,
    },
  ];

  const checkCsvDuplicates = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          const rows = results.data || [];

          if (!rows.length) {
            resolve({ duplicateNames: [] });
            return;
          }

          const headers = Object.keys(rows[0]);
          const nameKey = headers.find((header) => header.includes("name")) || headers[0];
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

          resolve({ duplicateNames: duplicates });
        },
        error: reject,
      });
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
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

  const ladderExists = (name) => {
    if (!Array.isArray(allLadders)) return false;

    return allLadders.some(
      (ladder) => ladder?.name?.toLowerCase().trim() === name.toLowerCase().trim(),
    );
  };

  const handleCreateRoster = async () => {
    const ladderType = "roster";

    if (duplicateWarning) {
      toast.warn("Please remove duplicate names first");
      return;
    }

    const cleanName = ladderName.trim();

    if (!admin?.id || !cleanName || !csvFile) {
      toast.warn("Please enter roster name, upload CSV, and ensure login.");
      return;
    }

  if (ladderExists(cleanName)) {
    toast.error(`${cleanName} name already exists — choose another`);
    return;
  }

    try {
      const ladderResult = await dispatch(
        createLadder({
          user_id: admin.id,
          name: cleanName,
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
        toast.error("Roster created but the ID was missing.");
        return;
      }

      await dispatch(
        importRoster({
          file: csvFile,
          ladder_id: createdLadderId,
        }),
      ).unwrap();

      toast.success("Roster created successfully!");
      dispatch(fetchLadders({ userId: admin.id }));
      setLadderName("");
      setCsvFile(null);
      setDuplicateWarning(null);

      setTimeout(() => {
        router.push(`/player-list?ladder_id=${createdLadderId}&type=roster`);
      }, 800);
    } catch (error) {
      console.error(error);

      const message =
        error?.response?.data?.error_message || error?.message || "Create failed";

      if (message.toLowerCase().includes("exist")) {
        toast.error("Roster name already exists");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground mt-10">
      {/* ── Unified Navbar (Admin & Sub-Admin) ── */}
      <PlayerLevelNavbar activeTab="dashboard" />

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
                <span className="h-2 w-2 rounded-full bg-primary sm:h-2.5 sm:w-2.5" />
                Sports Solutions Pro
              </div>

              <div className="space-y-3">
                <h1 className="text-h1 font-black tracking-tight text-foreground sm:text-h11">
                  Welcome back Admin Dashboard
                </h1>
                <p className="max-w-2xl text-p2 leading-7 text-muted-foreground">
                  Manage rosters, launch competitions, and keep your club’s internal
                  ladder system organized from one admin workspace.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Popover open={quickGuideOpen} onOpenChange={setQuickGuideOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                      <CircleHelp className="h-4 w-4" />
                      Quick Guide
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={10}
                    className="w-[90vw] max-w-xl border-slate-700 bg-slate-100 px-2 py-4 text-slate-900 shadow-2xl"
                  >
                    <AdminImportantInfo onClose={() => setQuickGuideOpen(false)} />
                  </PopoverContent>
                </Popover>

                <Popover open={solutionsInfoOpen} onOpenChange={setSolutionsInfoOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/50"
                    >
                      <Layers3 className="h-4 w-4" />
                      Competition Types
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={10}
                    className="w-[90vw] max-w-lg border-slate-700 bg-slate-100 px-3 py-4 text-slate-900 shadow-2xl"
                  >
                    <AdminHideShowInfo isModel={false} />
                  </PopoverContent>
                </Popover>
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
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 sm:p-6 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                    Workspace Flow
                  </p>
                  <h2 className="mt-2 text-h2 font-bold text-foreground">
                    How to get a new club ready
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <FolderKanban className="h-4 w-4" />
                  {activeLadders.length > 0 ? "Club already live" : "Fresh setup"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {startSteps.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-border bg-muted/40 p-5"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-p1 font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-p3 leading-6 text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                    Demo Area
                  </p>
                  <h2 className="mt-2 text-h2 font-bold text-foreground">
                    Explore ready-made examples
                  </h2>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 sm:inline-flex">
                  Test before you launch
                </div>
              </div>
              <DemoLadder userId={admin?.id} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="mb-4 px-1">
                <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                  Live Lists
                </p>
                <h2 className="mt-2 text-h2 font-bold text-foreground">
                  Manage existing competitions
                </h2>
              </div>
              <LadderList userId={admin?.id} />
            </motion.section>
          </div>

          <div className="space-y-6 sticky top-24 z-40">
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-[24px] sm:rounded-[30px] border border-primary/10 bg-card p-4 sm:p-6 backdrop-blur-xl"
              style={{ backgroundColor: "color-mix(in srgb, var(--card), var(--primary) 2%)" }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary">
                    Create Roster
                  </p>
                  <h2 className="mt-2 text-h2 font-bold text-foreground">
                    Upload your players and start fast
                  </h2>
                  <p className="mt-2 text-p2 leading-6 text-muted-foreground">
                    Add the roster name, upload the CSV, then jump straight into the
                    player list editor.
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: brandGradient,
                    boxShadow: "var(--brand-card-shadow)",
                  }}
                >
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>

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
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="rounded-[24px] sm:rounded-[30px] border border-border bg-card p-4 sm:p-6 backdrop-blur-xl"
            >
              <p className="text-p3 font-semibold uppercase tracking-[0.18em] text-primary/80">
                Support
              </p>
              <h2 className="mt-2 text-h2 font-bold text-foreground">
                Need a bespoke club setup?
              </h2>
              <p className="mt-3 text-p2 leading-6 text-muted-foreground">
                Reach out for help with custom workflows, imports, or a competition setup
                tailored to your club structure.
              </p>

              <a
                href="mailto:support@sportssolutionspro.com"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
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

      <div className="relative z-10 mt-10">
        <BespokeFooter />
      </div>
    </div>
  );
}
