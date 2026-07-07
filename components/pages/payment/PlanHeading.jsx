"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import topLogo from "@/public/topLogo.png";
import {
  ArrowRight,
  Activity,
  Bike,
  Check,
  ChartColumn,
  CircleDot,
  Crosshair,
  Dumbbell,
  Flag,
  Gift,
  Goal,
  Info,
  Medal,
  Menu,
  Moon,
  PhoneCall,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trophy,
  Users,
  Volleyball,
  Waves,
  X,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

const PerformanceDatabase = dynamic(() => import("@/components/shared/PerformanceDatabase"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-card rounded-2xl border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading Performance Board...</p>
      </div>
    </div>
  ),
});

const OnboardingFlow = dynamic(() => import("@/components/shared/OnboardingFlow"), {
  ssr: false,
});

import Footer from "@/components/shared/Footer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PlanHeading() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isONboardingFlowVisible, setIsONboardingFlowVisible] = useState(false);
  const [views, setViews] = useState(20000);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("VXRyfRLpBpY");

  const demoVideos = [
    {
      id: "VXRyfRLpBpY",
      title: "Start up (How to)",
      description: "Learn how to set up your club and get started with SSP.",
    },
    {
      id: "uDmBtGrz_Eg",
      title: "Leaderboards, Colours and Filters",
      description: "Learn how to use the leaderboards, colours and filters. work",
    },
    {
      id: "CCiU5nA7Sdo",
      title: "Main Dashboard Explained",
      description: "A comprehensive overview of the main admin dashboard and its features.",
    },
    {
      id: "1lBalDCSAPg",
      title: "Section Dashboard and Creating Solutions",
      description: "How to set up mini-leagues, challenge boards, and custom leaderboards as a Section Admin.",
    },
    {
      id: "2bielTgi72U",
      title: "The Benefits of the SSP Participation Eco-System",
      description: "Learn how the SSP Participation Ecosystem rewards and engages players of all ages.",
    },
  ];

  useEffect(() => {
    let active = true;

    async function incrementCounter() {
      try {
        const response = await fetch("https://api.counterapi.dev/v1/ssp-leaderboard/visits/up");
        if (!response.ok) throw new Error("API response error");
        const data = await response.json();
        if (data && typeof data.count === "number") {
          const syncedCount = 20000 + data.count;
          if (active) {
            setViews(syncedCount);
          }
          return;
        }
      } catch (err) {
        console.error("Failed to fetch synced views, falling back to local storage", err);
      }

      // Safe fallback using local storage if the API is down or blocked
      try {
        const storedViews = localStorage.getItem("ssp_page_views");
        let currentViews = 20000;
        if (storedViews) {
          currentViews = parseInt(storedViews, 10);
          if (currentViews < 20000) {
            currentViews = 20000;
          }
        } else {
          currentViews = 20000 + Math.floor(Math.random() * 500);
        }
        currentViews += 1;
        localStorage.setItem("ssp_page_views", currentViews.toString());
        if (active) {
          setViews(currentViews);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (mounted) {
      incrementCounter();
    }

    return () => {
      active = false;
    };
  }, [mounted]);
  
  const { theme, setTheme } = useTheme();

  const buttonRef = useRef(null);
  const [showPoster, setShowPoster] = useState(false);
  const [popupPosition, setPopupPosition] = useState("bottom");

  const [dbLoaded, setDbLoaded] = useState(false);
  const hasUserScrolledRef = useRef(false);

  const handleInfoClick = (e) => {
    e.preventDefault();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top < viewportHeight / 2) {
        setPopupPosition("bottom");
      } else {
        setPopupPosition("top");
      }
    }
    setShowPoster((prev) => !prev);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleUserScroll = () => {
      hasUserScrolledRef.current = true;
    };
    window.addEventListener("wheel", handleUserScroll, { passive: true });
    window.addEventListener("touchmove", handleUserScroll, { passive: true });
    window.addEventListener("keydown", handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleUserScroll);
      window.removeEventListener("touchmove", handleUserScroll);
      window.removeEventListener("keydown", handleUserScroll);
    };
  }, []);

  useEffect(() => {
    const handleHashScroll = (force = false) => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          if (force || !hasUserScrolledRef.current) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    };

    const onHashChange = () => {
      hasUserScrolledRef.current = false;
      handleHashScroll(true);
    };

    if (mounted) {
      handleHashScroll();

      if (dbLoaded) {
        handleHashScroll();
      }

      window.addEventListener("hashchange", onHashChange);

      return () => {
        window.removeEventListener("hashchange", onHashChange);
      };
    }
  }, [mounted, dbLoaded]);


  const handleNavigationToAuth = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setIsONboardingFlowVisible(true);
  }

  const sports = useMemo(
    () => ["Badminton", "Squash", "Table Tennis", "Padel", "5-a-side", "+ More"],
    [],
  );

  const competitionSports = useMemo(
    () => [
      { label: "ATHLETICS", Icon: Activity, color: "from-violet-600 to-purple-800" },
      { label: "BADMINTON", Icon: Medal, color: "from-blue-500 to-blue-800" },
      { label: "BASKETBALL", Icon: CircleDot, color: "from-red-500 to-red-800" },
      { label: "CRICKET", Icon: Trophy, color: "from-emerald-500 to-green-800" },
      { label: "CYCLING", Icon: Bike, color: "from-amber-500 to-orange-800" },
      { label: "DARTS", Icon: Crosshair, color: "from-purple-500 to-violet-800" },
      { label: "FOOTBALL", Icon: Goal, color: "from-sky-500 to-blue-800" },
      { label: "GOLF", Icon: Flag, color: "from-emerald-500 to-teal-800" },
      { label: "HANDBALL", Icon: Trophy, color: "from-amber-500 to-yellow-800" },
      { label: "HOCKEY", Icon: Dumbbell, color: "from-blue-600 to-indigo-900" },
      { label: "NETBALL", Icon: Volleyball, color: "from-fuchsia-500 to-pink-800" },
      { label: "PADEL", Icon: Shield, color: "from-cyan-500 to-teal-800" },
      { label: "PICKLEBALL", Icon: Medal, color: "from-yellow-400 to-orange-700" },
      { label: "RACQUETBALL", Icon: CircleDot, color: "from-rose-500 to-pink-800" },
      { label: "RUGBY", Icon: ShieldCheck, color: "from-violet-500 to-purple-800" },
      { label: "SNOOKER", Icon: CircleDot, color: "from-green-500 to-emerald-800" },
      { label: "SQUASH", Icon: Medal, color: "from-orange-500 to-amber-800" },
      { label: "SWIMMING", Icon: Waves, color: "from-sky-500 to-blue-800" },
      { label: "TABLE TENNIS", Icon: CircleDot, color: "from-red-500 to-rose-800" },
    ],
    [],
  );

  const features = useMemo(
    () => [
      {
        icon: Trophy,
        color: "text-[var(--landing-secondary)]",
        title: "24/7 Live Rankings",
        description:
          "Real-time updates visible to every member. Creates motivation and competitive buzz.",
      },
     
      {
        icon: PhoneCall,
        color: "text-[var(--landing-secondary)]",
        title: "Comms Made Easy",
        description:
          "Enables Admin to message all club and Section admin to message section members via the App alerting members through standard App Notifications.  Always keep members updated.",
      },
      {
        icon: Users,
        color: "text-[var(--landing-primary)]",
        title: "Unique Community Features",
        description:
          `- the uploading of avatars gives a visual community feel 
- activity logs provide members with club activity on a daily basis 
- the challenge boards set challenges for all club members of all ages and gender and provide a place to store and display records  
- members achieve activity statuses displayed in their roster information rewarding their participation. 
`,
      },
      {
        icon: ChartColumn,
        color: "text-[var(--landing-secondary)]",
        title: "Team Selection",
        description:
          "Stats and rankings support fair team selection and seeding for club tournaments.",
      },
      {
        icon: SlidersHorizontal,
        color: "text-[var(--landing-primary)]",
        title: "Customisable & Flexible",
        description:
          "All solutions fully customisable with many useful options available plus the ability to filter results by age and gender, enabling many sub-competitions to be run within one major competition.",
      },
      {
        icon: Gift,
        color: "text-[var(--landing-primary)]",
        title: "Reward Eco-System which Increases Participation",
        description:
          "Members are rewarded for simply participating irrespective of standard or success.  The system logs every result posted, each one earning members an SSP Digital Participation Token that can be redeemed for 20% off goods from SSP Sponsors.",
      },
    ],
    [],
  );

  const pricing = useMemo(
    () => [
      // {
      //   name: "STARTER",
      //   price: "Free",
      //   suffix: "forever",
      //   description: "Perfect for trying it out",
      //   buttonLabel: "Get Started",
      //   buttonHref: "/register-page",
      //   featured: false,
      //   items: ["Up to 10 players", "1 active ladder", "Basic leaderboard"],
      // },
      {
        name: "CLUB",
        price: "GBP 24",
        suffix: "/yr per player",
        description: "Everything a growing club needs",
        buttonLabel: "Start Free Trial",
        buttonHref: "/register-page",
        featured: true,
        items: [
          "Unlimited players",
          "Multiple ladders & mini-leagues",
          "CSV import",
          "Custom branding",
        ],
      },
      {
        name: "ENTERPRISE",
        price: "Custom",
        suffix: "",
        description: "For multi-club organizations",
        buttonLabel: "Contact Sales",
        buttonHref: "mailto:support@sportssolutionspro.com",
        featured: false,
        items: ["Multi-club discounts", "All Club features", "Priority support & SLA"],
      },
    ],
    [],
  );

  const navItems = useMemo(
    () => [
      { label: "SSP International Competitions", href: "#ssp-international-competitions" },
      { label: "SSP Talent Board", href: "#talent-board" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Clubs/Coaches", href: "#features" },
      { label: "Contact", href: "#contact" },
    ],
    [],
  );

  const buttonClass =
    "border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl";

  const navLinkClass =
    "text-[15px] font-medium transition-colors text-[var(--landing-nav-text)] hover:text-[var(--landing-nav-hover)]";

  const themeToggleClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]";

  return (
    <main className="landing-page min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]">
      <nav className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-surface)] backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image src={topLogo} alt="Sports Solutions Pro" width={60} height={60} className="lg:h-[60px] lg:w-[60px] h-[40px] w-[40px] object-contain" priority />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={navLinkClass}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {mounted && (
              <div className="views-badge flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{views.toLocaleString()} views</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={themeToggleClass}
              aria-label="Toggle theme"
            >
              {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </button>
            <Button asChild size="lg" className={`${buttonClass} rounded-full px-8`}>
              <Link onClick={handleNavigationToAuth} href="#">Log In</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {mounted && (
              <div className="views-badge flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold shadow-sm shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>{views.toLocaleString()}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={themeToggleClass}
              aria-label="Toggle theme"
            >
              {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--landing-text)]"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[var(--landing-border)] bg-[var(--landing-surface-strong)] lg:hidden">
            <div className="mx-auto flex max-w-full flex-col gap-4 px-4 py-5 sm:px-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-[var(--landing-nav-text)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button asChild className={`${buttonClass} h-11 rounded-full`}>
                <Link onClick={handleNavigationToAuth} href="#">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden pb-32 pt-24">
        <div
          className="absolute top-0 right-0 -z-10 h-[800px] w-[800px] translate-x-1/3 -translate-y-1/4 rounded-full blur-3xl opacity-70"
          style={{ background: "var(--landing-hero-orb-1)" }}
        />
        <div
          className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/4 rounded-full blur-3xl opacity-70"
          style={{ background: "var(--landing-hero-orb-2)" }}
        />

        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div
                className="animate-fade-in-up inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold text-[var(--landing-primary)] shadow-sm"
                style={{
                  borderColor: "var(--landing-badge-border)",
                  background: "var(--landing-badge-bg)",
                }}
              >
                <span className="mr-2 flex h-2 w-2 rounded-full bg-[var(--landing-secondary)]" />
                The #1 platform for sports clubs
              </div>

              {mounted && (
                <div
                  className="animate-fade-in-up views-badge inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-black backdrop-blur"
                  style={{ animationDelay: "0.05s" }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live Page Views: <span className="views-badge-highlight font-mono tracking-wider">{views.toLocaleString()}</span></span>
                </div>
              )}
            </div>

            <h1
              className="animate-fade-in-up mt-6 mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl"
              style={{ animationDelay: "0.05s" }}
            >
              PRO SOFTWARE
              <br />
              <span className="bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] bg-clip-text text-transparent">
                For Clubs and Coaches
              </span>
            </h1>

            <p
              className="animate-fade-in-up mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-[var(--landing-muted)] md:text-2xl"
              style={{ animationDelay: "0.1s" }}
            >
              Automated ladders, mini-leagues, leaderboards and challenge boards, all in one
              platform built for sports clubs.
            </p>

            <div
              className="animate-fade-in-up mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
              style={{ animationDelay: "0.15s" }}
            >
              <Button
                asChild
                size="lg"
                className={`${buttonClass} h-14 w-full rounded-full px-8 text-lg sm:w-auto`}
              >
                <Link onClick={handleNavigationToAuth} href="#">Start Free Trial</Link>
              </Button>

              <Button
                onClick={() => setIsDemoModalOpen(true)}
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-full px-8 text-lg transition-all sm:w-auto"
                style={{
                  borderColor: "var(--landing-outline-button)",
                  color: "var(--landing-outline-button-text)",
                  background: "var(--landing-surface)",
                }}
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* App Promotion & Info Card */}
          <div
            id="ssp-international-competitions"
            className="animate-fade-in-up mx-auto mb-16 w-full max-w-[980px] flex flex-col select-none relative scroll-mt-20"
            style={{ animationDelay: "0.18s" }}
          >
              {/* Unified Banner & Bottom Bar Container */}
              <div className="relative w-full overflow-hidden rounded-[16px] border border-cyan-500/35 bg-[#020713] p-1 shadow-[0_0_24px_rgba(0,145,255,0.28)]">
                
                {/* Top Banner Graphic */}
                <div className="relative overflow-hidden rounded-t-[12px] bg-black">
                  <Image
                    src="/ssp-internstional.png"
                    alt="SSP International Competitions"
                    width={700}
                    height={350}
                    sizes="(max-width: 768px) 100vw, 700px"
                    quality={70}
                    priority
                    className="w-full h-auto block"
                  />
                  
                  {/* Info button in top right */}
                  <button
                    ref={buttonRef}
                    onClick={handleInfoClick}
                    className="absolute right-3 top-3 z-20 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-black/45 p-1.5 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/65 active:scale-95 sm:h-8 sm:w-8"
                    title="Info for First Time Users"
                  >
                    <Info className="h-4 w-4" />
                  </button>

                  {/* Custom HTML/CSS Bottom Bar (Directly overlaying on the image at the bottom) */}
                  <div className="relative mx-2 mb-2 mt-2 flex w-[calc(100%-1rem)] flex-wrap items-center justify-around gap-3 rounded-[14px] border border-cyan-500/45 bg-gradient-to-r from-[#000a29] via-[#00143f] to-[#00081d] p-3 text-white shadow-[0_0_22px_rgba(6,182,212,0.24)] md:absolute md:bottom-2 md:left-2 md:right-2 md:mx-0 md:mt-0 md:w-auto md:flex-nowrap md:justify-between md:gap-2 md:px-4 md:py-2">
                  
                  {/* 1. Download The App */}
                  <div className="flex items-center gap-2.5">
                    <div className="border-2 border-white/80 rounded-lg p-1 w-8 h-10 flex items-center justify-center text-white shrink-0 shadow-inner">
                      <svg className="h-6 w-4" viewBox="0 0 24 38" fill="none">
                        <rect x="1" y="1" width="22" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
                        <circle cx="12" cy="31" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-[8px] font-bold tracking-[0.1em] text-slate-300 sm:text-[9px]">DOWNLOAD</span>
                      <span className="text-[12px] font-black tracking-wide text-cyan-400 sm:text-[13px]">THE APP</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block h-9 w-px bg-cyan-500/25" />

                  {/* 2. Use SSP ID */}
                  <div className="flex items-center gap-2.5">
                    <div className="text-cyan-400 shrink-0">
                      <svg className="h-8 w-7" viewBox="0 0 32 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 2s10 2 10 9c0 9-10 14-10 14S6 20 6 11c0-7 10-9 10-9z" />
                        <circle cx="16" cy="11" r="3" fill="currentColor" />
                        <path d="M11 18c0-2.5 2.5-3 5-3s5 .5 5 3" />
                      </svg>
                    </div>
                    <div className="flex flex-col text-left leading-none">
                      <span className="mb-1 text-[8px] font-bold tracking-[0.08em] text-slate-300">USE SSP ID</span>
                      <span className="text-xs font-black tracking-wide text-yellow-300 sm:text-sm">"SSPCOMPS"</span>
                      <span className="mt-1 text-[8px] font-bold tracking-[0.08em] text-slate-300">TO ENTER</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block h-9 w-px bg-cyan-500/25" />

                  {/* 3. Store Download Badges */}
                  <div className="flex flex-col gap-1 shrink-0">
                    {/* App Store Badge */}
                    <a
                      href="https://apps.apple.com/il/app/sports-solutions-pro/id6768947773"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black hover:bg-slate-900 border border-white/15 rounded-lg px-3 py-1 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md w-[124px] h-[28px] cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.6 2.98-1.41z"/>
                      </svg>
                      <div className="text-left leading-tight flex flex-col justify-center">
                        <span className="text-[5.5px] uppercase tracking-wider text-gray-300 leading-none">Download on the</span>
                        <span className="text-[9px] font-bold font-sans text-white leading-none mt-0.5">App Store</span>
                      </div>
                    </a>

                    {/* Google Play Badge */}
                    <a
                      href="https://play.google.com/store/apps/details?id=com.sportssolutions.ssp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black hover:bg-slate-900 border border-white/15 rounded-lg px-3 py-1 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md w-[124px] h-[28px] cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M3.25 3.25c-.14.14-.25.36-.25.64v16.22c0 .28.11.5.25.64l.06.06L12.44 12v-.12L3.31 3.19l-.06.06z" fill="#3bccff" />
                        <path d="M15.5 15.06l-3.06-3.06v-.12l3.06-3.06.07.04 3.63 2.06c1.04.59 1.04 1.55 0 2.14l-3.63 2.06-.07-.06z" fill="#ffcc00" />
                        <path d="M12.44 11.94L3.25 21.13c.34.36.91.4 1.55.04l10.76-6.11-3.12-3.12z" fill="#ff3366" />
                        <path d="M12.44 12.06l3.12-3.12L4.8 2.83c-.64-.36-1.21-.32-1.55.04L12.44 12z" fill="#48ff48" />
                      </svg>
                      <div className="text-left leading-tight flex flex-col justify-center">
                        <span className="text-[5.5px] uppercase tracking-wider text-gray-300 leading-none">GET IT ON</span>
                        <span className="text-[9px] font-bold font-sans text-white leading-none mt-0.5">Google Play</span>
                      </div>
                    </a>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block h-9 w-px bg-cyan-500/25" />

                  {/* 4. Follow Us */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center leading-none text-center">
                      <span className="text-[8px] font-bold text-slate-300 tracking-wide">FOLLOW US</span>
                      <span className="text-[8px] font-bold text-slate-300 tracking-wide mt-0.5">ON</span>
                    </div>
                     <a
                       href="https://www.facebook.com/profile.php?id=61580051563946"
                       target="_blank"
                       rel="noopener noreferrer"
                       aria-label="Follow us on Facebook"
                       className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-md cursor-pointer"
                     >
                      <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block h-9 w-px bg-cyan-500/25" />

                  {/* 5. Terms & Conditions */}
                  <Link
                    href="/terms-and-conditions"
                    prefetch={false}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-black tracking-wide text-[11px] sm:text-xs group cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col text-left leading-tight">
                      <span>TERMS &</span>
                      <span>CONDITIONS</span>
                    </div>
                    <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                </div>
                <div className="mt-1 overflow-hidden rounded-b-[12px] border border-cyan-500/35 bg-[#030716] px-2 py-2 shadow-[inset_0_0_18px_rgba(0,153,255,0.18)]">
                  <Image src="/ssp-internstional-bottom.PNG" alt="SSP International Competitions - Bottom Bar" width={700} height={90} sizes="(max-width: 768px) 100vw, 700px" quality={70} className="w-full h-auto block" />
                </div>
              </div>

              {/* Dialog modal overlay for /ssp-internstional-1.png */}
              {showPoster && (
                <Dialog open={showPoster} onOpenChange={setShowPoster}>
                  <DialogContent className={`w-[95vw] sm:w-[85vw] md:max-w-2xl lg:max-w-3xl p-4 sm:p-5 rounded-2xl border shadow-2xl backdrop-blur-md max-h-[85vh] overflow-y-auto ${
                    mounted && theme !== "dark" ? "bg-white text-gray-900 border-gray-200" : "bg-zinc-950/95 text-white border-zinc-800"
                  }`}>
                    <DialogTitle className="text-lg sm:text-xl font-bold mb-3 pr-6">SSP Competition Guide</DialogTitle>
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                      <Image
                        src="/ssp-internstional-1.png"
                        alt="SSP Competition Guide"
                        width={800}
                        height={1200}
                        className="w-full h-auto block"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
        </div>
      </section>

      <div id="talent-board" className="relative z-10 border-y border-border bg-background scroll-mt-20">
        <PerformanceDatabase onLoadComplete={() => setDbLoaded(true)} />
      </div>

      <section id="features" className="py-10 scroll-mt-20" style={{ background: "var(--landing-section-alt)" }}>
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              WHY CLUBS CHOOSE US
            </h2>
            <p className="text-xl text-[var(--landing-nav-text)]">Everything Your Club Needs</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="flex flex-col h-full py-0 transition-shadow hover:shadow-md"
                  style={{
                    borderColor: theme === "light" ? "rgba(0, 0, 0, 0.12)" : "var(--landing-card-border)",
                    background: theme === "light" ? "#ffffff" : "var(--landing-surface-strong)",
                    boxShadow: theme === "light" ? "0 4px 12px rgba(0, 0, 0, 0.05)" : "var(--landing-card-shadow)",
                  }}
                >
                  <CardHeader className="p-5 flex-1 flex flex-col">
                    <Icon className={`mb-2.5 h-6 w-6 ${feature.color}`} />
                    <CardTitle className="text-base font-bold text-foreground mb-0.5 leading-tight">{feature.title}</CardTitle>
                    <p className="text-sm leading-relaxed text-[var(--landing-nav-text)] whitespace-pre-line mt-0">
                      {feature.description}
                    </p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden py-5 scroll-mt-20" style={{ background: "var(--landing-section-soft)" }}>
        <div className="absolute inset-0 opacity-[0.03] [background-image:url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Simple Pricing, No Surprises
            </h2>
            <h3 className="mb-4 text-2xl font-bold italic bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] bg-clip-text text-transparent md:text-3xl">
              All for less than £2 a player per month
            </h3>
            <span className="text-l text-[var(--landing-nav-text)]">
              {`( less than a cup of coffee per player a month)`}
            </span>
            <p className="mt-5 text-xl text-[var(--landing-nav-text)]">
              All charges ONE MONTH IN ARREARS after free set up and free trial
            </p>
          </div>
        </div>
      </section>

      <section
        id="clubs"
        className="py-10 scroll-mt-20"
        style={{
          background: "var(--landing-section-alt)",
          borderBottom: "1px solid var(--landing-border)",
        }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-extrabold text-foreground">Ready to  Inspire?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-[var(--landing-nav-text)]">
           Competition - Participation - Rewards
          </p>
           <p className="mx-auto mb-10 max-w-2xl text-xl text-[var(--landing-nav-text)]">
           Set up in minutes - Demos Provided - No Cost - Free trial
          </p>
          <Button asChild size="lg" className={`${buttonClass} h-16 rounded-full px-10 text-xl`}>
            <Link  onClick={handleNavigationToAuth} href="#">
              Get Started Free <ArrowRight className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>



      <Footer />
      {isONboardingFlowVisible && <OnboardingFlow setIsONboardingFlowVisible={setIsONboardingFlowVisible} />}

      {isDemoModalOpen && (
        <Dialog open={isDemoModalOpen} onOpenChange={setIsDemoModalOpen}>
          <DialogContent className={`w-[95vw] sm:w-[90vw] md:max-w-4xl lg:max-w-5xl p-4 sm:p-6 rounded-2xl border shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto ${
            mounted && theme !== "dark" ? "bg-white text-gray-900 border-gray-200" : "bg-zinc-950/95 text-white border-zinc-800"
          }`}>
            <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 pr-6">SSP Demo & Explainer Videos</DialogTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Video Player */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                    title="SSP Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
                <h3 className="text-lg font-bold mt-2">
                  {demoVideos.find((v) => v.id === activeVideoId)?.title}
                </h3>
                <p className="text-sm opacity-70">
                  {demoVideos.find((v) => v.id === activeVideoId)?.description}
                </p>
              </div>
              
              {/* Video List */}
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Select Video</span>
                <div className="flex flex-col gap-2">
                  {demoVideos.map((video) => {
                    const isActive = video.id === activeVideoId;
                    return (
                      <button
                        key={video.id}
                        onClick={() => setActiveVideoId(video.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                          isActive 
                            ? "bg-blue-600/10 border-blue-500 text-blue-500 shadow-md"
                            : mounted && theme !== "dark"
                              ? "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800"
                              : "bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className={`mt-1 rounded-full p-1 shrink-0 ${isActive ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold leading-tight">{video.title}</h4>
                            <p className="text-[11px] opacity-70 mt-1 line-clamp-2">{video.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
