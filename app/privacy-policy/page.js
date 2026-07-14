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
import { NAV_ITEMS } from "@/constants/navigation";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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

  const navItems = NAV_ITEMS;

  const buttonClass =
    "border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl";

  const navLinkClass =
    "text-[15px] font-medium transition-colors text-[var(--landing-nav-text)] hover:text-[var(--landing-nav-hover)]";

  const themeToggleClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]";

  const privacySections = [
    {
      num: "1",
      title: "Introduction",
      content: [
        "NE Games firmly believes in the privacy of all our customers. At all times of our dealings and beyond that we respect and protect the privacy of our users, whatsoever.",
        "All the websites belonging to NE Games will be governed by these privacy policies. The privacy policies mentioned below would let you understand clearly the way we will be using your information and the steps you can consider to protect your privacy."
      ]
    },
    {
      num: "2",
      title: "Coverage of Privacy Policies",
      content: [
        "The privacy policies mentioned below cover:",
        "• The information collected by the company and the reason for which it is collected.",
        "• Usage guidelines for the information collected.",
        "• Options for protecting your privacy and steps for accessing and updating the information.",
        "All the privacy policies have been explained in a simple manner with reference to certain terms that are used commonly in the domain we provide our services. We are always concerned about the privacy of our users so even if you are an existing or new user, kindly go through our privacy policies for better understanding of the way we work."
      ]
    },
    {
      num: "3",
      title: "Information Collected by the Company",
      content: [
        "In general, our website can be visited by any user without providing any personal information or data. In addition to that, there are certain occasions where we might request your personal details in terms of name, email-id, address, company name, contact number, etc. The company keeps all the information provided during the course of interaction strictly confidential.",
        "When a user visits the website, our web server tracks and logs the IP address or domain name of the host. This is done solely for monitoring and analyzing the trends and statistics related to our website and not for any other purpose. In addition to that, when visiting our website, some cookies may be placed in your system for identification purposes."
      ]
    },
    {
      num: "4",
      title: "Usage Guidelines for Information Collected",
      content: [
        "The information collected by our website is used for monitoring, analyzing trends, maintaining and improving statistics related to our website. It allows us to improve and provide better services to our valued users. While contacting us, we might record all the interaction in order to resolve issues related to our services or website. The contact information provided by the user might be used for informing about new services or updates to our website. The information collected through cookies is used to improve the quality and user experience.",
        "In case of merger or/and business reorganization, we may be required to share information as desired according to the situation.",
        "In any condition while using your information for a purpose other than those mentioned in the Privacy Policy, your consent will be asked prior to using the information."
      ]
    },
    {
      num: "5",
      title: "Options for Protecting Your Privacy",
      content: [
        "Every user has different privacy concerns and this is the reason we want to be clear about the information collected by us. It will be helpful in making up your decision about whether to choose our services or not.",
        "A user at any time can opt for enabling or disabling the cookies, which will be prompted on their browser while they visit us. However, the point to be noted in this regard is that at times services may not work in the right manner if the cookies are disabled."
      ]
    },
    {
      num: "6",
      title: "Shared Information",
      content: [
        "Although we never share any information provided by the user in any case, except certain special conditions as mentioned above, if any information is shared publicly on our website, it might be indexed by the search engines."
      ]
    },
    {
      num: "7",
      title: "How to Access and Update Your Personal Information",
      content: [
        "If regarding any issue you want to contact us, we require you to provide us with your personal information, however, if at any time you think that the information provided is not correct then you can either fill the contact form again or inform us on the given email address. At times, we may even ask you to prove your identity before acting on your request.",
        "We strive towards protecting your information from any kind of malicious attacks and this is why we may not delete your information immediately from our servers."
      ]
    },
    {
      num: "8",
      title: "Securing Your Information",
      content: [
        "We constantly work towards protecting our company and associated users' information from malicious attacks or data thefts. We perform regular checks to ensure that all the information collected by us is properly stored, processed and enforced with all the security measures to avoid unauthorized access to any kind of sensitive data."
      ]
    },
    {
      num: "9",
      title: "Where Do These Privacy Policies Apply",
      content: [
        "These Privacy Policy apply to all our services included on our website and does not apply to any other services other than those mentioned on the website. The Privacy Policy mentioned on this page does not hold any responsibility for an outside company advertising or promoting our services in any way."
      ]
    },
    {
      num: "10",
      title: "How Do We Enforce",
      content: [
        "We regularly perform checks on our privacy policies. In case of any complaints made by a user, we get in contact with the user to follow up. On our end we will try to resolve the matter in as short a time as possible with clarity on each aspect."
      ]
    },
    {
      num: "11",
      title: "Modifications in Privacy Policy",
      content: [
        "All the Privacy Policy mentioned on this page might change depending on time and situation without any prior notice. All types of changes in this regard will be posted on this page only. No rights of an existing user will be reduced without their consent."
      ]
    },
    {
      num: "12",
      title: "Data Collection",
      content: [
        "After login to the application, the data of the registered users will be saved offline. This makes the application easier and faster for the user to access.",
        "STORAGE: The login details (user id and password) are saved automatically when the user first registers. After that, registered users access the app directly without entering login credentials until they log out of their account.",
        "INFORMATION REQUIRED FROM USERS IN ORDER FOR THEM TO BENEFIT FROM THE FULL RANKING SYSTEM OF THE APP: In the app, users earn points when making words successfully. These points are collated in real time to rank all users firstly by age (under 11, under 15, under 18 and over 18) and then by locality (regional, national and internationally). For this, we require their age and their country/state or province, and their country. This information is stored securely and privately on our secure servers and will not be used for any other purpose.",
        "PURCHASES: To access all the features of the game, users are asked to buy the game for either $15 for 6 months or $18 for a year. Users may also buy hints to help them form words. For such purchases, we offer users standard online secure payment options such as PayPal or standard secure credit/debit card options. As a company, we do not keep any personal payment details."
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
            <Lock className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-foreground mb-4 animate-text-glow"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-[var(--landing-muted)] max-w-2xl mx-auto"
          >
            NE Games privacy guidelines. Read how we protect and manage your personal data.
          </motion.p>
        </div>

        {/* Privacy Policy list */}
        <div className="space-y-6">
          {privacySections.map((sec, idx) => (
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
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Privacy Assured
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
