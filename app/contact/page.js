"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaPinterest,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaTiktok,
  FaHome,
  FaShoppingCart,
  FaGlobe,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaReddit
} from "react-icons/fa";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import { BsThreads } from "react-icons/bs";
import { MdRefresh } from "react-icons/md";

import { Button } from "@/components/ui/button";
import topLogo from "@/public/topLogo.png";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Sun, Moon, Menu, X } from "lucide-react";
import { isValidEmail } from "@/lib/utils";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

export default function ContactPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Country Selector State
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("India");
  const countries = ["India", "United Kingdom", "United States", "Australia", "Canada"];

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  // Captcha State
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    setMounted(true);

    // Check login state
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

  // Generate Captcha Text
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghkmnpqrstuvwxyz23456789"; // Omit I, l, O, 0 for clarity
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput("");
  };

  // Trigger captcha generation once mounted
  useEffect(() => {
    if (mounted) {
      generateCaptcha();
    }
  }, [mounted]);

  // Render Captcha to Canvas
  useEffect(() => {
    if (captchaText && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear previous draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = theme === "dark" ? "#1e293b" : "#f1f5f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Random lines for noise
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          ctx.strokeStyle = theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }

        // Draw Captcha Text with rotation & offset distortion
        ctx.font = "italic bold 28px monospace";
        ctx.textBaseline = "middle";

        const colors = theme === "dark"
          ? ["#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#f472b6"]
          : ["#0284c7", "#1d4ed8", "#4f46e5", "#6d28d9", "#be185d"];

        const startX = 15;
        for (let i = 0; i < captchaText.length; i++) {
          const char = captchaText[i];
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

          ctx.save();
          const x = startX + i * 26 + (Math.random() * 6 - 3);
          const y = canvas.height / 2 + (Math.random() * 8 - 4);
          ctx.translate(x, y);

          // Random rotation
          const angle = (Math.random() * 20 - 10) * Math.PI / 180;
          ctx.rotate(angle);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        }
      }
    }
  }, [captchaText, theme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNo") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 11) return;
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name, email, contactNo, message } = formData;

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!contactNo.trim()) {
      toast.error("Please enter your contact number.");
      return;
    }
    if (contactNo.length < 10 || contactNo.length > 11) {
      toast.error("Contact number must be 10 or 11 digits.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter your message.");
      return;
    }
    if (captchaInput.trim().toLowerCase() !== captchaText.toLowerCase()) {
      toast.error("Captcha code does not match. Please try again.");
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        user_email: email,
        user_mobile: contactNo,
        message
      };

      const response = await postRequest(API_ENDPOINTS.HELPDESK, payload);

      if (response?.status === true || response?.status === 200 || response?.success) {
        toast.success(response?.message || "Thank you for contacting us! We will get back to you shortly.");
        setFormData({
          name: "",
          email: "",
          contactNo: "",
          message: ""
        });
        generateCaptcha();
      } else {
        toast.error(response?.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Helpdesk submission error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Nav Items definition for the landing page
  const navItems = [
    { label: "SSP International Competitions", href: "/#ssp-international-competitions" },
    { label: "SSP Talent Board", href: "/#talent-board" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Clubs/Coaches", href: "/#features" },
    { label: "News and Information", href: "/#news-and-information" },
    { label: "Contact", href: "/contact" },
  ];

  const navLinkClass =
    "text-[13px] xl:text-[15px] font-semibold transition-colors whitespace-nowrap";

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

            <div className="hidden items-center gap-3 xl:gap-5 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${navLinkClass} ${item.label === "Contact"
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]"
                aria-label="Toggle theme"
              >
                {mounted && (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
              </button>
              <Button asChild size="lg" className="border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl rounded-full px-8">
                <Link href="/login-user">Log In</Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] shadow-sm backdrop-blur transition-all duration-200 hover:scale-[1.03] hover:bg-[var(--landing-outline-button-hover)]"
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
                <Button asChild className="border-0 bg-gradient-to-r from-[var(--landing-primary)] to-[var(--landing-secondary)] text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl h-11 rounded-full">
                  <Link href="/login-user">Log In</Link>
                </Button>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* MID CONTENT AREA (Contact Details & Contact Form Card)     */}
      {/* ──────────────────────────────────────────────────────── */}
      <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        {/* Glow Effects in Background */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full blur-3xl opacity-30 bg-cyan-500/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full blur-3xl opacity-30 bg-blue-500/10 pointer-events-none" />

        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 sm:p-10 lg:p-12 shadow-xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
          >

            {/* LEFT COLUMN: Contact Information */}
            <div className="lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-6 lg:border-r border-[var(--landing-border)] pb-8 lg:pb-0">

              <div>
                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--landing-text)] mb-8 pb-3 border-b-2 border-cyan-500 inline-block">
                  Contact info
                </h2>

                <div className="space-y-8">
                  {/* UK info */}
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">UK</span>
                    </p>
                    <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-[var(--landing-text)]">
                      <p className="flex items-center gap-2.5">
                        <span className="font-semibold text-gray-400">Email:</span>
                        <a href="mailto:support@sportssolutionspro.com" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                          support@sportssolutionspro.com
                        </a>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="font-semibold text-gray-400">WhatsApp / Tel:</span>
                        <a href="https://wa.me/447432272573" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                          +44 07432 272573
                        </a>
                      </p>
                      <div className="flex gap-2.5 items-start mt-2">
                        <span className="font-semibold text-gray-400">Address:</span>
                        <p className="text-[var(--landing-muted)]">
                          Sports Solutions Pro<br />
                          A subsidiary of NE Games Ltd<br />
                          Richmond House,<br />
                          Lawnswood Business Park,<br />
                          Redvers Close,<br />
                          Leeds LS16 6QY<br />
                          United Kingdom
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* India info */}
                  <div className="space-y-2 pt-2">
                    <p className="text-lg font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">India</span>
                    </p>
                    <div className="space-y-1.5 text-sm sm:text-base leading-relaxed text-[var(--landing-text)]">
                      <p className="flex items-center gap-2.5">
                        <span className="font-semibold text-gray-400">Call:</span>
                        <a href="tel:+919811298550" className="hover:text-cyan-500 transition-colors font-medium">
                          +91-981 129-8550
                        </a>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="font-semibold text-gray-400">Email:</span>
                        <a href="mailto:info@commediait.com" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                          info@commediait.com
                        </a>
                      </p>
                      <div className="flex gap-2.5 items-start mt-2">
                        <span className="font-semibold text-gray-400">Address:</span>
                        <p className="text-[var(--landing-muted)]">
                          D-100, Sector-63, Noida- 201301,<br />
                          Uttar Pradesh,<br />
                          India.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Follow-Us links */}
              <div className="mt-12">
                <p className="text-sm uppercase font-bold tracking-[0.2em] text-gray-400 mb-4">
                  Follow Us
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="https://www.facebook.com/profile.php?id=61580051563946"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-[#1877F2] hover:bg-[#1877F2]/90 text-white transition-transform hover:scale-105 shadow"
                    aria-label="Facebook"
                  >
                    <FaFacebookF size={16} />
                  </a>
                  <a
                    href="https://x.com/Sports_Sol_Pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-black border border-gray-800 hover:border-gray-700 text-white transition-transform hover:scale-105 shadow"
                    aria-label="Twitter"
                  >
                    <FaXTwitter size={16} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/sports-solutions-pro/?viewAsMember=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white transition-transform hover:scale-105 shadow"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedinIn size={16} />
                  </a>
                  <a
                    href="https://www.instagram.com/sports_solutions_pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white transition-transform hover:scale-105 shadow"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={16} />
                  </a>
                  <a
                    href="https://www.youtube.com/@sportssolutionspro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-[#FF0000] hover:bg-[#FF0000]/90 text-white transition-transform hover:scale-105 shadow"
                    aria-label="YouTube"
                  >
                    <FaYoutube size={16} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@ssp48721"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-black border border-gray-800 hover:border-gray-700 text-white transition-transform hover:scale-105 shadow"
                    aria-label="TikTok"
                  >
                    <FaTiktok size={16} />
                  </a>
                  <a
                    href="https://www.threads.com/@sports_solutions_pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-black border border-gray-800 hover:border-gray-700 text-white transition-transform hover:scale-105 shadow"
                    aria-label="Threads"
                  >
                    <BsThreads size={16} />
                  </a>
                  <a
                    href="https://wa.me/441134180902"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-[#25D366] hover:bg-[#25D366]/90 text-white transition-transform hover:scale-105 shadow"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp size={16} />
                  </a>
                  <a
                    href="https://www.reddit.com/user/sportssolutionspro/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded bg-[#FF4500] hover:bg-[#FF4500]/90 text-white transition-transform hover:scale-105 shadow"
                    aria-label="Reddit"
                  >
                    <FaReddit size={16} />
                  </a>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Contact Form */}
            <div className="lg:col-span-7 flex flex-col justify-between">

              <form onSubmit={handleFormSubmit} className="space-y-6">

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--landing-text)]"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--landing-text)]"
                  />
                </div>

                {/* Contact No Input */}
                <div>
                  <label htmlFor="contactNo" className="sr-only">Contact No.</label>
                  <input
                    id="contactNo"
                    name="contactNo"
                    type="tel"
                    required
                    value={formData.contactNo}
                    onChange={handleInputChange}
                    placeholder="Contact No."
                    className="w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--landing-text)]"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Message"
                    className="w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none text-[var(--landing-text)]"
                  />
                </div>

                {/* Captcha Rendering and Reload Block */}
                <div className="flex items-center gap-3">
                  <div className="relative border border-[var(--input-border)] rounded overflow-hidden shadow-inner shrink-0">
                    <canvas
                      ref={canvasRef}
                      width={170}
                      height={48}
                      className="block h-12 w-[170px]"
                    />
                  </div>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="flex h-10 w-10 items-center justify-center rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer shadow"
                    title="Reload Captcha"
                  >
                    <MdRefresh className="h-6 w-6 animate-spin-hover" />
                  </button>
                </div>

                {/* Enter Captcha Input */}
                <div>
                  <label htmlFor="captchaInput" className="sr-only">Enter Captcha</label>
                  <input
                    id="captchaInput"
                    name="captchaInput"
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter Captcha"
                    className="w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--landing-text)]"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-5 bg-[#0082c8] hover:bg-[#006ca6] text-white font-bold tracking-wide rounded-full text-base transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>

              </form>
            </div>

          </motion.div>
        </div>

      </div>

      {/* Global Footer component */}
      <Footer />

    </div>
  );
}
