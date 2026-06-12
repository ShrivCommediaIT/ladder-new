"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import topLogo from "@/public/topLogo.png";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="py-12"
      style={{
        background: "var(--landing-footer-bg)",
        color: "var(--landing-footer-text)",
      }}
    >
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        {/* CORPORATE FOOTER CONTENT */}
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src={topLogo}
              alt="Sports Solutions Pro"
              className="mb-6 h-8 w-auto brightness-0 invert opacity-80"
              priority
            />
            <p className="max-w-sm leading-7">
              The smart way to run automated ladders, mini-leagues, leaderboards and challenge
              boards for your sports club.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold" style={{ color: "var(--landing-footer-heading)" }}>
              Product
            </h3>
            <ul className="space-y-2 text-sm">
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
            <ul className="space-y-2 text-sm">
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
  );
}
