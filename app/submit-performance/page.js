"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, HelpCircle, Key, ArrowLeft, UploadCloud, FileSpreadsheet, X, CheckCircle, AlertTriangle, RefreshCw, Copy } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuthGuard from "@/hooks/useAuthGuard";
import Navbar from "@/components/shared/Navbar";
import { postFormData, getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PerformanceDatabase from "@/components/shared/PerformanceDatabase";

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

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    if (year.length === 4) {
      day = day.padStart(2, "0");
      month = month.padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // ignore
  }
  return dateStr;
};

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
  const [accessCodeModalOpen, setAccessCodeModalOpen] = useState(false);
  const [submittedAccessCode, setSubmittedAccessCode] = useState("");

  // PayPal Payment Flow states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);

  // Lookup and Update mode states
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [matchedRecords, setMatchedRecords] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [admin, setAdmin] = useState(null);
  const [subAdmin, setSubAdmin] = useState(null);
  const [dbData, setDbData] = useState([]);
  


useEffect(() => {
  const fetchData = async () => {
    if (typeof window !== "undefined") {
      const adminDetailsStr = sessionStorage.getItem("adminDetails");
      const subDetailsStr = sessionStorage.getItem("subAdmin");

      const adminDetails = adminDetailsStr
        ? JSON.parse(adminDetailsStr)
        : null;

      const subDetails = subDetailsStr
        ? JSON.parse(subDetailsStr)
        : null;

      setAdmin(adminDetails);
      setSubAdmin(subDetails);

      const requestParams = {};

      if (adminDetails) {
        requestParams.admin_id = adminDetails.id;
      }

      const response = await getRequest(
        API_ENDPOINTS.GET_PERFORMANCE_RESULT_LIST,
        requestParams
      );

      if (response?.status === 200 && response?.data) {
        const pageData = response.data.data || [];
        setDbData(pageData);
      }
    }
  };

  fetchData();
}, []);

  // Load and render PayPal SDK subscription buttons dynamically when modal is open
  useEffect(() => {
    if (!showPaymentModal) return;

    setPaypalLoading(true);

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const hostedButtonId = process.env.NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID;

    const scriptId = "paypal-subscription-sdk";
    const scriptSrc = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&disable-funding=venmo&currency=GBP`;

    let retries = 0;
    const initializeButtons = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        const container = document.getElementById(`paypal-container-${hostedButtonId}`);
        if (container) {
          container.innerHTML = "";
          try {
            window.paypal.HostedButtons({
              hostedButtonId: hostedButtonId,
              onPaymentCompleted: async function (data, actions) {
                toast.success("Payment successful! Submitting performance result...");
                setShowPaymentModal(false);
                await submitFormData(data.orderID || data.paymentID || "PAYPAL_HOSTED_BUTTON_" + Date.now());
              },
              onApprove: async function (data, actions) {
                toast.success("Payment successful! Submitting performance result...");
                setShowPaymentModal(false);
                await submitFormData(data.orderID || data.paymentID || "PAYPAL_HOSTED_BUTTON_" + Date.now());
              },
              onError: function (err) {
                toast.error("PayPal payment failed or cancelled");
                console.error("PayPal integration error:", err);
              }
            }).render(`#paypal-container-${hostedButtonId}`);
          } catch (e) {
            console.error("Paypal render error", e);
          } finally {
            setPaypalLoading(false);
          }
        } else {
          if (retries < 50) {
            retries++;
            setTimeout(initializeButtons, 100);
          } else {
            setPaypalLoading(false);
          }
        }
      } else {
        if (retries < 50) {
          retries++;
          setTimeout(initializeButtons, 100);
        } else {
          setPaypalLoading(false);
          toast.error("PayPal SDK failed to initialize.");
        }
      }
    };

    // Clean up any existing PayPal scripts and globals to avoid conflicts (e.g. from footer)
    const existingScripts = document.querySelectorAll("script[src*='paypal.com/sdk/js']");
    let scriptLoaded = false;

    existingScripts.forEach((s) => {
      if (s.getAttribute("src") === scriptSrc && window.paypal && window.paypal.HostedButtons) {
        scriptLoaded = true;
      } else {
        s.parentNode.removeChild(s);
      }
    });

    if (!scriptLoaded) {
      if (window.paypal) {
        try {
          delete window.paypal;
        } catch (_) {
          window.paypal = undefined;
        }
      }
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => {
        setTimeout(initializeButtons, 200);
      };
      script.onerror = () => {
        toast.error("Failed to load PayPal SDK");
        setPaypalLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(initializeButtons, 200);
    }
  }, [showPaymentModal]);

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

  const handleCancelUpdate = () => {
    setFormData({
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
    setEvidenceFile(null);
    setErrors({});
    setIsUpdateMode(false);
    setActiveRecordId(null);
    setOriginalFormData(null);

    // Re-fill coach/submitter name & email from sessionStorage if available
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
    toast.info("Update cancelled. Returned to New Submission mode.");
  };

  const handleLookupSubmission = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) {
      toast.error("Please enter a valid Access Code");
      return;
    }

    setSearchLoading(true);
    try {
      let adminId = admin?.id;
      if (!adminId && typeof window !== "undefined") {
        const adminDetailsStr = sessionStorage.getItem("adminDetails");
        if (adminDetailsStr) {
          try {
            const adminDetails = JSON.parse(adminDetailsStr);
            adminId = adminDetails?.id;
          } catch (e) {
            console.error("Error parsing adminDetails in lookup:", e);
          }
        }
      }

      const response = await getRequest(API_ENDPOINTS.GET_PERFORMANCE_RESULT_LIST, {
        admin_id: adminId || undefined,
        limit: 1000
      });

      if (response && (response.status === 200 || response.status === true)) {
        const recordList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
        const isMatched = recordList.some(record => 
          String(record.submited_id || "").trim() === searchId.trim()
        );

        if (isMatched) {
          setMatchedRecords(recordList);
          setLookupModalOpen(false);
          setListModalOpen(true);
          setSearchId("");
          toast.success("Access code verified! Displaying talent board submissions.");
        } else {
          toast.error("Invalid Access Token. Please enter a correct Submitted ID.");
        }
      } else {
        toast.error("Could not fetch the posted list of the talent board.");
      }
    } catch (error) {
      console.error("Lookup error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch submission details.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectRecord = (record) => {
    if (!record) return;
    
    const matchedSport = sportsList.includes(record.sport) ? record.sport : (record.sport ? "Other" : "");
    const customSport = matchedSport === "Other" ? record.sport : "";

    const matchedUnit = unitsList.includes(record.unit) ? record.unit : (record.unit ? "Other" : "");
    const customUnit = matchedUnit === "Other" ? record.unit : "";

    const initialFormData = {
      sport: matchedSport,
      customSport: customSport || "",
      activity: record.activity || "",
      result: record.result !== null && record.result !== undefined ? String(record.result) : "",
      unit: matchedUnit,
      customUnit: customUnit || "",
      full_name: record.full_name || "",
      age: record.age !== null && record.age !== undefined ? String(record.age) : "",
      date_of_performance: formatDateForInput(record.date_of_performance),
      gender: record.gender || "",
      country: record.country || "",
      club_name: record.club_name || "",
      coach_name: record.coach_name || "",
      email: record.email || "",
      venue: record.venue || "",
      wind: record.wind || "",
      video_link: record.video_link || "",
      aditional_notes: record.aditional_notes || record.additional_notes || "",
    };

    setFormData(initialFormData);
    setOriginalFormData(initialFormData);
    setActiveRecordId(record.id);
    setIsUpdateMode(true);
    setListModalOpen(false);
    toast.success(`Selected ${record.full_name || "athlete"}'s submission. You can now edit the fields below.`);
  };

  const hasBeenEdited = () => {
    if (!originalFormData) return false;
    if (evidenceFile) return true;

    const keysToCheck = [
      "sport",
      "customSport",
      "activity",
      "result",
      "unit",
      "customUnit",
      "full_name",
      "age",
      "date_of_performance",
      "gender",
      "country",
      "club_name",
      "coach_name",
      "email",
      "venue",
      "wind",
      "video_link",
      "aditional_notes"
    ];

    for (const key of keysToCheck) {
      const val1 = String(formData[key] || "").trim();
      const val2 = String(originalFormData[key] || "").trim();
      if (val1 !== val2) {
        return true;
      }
    }
    return false;
  };

  const handleUpdateSubmission = async (e) => {
    if (e) e.preventDefault();

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

    if (!hasBeenEdited()) {
      toast.error("No changes detected. Please edit at least one field before updating.", {
        toastId: "no-changes-error",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      // Get admin_id from sessionStorage key "adminDetails"
      if (typeof window !== "undefined") {
        const adminDetailsStr = sessionStorage.getItem("adminDetails");
        if (adminDetailsStr) {
          try {
            const adminDetails = JSON.parse(adminDetailsStr);
            if (adminDetails && adminDetails.id) {
              payload.append("admin_id", adminDetails.id);
            }
          } catch (e) {
            console.error("Error parsing adminDetails:", e);
          }
        }
      }

      payload.append("id", activeRecordId);
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

      const response = await postFormData(API_ENDPOINTS.PERFORMANCE_RESULT_UPDATE, payload);

      if (response && (response.status === 200 || response.status === true || response.success)) {
        toast.success("Performance result updated successfully!");

        setFormData({
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
        setEvidenceFile(null);
        setErrors({});
        setIsUpdateMode(false);
        setActiveRecordId(null);
        setOriginalFormData(null);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(response?.message || response?.error_message || "Failed to update performance result.");
      }
    } catch (error) {
      console.error("Talent Board update error:", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred during update.");
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUpdateMode) {
      await handleUpdateSubmission(e);
    } else {
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

      if(dbData.length >= 50){
          setShowPaymentModal(true);
      }
      await submitFormData()
    }
  };

  const copyAccessCode = async () => {
    if (!submittedAccessCode) return;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(submittedAccessCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = submittedAccessCode;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success("Access code copied to clipboard!");
    } catch (error) {
      console.error("Access code copy error:", error);
      toast.error("Unable to copy access code.");
    }
  };

  const submitFormData = async (transactionId) => {

    setLoading(true);
    try {
      const payload = new FormData();
      if (subAdmin == null) {
        payload.append("admin_id", admin.id);
        payload.append("user_id", admin.id);
        payload.append("user_type", admin.user_type);
      } else {
        payload.append("admin_id", admin.id);
        payload.append("user_id", subAdmin.id);
        payload.append("user_type", subAdmin.user_type);
      }
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

      if (transactionId) {
        payload.append("paypal_subscription_id", transactionId);
      }

      if (evidenceFile) {
        payload.append("upload_avidence", evidenceFile);
      }

      const response = await postFormData(API_ENDPOINTS.SAVE_PERFORMANCE_RESULT, payload);

      if (response && (response.status === 200 || response.status === true || response.success)) {
        const performanceResult =
          response?.performance_result ||
          response?.data?.performance_result ||
          response?.data?.data?.performance_result ||
          null;
        const accessCode =
          performanceResult?.submited_id ||
          response?.submited_id ||
          response?.data?.submited_id ||
          "";

        if (accessCode) {
          setSubmittedAccessCode(String(accessCode));
          setAccessCodeModalOpen(true);
        }

        toast.success("Performance result submitted successfully!");

        // Reset all form inputs to empty strings
        setFormData({
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
        setEvidenceFile(null);
        setErrors({});
        setRefreshKey(prev => prev + 1);
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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f4faff] to-[#e8f3fc] dark:from-[#05101E] dark:via-[#091829] dark:to-[#05070f] text-foreground pb-6 transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" hideProgressBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* HEADER INFORMATION CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[#0284C7] to-accent bg-clip-text text-transparent mb-4">
              {isUpdateMode ? "Update Performance Result" : "Submit a Performance Result"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-semibold leading-relaxed">
              The SSP Talent Board allows account holders to showcase notable sporting performances and emerging talent that may be of interest to coaches, scouts and sporting organisations.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 dark:bg-[#00275c]/10 p-5 flex items-start gap-4 shadow-lg backdrop-blur-sm">
            <div className="w-14 h-14 rounded-full bg-[#0080FF] flex items-center justify-center shrink-0 text-white font-extrabold text-2xl shadow-md">
              £5
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm md:text-base text-foreground">£5 Annual Submission</h3>
              <p className="text-[11px] text-muted-foreground font-semibold">£5.00 GBP per submission.</p>
              <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                Each submission is valid for 12 months from the date of submission.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                Your submission can be updated at any time during this 12-month period to keep your performance information current and accurate.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl bg-card border border-border backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-8 transition-all duration-300">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-wide">
                Athlete & Performance Details
              </h3>
            </div>

            {/* 4-COLUMN RESPONSIVE FORM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* SPORT */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Sport <span className="text-red-500">*</span>
                </label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={(e) => handleSelectChange("sport", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.sport ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-white dark:bg-[#0c1224] text-slate-400 dark:text-zinc-400">Select Sport</option>
                  {sportsList.map(sport => (
                    <option key={sport} value={sport} className="bg-white dark:bg-[#0c1224] text-slate-800 dark:text-white">
                      {sport}
                    </option>
                  ))}
                </select>
                {errors.sport && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.sport}
                  </p>
                )}
              </div>

              {/* CUSTOM SPORT IF OTHER */}
              {formData.sport === "Other" && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Custom Sport Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customSport"
                    value={formData.customSport}
                    onChange={handleInputChange}
                    placeholder="Enter custom sport"
                    className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.customSport ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                      } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                  />
                  {errors.customSport && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {errors.customSport}
                    </p>
                  )}
                </div>
              )}

              {/* ACTIVITY / EVENT / TEST */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Activity / Event / Test <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  placeholder="Select or enter activity"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.activity ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.activity && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.activity}
                  </p>
                )}
              </div>

              {/* RESULT */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Result <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  placeholder="Enter result (e.g. 40)"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.result ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.result && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.result}
                  </p>
                )}
              </div>

              {/* UNIT */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => handleSelectChange("unit", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.unit ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-white dark:bg-[#0c1224] text-slate-400 dark:text-zinc-400">Select unit</option>
                  {unitsList.map(unit => (
                    <option key={unit} value={unit} className="bg-white dark:bg-[#0c1224] text-slate-800 dark:text-white">
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.unit}
                  </p>
                )}
              </div>

              {/* CUSTOM UNIT IF OTHER */}
              {formData.unit === "Other" && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Custom Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customUnit"
                    value={formData.customUnit}
                    onChange={handleInputChange}
                    placeholder="Enter custom unit"
                    className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.customUnit ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                      } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                  />
                  {errors.customUnit && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {errors.customUnit}
                    </p>
                  )}
                </div>
              )}

              {/* ATHLETE FULL NAME */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Athlete Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter athlete full name"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.full_name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.full_name && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* AGE */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.age ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.age && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* DATE OF PERFORMANCE */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  Date of Performance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_performance"
                  value={formData.date_of_performance}
                  onChange={handleInputChange}
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.date_of_performance ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm dark:scheme-dark`}
                />
                {errors.date_of_performance && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.date_of_performance}
                  </p>
                )}
              </div>

              {/* GENDER */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleSelectChange("gender", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.gender ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-white dark:bg-[#0c1224] text-slate-400 dark:text-zinc-400">Select gender</option>
                  <option value="male" className="bg-white dark:bg-[#0c1224] text-slate-800 dark:text-white">Male</option>
                  <option value="female" className="bg-white dark:bg-[#0c1224] text-slate-800 dark:text-white">Female</option>
                  <option value="other" className="bg-white dark:bg-[#0c1224] text-slate-800 dark:text-white">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* COUNTRY */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={(e) => handleSelectChange("country", e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.country ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="" className="bg-white dark:bg-[#0c1224] text-slate-400 dark:text-zinc-400">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-white dark:bg-[#0c1224] text-slate-800 dark:text-white">
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* CLUB / TEAM */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Club / Team
                </label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleInputChange}
                  placeholder="Enter club or team"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border dark:border-white/10 text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* COACH / SUBMITTER NAME */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Coach / Submitter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="coach_name"
                  value={formData.coach_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.coach_name ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.coach_name && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.coach_name}
                  </p>
                )}
              </div>

              {/* EMAIL ADDRESS */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* VENUE / LOCATION */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Venue / Location
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter venue or location"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border dark:border-white/10 text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* WIND / CONDITIONS */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Wind / Conditions (if applicable)
                </label>
                <input
                  type="text"
                  name="wind"
                  value={formData.wind}
                  onChange={handleInputChange}
                  placeholder="e.g. +1.2m/s, Indoor, etc."
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border dark:border-white/10 text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 focus:outline-none transition-all text-sm"
                />
              </div>

              {/* VIDEO LINK */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Video Link (YouTube / Vimeo / Drive)
                </label>
                <input
                  type="url"
                  name="video_link"
                  value={formData.video_link}
                  onChange={handleInputChange}
                  placeholder="Enter video link URL"
                  className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border ${errors.video_link ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary dark:focus:border-accent focus:ring-primary/20 dark:focus:ring-accent/20"
                    } text-foreground placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:outline-none transition-all text-sm`}
                />
                {errors.video_link && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.video_link}
                  </p>
                )}
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                {isUpdateMode ? (
                  <>
                    {/* Cancel Update Button */}
                    <button
                      type="button"
                      onClick={handleCancelUpdate}
                      className="flex-1 flex items-center justify-start gap-4 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-all duration-200 text-left cursor-pointer"
                    >
                      <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
                        <X className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm md:text-base text-rose-800 dark:text-rose-200">Cancel Update</p>
                        <p className="text-[10px] md:text-xs text-rose-500 dark:text-rose-400 mt-0.5">Discard changes and return</p>
                      </div>
                    </button>

                    {/* Update Submission (Submit Button) */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-start gap-4 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all duration-200 text-left shadow-lg shadow-emerald-500/15 cursor-pointer"
                    >
                      <div className="p-3 rounded-xl bg-white/10 text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm md:text-base text-white">Update Submission</p>
                        <p className="text-[10px] md:text-xs text-emerald-100/90 mt-0.5">
                          {loading ? "Updating performance..." : "Save changes to performance result"}
                        </p>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Update Existing Submission */}
                    <button
                      type="button"
                      onClick={() => setLookupModalOpen(true)}
                      className="flex-1 flex items-center justify-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-[#0c1628] dark:hover:bg-[#122038] transition-all duration-200 text-left cursor-pointer"
                    >
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-200">Click on result to update</p>
                      </div>
                    </button>

                    {/* New Submission (Submit Button) */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-start gap-4 p-4 rounded-2xl bg-[#0091FF] hover:bg-[#0080E0] disabled:opacity-50 text-white transition-all duration-200 text-left shadow-lg shadow-blue-500/15 cursor-pointer"
                    >
                      <div className="p-3 rounded-xl bg-white/10 text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-extrabold text-sm md:text-base text-white">New Submission</p>
                        <p className="text-[10px] md:text-xs text-blue-100/90 mt-0.5">
                          {loading ? "Submitting performance..." : "Create a new performance submission"}
                        </p>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Secure Footer */}
              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] md:text-xs text-slate-500 dark:text-slate-400/80 font-medium">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure • Trusted • International</span>
                <span className="mx-1 opacity-40">|</span>
                <span>SSP Talent Board</span>
                <span className="mx-1 opacity-40">|</span>
                <span>Showcasing Sporting Talent Worldwide</span>
              </div>
            </div>

          </div>
        </form>

        {/* PayPal Sandbox Payment Dialog */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="w-[95vw] sm:max-w-md bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure Checkout
                </div>
                <DialogTitle className="text-xl font-black text-foreground">
                  Talent Board Submission
                </DialogTitle>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <span className="font-extrabold text-sm">£5</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground">Annual Submission Subscription</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To complete your submission to the SSP Talent Board, an annual subscription of £5.00 GBP is required. This keeps your listing active for 12 months, allowing you to update it at any time.
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                {paypalLoading && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <p className="text-xs text-muted-foreground font-semibold">Initializing PayPal Payment...</p>
                  </div>
                )}
                <div
                  id={`paypal-container-${process.env.NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID}`}
                  className="min-h-[150px] w-full transition-all duration-300"
                />

                <div className="flex flex-col items-center space-y-2 pt-2 border-t border-dashed border-border">
                  <p className="text-[10px] text-muted-foreground italic">
                    If PayPal fails to load (due to invalid client-id or network), use this fallback to test form submission:
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      toast.success("Bypass payment successful! Submitting performance result...");
                      setShowPaymentModal(false);
                      await submitFormData("DUMMY_TRX_ID_" + Date.now());
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Payment Success (Bypass)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground/60 font-medium">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secured by PayPal • SSL Encrypted</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submitted Access Code Dialog */}
        <Dialog open={accessCodeModalOpen} onOpenChange={setAccessCodeModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  <CheckCircle className="h-3.5 w-3.5" /> Submitted
                </div>
                <DialogTitle className="text-xl font-black text-foreground">
                  Copy Access Code
                </DialogTitle>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                <Key className="h-5 w-5" />
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Keep this code safe. You will need it to find and update this performance result later.
                </p>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/60 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Access Code
                    </p>
                    <p className="mt-1 break-all font-mono text-lg font-black text-foreground">
                      {submittedAccessCode || "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyAccessCode}
                    disabled={!submittedAccessCode}
                    className="h-11 w-11 shrink-0 rounded-xl bg-[#0091FF] hover:bg-[#0080E0] disabled:opacity-50 text-white transition-all cursor-pointer flex items-center justify-center shadow-md"
                    title="Copy access code"
                  >
                    <Copy className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAccessCodeModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-all cursor-pointer text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={copyAccessCode}
                  disabled={!submittedAccessCode}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0091FF] hover:bg-[#0080E0] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Code
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lookup Submitted ID Dialog */}
        <Dialog open={lookupModalOpen} onOpenChange={setLookupModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  <Key className="h-3.5 w-3.5" /> Lookup Submission
                </div>
                <DialogTitle className="text-xl font-black text-foreground">
                  Update Submission
                </DialogTitle>
              </div>
            </div>

            <form onSubmit={handleLookupSubmission} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-foreground/80">
                  Access Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter your Access Code (e.g. 1234)"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-input-theme-bg border border-input-theme-border text-foreground placeholder-muted-foreground/60 focus:border-primary dark:focus:border-accent focus:ring-2 focus:ring-primary/20 dark:focus:ring-accent/20 focus:outline-none transition-all text-sm font-medium"
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enter the unique 4-digit Access Code you received when creating your performance result.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLookupModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0091FF] hover:bg-[#0080E0] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {searchLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/35 border-t-white animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search & Fill"
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Selection List Dialog */}
        <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-lg bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Select Submission
                </div>
                <DialogTitle className="text-xl font-black text-foreground">
                  Choose Submission to Update
                </DialogTitle>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                We found the following submission(s) matching your access token. Select the one you wish to edit:
              </p>

              <div className="space-y-3">
                {matchedRecords.map((record, idx) => (
                  <div
                    key={record.id || idx}
                    onClick={() => handleSelectRecord(record)}
                    className="group p-4 rounded-2xl border border-border bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                        {record.full_name || "N/A"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-semibold">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px]">
                          {record.sport || "N/A"}
                        </span>
                        <span>•</span>
                        <span>{record.activity || "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black text-foreground">
                          {record.result !== null && record.result !== undefined ? record.result : "N/A"}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground ml-1">
                          {record.unit || ""}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 pt-0 border-t border-border mt-auto flex justify-end">
              <button
                type="button"
                onClick={() => setListModalOpen(false)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <PerformanceDatabase refreshTrigger={refreshKey} />
    </div>
  );
}
