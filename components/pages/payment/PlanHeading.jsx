"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import PerformanceDatabase from "@/components/shared/PerformanceDatabase";
import OnboardingFlow from "@/components/shared/OnboardingFlow";

export default function PlanHeading() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
    const [isONboardingFlowVisible, setIsONboardingFlowVisible] = useState(false);
  
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
            <Image src={topLogo} alt="Sports Solutions Pro" className="lg:h-15 h-10 w-auto" priority />
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={navLinkClass}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
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
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold text-[var(--landing-primary)] shadow-sm"
              style={{
                borderColor: "var(--landing-badge-border)",
                background: "var(--landing-badge-bg)",
              }}
            >
              <span className="mr-2 flex h-2 w-2 rounded-full bg-[var(--landing-secondary)]" />
              The #1 platform for sports clubs
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-6 mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl"
            >
              PRO SOFTWARE
              <br />
              <span className="bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] bg-clip-text text-transparent">
                For Clubs and Coaches
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-[var(--landing-muted)] md:text-2xl"
            >
              Automated ladders, mini-leagues, leaderboards and challenge boards, all in one
              platform built for sports clubs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className={`${buttonClass} h-14 w-full rounded-full px-8 text-lg sm:w-auto`}
              >
                <Link onClick={handleNavigationToAuth} href="#">Start Free Trial</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-full px-8 text-lg transition-all sm:w-auto"
                style={{
                  borderColor: "var(--landing-outline-button)",
                  color: "var(--landing-outline-button-text)",
                  background: "var(--landing-surface)",
                }}
              >
                <Link href="/demo-page">Watch Demo</Link>
              </Button>
            </motion.div>
            {/* App Promotion & Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              id={"ssp-international-competitions"}
              className="mx-auto mb-16 max-w-[980px] flex flex-col select-none relative scroll-mt-20"
            >
              {/* Unified Banner & Bottom Bar Container */}
              <div className="relative w-full overflow-hidden rounded-[16px] border border-cyan-500/35 bg-[#020713] p-1 shadow-[0_0_24px_rgba(0,145,255,0.28)]">
                
                {/* Top Banner Graphic */}
                <div className="relative overflow-hidden rounded-t-[12px] bg-black">
                  <img
                    src="/ssp-internstional.png"
                    alt="SSP International Competitions"
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
                 <img src="/ssp-internstional-bottom.PNG" alt="SSP International Competitions - Bottom Bar" className="w-full h-auto block" />
                </div>
              </div>

              {/* Popover overlay for /poster1.png */}
              {showPoster && (
                <div
                  className={`absolute left-4 right-4 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${
                    popupPosition === "top"
                      ? "bottom-[102%] mb-2"
                      : "top-[78px] mt-2"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">Competition Details</span>
                    <button
                      onClick={() => setShowPoster(false)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                    <img src="ssp-internstional-1.png" alt="SSP Competition Guide" className="w-full h-auto block" />
                  </div>
                </div>
              )}
            </motion.div>

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
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Simple Pricing, No Surprises
            </h2>
<h3 className="mb-4 text-3xl font-bold bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] bg-clip-text text-transparent md:text-4xl">
  All for less than $2 a player per month
</h3>
            <span className="text-xl text-[var(--landing-nav-text)]">
              {`( less than a cup of coffee per player a month)`}
            </span>
            <p className="mt-5 text-xl text-[var(--landing-nav-text)]">
              All charges ONE MONTH IN ARREARS after free set up and free trial
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2 md:items-center">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={[
                  "py-0",
                  plan.featured ? "relative z-10 shadow-xl md:scale-102" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  borderColor: plan.featured 
                    ? "var(--landing-secondary)" 
                    : theme === "light" 
                      ? "rgba(0, 0, 0, 0.15)" 
                      : "var(--landing-card-border)",
                  background: theme === "light" ? "#ffffff" : "var(--landing-surface-strong)",
                  boxShadow: theme === "light"
                    ? plan.featured
                      ? "0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)"
                      : "0 4px 15px -3px rgba(0, 0, 0, 0.08)"
                    : "var(--landing-card-shadow)",
                }}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="rounded-full bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="p-5 pb-5">
                  <CardTitle
                    className={[
                      "text-base uppercase tracking-[0.08em]",
                      plan.featured ? "text-[var(--landing-primary)]" : "text-[var(--landing-nav-text)]",
                    ].join(" ")}
                  >
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2 flex items-baseline text-foreground">
                    <span className={["font-extrabold", plan.featured ? "text-3xl" : "text-2xl"].join(" ")}>
                      {plan.price}
                    </span>
                    {plan.suffix ? (
                      <span className="ml-1 text-sm font-medium text-[var(--landing-nav-text)]">
                        {plan.suffix}
                      </span>
                    ) : null}
                  </div>
                  <CardDescription className="mt-2 text-xs">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-5">
                  <ul className="space-y-2.5">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check
                          className={[
                            "h-4 w-4 shrink-0",
                            plan.featured ? "text-[var(--landing-primary)]" : "text-[var(--landing-secondary)]",
                          ].join(" ")}
                        />
                        <span className={["text-xs sm:text-sm", plan.featured ? "font-medium text-foreground" : "text-[var(--landing-nav-text)]"].join(" ")}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-5 pt-6">
                  <Button
                    asChild
                    variant={plan.featured ? "default" : "outline"}
                    className={[
                      "h-10 w-full rounded-lg text-sm",
                      plan.featured ? buttonClass : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      plan.featured
                        ? undefined
                        : {
                            borderColor: "var(--landing-outline-button)",
                            color: "var(--landing-outline-button-text)",
                            background: "transparent",
                          }
                    }
                  >
                    <Link href={plan.buttonHref}>{plan.buttonLabel}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
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



      <footer
        id="contact"
        className="py-12 scroll-mt-20"
        style={{ background: "var(--landing-footer-bg)", color: "var(--landing-footer-text)" }}
      >
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Image
                src={topLogo}
                alt="Sports Solutions Pro"
                className="mb-6 h-8 w-auto brightness-0 invert opacity-80"
              />
              <p className="max-w-sm leading-7">
                The smart way to run automated ladders, mini-leagues, leaderboards and challenge
                boards for your  sports club.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold" style={{ color: "var(--landing-footer-heading)" }}>
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#talent-board" className="transition-colors hover:text-foreground">
                    SSP Talent Board
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition-colors hover:text-foreground">
                    Clubs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold" style={{ color: "var(--landing-footer-heading)" }}>
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="transition-colors hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@sportssolutionspro.com" className="transition-colors hover:text-foreground">
                    Support
                  </a>
                </li>
                <li>
                  <a href="mailto:support@sportssolutionspro.com" className="transition-colors hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-between gap-4 pt-8 text-center md:flex-row"
            style={{ borderTop: "1px solid var(--landing-footer-border)" }}
          >
            <p>© 2026 Sports Solutions Pro. All rights reserved.</p>
            <p className="text-sm">Made for sports clubs worldwide.</p>
          </div>
        </div>
      </footer>
      {isONboardingFlowVisible && <OnboardingFlow setIsONboardingFlowVisible={setIsONboardingFlowVisible} />}
    </main>
  );
}
