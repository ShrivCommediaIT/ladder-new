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
  X
} from "lucide-react";
import { toast } from "react-toastify";

// Maps country name → ISO 2-letter code for flagcdn.com
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
    if (keywords.some(kw => name.includes(kw))) return code;
  }
  return null;
};

// Case-insensitive dedup — keeps first occurrence's original casing
const dedupCaseInsensitive = (arr) => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item || !item.trim()) return false;
    const key = item.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Custom robust date formatter to handle dd-mm-yyyy, yyyy-mm-dd and ISO strings
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const trimmed = dateStr.trim();
    if (trimmed.includes("-")) {
      const parts = trimmed.split("-");
      if (parts[0].length === 4) {
        // Format is yyyy-mm-dd
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });
        }
      } else if (parts[2] && parts[2].length === 4) {
        // Format is dd-mm-yyyy
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
        year: "numeric"
      });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export default function PerformanceDatabase() {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States (UI inputs)
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

  // Applied Filters State (updates on search submission)
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
    dateTo: ""
  });

  // Sort & Server-Side Pagination States
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Video player modal
  const [activeVideo, setActiveVideo] = useState(null);

  // Lists for dropdown options (dynamically calculated from total current list)
  const [sportsOptions, setSportsOptions] = useState([]);
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [countriesOptions, setCountriesOptions] = useState([]);

  // Fetch performance result list from API with current page and active filters
  const fetchResults = useCallback(async (pageVal = 1, currentFilters = appliedFilters) => {
    setLoading(true);
    try {
      // Map ageGroup label to numeric age value for the API
      const ageMap = { under13: 13, under15: 15, under17: 17, senior: 18 };
      const ageValue = currentFilters.ageGroup ? ageMap[currentFilters.ageGroup] : undefined;

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
        date_to: currentFilters.dateTo || undefined
      };

      // API call to the specified endpoint
      const response = await getRequest(API_ENDPOINTS.GET_PERFORMANCE_RESULT_LIST, params);
      
      if (response && response.status === 200 && response.data) {
        const pageData = response.data.data || [];
        setDbData(pageData);
        setTotalCount(response.data.total || pageData.length);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || pageVal);

        // Case-insensitive dedup for all dropdown options
        const uniqueSports = dedupCaseInsensitive(pageData.map(i => i.sport)).sort();
        const uniqueActivities = dedupCaseInsensitive(pageData.map(i => i.activity)).sort();
        const uniqueCountries = dedupCaseInsensitive(pageData.map(i => i.country)).sort();

        setSportsOptions(uniqueSports);
        setActivitiesOptions(uniqueActivities);
        setCountriesOptions(uniqueCountries);
      } else {
        // Always clear all lists when API returns no data
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
  }, [appliedFilters]);

  // Load results on mount and whenever the page or applied filters change
  useEffect(() => {
    fetchResults(currentPage);
  }, [currentPage, fetchResults]);

  // Filter application
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
      dateTo
    };
    setAppliedFilters(newFilters);
    setCurrentPage(1);
    fetchResults(1, newFilters);
  };

  // Reset Filters
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
      dateTo: ""
    };
    
    setAppliedFilters(clearedFilters);
    setCurrentPage(1);
    fetchResults(1, clearedFilters);
    toast.success("Filters reset successfully");
  };

  // Local sorting fallback (applies sort on current page results)
  const getProcessedData = () => {
    let list = [...dbData];

    // Local Sorting
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

  // CSV Export function
  const handleExportCSV = () => {
    if (processedData.length === 0) {
      toast.warn("No data available to export");
      return;
    }

    const headers = [
      "Date", "Athlete", "Age", "Gender", "Sport", "Activity/Event", 
      "Result", "Unit", "Country", "Club/Team", "Coach/Witness"
    ];

    const rows = processedData.map(item => [
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
      item.coach_name
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val || ""}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SSP_Performance_Database_${new Date().toISOString().split("T")[0]}.csv`);
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-semibold flex items-center justify-center transition-all ${
          p === currentPage
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
            : p === "..."
            ? "text-zinc-600 cursor-default"
            : "bg-[#0e1326] border border-[#212946] text-zinc-300 hover:text-white"
        }`}
      >
        {p}
      </button>
    ));
  };

  // Video play modal trigger
  const handlePlayVideo = (link) => {
    if (!link) return;
    
    // Format youtube link for embed
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

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-8 py-10 space-y-10 text-white">
      
      {/* SSP DATABASE HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            SSP Performance Database
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-2xl">
            Search and discover exceptional athletic performances from around the world.
          </p>
        </div>

        {/* METRIC CARDS (Solid backgrounds to prevent transparency) */}
        <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
          {/* Card 1 */}
          <div className="bg-[#0e1326] border border-[#212946] rounded-2xl p-4 flex items-center gap-3 shadow-xl">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                {totalCount.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase">Results</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0e1326] border border-[#212946] rounded-2xl p-4 flex items-center gap-3 shadow-xl">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                {countriesOptions.length}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase">Countries</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0e1326] border border-[#212946] rounded-2xl p-4 flex items-center gap-3 shadow-xl">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                {sportsOptions.length}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase">Sports</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER PANEL (Solid dark backgrounds) */}
      <form onSubmit={handleSearch} className="rounded-3xl bg-[#0e1326] border border-[#212946] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* SPORT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Sport</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all cursor-pointer text-sm font-medium"
            >
              <option value="" className="bg-[#05070f]">All Sports</option>
              {sportsOptions.map((sp, idx) => (
                <option key={idx} value={sp} className="bg-[#05070f]">{sp}</option>
              ))}
            </select>
          </div>

          {/* ACTIVITY / EVENT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Activity / Event</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all cursor-pointer text-sm font-medium"
            >
              <option value="" className="bg-[#05070f]">All Activities</option>
              {activitiesOptions.map((act, idx) => (
                <option key={idx} value={act} className="bg-[#05070f]">{act}</option>
              ))}
            </select>
          </div>

          {/* AGE GROUP */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all cursor-pointer text-sm font-medium"
            >
              <option value="" className="bg-[#05070f]">All Ages</option>
              <option value="under13" className="bg-[#05070f]">Under 13s</option>
              <option value="under15" className="bg-[#05070f]">Under 15s</option>
              <option value="under17" className="bg-[#05070f]">Under 17s</option>
              <option value="senior" className="bg-[#05070f]">18 & Over</option>
            </select>
          </div>

          {/* GENDER */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all cursor-pointer text-sm font-medium"
            >
              <option value="" className="bg-[#05070f]">All Genders</option>
              <option value="male" className="bg-[#05070f]">Male</option>
              <option value="female" className="bg-[#05070f]">Female</option>
              <option value="other" className="bg-[#05070f]">Other</option>
            </select>
          </div>

          {/* COUNTRY */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all cursor-pointer text-sm font-medium"
            >
              <option value="" className="bg-[#05070f]">All Countries</option>
              {countriesOptions.map((ct, idx) => (
                <option key={idx} value={ct} className="bg-[#05070f]">{ct}</option>
              ))}
            </select>
          </div>

          {/* KEYWORD SEARCH */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Keyword Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search athlete, club, etc..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all text-sm font-medium"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

        </div>

        {/* SECOND ROW FILTERS (RANGE, DATES, RESET, SUBMIT) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-3 pt-2 border-t border-white/5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-3/4">
            
            {/* RESULT RANGE */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Result Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minResult}
                  max={maxResult !== "" ? maxResult : undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Prevent min from exceeding current max
                    if (maxResult !== "" && parseFloat(val) > parseFloat(maxResult)) return;
                    setMinResult(val);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all text-sm font-medium"
                />
                <span className="text-xs text-zinc-400 font-bold uppercase">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxResult}
                  min={minResult !== "" ? minResult : undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Prevent max from being less than current min
                    if (minResult !== "" && parseFloat(val) < parseFloat(minResult)) return;
                    setMaxResult(val);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* DATE FROM */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all text-sm font-medium scheme-dark"
              />
            </div>

            {/* DATE TO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:outline-none transition-all text-sm font-medium scheme-dark"
              />
            </div>

          </div>

          {/* RESET / SEARCH BUTTONS */}
          <div className="flex gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 lg:flex-none h-11 px-2 rounded-xl border border-[#212946] bg-[#05070f] hover:bg-[#11162d] text-zinc-300 hover:text-white transition-all font-semibold flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
            <button
              type="submit"
              className="flex-1 lg:flex-none h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-semibold flex items-center justify-center gap-2 text-sm uppercase tracking-wide shadow-lg shadow-indigo-600/25 cursor-pointer border-t border-indigo-400/30"
            >
              <Search className="w-4 h-4" />
              Search Results
            </button>
          </div>

        </div>

      </form>

      {/* TABLE AND DATA SECTION (Solid dark container) */}
      <div className="rounded-3xl border border-[#212946] bg-[#0c1224] shadow-2xl overflow-hidden">
        
        {/* TABLE ACTION HEADER */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0e1326]">
          <div className="text-sm font-semibold tracking-wide text-zinc-400">
            SHOWING <span className="text-white font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> - <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> OF <span className="text-indigo-400 font-bold">{totalCount}</span> RESULTS
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            {/* SORT BY */}
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-lg bg-[#05070f] border border-[#212946] text-white placeholder-zinc-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 focus:outline-none transition-all cursor-pointer text-xs font-medium"
              >
                <option value="newest" className="bg-[#05070f]">Date (Newest First)</option>
                <option value="oldest" className="bg-[#05070f]">Date (Oldest First)</option>
                <option value="athlete" className="bg-[#05070f]">Athlete (A-Z)</option>
                <option value="result-desc" className="bg-[#05070f]">Result (Highest)</option>
                <option value="result-asc" className="bg-[#05070f]">Result (Lowest)</option>
              </select>
            </div>

            {/* EXPORT */}
            <button
              onClick={handleExportCSV}
              className="h-10 px-4 rounded-lg border border-[#212946] bg-[#05070f] hover:bg-[#11162d] text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* RESULTS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-left min-w-[1000px]">
            <thead>
              <tr className="bg-[#111628] border-b border-[#212946] text-[10px] sm:text-xs font-bold tracking-wider text-zinc-400 uppercase select-none">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Athlete</th>
                <th className="py-4 px-6">Age</th>
                <th className="py-4 px-6">Gender</th>
                <th className="py-4 px-6">Sport</th>
                <th className="py-4 px-6">Activity / Event</th>
                <th className="py-4 px-6 text-center">Result</th>
                <th className="py-4 px-6">Unit</th>
                <th className="py-4 px-6">Country</th>
                <th className="py-4 px-6">Club / Team</th>
                <th className="py-4 px-6">Coach / Witness</th>
                <th className="py-4 px-6 text-center">Video</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#212946] text-xs sm:text-sm bg-[#0c1224]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-[#0c1224] transition-colors">
                    <td colSpan={12} className="py-8 px-6 text-center text-zinc-500 font-medium">
                      Loading SSP performance results data...
                    </td>
                  </tr>
                ))
              ) : processedData.length === 0 ? (
                <tr className="bg-[#0c1224]">
                  <td colSpan={12} className="py-12 px-6 text-center text-zinc-500 font-medium">
                    No athletic performances match your current filters. Try resetting the criteria.
                  </td>
                </tr>
              ) : (
                processedData.map((item, idx) => (
                  <tr 
                    key={item.id || idx} 
                    className={`transition-colors select-none ${
                      idx % 2 === 0 ? "bg-[#0c1224] hover:bg-[#151c33]" : "bg-[#0e1326] hover:bg-[#151c33]"
                    }`}
                  >
                    {/* Date */}
                    <td className="py-4 px-6 text-zinc-300 font-medium whitespace-nowrap">
                      {formatDate(item.date_of_performance)}
                    </td>

                    {/* Athlete */}
                    <td className="py-4 px-6 font-bold text-white capitalize whitespace-nowrap">
                      {item.full_name}
                    </td>

                    {/* Age */}
                    <td className="py-4 px-6 text-zinc-300 font-semibold">{item.age}</td>

                    {/* Gender */}
                    <td className="py-4 px-6 text-zinc-400 capitalize">{item.gender}</td>

                    {/* Sport */}
                    <td className="py-4 px-6 text-indigo-300 font-medium">{item.sport}</td>

                    {/* Activity */}
                    <td className="py-4 px-6 text-zinc-200 font-semibold">{item.activity}</td>

                    {/* Result */}
                    <td className="py-4 px-6 text-center text-indigo-400 font-extrabold text-[15px] font-sans tracking-wide">
                      {item.result}
                    </td>

                    {/* Unit */}
                    <td className="py-4 px-6 text-zinc-400 font-medium">{item.unit}</td>

                    {/* Country — flag image from flagcdn.com + country name */}
                    <td className="py-4 px-6 text-zinc-200 font-medium whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        {getCountryCode(item.country) ? (
                          <img
                            src={`https://flagcdn.com/20x15/${getCountryCode(item.country)}.png`}
                            alt={item.country || ""}
                            width={20}
                            height={15}
                            className="rounded-sm flex-shrink-0"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <span className="w-5 h-4 bg-zinc-700 rounded-sm flex-shrink-0 inline-block" />
                        )}
                        {item.country}
                      </span>
                    </td>

                    {/* Club */}
                    <td className="py-4 px-6 text-zinc-300 capitalize max-w-[150px] truncate">
                      {item.club_name || "—"}
                    </td>

                    {/* Coach */}
                    <td className="py-4 px-6 text-zinc-300 capitalize">{item.coach_name}</td>

                    {/* Video Link */}
                    <td className="py-4 px-6 text-center">
                      {item.video_link && item.video_link.trim() && item.video_link !== "dfgg" ? (
                        <button
                          onClick={() => handlePlayVideo(item.video_link)}
                          className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 shadow-md shadow-indigo-600/10"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION PANEL FOOTER — hidden when no data */}
        {totalCount > 0 && !loading && (
          <div className="p-6 border-t border-[#212946] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0e1326] select-none">
            <button
              onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto h-10 px-4 rounded-xl border border-[#212946] bg-[#05070f] hover:bg-[#11162d] text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {renderPageNumbers()}
            </div>

            <button
              onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto h-10 px-4 rounded-xl border border-[#212946] bg-[#05070f] hover:bg-[#11162d] text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-semibold"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* VIDEO POPUP MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-[#212946] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Title/Header */}
            <div className="p-4 border-b border-[#212946] flex justify-between items-center bg-[#0e1326]">
              <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                Performance Evidence Video Player
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-[#05070f] hover:bg-[#11162d] border border-[#212946] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Content */}
            <div className="aspect-video w-full bg-black">
              {activeVideo.startsWith("http") ? (
                <iframe
                  src={activeVideo}
                  title="Performance Video Player"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 bg-[#0c1224]">
                  <Play className="w-12 h-12 text-indigo-400/50 mb-3 animate-pulse" />
                  <p className="font-medium text-sm text-zinc-300">Invalid Video Link</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    This video URL could not be dynamically parsed. Use the direct link to review evidence.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
