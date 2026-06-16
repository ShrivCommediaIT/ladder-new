"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getRequest, putRequest, deleteRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Search,
  RotateCcw,
  Download,
  Play,
  Activity,
  Globe,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Save,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const brandGradient = "var(--background-image-gradient-brand)";
const shellClass =
  "relative overflow-hidden rounded-[28px] border border-border bg-card text-foreground shadow-xl backdrop-blur-xl";
const panelClass =
  "rounded-[24px] border border-border bg-card/95 text-foreground shadow-lg backdrop-blur-xl";
const fieldClass =
  "w-full h-11 rounded-xl border border-input bg-[var(--input-bg)] px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all";
const selectClass = `${fieldClass} cursor-pointer`;
const mutedLabelClass =
  "text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground";
const subtleButtonClass =
  "flex items-center justify-center gap-2 rounded-xl border border-border bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] px-4 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-[color:color-mix(in_srgb,var(--card),var(--primary)_8%)]";

const getCountryCode = (countryName) => {
  if (!countryName) return null;
  const name = countryName.toLowerCase().trim();
  const map = [
    [["india"], "in"],
    [["france"], "fr"],
    [["united states", "usa", "america"], "us"],
    [["united kingdom", " uk", "britain", "england"], "gb"],
    [["canada"], "ca"],
    [["australia"], "au"],
    [["germany"], "de"],
    [["italy"], "it"],
    [["spain"], "es"],
    [["netherlands", "dutch"], "nl"],
    [["china"], "cn"],
    [["japan"], "jp"],
    [["singapore"], "sg"],
    [["uae", "emirates"], "ae"],
    [["saudi"], "sa"],
    [["brazil"], "br"],
    [["south africa"], "za"],
    [["malaysia"], "my"],
    [["south korea", "korea"], "kr"],
    [["pakistan"], "pk"],
    [["bangladesh"], "bd"],
    [["sri lanka"], "lk"],
    [["russia"], "ru"],
    [["ukraine"], "ua"],
    [["poland"], "pl"],
    [["sweden"], "se"],
    [["norway"], "no"],
    [["denmark"], "dk"],
    [["finland"], "fi"],
    [["switzerland"], "ch"],
    [["austria"], "at"],
    [["belgium"], "be"],
    [["portugal"], "pt"],
    [["greece"], "gr"],
    [["turkey"], "tr"],
    [["new zealand"], "nz"],
    [["argentina"], "ar"],
    [["mexico"], "mx"],
    [["egypt"], "eg"],
    [["nigeria"], "ng"],
    [["kenya"], "ke"],
    [["indonesia"], "id"],
    [["thailand"], "th"],
    [["vietnam"], "vn"],
    [["philippines"], "ph"],
    [["ireland"], "ie"],
  ];
  for (const [keywords, code] of map) {
    if (keywords.some((kw) => name.includes(kw))) return code;
  }
  return null;
};

