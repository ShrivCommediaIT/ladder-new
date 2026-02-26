"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLeaderboard, uploadCSV } from "@/redux/slices/leaderboardSlice";
import { UploadCloud } from "lucide-react";

const UploadPlayerLists = ({ onSuccessClose, ladderId }) => {
  const dispatch = useDispatch();

  /* ---------------- REDUX STATE ---------------- */

  const leaderboard = useSelector((state) => state.leaderboard || {});
  const loading = leaderboard.loading || false;
  const reduxUser = useSelector((state) => state.user?.user);

  /* ---------------- LOCAL USER FALLBACK ---------------- */

  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("userData") || localStorage.getItem("subAdmin"); 
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setLocalUser(parsed);
        } catch (e) {
          console.error("Invalid userData in localStorage");
        }
      }
    }
  }, []);


  // redux first, fallback localStorage
  const user = reduxUser || localUser;

  // ladderId priority: prop → user.ladder_id
  const effectiveLadderId = ladderId || user?.ladder_id;

  /* ---------------- LOCAL STATE ---------------- */

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  /* ---------------- FETCH LEADERBOARD ---------------- */

  useEffect(() => {
    if (effectiveLadderId) {
      dispatch(fetchLeaderboard({ ladder_id: effectiveLadderId }));
    }
  }, [dispatch, effectiveLadderId]);

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

    if (file.type !== "text/csv") {
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
        uploadCSV({ file, ladder_id: effectiveLadderId })
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

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 relative">
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
        <div className="p-4 bg-blue-50 rounded-full shadow-inner">
          <UploadCloud className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Upload Player List (CSV)
        </h2>
        <p className="text-sm text-gray-500">
          Upload your tournament/ladder players in bulk using a CSV file.
        </p>
      </div>

      {/* ADMIN ONLY */}
      {user?.user_type === "admin" || user?.user_type === "sub_admin" && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile && selectedFile.type !== "text/csv") {
                toast.error("Please upload a valid CSV file.");
                setFile(null);
              } else {
                setFile(selectedFile);
              }
            }}
            className="w-full sm:w-56 rounded-lg shadow-sm border border-blue-300 font-mono text-sm"
          />

          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full sm:w-auto rounded-lg bg-blue-600 font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            {loading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      )}

      {/* NOT ADMIN MESSAGE */}
      {user &&
  user.user_type !== "admin" &&
  user.user_type !== "sub_admin" && (
    <p className="text-center text-red-500 font-medium">
      Only admin or sub admin can upload CSV
    </p>
)}

      {/* PROGRESS */}
      {progress > 0 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner relative">
          <div
            className="bg-blue-600 h-5 rounded-full transition-all duration-300 flex items-center justify-center"
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
