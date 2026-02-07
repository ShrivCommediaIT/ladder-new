

"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import axios from "axios";

import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

const Best5MovePlayerBox = ({ onCancel }) => {
  const [fromRank, setFromRank] = useState("");
  const [toRank, setToRank] = useState("");
  const [activeInput, setActiveInput] = useState("from");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

    const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("userData");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setLocalUser(parsed);
          console.log("local user loaded:", parsed);
        } catch (e) {
          console.error("Invalid userData in localStorage");
        }
      }
    }
  }, []);

   const user_id = localUser?.id;

  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");

  /* ---------------- NUMPAD ---------------- */

  const handleDigit = (digit) => {
    if (activeInput === "from") setFromRank((prev) => prev + digit);
    else setToRank((prev) => prev + digit);
  };

  const handleBackspace = () => {
    if (activeInput === "from") setFromRank((prev) => prev.slice(0, -1));
    else setToRank((prev) => prev.slice(0, -1));
  };

  /* ---------------- DIRECT MOVE API ---------------- */

  const movePlayerDirect = async () => {
    if (!fromRank || !toRank) {
      toast.error("Both ranks are required");
      return;
    }

    if (!ladder_id) {
      toast.error("Ladder id missing");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        "https://ne-games.com/leaderBoard/api/user/move_to",
        {
          params: {
            user_id,
            move_from_user_id: fromRank,
            move_to_rank: toRank,
            move_from_rank: fromRank,
            ladder_id,
          },
          headers: { APPKEY },
        }
      );

      const data = response.data;

      if (data.status === 200) {
        toast.success(data.message || "Move Successful");

        // refresh leaderboard
        dispatch(fetchLeaderboard({ ladder_id }));

        setFromRank("");
        setToRank("");

        if (onCancel) onCancel();
      } else {
        toast.error(data.message || "Move failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Move failed, please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Card className="max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4 space-y-4">
      <CardHeader className="text-center">
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Move Player
        </h2>
        <p className="text-sm text-white/70 mt-1">
          Enter the ranks to swap
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input
            readOnly
            value={fromRank}
            placeholder="From Rank"
            onFocus={() => setActiveInput("from")}
            className={`text-center ${
              activeInput === "from" ? "border-cyan-400" : "border-gray-300"
            }`}
          />
          <Input
            readOnly
            value={toRank}
            placeholder="To Rank"
            onFocus={() => setActiveInput("to")}
            className={`text-center ${
              activeInput === "to" ? "border-cyan-400" : "border-gray-300"
            }`}
          />
        </div>

        {/* NUMPAD */}
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3,4,5,6,7,8,9,0].map((num) => (
            <Button
              key={num}
              variant="outline"
              onClick={() => handleDigit(num.toString())}
              className="py-3 text-lg hover:bg-cyan-500 hover:text-white"
            >
              {num}
            </Button>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleBackspace}
          variant="secondary"
          className="w-full sm:flex-1"
        >
          ⬅ Backspace
        </Button>

        <Button
          onClick={onCancel}
          variant="destructive"
          className="w-full sm:flex-1"
        >
          ✖ Cancel
        </Button>

        <Button
          onClick={movePlayerDirect}
          disabled={loading}
          className="w-full sm:flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          {loading ? "Moving..." : "✔ Move"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Best5MovePlayerBox;
