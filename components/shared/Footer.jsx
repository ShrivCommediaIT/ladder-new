"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaChevronRight,
} from "react-icons/fa";

import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { BsThreads } from "react-icons/bs";

/* Simple inline ISO 9001:2015 laurel badge — no external asset required */
function IsoBadge({ className = "h-20 w-20" }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left laurel branch */}
      <g fill="#facc15">
        <path d="M30 95 C18 88 12 72 16 58 C18 64 24 70 30 72 C26 78 26 86 30 95Z" />
        <path d="M24 80 C12 75 6 60 10 46 C13 52 19 57 25 59 C21 65 20 73 24 80Z" />
        <path d="M22 64 C11 60 6 46 10 33 C13 39 19 43 24 45 C20 50 19 58 22 64Z" />
        <path d="M24 48 C14 45 10 32 14 20 C17 26 22 30 27 31 C23 36 22 43 24 48Z" />
      </g>
      {/* Right laurel branch */}
      <g fill="#facc15">
        <path d="M90 95 C102 88 108 72 104 58 C102 64 96 70 90 72 C94 78 94 86 90 95Z" />
        <path d="M96 80 C108 75 114 60 110 46 C107 52 101 57 95 59 C99 65 100 73 96 80Z" />
        <path d="M98 64 C109 60 114 46 110 33 C107 39 101 43 96 45 C100 50 101 58 98 64Z" />
        <path d="M96 48 C106 45 110 32 106 20 C103 26 98 30 93 31 C97 36 98 43 96 48Z" />
      </g>
      {/* Center circle */}
      <circle cx="60" cy="48" r="34" fill="#0c1f3f" stroke="#facc15" strokeWidth="3" />
      <text
        x="60"
        y="38"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="13"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        ISO
      </text>
      <text
        x="60"
        y="52"
        textAnchor="middle"
        fill="#38bdf8"
        fontSize="10"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        9001:2015
      </text>
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill="#facc15"
        fontSize="7"
        fontWeight="600"
        letterSpacing="1"
        fontFamily="Arial, sans-serif"
      >
        CERTIFIED
      </text>
    </svg>
  );
}

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
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

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-top bg-no-repeat text-white"
      style={{
        backgroundImage: "url('/footer.png')",
        backgroundSize: "cover",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 mx-auto max-w-8xl px-4 py-10 sm:px-6 sm:py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo Section */}
          <div>
            <div className="flex gap-5">
              <Image
                src="/topLogo.png"
                alt="Sports Solutions Pro"
                width={60}
                height={60}
                className="mb-6 h-auto w-12 sm:w-[60px]"
              />
              <div>
                <p className="text-2xl font-bold text-primary">SPORTS</p>
                <p className="text-l font-bold text-white">SOLUTIONS PRO</p>
              </div>
            </div>

            <p className="text-sm leading-7 text-gray-300">
              The smart way to run automated ladders, mini-leagues,
              leaderboards, challenge boards, international competitions
              and talent identification systems for sports clubs,
              coaches, schools and organisations worldwide.
            </p>

            <div className="mt-6 text-sm font-semibold tracking-wide text-sky-400">
              COMPETE • IMPROVE • ACHIEVE
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 inline-block border-b-2 border-sky-500 pb-2 text-lg font-bold">
              CONTACT
            </h3>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex gap-3">
                <FaMapMarkerAlt className="mt-1 h-4 w-4 flex-shrink-0 text-sky-400" />
                <p>
                  Sports Solutions Pro
                  <br />
                  A subsidiary of NE Games Ltd
                  <br />
                  Richmond House,
                  <br />
                  Lawnswood Business Park,
                  <br />
                  Redvers Close,
                  <br />
                  Leeds LS16 6QY
                  <br />
                  United Kingdom
                </p>
              </div>

              <div className="flex gap-3">
                <FaEnvelope className="mt-1 h-4 w-4 flex-shrink-0 text-sky-400" />
                <p className="break-all sm:break-normal">
                  Email:
                  <br />
                  <a
                    href="mailto:support@sportssolutionspro.com"
                    className="text-sky-400 hover:text-sky-300"
                  >
                    support@sportssolutionspro.com
                  </a>
                </p>
              </div>

              <div className="flex gap-3">
                <FaPhoneAlt className="mt-1 h-4 w-4 flex-shrink-0 text-sky-400" />
                <p>
                  Tel:
                  <br />
                  <a
                    href="https://wa.me/441134180902"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300"
                  >
                    0113 418 0902
                  </a>
                  <br />
                  <span className="text-xs text-gray-400">
                    (WhatsApp Business 24/7)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 inline-block border-b-2 border-sky-500 pb-2 text-lg font-bold">
              QUICK LINKS
            </h3>

            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <FaChevronRight className="h-3 w-3 text-sky-400" />
                <Link
                  href="/#features"
                  className="hover:text-sky-400"
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                >
                  Features
                </Link>
              </li>

              <li className="flex items-center gap-2">
                <FaChevronRight className="h-3 w-3 text-sky-400" />
                <Link
                  href="/#pricing"
                  className="hover:text-sky-400"
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                >
                  Pricing
                </Link>
              </li>

              <li className="flex items-center gap-2">
                <FaChevronRight className="h-3 w-3 text-sky-400" />
                <Link
                  href="/#competitions"
                  className="hover:text-sky-400"
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                >
                  International Competitions
                </Link>
              </li>

              <li className="flex items-center gap-2">
                <FaChevronRight className="h-3 w-3 text-sky-400" />
                <Link
                  href="/#talent-board"
                  className="hover:text-sky-400"
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                >
                  SSP Talent Board
                </Link>
              </li>

              <li className="flex items-center gap-2">
                <FaChevronRight className="h-3 w-3 text-sky-400" />
                <Link
                  href="/#clubs"
                  className="hover:text-sky-400"
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                >
                  Clubs & Coaches
                </Link>
              </li>

              <li className="flex items-center gap-2">
                <FaChevronRight className="h-3 w-3 text-sky-400" />
                <Link
                  href="/contact"
                  className="hover:text-sky-400"
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-5 inline-block border-b-2 border-sky-500 pb-2 text-lg font-bold">
              FOLLOW SSP
            </h3>

            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61580051563946"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white sm:h-12 sm:w-12">
                  <FaFacebookF size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  Facebook
                </span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/sports_solutions_pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white sm:h-12 sm:w-12">
                  <FaInstagram size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  Instagram
                </span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@ssp48721"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white sm:h-12 sm:w-12">
                  <FaTiktok size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  TikTok
                </span>
              </a>

              {/* X */}
              <a
                href="https://x.com/Sports_Sol_Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white sm:h-12 sm:w-12">
                  <FaXTwitter size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  X
                </span>
              </a>

              {/* Threads */}
              <a
                href="https://www.threads.com/@sports_solutions_pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white sm:h-12 sm:w-12">
                  <BsThreads size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  Threads
                </span>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@sportssolutionspro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF0000] text-white sm:h-12 sm:w-12">
                  <FaYoutube size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  YouTube
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/sports-solutions-pro/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A66C2] text-white sm:h-12 sm:w-12">
                  <FaLinkedinIn size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  LinkedIn
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/441134180902"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white sm:h-12 sm:w-12">
                  <FaWhatsapp size={18} />
                </div>
                <span className="mt-1 text-[10px] leading-none text-gray-300 sm:text-[11px]">
                  WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Side */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-0">
              {/* ISO Logo */}
              <div className="flex-shrink-0 border-b border-white/20 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                <Image
                  src="/iso-certified.png"
                  alt="ISO 9001:2015 Certified"
                  width={150}
                  height={150}
                  className="h-auto w-24 sm:w-28 lg:w-32"
                />
              </div>

              {/* Company Details */}
              <div className="sm:ml-6">
                <p className="text-sm font-semibold text-sky-400">
                  Sports Solutions Pro – a subsidiary of NE Games Ltd
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  NE Games Ltd Registered in England & Wales.
                </p>

                <p className="mt-3 text-sm text-gray-300">
                  ISO 9001:2015 Certified.
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="w-full text-left lg:w-auto lg:text-right">
              <p className="text-sm text-gray-300">
                © 2026 Sports Solutions Pro. All rights reserved.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 lg:justify-end">
                <Link
                  href="/privacy-policy"
                  className="text-sm text-sky-400 hover:text-sky-300"
                >
                  Privacy Policy
                </Link>

                <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />

                <Link
                  href="/terms-and-conditions"
                  className="text-sm text-sky-400 hover:text-sky-300"
                >
                  Terms & Conditions
                </Link>

                <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />

                <Link
                  href="/refund-policy"
                  className="text-sm text-sky-400 hover:text-sky-300"
                >
                  Cancellation & Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Credit */}
        <div className="mt-6 flex flex-col items-center gap-1 border-t border-white/10 pt-4 text-center sm:flex-row sm:justify-center sm:gap-2 lg:justify-end">
          <p className="text-xs text-gray-400 sm:text-sm">
            Designed &amp; Developed by
          </p>

          <Link
            href="https://commediait.com/"
            target="_blank"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 sm:text-sm"
          >
            Shriv ComMedia Solutions Pvt. Ltd.
          </Link>
        </div>
      </div>
    </footer>
  );
}