"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { createLadder } from "@/redux/slices/ladderSlice";
import { uploadCSV } from "@/redux/slices/leaderboardSlice";
import { setLadderId } from "@/redux/slices/userSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLadders } from "@/redux/slices/fetchLadderSlice";

import Link from "next/link";

export default function DemoLadders() {
  const [ladderName, setLadderName] = useState("Demo Ladder");
  const [csvFile, setCsvFile] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state) => state.user?.user);
  const loading = useSelector((state) => state.createLadder?.loading);

  // ✅ Auto-load sample CSV on page load
  useEffect(() => {
  const loadDefaultCSV = async () => {
    try {
      const response = await fetch("/newLeaderboard.csv"); // public folder
      const blob = await response.blob();
      const file = new File([blob], "newLeaderboard.csv", { type: "text/csv" });
      setCsvFile(file);
    } catch (err) {
      console.error("Error loading default CSV:", err);
    }
  };

  loadDefaultCSV();
}, []);


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  // ✅ PDF open + download
  const handleDownload = (e) => {
    e.preventDefault();
    const fileUrl = "/samplePlayerLists.pdf";
    window.open(fileUrl, "_blank");
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "samplePlayerLists.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 🏗 Create Ladder
  const handleCreateLadder = async () => {
    if (!user?.id || !ladderName.trim() || !csvFile) {
      toast.warn(
        "Please enter solution name, upload CSV, and ensure user is logged in."
      );
      return;
    }

    try {
      const ladderResult = await dispatch(
        createLadder({ user_id: user.id, name: ladderName })
      ).unwrap();

      toast.success(
        ladderResult?.success_message || "Ladder created successfully."
      );

      const createdLadderId =
        ladderResult?.data?.ladder_id || ladderResult?.data?.id;

      if (createdLadderId) {
        dispatch(setLadderId(createdLadderId));
      }

      await dispatch(
        uploadCSV({ file: csvFile, ladder_id: createdLadderId })
      ).unwrap();

      toast.success("Users imported successfully!");
      dispatch(fetchLadders(user.id));

      setLadderName("Demo Ladder");
      setCsvFile(null);

      setTimeout(() => {
        router.push(`/player-list?ladder_id=${createdLadderId}`);
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#FFFFCC] min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="flex items-center flex-col justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-5xl shadow-lg border-2 rounded-lg mb-8 border-purple-300 border-dotted">
          <CardContent className="flex items-center justify-center px-2 py-4">
            <div className="w-full text-center">
              <div className="flex items-center justify-center my-4 w-full">
                <div className="flex items-center w-full max-w-md px-2 sm:px-4">
                  <div className="flex-grow border-t border-black"></div>
                  <span className="mx-2 sm:mx-4 text-blue-700 font-bold whitespace-nowrap text-sm sm:text-base">
                    Welcome to
                  </span>
                  <div className="flex-grow border-t border-black"></div>
                </div>
              </div>
              <h1 className="uppercase text-blue-700 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wide">
                Your Admin Centre
              </h1>
            </div>
          </CardContent>

          <CardContent className="space-y-6 px-4 sm:px-8">
            <p className="text-gray-700 text-base sm:text-lg text-center font-semibold">
              Here you can create new ladders and access current ones
            </p>

            <CardContent className="shadow-lg py-4 px-3 sm:px-6 border rounded-lg bg-white">
              <div className="space-y-4">
                <Label className="text-xl sm:text-2xl border-b text-blue-600 font-semibold sm:text-start md:text-start lg:text-start text-center">
                  Create a new ladder or test 'demo' ladder
                </Label>

                <div className="space-y-3 sm:space-y-2 sm:text-start md:text-start lg:text-start text-center ">
                  <p className="py-2 font-semibold text-sm sm:text-base">
                    Test 'demo' Ladder -{" "}
                    <Link
                      href="/demo-page?autoLogin=true"
                      target="_blank"
                      className="text-blue-700 underline"
                    >
                      Click here
                    </Link>{" "}
                    - You will be logged in as the player called ‘Joe Bloggs’
                  </p>

                  <p className="text-sm sm:text-base font-semibold sm:text-start md:text-start lg:text-start text-center">
                    <span className="font-semibold text-yellow-700">Note:</span>{" "}
                    as in a 'live ladder, you will only be able to 'work with'
                    Joe Bloggs' icon
                  </p>
                </div>

                <Label className="text-xl sm:text-2xl border-b text-blue-600 font-semibold">
                  Create a new ladder
                </Label>

                {/* Responsive form layout */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
                  <Input
                    placeholder="Enter solution name"
                    value={ladderName}
                    onChange={(e) => setLadderName(e.target.value)}
                    className="flex-1 rounded-md"
                  />
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full sm:w-auto rounded-md"
                  />
                  <Button
                    onClick={handleCreateLadder}
                    disabled={!ladderName || !csvFile || loading}
                    className="bg-blue-600 hover:bg-blue-700 rounded-md w-full sm:w-auto text-white hover:opacity-90"
                  >
                    {loading ? "Creating..." : "Create Ladder"}
                  </Button>
                </div>

                {/* ✅ CSV Note */}
                <div className="mb-4 sm:text-start md:text-start lg:text-start text-center">
                  <span className="font-semibold text-sm sm:text-base">
                    <span className="text-yellow-700">Note:</span> Your CSV file
                    must be in this exact format -{" "}
                  </span>
                  <a
                    href="/samplePlayerLists.pdf"
                    onClick={handleDownload}
                    className="cursor-pointer underline text-blue-700 font-semibold text-sm sm:text-base"
                  >
                    Click here to see example
                  </a>
                  <br />
                  <br />
                  <p className="text-center text-sm sm:text-start sm:text-sm font-semibold bg-yellow-300 px-2 py-1 rounded-sm">
                    For a quick trial, you do not need phone numbers
                  </p>
                </div>
              </div>
            </CardContent>

            <p className="text-xs sm:text-sm text-gray-600 mt-6 text-end font-semibold">
              Any Questions:{" "}
              <span className="font-semibold text-blue-600">
                support@sportssolutionspro.com
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
