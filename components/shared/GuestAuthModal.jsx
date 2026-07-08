"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  UserRound,
  Lock,
  Globe,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { guestRegister, guestLogin } from "@/services/authService";

const countries = [
  "United Kingdom", "United States", "Canada", "Australia", "India",
  "Germany", "France", "Italy", "Spain", "Netherlands", "China",
  "Japan", "Singapore", "UAE", "Saudi Arabia", "Brazil", "South Africa",
  "Mexico", "Russia", "Sri Lanka", "Nepal", "Bangladesh", "Pakistan", "Other"
];

export default function GuestAuthModal({ open, onOpenChange, onSuccess }) {
  const router = useRouter();
  const [mode, setMode] = useState("register");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    age: "",
    gender: "",
    country: "",
    dob: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id.trim()) {
      newErrors.user_id = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "6 Pin of your choice is required";
    } else if (!/^\d{6}$/.test(formData.password)) {
      newErrors.password = "Pin must be exactly 6 digits";
    }

    if (mode === "register") {
      if (!formData.age) {
        newErrors.age = "Age is required";
      } else {
        const parsedAge = parseInt(formData.age, 10);
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
          newErrors.age = "Please enter a valid age between 1 and 120";
        }
      }

      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }

      if (!formData.country) {
        newErrors.country = "Country is required";
      }

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseError = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (typeof err === "object") {
      const values = Object.values(err).flat();
      return values.length > 0 ? values.join(" ") : JSON.stringify(err);
    }
    return String(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === "register") {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - parseInt(formData.age, 10);
        const calculatedDob = `${birthYear}-01-01`;

        const payload = {
          user_id: formData.user_id.trim(),
          password: formData.password,
          age: formData.age,
          gender: formData.gender,
          country: formData.country,
          dob: calculatedDob,
          user_type: "guest",
        };

        const res = await guestRegister(payload);
        if (res && (res.status === 200 || res.status === true || res.success)) {
          toast.success("Registration successful!");
          
          // Auto log in guest
          sessionStorage.clear();
          const guestUserData = {
            id: res.data?.id || res.id || payload.user_id,
            user_id: payload.user_id,
            name: payload.user_id,
            age: payload.age,
            gender: payload.gender,
            country: payload.country,
            dob: calculatedDob,
            admin_id: res.data?.admin_id || res.admin_id || "",
            user_type: "guest",
            isLoggedIn: true,
          };
          sessionStorage.setItem("userData", JSON.stringify(guestUserData));
          sessionStorage.setItem("adminDetails", JSON.stringify(guestUserData));
          
          onOpenChange(false);
          if (onSuccess) onSuccess();
          
          setTimeout(() => {
            router.push("/submit-performance");
          }, 400);
        } else {
          toast.error(parseError(res?.error_message) || res?.message || "Registration failed.");
        }
      } else {
        // Login Mode
        const payload = {
          user_id: formData.user_id.trim(),
          password: formData.password,
          user_type: "guest",
        };

        const res = await guestLogin(payload);
        if (res && (res.status === 200 || res.status === true || res.success)) {
          toast.success("Login successful!");
          
          sessionStorage.clear();
          const guestUserData = {
            id: res.data?.id || res.id || payload.user_id,
            user_id: payload.user_id,
            name: res.data?.name || payload.user_id,
            age: res.data?.age || "",
            gender: res.data?.gender || "",
            country: res.data?.country || "",
            dob: res.data?.dob || "",
            admin_id: res.data?.admin_id || res.admin_id || "",
            user_type: "guest",
            isLoggedIn: true,
          };
          sessionStorage.setItem("userData", JSON.stringify(guestUserData));
          sessionStorage.setItem("adminDetails", JSON.stringify(guestUserData));
          
          onOpenChange(false);
          if (onSuccess) onSuccess();
          
          setTimeout(() => {
            router.push("/submit-performance");
          }, 400);
        } else {
          toast.error(parseError(res?.error_message) || res?.message || "Invalid Username or Pin.");
        }
      }
    } catch (err) {
      console.error("Guest Auth error:", err);
      toast.error(
        parseError(err.response?.data?.error_message) ||
        err.response?.data?.message ||
        err.message ||
        "Authentication error."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "register" ? "login" : "register");
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] sm:max-w-md rounded-[28px] border p-0 overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 bg-background text-foreground"
        style={{
          background: "var(--auth-card-bg)",
          borderColor: "var(--auth-card-border)",
          boxShadow: "var(--auth-card-shadow)",
        }}
      >
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-3 relative">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent-theme)] shadow-lg"
            >
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent-theme)]">
                SSP Talent Board
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] font-semibold mt-1">
                {mode === "register"
                  ? "Register as guest to submit a performance"
                  : "Log in to submit a performance"}
              </p>
            </div>
          </div>

          {/* Tab switch buttons */}
          <div
            className="flex rounded-2xl border p-1"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--muted)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrors({});
              }}
              className="flex-1 rounded-xl py-2 text-xs sm:text-sm font-bold transition-all duration-300"
              style={
                mode === "register"
                  ? {
                      background: "var(--background-image-gradient-brand)",
                      color: "#ffffff",
                      boxShadow: "var(--brand-tab-shadow)",
                    }
                  : {
                      color: "var(--muted-foreground)",
                    }
              }
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrors({});
              }}
              className="flex-1 rounded-xl py-2 text-xs sm:text-sm font-bold transition-all duration-300"
              style={
                mode === "login"
                  ? {
                      background: "var(--background-image-gradient-brand)",
                      color: "#ffffff",
                      boxShadow: "var(--brand-tab-shadow)",
                    }
                  : {
                      color: "var(--muted-foreground)",
                    }
              }
            >
              Already have account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* USER ID (Username) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                Choose Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]/60" />
                <input
                  type="text"
                  name="user_id"
                  placeholder="Enter username"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full h-11 pl-11 pr-4 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: errors.user_id ? "red" : "var(--input-border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              {errors.user_id && (
                <span className="text-red-500 text-xs block font-semibold animate-pulse">{errors.user_id}</span>
              )}
            </div>

            {/* PASSWORD (6 Pin of choice) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                6 Pin  <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]/60" />
                <input
                  type={showPin ? "text" : "password"}
                  name="password"
                  maxLength={6}
                  placeholder="Enter 6-digit pin"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-11 pl-11 pr-12 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: errors.password ? "red" : "var(--input-border)",
                    color: "var(--foreground)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/60 hover:text-[var(--foreground)] transition-colors"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs block font-semibold animate-pulse">{errors.password}</span>
              )}
            </div>

            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* AGE */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      min={1}
                      max={120}
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: errors.age ? "red" : "var(--input-border)",
                        color: "var(--foreground)",
                      }}
                    />
                    {errors.age && (
                      <span className="text-red-500 text-xs block font-semibold animate-pulse">{errors.age}</span>
                    )}
                  </div>

                  {/* GENDER */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: errors.gender ? "red" : "var(--input-border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="" className="text-gray-400">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <span className="text-red-500 text-xs block font-semibold animate-pulse">{errors.gender}</span>
                    )}
                  </div>
                </div>

                {/* COUNTRY */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]/60" />
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: errors.country ? "red" : "var(--input-border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="" className="text-gray-400">Select Country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.country && (
                    <span className="text-red-500 text-xs block font-semibold animate-pulse">{errors.country}</span>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-white font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-6"
              style={{
                background: "var(--background-image-gradient-brand)",
                boxShadow: "var(--brand-button-shadow)",
              }}
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  {mode === "register" ? "Register & Submit" : "Log In & Submit"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer info links */}
          <div className="flex justify-center gap-4 text-[10px] sm:text-xs text-[var(--muted-foreground)]/80 pt-4 border-t border-[var(--border)] font-medium">
            <button type="button" onClick={toggleMode} className="hover:underline transition-all">
              {mode === "register"
                ? "Already have an account? Log In"
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
