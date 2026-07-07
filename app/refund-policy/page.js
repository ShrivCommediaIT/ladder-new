"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import topLogo from "@/public/topLogo.png";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
  const router = useRouter();
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

    if (
      subAdmin?.user_type === "sub_admin" ||
      admin?.user_type === "admin" ||
      adminDetails?.user_type === "admin" ||
      normalUser
    ) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const navItems = [
    { label: "SSP Talent Board", href: "/#talent-board" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Clubs", href: "/#features" },
    { label: "Contact", href: "/#contact" },
  ];

  const buttonClass =
    "border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl";

  const navLinkClass =
    "text-[15px] font-medium transition-colors text-[var(--landing-nav-text)] hover:text-[var(--landing-nav-hover)]";

  const themeToggleClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]";

  const refundSections = [
    {
      num: "1",
      title: "Introduction",
      content: [
        "Thank you for purchasing our products or subscribing to our services.",
        "We are dedicated to providing positive, high-quality sporting experiences and transparent refund/return policies for all our users."
      ]
    },
    {
      num: "2",
      title: "Money-Back Guarantee & Eligibility",
      content: [
        "We offer a full money-back guarantee for all purchases bearing our company name, regardless of where you bought or downloaded them from.",
        "If you are not satisfied with the product or service that you have purchased from us, you can request a full refund, no questions asked.",
        "You are eligible for a full refund within 14 calendar days of your purchase."
      ]
    },
    {
      num: "3",
      title: "Post 14-Day Refund Request Policy",
      content: [
        "After the initial 14-day period has passed, you will no longer be automatically eligible to receive a refund.",
        "However, if you write to us at info@ne-games.com, our support team will carefully consider all reasonable arguments and circumstances for your refund or return request."
      ]
    },
    {
      num: "4",
      title: "Physical Goods Return Conditions",
      content: [
        "NOTE: Physical goods purchased must be returned in good condition, with all components present and in their original packaging.",
        "You will be responsible for the cost of return postage unless the return is for goods that were damaged on arrival or not as described."
      ]
    },
    {
      num: "5",
      title: "Contact Us",
      content: [
        "If you have any additional questions or would like to request a refund, please feel free to contact us at info@ne-games.com."
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--landing-bg)] text-[var(--landing-text)] transition-colors duration-300">
      {/* Navbar rendering conditionally */}
      {isLoggedIn ? (
        <Navbar activeTab="" />
      ) : (
        <nav className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-surface)] backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <Image src={topLogo} alt="Sports Solutions Pro" width={60} height={60} className="lg:h-[60px] lg:w-[60px] h-[40px] w-[40px] object-contain" priority />
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
      <div className="flex-grow mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 mt-4">
        {/* Back navigation */}
        {isLoggedIn ? (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-muted)] hover:text-[var(--landing-primary)] mb-8 transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowLeft className="h-4 w-4" /> Previous Page
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-muted)] hover:text-[var(--landing-primary)] mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        )}

        {/* Document Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 text-[var(--landing-primary)] border border-cyan-500/20 mb-4"
          >
            <RotateCcw className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground mb-4 animate-text-glow"
          >
            Cancellation & Refund Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-[var(--landing-muted)] max-w-2xl mx-auto"
          >
            NE Games Ltd Refund / Return Policy details. Learn how to request refunds or returns.
          </motion.p>
        </div>

        {/* Refund Policy list */}
        <div className="space-y-6">
          {refundSections.map((sec, idx) => (
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
                    if (p.startsWith("NOTE:")) {
                      return (
                        <p key={pIdx} className="font-semibold text-foreground">
                          {p}
                        </p>
                      );
                    }
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
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Assurance Guaranteed
          </div>
          <p className="text-base font-bold text-foreground">Sports Solutions Pro (SSP)</p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold mt-1">A Division of NE GAMES LTD</p>
        </motion.div>
      </div>

      {/* Global Footer component */}
      <Footer />
    </div>
  );
}
