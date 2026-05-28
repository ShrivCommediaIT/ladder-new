"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import topLogo from "@/public/topLogo.png";
import {
  ArrowRight,
  Check,
  ChartColumn,
  Menu,
  Moon,
  PhoneCall,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trophy,
  Users,
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
    const [isVisible, setIsVisible] = useState(true);
    const [isONboardingFlowVisible, setIsONboardingFlowVisible] = useState(false);
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

    // useEffect(() => {
  //   const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
  //   if (!hasSeenOnboarding) {
  //     setIsVisible(true);
  //   }
  // }, []);


  const handleNavigationToAuth = () => {
    setIsONboardingFlowVisible(true);
  }

  const sports = useMemo(
    () => ["Badminton", "Squash", "Table Tennis", "Padel", "5-a-side", "+ More"],
    [],
  );

  const stats = useMemo(
    () => [
      { value: "500+", label: "Active Clubs" },
      { value: "12K+", label: "Players Managed" },
      { value: "98%", label: "Satisfaction Rate" },
      { value: "GBP 12", label: "Per Player/Year" },
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
        icon: ShieldCheck,
        color: "text-[var(--landing-primary)]",
        title: "Self-Managing & Tamper-Proof",
        description:
          "Players update their own results, no admin needed. Only winners can move up.",
      },
      {
        icon: PhoneCall,
        color: "text-[var(--landing-secondary)]",
        title: "Comms Made Easy",
        description:
          "One-click access to contact details for scheduling. Encourages frequent play.",
      },
      {
        icon: Users,
        color: "text-[var(--landing-primary)]",
        title: "Club Community Feel",
        description:
          "Players upload avatars and build an identity. Strengthens belonging and engagement.",
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
          "Adjust ladder size, challenge rules, and colour themes. Import easily via CSV.",
      },
    ],
    [],
  );

  const pricing = useMemo(
    () => [
      {
        name: "STARTER",
        price: "Free",
        suffix: "forever",
        description: "Perfect for trying it out",
        buttonLabel: "Get Started",
        buttonHref: "/register-page",
        featured: false,
        items: ["Up to 10 players", "1 active ladder", "Basic leaderboard"],
      },
      {
        name: "CLUB",
        price: "GBP 12",
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
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Clubs", href: "#clubs" },
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
            <Image src={topLogo} alt="Sports Solutions Pro" className="h-10 w-auto" priority />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className={navLinkClass}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={themeToggleClass}
              aria-label="Toggle theme"
            >
              {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
            </button>
            <Button asChild size="lg" className={`${buttonClass} rounded-full px-8`}>
              <Link onClick={handleNavigationToAuth} href="#">Start Free Trial</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
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
          <div className="border-t border-[var(--landing-border)] bg-[var(--landing-surface-strong)] md:hidden">
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
              The #1 platform for indoor sports clubs
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-6 mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-7xl"
            >
              Run Your Club
              <br />
              <span className="bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] bg-clip-text text-transparent">
                Like a Pro
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-[var(--landing-muted)] md:text-2xl"
            >
              Automated ladders, mini-leagues, leaderboards and challenge boards, all in one
              platform built for indoor sports clubs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className={`${buttonClass} h-14 w-full rounded-full px-8 text-lg sm:w-auto`}
              >
                <Link onClick={handleNavigationToAuth} href="#">Create Free Account</Link>
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

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pt-8"
              style={{ borderTop: "1px solid var(--landing-border)" }}
            >
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--landing-muted)]">
                Trusted by sports clubs across
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-base font-medium text-[var(--landing-nav-text)] md:gap-8">
                {sports.map((sport) => (
                  <span key={sport}>{sport}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="clubs"
        className="bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] py-12 text-white"
      >
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-white/20 px-4 md:border-l first:md:border-l-0"
              >
                <div className="mb-2 text-4xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium md:text-base" style={{ color: "var(--landing-stat-text)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24" style={{ background: "var(--landing-section-alt)" }}>
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              WHY CLUBS CHOOSE US
            </h2>
            <p className="text-xl text-[var(--landing-nav-text)]">Everything Your Club Needs</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="py-0 transition-shadow hover:shadow-md"
                  style={{
                    borderColor: "var(--landing-card-border)",
                    background: "var(--landing-surface-strong)",
                    boxShadow: "var(--landing-card-shadow)",
                  }}
                >
                  <CardHeader className="p-6">
                    <Icon className={`mb-4 h-10 w-10 ${feature.color}`} />
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-base leading-7 text-[var(--landing-nav-text)]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden py-24" style={{ background: "var(--landing-section-soft)" }}>
        <div className="absolute inset-0 opacity-[0.03] [background-image:url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Simple Pricing, No Surprises
            </h2>
            <p className="mb-2 text-xl text-[var(--landing-nav-text)]">
              Just GBP 1/month per player, easily covered by a small court fee tweak.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:items-center">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={[
                  "py-0",
                  plan.featured ? "relative z-10 shadow-xl md:scale-105" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  borderColor: plan.featured ? "var(--landing-secondary)" : "var(--landing-card-border)",
                  background: "var(--landing-surface-strong)",
                  boxShadow: "var(--landing-card-shadow)",
                }}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="rounded-full bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="p-6 pb-8">
                  <CardTitle
                    className={[
                      "text-xl uppercase tracking-[0.08em]",
                      plan.featured ? "text-[var(--landing-primary)]" : "text-[var(--landing-nav-text)]",
                    ].join(" ")}
                  >
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4 flex items-baseline text-foreground">
                    <span className={["font-extrabold", plan.featured ? "text-5xl" : "text-4xl"].join(" ")}>
                      {plan.price}
                    </span>
                    {plan.suffix ? (
                      <span className="ml-1 text-xl font-medium text-[var(--landing-nav-text)]">
                        {plan.suffix}
                      </span>
                    ) : null}
                  </div>
                  <CardDescription className={["mt-4", plan.featured ? "text-base" : "text-sm"].join(" ")}>
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-4">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <Check
                          className={[
                            "h-5 w-5 shrink-0",
                            plan.featured ? "text-[var(--landing-primary)]" : "text-[var(--landing-secondary)]",
                          ].join(" ")}
                        />
                        <span className={plan.featured ? "font-medium text-foreground" : "text-[var(--landing-nav-text)]"}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6 pt-8">
                  <Button
                    asChild
                    variant={plan.featured ? "default" : "outline"}
                    className={[
                      "h-12 w-full rounded-lg text-base",
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
        className="py-24"
        style={{
          background: "var(--landing-section-alt)",
          borderBottom: "1px solid var(--landing-border)",
        }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-extrabold text-foreground">Ready to Elevate Your Club?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-[var(--landing-nav-text)]">
            Join 500+ clubs already using Sports Solutions Pro. Set up in minutes, no credit card
            required.
          </p>
          <Button asChild size="lg" className={`${buttonClass} h-16 rounded-full px-10 text-xl`}>
            <Link href="/register-page">
              Get Started Free <ArrowRight className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="relative z-10 border-y border-border bg-background">
        <PerformanceDatabase />
      </div>

      <footer
        id="contact"
        className="py-12"
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
                boards for your indoor sports club.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold" style={{ color: "var(--landing-footer-heading)" }}>
                Product
              </h3>
              <ul className="space-y-2">
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
                  <a href="#clubs" className="transition-colors hover:text-foreground">
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
                  <a href="#" className="transition-colors hover:text-foreground">
                    Terms of Service
                  </a>
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
      {isONboardingFlowVisible && <OnboardingFlow isVisible={isVisible} setIsVisible={setIsVisible} setIsONboardingFlowVisible={setIsONboardingFlowVisible} />}
    </main>
  );
}
