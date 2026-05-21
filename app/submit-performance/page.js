"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, HelpCircle, Key, ArrowLeft, UploadCloud, FileSpreadsheet, X, CheckCircle, AlertTriangle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuthGuard from "@/hooks/useAuthGuard";
import UserDetails from "@/components/shared/UserDetails";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

const countries = [
  "India", "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "Italy", "Spain", "Netherlands", "China", 
  "Japan", "Singapore", "UAE", "Saudi Arabia", "Brazil", "South Africa", 
  "Mexico", "Russia", "Sri Lanka", "Nepal", "Bangladesh", "Pakistan", "Other"
];

const sportsList = [
  "Athletics (Track & Field)", "Swimming", "Cycling", "Gymnastics", 
  "Weightlifting", "Powerlifting", "Rowing", "Football (Soccer)", 
  "Basketball", "Tennis", "Cricket", "Rugby", "Other"
];

const unitsList = [
  "seconds (s)", "minutes (min)", "meters (m)", "kilometers (km)", 
  "kilograms (kg)", "points (pts)", "repetitions (reps)", "watts (W)", "Other"
];

export default function SubmitPerformancePage() {
  const allowed = useAuthGuard();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    sport: "",
    customSport: "",
    activity: "",
    result: "",
    unit: "",
    customUnit: "",
    full_name: "",
    age: "",
    date_of_performance: "",
    gender: "",
    country: "",
    club_name: "",
    coach_name: "",
    email: "",
    venue: "",
    wind: "",
    video_link: "",
    aditional_notes: "",
  });

  const [errors, setErrors] = useState({});
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Pre-fill coach/submitter details from logged-in admin if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAdmin = sessionStorage.getItem("userData");
      const storedSubAdmin = sessionStorage.getItem("subAdmin");
      const user = storedAdmin ? JSON.parse(storedAdmin) : (storedSubAdmin ? JSON.parse(storedSubAdmin) : null);
      
      if (user) {
        setFormData(prev => ({
          ...prev,
          coach_name: user.name || "",
          email: user.email || ""
        }));
      }
    }
  }, [allowed]);

  if (!allowed) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error as the user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setEvidenceFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setEvidenceFile(file);
      toast.success(`File "${file.name}" dropped successfully`);
    }
  };

  const clearFile = () => {
    setEvidenceFile(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Required standard fields
    if (!formData.sport) {
      newErrors.sport = "Sport is required";
    }
    if (formData.sport === "Other" && !formData.customSport.trim()) {
      newErrors.customSport = "Please enter custom sport name";
    }

    if (!formData.activity.trim()) {
      newErrors.activity = "Activity/Event/Test is required";
    }

    if (!formData.result.trim()) {
      newErrors.result = "Result is required";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }
    if (formData.unit === "Other" && !formData.customUnit.trim()) {
      newErrors.customUnit = "Please enter custom unit";
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Athlete name is required";
    }

    // 2. Age validation
    const ageInt = parseInt(formData.age, 10);
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (isNaN(ageInt) || ageInt < 1 || ageInt > 120) {
      newErrors.age = "Please enter a valid age between 1 and 120";
    }

    // 3. Date of performance check
    if (!formData.date_of_performance) {
      newErrors.date_of_performance = "Date of performance is required";
    } else {
      const perfDate = new Date(formData.date_of_performance);
      const today = new Date();
      if (perfDate > today) {
        newErrors.date_of_performance = "Date cannot be in the future";
      }
    }

    // 4. Dropdowns
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    // 5. Coach details
    if (!formData.coach_name.trim()) {
      newErrors.coach_name = "Coach/Submitter name is required";
    }

    // 6. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // 7. Video URL validation
    if (formData.video_link.trim()) {
      try {
        new URL(formData.video_link.trim());
      } catch (_) {
        newErrors.video_link = "Please enter a valid URL (including http:// or https://)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields and fix validation errors");
      
      // Scroll to the first element with an error
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
        }
      }, 100);
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("sport", formData.sport === "Other" ? formData.customSport : formData.sport);
      payload.append("activity", formData.activity);
      payload.append("result", formData.result);
      payload.append("unit", formData.unit === "Other" ? formData.customUnit : formData.unit);
      payload.append("full_name", formData.full_name);
      payload.append("age", formData.age);
      payload.append("date_of_performance", formData.date_of_performance);
      payload.append("gender", formData.gender);
      payload.append("country", formData.country);
      payload.append("club_name", formData.club_name || "");
      payload.append("coach_name", formData.coach_name);
      payload.append("email", formData.email);
      payload.append("venue", formData.venue || "");
      payload.append("wind", formData.wind || "");
      payload.append("video_link", formData.video_link || "");
      payload.append("aditional_notes", formData.aditional_notes || "");
      
      if (evidenceFile) {
        payload.append("upload_avidence", evidenceFile);
      }

      const response = await postFormData(API_ENDPOINTS.SAVE_PERFORMANCE_RESULT, payload);

      if (response && (response.status === 200 || response.status === true || response.success)) {
        toast.success("Performance result submitted successfully!");
        
        // Reset form keeping submitter details
        setFormData(prev => ({
          sport: "",
          customSport: "",
          activity: "",
          result: "",
          unit: "",
          customUnit: "",
          full_name: "",
          age: "",
          date_of_performance: "",
          gender: "",
          country: "",
          club_name: "",
          coach_name: prev.coach_name,
          email: prev.email,
          venue: "",
          wind: "",
          video_link: "",
          aditional_notes: "",
        }));
        setEvidenceFile(null);
        setErrors({});
      } else {
        toast.error(response?.message || response?.error_message || "Failed to submit performance result.");
      }
    } catch (error) {
      console.error("Talent Board submit error:", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#05070f] via-[#0c1224] to-black text-white py-6">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" hideProgressBar />

      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8 flex justify-between items-center border-b border-white/5 pb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div>
          <UserDetails />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* HEADER INFORMATION CARD */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-transparent bg-clip-text mb-2">
              Submit a Performance Result
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
              Share exceptional athletic performances and help identify the world's best.
              All submissions are reviewed by SSP before being published.
            </p>
          </div>

          {/* QUALITY ASSURED CARD */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 max-w-sm backdrop-blur-md">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-cyan-300 text-sm">Quality Assured</h4>
              <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                Every submission is manually reviewed to ensure accuracy, consistency, and athletic credibility.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Athlete & Performance Details
              </h3>
            </div>

            {/* 4-COLUMN RESPONSIVE FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* SPORT */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Sport <span className="text-red-400">*</span>
                </label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={(e) => handleSelectChange("sport", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.sport ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-[#0c1224] text-zinc-400">Select Sport</option>
                  {sportsList.map(sport => (
                    <option key={sport} value={sport} className="bg-[#0c1224] text-white">
                      {sport}
                    </option>
                  ))}
                </select>
                {errors.sport && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.sport}
                  </p>
                )}
              </div>

              {/* CUSTOM SPORT IF OTHER */}
              {formData.sport === "Other" && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                    Custom Sport Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="customSport"
                    value={formData.customSport}
                    onChange={handleInputChange}
                    placeholder="Enter custom sport"
                    className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                      errors.customSport ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                    } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                  />
                  {errors.customSport && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {errors.customSport}
                    </p>
                  )}
                </div>
              )}

              {/* ACTIVITY / EVENT / TEST */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Activity / Event / Test <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  placeholder="Select or enter activity"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.activity ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.activity && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.activity}
                  </p>
                )}
              </div>

              {/* RESULT */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Result <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  placeholder="Enter result (e.g. 40)"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.result ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.result && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.result}
                  </p>
                )}
              </div>

              {/* UNIT */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Unit <span className="text-red-400">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => handleSelectChange("unit", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.unit ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-[#0c1224] text-zinc-400">Select unit</option>
                  {unitsList.map(unit => (
                    <option key={unit} value={unit} className="bg-[#0c1224] text-white">
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.unit}
                  </p>
                )}
              </div>

              {/* CUSTOM UNIT IF OTHER */}
              {formData.unit === "Other" && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                    Custom Unit <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="customUnit"
                    value={formData.customUnit}
                    onChange={handleInputChange}
                    placeholder="Enter custom unit"
                    className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                      errors.customUnit ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                    } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                  />
                  {errors.customUnit && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {errors.customUnit}
                    </p>
                  )}
                </div>
              )}

              {/* ATHLETE FULL NAME */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Athlete Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter athlete full name"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.full_name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.full_name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* AGE */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Age <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.age ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.age && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* DATE OF PERFORMANCE */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center gap-1">
                  Date of Performance <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_performance"
                  value={formData.date_of_performance}
                  onChange={handleInputChange}
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.date_of_performance ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm scheme-dark`}
                />
                {errors.date_of_performance && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.date_of_performance}
                  </p>
                )}
              </div>

              {/* GENDER */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleSelectChange("gender", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.gender ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-[#0c1224] text-zinc-400">Select gender</option>
                  <option value="male" className="bg-[#0c1224] text-white">Male</option>
                  <option value="female" className="bg-[#0c1224] text-white">Female</option>
                  <option value="other" className="bg-[#0c1224] text-white">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* COUNTRY */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Country <span className="text-red-400">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={(e) => handleSelectChange("country", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.country ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-[#0c1224] text-zinc-400">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-[#0c1224] text-white">
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* CLUB / TEAM */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Club / Team
                </label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleInputChange}
                  placeholder="Enter club or team"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* COACH / SUBMITTER NAME */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Coach / Submitter Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="coach_name"
                  value={formData.coach_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.coach_name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.coach_name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.coach_name}
                  </p>
                )}
              </div>

              {/* EMAIL ADDRESS */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* VENUE / LOCATION */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Venue / Location
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter venue or location"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* WIND / CONDITIONS */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Wind / Conditions (if applicable)
                </label>
                <input
                  type="text"
                  name="wind"
                  value={formData.wind}
                  onChange={handleInputChange}
                  placeholder="e.g. +1.2m/s, Indoor, etc."
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* VIDEO LINK */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Video Link (YouTube / Vimeo / Drive)
                </label>
                <input
                  type="url"
                  name="video_link"
                  value={formData.video_link}
                  onChange={handleInputChange}
                  placeholder="Enter video link URL"
                  className={`w-full h-12 px-4 rounded-xl bg-white/5 border ${
                    errors.video_link ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20"
                  } text-white placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.video_link && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.video_link}
                  </p>
                )}
              </div>

              {/* ADDITIONAL NOTES */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Additional Notes
                </label>
                <textarea
                  name="aditional_notes"
                  value={formData.aditional_notes}
                  onChange={handleInputChange}
                  placeholder="Any extra notes or details about the performance"
                  rows={4}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all text-sm custom-scroll resize-y"
                />
              </div>

              {/* UPLOAD EVIDENCE FILE ZONE */}
              <div className="lg:col-span-4 space-y-3">
                <label className="text-xs sm:text-sm font-semibold text-zinc-300">
                  Upload Evidence (Video, Photo, PDF, CSV)
                </label>
                
                <div 
                  className={`relative w-full rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center cursor-pointer ${
                    dragActive 
                      ? "border-cyan-400 bg-cyan-400/5" 
                      : evidenceFile 
                        ? "border-emerald-500/50 bg-emerald-500/5" 
                        : "border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-upload-input").click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf,.csv,.xls,.xlsx"
                  />

                  {!evidenceFile ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-zinc-400">
                        <UploadCloud className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">
                          Drag & Drop or Click to Upload
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          CSV, PDF, Images or Videos up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-emerald-400">
                            {evidenceFile.name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 bg-gradient-to-r from-cyan-400 via-teal-500 to-fuchsia-500 text-white font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Performance...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Performance
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
