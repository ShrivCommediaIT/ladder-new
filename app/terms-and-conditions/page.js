"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import topLogo from "@/public/topLogo.png";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsAndConditions() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    
    // Check if user is logged in
    const storedAdminDetails = sessionStorage.getItem("adminDetails");
    const storedSubAdmin = sessionStorage.getItem("subAdmin");
    const storedAdmin = sessionStorage.getItem("userData");
    const storedUser = sessionStorage.getItem("user");

    const adminDetails = storedAdminDetails ? JSON.parse(storedAdminDetails) : null;
    const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;
    const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
    const normalUser = storedUser ? JSON.parse(storedUser) : null;

    if (subAdmin?.user_type === "sub_admin" || admin?.user_type === "admin" || adminDetails?.user_type === "admin" || normalUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const navItems = [
    { label: "SSP Talent Board", href: "/#talent-board" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Clubs", href: "/#clubs" },
    { label: "Contact", href: "/#contact" },
  ];

  const buttonClass =
    "border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl";

  const navLinkClass =
    "text-[15px] font-medium transition-colors text-[var(--landing-nav-text)] hover:text-[var(--landing-nav-hover)]";

  const themeToggleClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]";

  const termsSections = [
    {
      num: "1",
      title: "Welcome",
      content: [
        "SSP International Competitions are designed to encourage participation, enjoyment, personal achievement and friendly competition across all sports.",
        "By entering an SSP International Competition, participants agree to these Terms and Conditions."
      ]
    },
    {
      num: "2",
      title: "Competition Entry",
      content: [
        "Entry may require payment of a registration fee as displayed at the time of entry.",
        "The registration fee helps support the administration, development and promotion of SSP competitions.",
        "Entry fees are generally non-refundable except in exceptional circumstances at SSP's discretion."
      ]
    },
    {
      num: "3",
      title: "Participant Information",
      content: [
        "Participants should provide accurate registration details.",
        "For most competitions, only basic registration information is required.",
        "Additional contact information may be requested where necessary for prize administration or verification purposes."
      ]
    },
    {
      num: "4",
      title: "Results Submission",
      content: [
        "Participants are expected to submit genuine and accurate results.",
        "SSP operates on trust and encourages all participants to compete in a fair and sporting manner.",
        "Most results will be accepted without the need for additional verification."
      ]
    },
    {
      num: "5",
      title: "Verification of Results",
      content: [
        "In certain circumstances, SSP may request supporting evidence for a result.",
        "This is most likely to occur where:",
        "• A participant is eligible for a prize.",
        "• A result appears exceptional or significantly outside expected performance levels.",
        "• Verification is required to protect the integrity of the competition.",
        "Supporting evidence may include video footage, witness confirmation or other reasonable proof.",
        "Where evidence is requested but not provided, SSP reserves the right to remove the result from the leaderboard or exclude it from prize consideration."
      ]
    },
    {
      num: "6",
      title: "Rankings and Leaderboards",
      content: [
        "Leaderboards are provided to create a fun and engaging competitive environment.",
        "SSP reserves the right to correct genuine errors and remove results that cannot be reasonably verified when verification has been requested."
      ]
    },
    {
      num: "7",
      title: "Prizes",
      content: [
        "Some competitions may offer prizes, awards or recognition.",
        "Prize winners may be required to provide contact details and any reasonable verification requested by SSP before prizes are awarded.",
        "Prizes are subject to availability and any conditions specified for the relevant competition."
      ]
    },
    {
      num: "8",
      title: "Fair Participation",
      content: [
        "Participants are asked to respect the spirit of friendly and fair competition.",
        "SSP reserves the right to remove entries that are deliberately misleading, abusive or clearly inconsistent with the purpose of the competition."
      ]
    },
    {
      num: "9",
      title: "Liability",
      content: [
        "Participation in sporting activities is entirely voluntary.",
        "Participants take part in all activities at their own risk and are responsible for ensuring that they are fit and able to participate safely.",
        "SSP accepts no responsibility for injury, loss or damage arising from participation in any activity or competition."
      ]
    },
    {
      num: "10",
      title: "Privacy",
      content: [
        "Personal information supplied to SSP will be used only for the operation and administration of SSP services and competitions.",
        "Competition results, rankings and participant names may be displayed on public leaderboards.",
        "SSP will not sell personal information to third parties."
      ]
    },
    {
      num: "11",
      title: "Competition Changes",
      content: [
        "From time to time SSP may update competition formats, rules, prizes or these Terms and Conditions in order to improve the participant experience and ensure fair competition."
      ]
    },
    {
      num: "12",
      title: "Acceptance",
      content: [
        "By entering an SSP International Competition, participants confirm that they have read and accepted these Terms and Conditions.",
        "Thank you for supporting SSP International Competitions and helping us create positive sporting opportunities for participants around the world."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)] transition-colors duration-300">
      {/* Navbar rendering conditionally */}
      {isLoggedIn ? (
        <Navbar activeTab="" />
      ) : (
        <nav className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-surface)] backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <Image src={topLogo} alt="Sports Solutions Pro" className="lg:h-15 h-10 w-auto" priority />
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
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
                <Link href="/login-user">Log In</Link>
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
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-[var(--landing-nav-text)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className={`${buttonClass} h-11 rounded-full`}>
                  <Link href="/login-user">Log In</Link>
                </Button>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Main Document Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 mt-4">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-muted)] hover:text-[var(--landing-primary)] mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Document Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-[var(--landing-primary)] border border-cyan-500/20 mb-4"
          >
            <FileText className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground mb-4 animate-text-glow"
          >
            Terms and Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-[var(--landing-muted)] max-w-2xl mx-auto"
          >
            SSP International Competitions participant agreement. Please read these terms carefully before entering.
          </motion.p>
        </div>

        {/* Terms list */}
        <div className="space-y-6">
          {termsSections.map((sec, idx) => (
            <motion.div
              key={sec.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * idx }}
              className="bg-[var(--landing-surface)] rounded-2xl border border-[var(--landing-border)] p-6 md:p-8 hover:shadow-md transition-all duration-300 flex gap-4 md:gap-6"
            >
              {/* Badge */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white text-base font-black shadow-md">
                {sec.num}
              </div>

              {/* Text */}
              <div className="flex-1 space-y-3">
                <h2 className="text-xl font-bold text-foreground tracking-wide">{sec.title}</h2>
                <div className="space-y-2 text-sm md:text-base leading-relaxed text-[var(--landing-muted)]">
                  {sec.content.map((p, pIdx) => {
                    if (p.startsWith("•")) {
                      return (
                        <div key={pIdx} className="flex gap-2.5 items-start pl-2">
                          <span className="text-[var(--landing-secondary)] font-bold mt-0.5">•</span>
                          <span>{p.replace("•", "").trim()}</span>
                        </div>
                      );
                    }
                    return <p key={pIdx}>{p}</p>;
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Document Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-[var(--landing-border)] text-center text-[var(--landing-muted)]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-500/5 border border-slate-500/10 mb-4 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Integrity Assured
          </div>
          <p className="text-base font-bold text-foreground">Sports Solutions Pro (SSP)</p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold mt-1">A Division of NE GAMES LTD</p>
        </motion.div>

      </div>
    </div>
  );
}
