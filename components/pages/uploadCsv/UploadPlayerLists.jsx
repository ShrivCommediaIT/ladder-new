"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLeaderboard, uploadCSV } from "@/redux/slices/leaderboardSlice";
import { UploadCloud } from "lucide-react";
import { useSearchParams } from "next/navigation";

const UploadPlayerLists = ({ onSuccessClose, ladderId, ladderType }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderTypeFromUrl = ladderType || searchParams.get("type") || searchParams.get("ladder_type");

  /* ---------------- REDUX STATE ---------------- */

  const leaderboard = useSelector((state) => state.player || {});
  const loading = leaderboard.loading || false;
  const reduxUser = useSelector((state) => state.user?.user);

  /* ---------------- LOCAL USER FALLBACK ---------------- */

  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("userData") || sessionStorage.getItem("subAdmin"); 
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setLocalUser(parsed);
        } catch (e) {
          console.error("Invalid userData in sessionStorage");
        }
      }
    }
  }, []);


  // redux first, fallback sessionStorage
  const user = reduxUser || localUser;

  // ladderId priority: prop → user.ladder_id
  const effectiveLadderId = ladderId || user?.ladder_id;

  /* ---------------- LOCAL STATE ---------------- */

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  /* ---------------- FETCH LEADERBOARD ---------------- */

  useEffect(() => {
    if (effectiveLadderId) {
      dispatch(fetchLeaderboard({ ladder_id: effectiveLadderId, type: ladderTypeFromUrl }));
    }
  }, [dispatch, effectiveLadderId, ladderTypeFromUrl]);

  /* ---------------- UPLOAD ---------------- */

  const handleUpload = async () => {
    if (!effectiveLadderId) {
      toast.error("Ladder ID not found");
      return;
    }

    if (!file) {
      toast.warn("Please select a CSV file first.");
      return;
    }

    const isCsvFile = file.type === "text/csv" || file.name?.toLowerCase().endsWith(".csv");

    if (!isCsvFile) {
      toast.error("Only CSV files are allowed.");
      return;
    }

    try {
      setProgress(10);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      await dispatch(
        uploadCSV({ file, ladder_id: effectiveLadderId, type: ladderTypeFromUrl })
      ).unwrap();

      clearInterval(interval);
      setProgress(100);

      setFile(null);

      if (typeof onSuccessClose === "function") {
        onSuccessClose();
      }

      setTimeout(() => setProgress(0), 1000);
    } catch (err) {
      setProgress(0);
      toast.error("Failed to upload CSV. Please try again.");
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const isCsvFile =
      selectedFile.type === "text/csv" ||
      selectedFile.name?.toLowerCase().endsWith(".csv");

    if (!isCsvFile) {
      toast.error("Please upload a valid CSV file.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  /* ---------------- DRAG & DROP HANDLERS ---------------- */

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 max-w-lg mx-auto bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 relative transition-colors duration-200">
      <ToastContainer
        position="top-right"
        autoClose={7000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      {/* HEADER */}
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Upload Player List (CSV)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload your tournament/ladder players in bulk using a CSV file.
        </p>
      </div>

      {/* ADMIN ONLY */}
      {(user?.user_type === "admin" || user?.user_type === "sub_admin") && (
        <div className="flex flex-col items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* DRAG AND DROP AREA */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 dark:border-blue-400 scale-[1.01]"
                : "border-gray-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-slate-800/80"
            }`}
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-full mb-3 text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag & drop CSV file
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Only .csv files are supported</p>

            {file && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 max-w-full truncate rounded-lg bg-blue-100 dark:bg-blue-950/80 dark:border dark:border-blue-800/60 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2"
              >
                <span>📄 {file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-bold ml-1"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS SIDE BY SIDE */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-1/2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold rounded-lg"
            >
              Choose CSV File
            </Button>

            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full sm:w-1/2 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload CSV"}
            </Button>
          </div>
        </div>
      )}

      {/* NOT ADMIN MESSAGE */}
      {user &&
        user.user_type !== "admin" &&
        user.user_type !== "sub_admin" && (
          <p className="text-center text-red-500 dark:text-red-400 font-medium">
            Only admin or sub admin can upload CSV
          </p>
        )}

      {/* PROGRESS */}
      {progress > 0 && (
        <div className="mt-4 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-5 overflow-hidden shadow-inner relative">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-5 rounded-full transition-all duration-300 flex items-center justify-center"
            style={{ width: `${progress}%` }}
          >
            <span className="text-xs text-white font-semibold">
              {progress}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPlayerLists;