const dedupCaseInsensitive = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    if (!item || !item.trim()) return false;
    const key = item.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const trimmed = dateStr.trim();
    if (trimmed.includes("-")) {
      const parts = trimmed.split("-");
      if (parts[0].length === 4) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      } else if (parts[2] && parts[2].length === 4) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = parseInt(month, 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          return `${day} ${months[mIdx]} ${year}`;
        }
      }
    }
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export default function PerformanceDatabase({ refreshTrigger, onLoadComplete }) {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [sport, setSport] = useState("");
  const [activity, setActivity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [keyword, setKeyword] = useState("");
  const [unit, setUnit] = useState("");
  const [minResult, setMinResult] = useState("");
  const [maxResult, setMaxResult] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    sport: "",
    activity: "",
    ageGroup: "",
    gender: "",
    country: "",
    keyword: "",
    unit: "",
    minResult: "",
    maxResult: "",
    dateFrom: "",
    dateTo: "",
    witness: false,
  });

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [activeVideo, setActiveVideo] = useState(null);
  const [sportsOptions, setSportsOptions] = useState([]);

  // Performance history log states
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { },
  });

  // Inline edit states (admin only)
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const handleOpenEdit = (record) => {
    setEditData({
      id: record.id,
      sport: record.sport || "",
      activity: record.activity || "",
      result: record.result !== null && record.result !== undefined ? String(record.result) : "",
      unit: record.unit || "",
      full_name: record.full_name || "",
      age: record.age !== null && record.age !== undefined ? String(record.age) : "",
      date_of_performance: record.date_of_performance || "",
      gender: record.gender || "",
      country: record.country || "",
      club_name: record.club_name || "",
      coach_name: record.coach_name || "",
      email: record.email || "",
      venue: record.venue || "",
      wind: record.wind || "",
      video_link: record.video_link || "",
      aditional_notes: record.aditional_notes || "",
    });
    setEditMode(true);
  };

  const handleEditSave = async () => {
    if (!editData) return;
    setEditSaving(true);
    try {
      let adminId = undefined;
      if (typeof window !== "undefined") {
        const str = sessionStorage.getItem("adminDetails");
        if (str) {
          try { adminId = JSON.parse(str)?.id; } catch (_) {}
        }
      }
      const payload = new FormData();
      if (adminId) payload.append("admin_id", adminId);
      Object.entries(editData).forEach(([k, v]) => payload.append(k, v ?? ""));
      const response = await postFormData(API_ENDPOINTS.PERFORMANCE_RESULT_UPDATE, payload);
      if (response && (response.status === 200 || response.status === true || response.success)) {
        toast.success(response.message || "Performance updated successfully!");
        setEditMode(false);
        setEditData(null);
        setHistoryModalOpen(false);
        fetchResults(currentPage);
      } else {
        toast.error(response?.message || "Failed to update performance.");
      }
    } catch (err) {
      console.error("Edit save error:", err);
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setEditSaving(false);
    }
  };

  const fetchResults = useCallback(
    async (pageVal = 1, currentFilters = appliedFilters) => {
      setLoading(true);
      try {
        const ageMap = { under13: 13, under15: 15, under17: 17, senior: 18, over40: 40, over60: 60 };
        const ageValue = currentFilters.ageGroup
          ? ageMap[currentFilters.ageGroup]
          : undefined;

        let adminId = undefined;
        if (typeof window !== "undefined") {
          const adminDetailsStr = sessionStorage.getItem("adminDetails");
          if (adminDetailsStr) {
            try {
              const adminDetails = JSON.parse(adminDetailsStr);
              if (adminDetails && adminDetails.id) {
                adminId = adminDetails.id;
              }
            } catch (e) {
              console.error("Error parsing adminDetails:", e);
            }
          }
        }

        const params = {
          page: pageVal,
          limit: 10,
          sport: currentFilters.sport || undefined,
          activity: currentFilters.keyword || undefined,
          age: ageValue,
          gender: currentFilters.gender || undefined,
          country: currentFilters.country || undefined,
          min_result: currentFilters.minResult || undefined,
          max_result: currentFilters.maxResult || undefined,
          date_from: currentFilters.dateFrom || undefined,
          date_to: currentFilters.dateTo || undefined,
          witness: currentFilters.witness || undefined,
        };

        if (adminId) {
          params.admin_id = adminId;
        }

        const response = await getRequest(
          API_ENDPOINTS.GET_PERFORMANCE_RESULT_LIST,
          params,
        );

        if (response && response.status === 200 && response.data) {
          const pageData = response.data.data || [];
          setDbData(pageData);
          setTotalCount(response.data.total || pageData.length);
          setTotalPages(response.data.last_page || 1);
          setCurrentPage(response.data.current_page || pageVal);

          const uniqueSports = dedupCaseInsensitive(pageData.map((i) => i.sport)).sort();
          const uniqueActivities = dedupCaseInsensitive(
            pageData.map((i) => i.activity),
          ).sort();
          const uniqueCountries = dedupCaseInsensitive(
            pageData.map((i) => i.country),
          ).sort();

          setSportsOptions(uniqueSports);
          setActivitiesOptions(uniqueActivities);
          setCountriesOptions(uniqueCountries);
        } else {
          setDbData([]);
          setTotalCount(0);
          setTotalPages(1);
          setSportsOptions([]);
          setActivitiesOptions([]);
          setCountriesOptions([]);
        }
      } catch (err) {
        console.error("Error fetching performance database: ", err);
        toast.error("Failed to load results from server");
        setDbData([]);
        setTotalCount(0);
        setTotalPages(1);
        setSportsOptions([]);
        setActivitiesOptions([]);
        setCountriesOptions([]);
      } finally {
        setLoading(false);
        if (onLoadComplete) {
          onLoadComplete();
        }
      }
    },
    [appliedFilters],
  );

  useEffect(() => {
    fetchResults(currentPage);

    if (typeof window !== "undefined") {
      const adminDetailsStr = sessionStorage.getItem("adminDetails");
      if (adminDetailsStr) {
        try {
          const adminDetails = JSON.parse(adminDetailsStr);
          setIsAdmin(!!(adminDetails && adminDetails.id));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
  }, [currentPage, fetchResults, refreshTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = {
      sport,
      activity,
      ageGroup,
      gender,
      country,
      keyword,
      unit,
      minResult,
      maxResult,
      dateFrom,
      dateTo,
      witness: verifiedOnly,
    };
    setAppliedFilters(newFilters);
    setCurrentPage(1);
    fetchResults(1, newFilters);
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  const handleVerifiedOnlyToggle = () => {
    setVerifiedOnly((current) => !current);
  };

  const handleReset = () => {
    setSport("");
    setActivity("");
    setAgeGroup("");
    setGender("");
    setCountry("");
    setKeyword("");
    setUnit("");
    setMinResult("");
    setMaxResult("");
    setDateFrom("");
    setDateTo("");
    setVerifiedOnly(false);

    const clearedFilters = {
      sport: "",
      activity: "",
      ageGroup: "",
      gender: "",
      country: "",
      keyword: "",
      unit: "",
      minResult: "",
      maxResult: "",
      dateFrom: "",
      dateTo: "",
      witness: false,
    };

    setAppliedFilters(clearedFilters);
    setCurrentPage(1);
    fetchResults(1, clearedFilters);
  };

  const handleToggleStatus = async (record) => {
    const isCurrentlyVisible = record.status == 1;
    const confirmMessage = isCurrentlyVisible
      ? "This performance will no longer be visible publicly. Are you sure you want to hide it?"
      : "Are you sure you want to make this performance visible publicly?";

    setConfirmModalConfig({
      title: "Confirm Status Change",
      message: confirmMessage,
      onConfirm: async () => {
        setConfirmModalOpen(false);
        try {
          const response = await putRequest(`/changeStatusPerformanceResult/${record.id}`, {
            status: record.status == 1 ? 0 : 1,
          });
          if (response && (response.status === 200 || response.status === true || response.success)) {
            toast.success(response.message || "Status changed successfully!");
            setHistoryModalOpen(false);
            fetchResults(currentPage);
          } else {
            toast.error(response?.message || "Failed to change status.");
          }
        } catch (error) {
          console.error("Error toggling status:", error);
          toast.error(error.message || "An error occurred while toggling status.");
        }
      }
    });
    setConfirmModalOpen(true);
  };

  const handleDeletePerformance = async (record) => {
    setConfirmModalConfig({
      title: "Confirm Deletion",
      message: "This performance will be permanently deleted and will no longer show publicly. Are you sure you want to proceed?",
      onConfirm: async () => {
        setConfirmModalOpen(false);
        try {
          const response = await deleteRequest(`/PerformanceResultdelete/${record.id}`);
          if (response && (response.status === 200 || response.status === true || response.success)) {
            toast.success(response.message || "Performance record deleted successfully!");
            setHistoryModalOpen(false);
            fetchResults(currentPage);
          } else {
            toast.error(response?.message || "Failed to delete performance record.");
          }
        } catch (error) {
          console.error("Error deleting performance record:", error);
          toast.error(error.message || "An error occurred while deleting performance record.");
        }
      }
    });
    setConfirmModalOpen(true);
  };

  const handleRowClick = async (item) => {
    setSelectedItem(item);
    setHistoryModalOpen(true);

    if (isAdmin) {
      // Logged in: use the already-available list data — no API needed
      setHistoryData([item]);
      setHistoryLoading(false);
      return;
    }

    // Not logged in: fetch the full performance history from API
    setHistoryLoading(true);
    setHistoryData([]);
    try {
      const response = await getRequest("/getPerformanceHistory", { id: item.id });
      if (response && (response.status === 200 || response.status === true) && response.data) {
        setHistoryData(response.data);
      } else {
        toast.error(response?.message || "Failed to fetch performance history.");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error(error.message || "An error occurred while fetching history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const getProcessedData = () => {
    const list = [...dbData];
    list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || b.date_of_performance) - new Date(a.created_at || a.date_of_performance);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || a.date_of_performance) - new Date(b.created_at || b.date_of_performance);
      }
      if (sortBy === "athlete") {
        return (a.full_name || "").localeCompare(b.full_name || "");
      }
      if (sortBy === "result-desc") {
        return parseFloat(b.result || 0) - parseFloat(a.result || 0);
      }
      if (sortBy === "result-asc") {
        return parseFloat(a.result || 0) - parseFloat(b.result || 0);
      }
      return 0;
    });
    return list;
  };

  const processedData = getProcessedData();

  const handleExportCSV = () => {
    if (processedData.length === 0) {
      toast.warn("No data available to export");
      return;
    }

    const headers = [
      "Date",
      "Athlete",
      "Age",
      "Gender",
      "Sport",
      "Activity/Event",
      "Result",
      "Unit",
      "Country",
      "Club/Team",
      "Coach/Witness",
    ];

    const rows = processedData.map((item) => [
      item.date_of_performance,
      item.full_name,
      item.age,
      item.gender,
      item.sport,
      item.activity,
      item.result,
      item.unit,
      item.country,
      item.club_name || "N/A",
      item.coach_name,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val || ""}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SSP_Performance_Database_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((p, idx) => (
      <button
        key={idx}
        onClick={() => typeof p === "number" && handlePageClick(p)}
        disabled={p === "..."}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all sm:h-10 sm:w-10 ${p === currentPage
          ? "scale-105 text-white"
          : p === "..."
            ? "cursor-default text-muted-foreground"
            : "border border-border bg-[var(--input-bg)] text-foreground hover:bg-muted"
          }`}
        style={
          p === currentPage
            ? {
              backgroundImage: brandGradient,
              boxShadow: "var(--brand-button-shadow)",
            }
            : undefined
        }
      >
        {p}
      </button>
    ));
  };

  const handlePlayVideo = (link) => {
    if (!link) return;
    let embedUrl = link;
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = link.match(regExp);
      if (match && match[2].length === 11) {
        embedUrl = `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    setActiveVideo(embedUrl);
  };

  const stats = [
    {
      label: "Results",
      value: totalCount.toLocaleString(),
      icon: Activity,
      tone: "rgb(var(--brand-primary-rgb) / 0.14)",
      iconColor: "text-primary",
    },
    {
      label: "Countries",
      value: countriesOptions.length,
      icon: Globe,
      tone: "rgb(16 185 129 / 0.12)",
      iconColor: "text-emerald-500",
    },
    {
      label: "Sports",
      value: sportsOptions.length,
      icon: Trophy,
      tone: "rgb(var(--brand-deep-rgb) / 0.14)",
      iconColor: "text-[color:rgb(var(--brand-deep-rgb))]",
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-8 lg:px-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: "var(--page-glow-corners)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "var(--page-grid-overlay)",
          backgroundSize: "78px 78px",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] space-y-8">
        <div className={`${shellClass} p-6 sm:p-8`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Verified Results
              </div>
              <h1
                className="mt-4 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl"
                style={{ backgroundImage: brandGradient }}
              >
                SSP Talent Board
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Entries on the SSP Talent Board are submitted by participating articipating clubs, coaches and organisations to help showcase emerging talent and notable sporting achievements. Interested parties are encouraged to contact the submitting club or organisation directly for further information.  SSP reserves the right to remove or hide any entry that appears unsuitable, inaccurate, incomplete, or inappropriate
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:w-auto">
              {stats.map(({ label, value, icon: Icon, tone, iconColor }) => (
                <div
                  key={label}
                  className="min-w-[180px] rounded-[22px] border border-border bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconColor}`}
                      style={{
                        backgroundColor: tone,
                        boxShadow: "var(--brand-card-shadow)",
                      }}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-xl font-black tracking-wide sm:text-2xl">{value}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className={`${panelClass} space-y-6 p-6 sm:p-8`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)} className={selectClass}>
                <option value="">All Sports</option>
                {sportsOptions.map((sp, idx) => (
                  <option key={idx} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Age Group</label>
              <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={selectClass}>
                <option value="">All Ages</option>
                <option value="under13">Under 13s</option>
                <option value="under15">Under 15s</option>
                <option value="under17">Under 17s</option>
                <option value="senior">18 & Over</option>
                <option value="over40">Over 40s</option>
                <option value="over60">Over 60s</option>
              </select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
                <option value="">All Countries</option>
                {countriesOptions.map((ct, idx) => (
                  <option key={idx} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Activity Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search athlete, club, etc..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className={`${fieldClass} pl-9`}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-4 border-t border-border/70 pt-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[minmax(260px,1.35fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(150px,0.7fr)_auto]">
            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Result Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minResult}
                  max={maxResult !== "" ? maxResult : undefined}
                  onChange={(e) => setMinResult(e.target.value)}
                  className={fieldClass}
                />
                <span className="text-xs font-bold uppercase text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxResult}
                  min={minResult !== "" ? minResult : undefined}
                  onChange={(e) => setMaxResult(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={fieldClass} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className={mutedLabelClass}>Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={fieldClass} />
            </div>
            <div className="space-y-1.5 min-w-0">
              <button
                type="button"
                aria-pressed={verifiedOnly}
                onClick={handleVerifiedOnlyToggle}
                className={`${fieldClass} whitespace-nowrap text-center ${verifiedOnly ? "border-primary bg-primary text-white shadow-md" : ""
                  }`}
              >
                Verified Only
              </button>
            </div>

            <div className="flex w-full flex-col gap-3 sm:col-span-2 sm:flex-row lg:col-span-4 xl:col-span-1 xl:w-auto xl:shrink-0">
              <button type="button" onClick={handleReset} className={`${subtleButtonClass} h-11 w-full justify-center whitespace-nowrap px-4 sm:w-auto`}>
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </button>
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto"
                style={{ backgroundImage: brandGradient, boxShadow: "var(--brand-button-shadow)" }}
              >
                <Search className="h-4 w-4" />
                Search Results
              </button>
            </div>
          </div>
        </form>

        <div className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border/70 bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] p-6 sm:flex-row">
            <div className="text-sm font-semibold tracking-wide text-muted-foreground">
              SHOWING <span className="font-bold text-foreground">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> - <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, totalCount)}</span> OF <span className="font-bold text-primary">{totalCount}</span> RESULTS
            </div>

            <div className="flex flex-wrap items-center w-full gap-3 sm:w-auto">


              <div className="flex flex-1 min-w-[150px] items-center gap-2 sm:flex-none">
                <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-[var(--input-bg)] px-3 text-xs font-medium text-foreground transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="newest">Date (Newest First)</option>
                  <option value="oldest">Date (Oldest First)</option>
                  <option value="athlete">Athlete (A-Z)</option>
                  <option value="result-desc">Result (Highest)</option>
                  <option value="result-asc">Result (Lowest)</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className={`${subtleButtonClass} h-10 px-4 text-xs font-bold uppercase tracking-wider flex-shrink-0`}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-border/70 bg-[color:color-mix(in_srgb,var(--card),var(--primary)_7%)] text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Athlete</th>
                  <th className="px-6 py-4">Age</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Sport</th>
                  <th className="px-6 py-4">Activity / Event</th>
                  <th className="px-6 py-4 text-center">Result</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Date of event</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Club / Team</th>
                  <th className="px-6 py-4">Email address</th>
                  <th className="px-6 py-4">Coach / Witness</th>
                  <th className="px-6 py-4 text-center">Video</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60 bg-card text-xs sm:text-sm">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={14} className="px-6 py-8 text-center font-medium text-muted-foreground">
                        Loading SSP performance results data...
                      </td>
                    </tr>
                  ))
                ) : processedData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center font-medium text-muted-foreground">
                      No athletic performances match your current filters. Try resetting the criteria.
                    </td>
                  </tr>
                ) : (
                  processedData.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      onClick={() => handleRowClick(item)}
                      className={`cursor-pointer transition-colors ${item.status == 0
                        ? "opacity-60 bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-amber-500"
                        : idx % 2 === 0
                          ? "bg-card hover:bg-[color:color-mix(in_srgb,var(--card),var(--primary)_6%)]"
                          : "bg-[color:color-mix(in_srgb,var(--card),var(--primary)_3%)] hover:bg-[color:color-mix(in_srgb,var(--card),var(--primary)_8%)]"
                        }`}
                    >
                      <td className="px-6 py-4 font-medium whitespace-nowrap text-muted-foreground">
                        {formatDate(item.created_at || item.date_of_performance)}
                      </td>
                      <td className="px-6 py-4 font-bold capitalize whitespace-nowrap text-foreground">
                        {item.full_name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-muted-foreground">{item.age}</td>
                      <td className="px-6 py-4 capitalize text-muted-foreground">{item.gender}</td>
                      <td className="px-6 py-4 font-medium text-primary">{item.sport}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <span className="flex items-center gap-2">
                          {item.activity}
                          {item.status == 0 && (
                            <span className="inline-flex items-center rounded bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-500 tracking-wider">
                              Hidden
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-sans text-[15px] font-extrabold tracking-wide text-primary">
                        {item.result}
                      </td>
                      <td className="px-6 py-4 font-medium text-muted-foreground">{item.unit}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatDate(item.date_of_performance)}</td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap text-foreground">
                        <span className="inline-flex items-center gap-2">
                          {getCountryCode(item.country) ? (
                            <img
                              src={`https://flagcdn.com/20x15/${getCountryCode(item.country)}.png`}
                              alt={item.country || ""}
                              width={20}
                              height={15}
                              className="rounded-sm flex-shrink-0"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="inline-block h-4 w-5 flex-shrink-0 rounded-sm bg-muted" />
                          )}
                          {item.country}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[150px] truncate capitalize text-muted-foreground">
                        {item.club_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.email}</td>
                      <td className="px-6 py-4 capitalize text-muted-foreground">{item.coach_name}</td>
                      <td className="px-6 py-4 text-center">
                        {item.video_link && item.video_link.trim() && item.video_link !== "dfgg" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayVideo(item.video_link);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary shadow-md transition-all hover:scale-110 hover:bg-primary hover:text-white active:scale-95"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalCount > 0 && !loading && (
            <div className={`flex flex-col items-center gap-4 border-t border-border/70 bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] p-6 sm:flex-row ${totalPages > 1 ? "justify-between" : "justify-center"}`}>
              {totalPages > 1 && (
                <button
                  onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`${subtleButtonClass} h-10 w-full px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                {renderPageNumbers()}
              </div>

              {totalPages > 1 && (
                <button
                  onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`${subtleButtonClass} h-10 w-full px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/70 bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] p-4">
                <h3 className="text-sm font-bold tracking-wide text-foreground sm:text-base">
                  Performance Evidence Video Player
                </h3>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-[var(--input-bg)] text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                {activeVideo.startsWith("http") ? (
                  <iframe
                    src={activeVideo}
                    title="Performance Video Player"
                    className="h-full w-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] p-6 text-center text-muted-foreground">
                    <Play className="mb-3 h-12 w-12 animate-pulse text-primary/50" />
                    <p className="text-sm font-medium text-foreground">Invalid Video Link</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      This video URL could not be dynamically parsed. Use the direct link to review evidence.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance History Dialog */}
        <Dialog open={historyModalOpen} onOpenChange={(open) => { if (!open) { setEditMode(false); setEditData(null); } setHistoryModalOpen(open); }}>
          <DialogContent className="w-[95vw] sm:max-w-2xl bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                  <Activity className="h-3.5 w-3.5" /> Performance Record
                </div>
                <DialogTitle className="text-xl font-black text-foreground truncate">
                  {selectedItem ? `${selectedItem.full_name}'s Record` : "Performance Record"}
                </DialogTitle>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scroll">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-semibold">Loading history logs...</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm font-medium">
                  No historical updates found for this performance record.
                </div>
              ) : (
                <div className="space-y-6">
                  {historyData.map((record, index) => {
                    const isEditing = editMode && editData?.id === record.id;
                    const inp = "w-full h-9 rounded-lg border border-input bg-[var(--input-bg)] px-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all";
                    return (
                      <div key={record.id || index} className={`rounded-2xl border p-4 sm:p-5 space-y-4 shadow-sm ${record.status == 0 ? "border-amber-500/20 opacity-75" : "border-border"}`}>
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                              {record.sport || "Other Sport"}
                              {record.status == 0 && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-500 tracking-wider">Hidden</span>
                              )}
                            </span>
                            <h4 className="text-base font-bold text-foreground mt-0.5">{record.activity || "Performance Event"}</h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground font-semibold block">Logged: {formatDate(record.created_at || record.date_of_performance)}</span>
                              <span className="text-[11px] text-muted-foreground/80 mt-0.5 block">Perf Date: {formatDate(record.date_of_performance)}</span>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-1.5 border-l border-border pl-2 ml-1">
                                {!isEditing && (
                                  <button type="button" onClick={() => handleOpenEdit(record)}
                                    title="Edit Performance"
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95 transition-all cursor-pointer">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleStatus(record); }}
                                  title={record.status == 1 ? "Hide Performance" : "Show Performance"}
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${record.status == 1 ? "border-amber-500/25 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white" : "border-slate-500/25 bg-slate-500/10 text-slate-400 hover:bg-slate-500 hover:text-white"}`}>
                                  {record.status == 1 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeletePerformance(record); }}
                                  title="Delete Performance"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white active:scale-95 transition-all cursor-pointer">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          /* ── EDIT FORM ── */
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                              {[
                                { label: "Athlete Name", key: "full_name" },
                                { label: "Sport", key: "sport" },
                                { label: "Activity / Event", key: "activity" },
                                { label: "Result", key: "result" },
                                { label: "Unit", key: "unit" },
                                { label: "Age", key: "age", type: "number" },
                                { label: "Gender", key: "gender" },
                                { label: "Country", key: "country" },
                                { label: "Club / Team", key: "club_name" },
                                { label: "Coach / Submitter", key: "coach_name" },
                                { label: "Email", key: "email" },
                                { label: "Venue", key: "venue" },
                                { label: "Wind / Conditions", key: "wind" },
                                { label: "Video Link", key: "video_link" },
                              ].map(({ label, key, type }) => (
                                <div key={key} className="space-y-1">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block">{label}</span>
                                  <input
                                    type={type || "text"}
                                    value={editData[key] ?? ""}
                                    onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                                    className={inp}
                                  />
                                </div>
                              ))}
                              <div className="col-span-2 sm:col-span-3 space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block">Date of Performance</span>
                                <input type="date" value={editData.date_of_performance ?? ""}
                                  onChange={(e) => setEditData(prev => ({ ...prev, date_of_performance: e.target.value }))}
                                  className={inp} />
                              </div>
                              <div className="col-span-2 sm:col-span-3 space-y-1">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block">Additional Notes</span>
                                <textarea rows={3} value={editData.aditional_notes ?? ""}
                                  onChange={(e) => setEditData(prev => ({ ...prev, aditional_notes: e.target.value }))}
                                  className={`${inp} h-auto pt-2 resize-none`} />
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button type="button" onClick={() => { setEditMode(false); setEditData(null); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-all cursor-pointer">
                                <XCircle className="h-3.5 w-3.5" /> Cancel
                              </button>
                              <button type="button" onClick={handleEditSave} disabled={editSaving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                                style={{ backgroundImage: brandGradient, boxShadow: "var(--brand-button-shadow)" }}>
                                {editSaving ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</> : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── READ-ONLY VIEW ── */
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Result</span>
                                <span className="text-primary font-black text-sm">{record.result} {record.unit}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Age & Gender</span>
                                <span className="text-foreground capitalize">{record.age} yrs • {record.gender}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Country</span>
                                <span className="text-foreground flex items-center gap-1.5 truncate" title={record.country}>
                                  {getCountryCode(record.country) && (
                                    <img src={`https://flagcdn.com/20x15/${getCountryCode(record.country)}.png`} alt="" width={16} height={12} className="rounded-[2px] shrink-0" />
                                  )}
                                  <span className="truncate">{record.country}</span>
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Club / Team</span>
                                <span className="text-foreground truncate block">{record.club_name || "—"}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/40 text-xs">
                              <div className="space-y-1">
                                <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Coach/Submitter:</span>{" "}<span className="text-foreground font-semibold">{record.coach_name}</span></div>
                                <div className="truncate"><span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Email:</span>{" "}<span className="text-foreground font-medium break-all">{record.email}</span></div>
                              </div>
                              <div className="space-y-1">
                                <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Venue:</span>{" "}<span className="text-foreground font-semibold">{record.venue || "—"}</span></div>
                                <div><span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Wind/Conditions:</span>{" "}<span className="text-foreground font-semibold">{record.wind || "—"}</span></div>
                                {record.video_link && record.video_link.trim() && record.video_link !== "dfgg" && (
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Video Evidence:</span>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handlePlayVideo(record.video_link); }}
                                      className="inline-flex h-5 items-center gap-1 px-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-all cursor-pointer">
                                      <Play className="h-2 w-2 fill-current" /> Play Video
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {record.aditional_notes && (
                              <div className="bg-muted/40 rounded-xl p-3 border border-border/40 text-xs">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Additional Notes</span>
                                <p className="text-foreground/95 font-medium leading-relaxed italic">"{record.aditional_notes}"</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="py-2.5 px-6 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Premium Confirmation Dialog */}
        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent">
              <DialogTitle className="text-xl font-black text-foreground">
                {confirmModalConfig.title}
              </DialogTitle>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                {confirmModalConfig.message}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-bold text-sm transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModalConfig.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all cursor-pointer text-center bg-[#0091FF] hover:bg-[#0080E0]"
                  style={{ backgroundImage: brandGradient, boxShadow: "var(--brand-button-shadow)" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
