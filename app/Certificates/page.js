"use client";

import React from "react";
import LandingNavbar from "@/components/shared/LandingNavbar";
import Footer from "@/components/shared/Footer";

export default function Certificates() {
  return (
    <div className="flex flex-col h-screen bg-[var(--landing-bg)] text-[var(--landing-text)] overflow-hidden">
      <LandingNavbar />
      
      {/* Middle body */}
      <main className="flex-grow flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Animated Decorative Circle */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--landing-primary)]/10 border border-[var(--landing-primary)]/20 shadow-[0_0_30px_rgba(14,165,233,0.15)] animate-bounce">
            <svg
              className="h-12 w-12 text-[var(--landing-primary)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-[0.1em] text-[var(--landing-primary)] leading-none">
              Coming Soon
            </h1>
            <p className="text-sm sm:text-base text-[var(--landing-nav-text)] font-semibold tracking-wide uppercase">
              Official SSP Certificates
            </p>
          </div>

          <p className="text-sm sm:text-md text-[var(--landing-muted)] max-w-md mx-auto leading-relaxed">
            We are setting up the certificate database. Soon, you will be able to search your name and download verified achievements directly to your device.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
