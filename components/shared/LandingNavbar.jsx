"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/Navbar";
import topLogo from "@/public/topLogo.png";
import { NAV_ITEMS } from "@/constants/navigation";

export default function LandingNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const loggedIn = !!(
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("userData") ||
        sessionStorage.getItem("subAdmin") ||
        sessionStorage.getItem("adminDetails")
      );
      setIsLoggedIn(loggedIn);
    }
  }, []);

  const buttonClass =
    "border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl";

  const navLinkClass =
    "text-[13px] xl:text-[15px] font-semibold transition-colors whitespace-nowrap";

  const themeToggleClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]";

  if (isLoggedIn) {
    return <Navbar activeTab="" />;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-surface)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src={topLogo}
            alt="Sports Solutions Pro"
            width={60}
            height={60}
            className="lg:h-[60px] lg:w-[60px] h-[40px] w-[40px] object-contain"
            priority
          />
        </Link>

        <div className="hidden items-center gap-3 xl:gap-5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${navLinkClass} ${
                item.label === "Contact"
                  ? "text-[var(--landing-primary)] font-bold"
                  : "text-[var(--landing-nav-text)] hover:text-[var(--landing-nav-hover)]"
              }`}
            >
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
            {NAV_ITEMS.map((item) => (
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
  );
}
