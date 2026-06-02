"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getRequest } from "@/services/apiService";
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
} from "lucide-react";
import { toast } from "react-toastify";

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

export default function PerformanceDatabase() {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [sport, setSport] = useState("");
  const [activity, setActivity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [keyword, setKeyword] = useState("");
  const [minResult, setMinResult] = useState("");
  const [maxResult, setMaxResult] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    sport: "",
    activity: "",
    ageGroup: "",
    gender: "",
    country: "",
    keyword: "",
    minResult: "",
    maxResult: "",
    dateFrom: "",
    dateTo: "",
  });

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [activeVideo, setActiveVideo] = useState(null);
  const [sportsOptions, setSportsOptions] = useState([]);
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [countriesOptions, setCountriesOptions] = useState([]);

  const fetchResults = useCallback(
    async (pageVal = 1, currentFilters = appliedFilters) => {
      setLoading(true);
      try {
        const ageMap = { under13: 13, under15: 15, under17: 17, senior: 18, over40: 40, over60: 60 };
        const ageValue = currentFilters.ageGroup
          ? ageMap[currentFilters.ageGroup]
          : undefined;

        const params = {
          page: pageVal,
          limit: 10,
          sport: currentFilters.sport || undefined,
          activity: currentFilters.activity || undefined,
          age: ageValue,
          gender: currentFilters.gender || undefined,
          country: currentFilters.country || undefined,
          keyword: currentFilters.keyword || undefined,
          min_result: currentFilters.minResult || undefined,
          max_result: currentFilters.maxResult || undefined,
          date_from: currentFilters.dateFrom || undefined,
          date_to: currentFilters.dateTo || undefined,
        };

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
      }
    },
    [appliedFilters],
  );

  useEffect(() => {
    fetchResults(currentPage);
  }, [currentPage, fetchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = {
      sport,
      activity,
      ageGroup,
      gender,
      country,
      keyword,
      minResult,
      maxResult,
      dateFrom,
      dateTo,
    };
    setAppliedFilters(newFilters);
    setCurrentPage(1);
    fetchResults(1, newFilters);
  };

  const handleReset = () => {
    setSport("");
    setActivity("");
    setAgeGroup("");
    setGender("");
    setCountry("");
    setKeyword("");
    setMinResult("");
    setMaxResult("");
    setDateFrom("");
    setDateTo("");

    const clearedFilters = {
      sport: "",
      activity: "",
      ageGroup: "",
      gender: "",
      country: "",
      keyword: "",
      minResult: "",
      maxResult: "",
      dateFrom: "",
      dateTo: "",
    };

    setAppliedFilters(clearedFilters);
    setCurrentPage(1);
    fetchResults(1, clearedFilters);
    toast.success("Filters reset successfully");
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
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all sm:h-10 sm:w-10 ${
          p === currentPage
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
                Entries on the SSP Talent Board are submitted by participating clubs and organisations to help showcase emerging talent and notable sporting achievements. Interested parties are encouraged to contact the submitting club or organisation directly for further information.  SSP reserves the right to remove or hide any entry that appears unsuitable, inaccurate, incomplete, or inappropriate 
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1.5">
              <label className={mutedLabelClass}>Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)} className={selectClass}>
                <option value="">All Sports</option>
                {sportsOptions.map((sp, idx) => (
                  <option key={idx} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={mutedLabelClass}>Activity / Event</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className={selectClass}>
                <option value="">All Activities</option>
                {activitiesOptions.map((act, idx) => (
                  <option key={idx} value={act}>{act}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <label className={mutedLabelClass}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={mutedLabelClass}>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
                <option value="">All Countries</option>
                {countriesOptions.map((ct, idx) => (
                  <option key={idx} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={mutedLabelClass}>Keyword Search</label>
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

          <div className="flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-2 lg:flex-row lg:items-end">
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:w-3/4">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className={mutedLabelClass}>Date From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={fieldClass} />
              </div>

              <div className="space-y-1.5">
                <label className={mutedLabelClass}>Date To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={fieldClass} />
              </div>
            </div>

            <div className="flex w-full gap-3 lg:w-auto">
              <button type="button" onClick={handleReset} className={`${subtleButtonClass} h-11 flex-1 px-3 lg:flex-none`}>
                <RotateCcw className="h-4 w-4" />
                Reset Filters
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition-all hover:-translate-y-0.5 lg:flex-none"
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
                      className={`transition-colors ${
                        idx % 2 === 0
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
                      <td className="px-6 py-4 font-semibold text-foreground">{item.activity}</td>
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
                            onClick={() => handlePlayVideo(item.video_link)}
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/70 bg-[color:color-mix(in_srgb,var(--card),var(--primary)_4%)] p-6 sm:flex-row">
              <button
                onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`${subtleButtonClass} h-10 w-full px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {renderPageNumbers()}
              </div>

              <button
                onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`${subtleButtonClass} h-10 w-full px-4 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
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
      </div>
    </section>
  );
}
