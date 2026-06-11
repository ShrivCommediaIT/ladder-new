"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowLeft, X, MoveUp } from "lucide-react";

const Best5MovePlayerBox = ({ open, onClose = () => {}, onSuccessRefresh }) => {

    if (!open) return null;

  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const ladder_id = searchParams.get("ladder_id");
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");

  const [fromRank, setFromRank] = useState("");
  const [toRank, setToRank] = useState("");
  const [activeInput, setActiveInput] = useState("from");
  const [loading, setLoading] = useState(false);

  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("userData");
      if (raw) {
        setLocalUser(JSON.parse(raw));
      }
    }
  }, []);

  const user_id = localUser?.id;

  /* ------------ NUMPAD ------------ */

  const handleDigit = (digit) => {
    if (activeInput === "from") {
      if (digit === "0" && fromRank === "") return;
      setFromRank((prev) => prev + digit);
    } else {
      if (digit === "0" && toRank === "") return;
      setToRank((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (activeInput === "from") {
      setFromRank((prev) => prev.slice(0, -1));
    } else {
      setToRank((prev) => prev.slice(0, -1));
    }
  };

  /* ------------ MOVE API ------------ */

  const movePlayerDirect = async () => {
    if (!fromRank || !toRank) {
      toast.error("Enter both ranks");
      return;
    }

    try {
      setLoading(true);

      const response = await getRequest(API_ENDPOINTS.MOVE_TO, {
        user_id,
        move_from_user_id: fromRank,
        move_to_rank: toRank,
        move_from_rank: fromRank,
        ladder_id,
      });

      if (response.status === 200) {
        toast.success("Player moved successfully");

        await dispatch(fetchLeaderboard({ ladder_id, type: urlType }));
        onSuccessRefresh?.();

        setFromRank("");
        setToRank("");

        onClose(); 
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Move failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid = fromRank && toRank;

  /* ------------ UI ------------ */

  return (
    <Card className="max-w-md mx-auto rounded-2xl shadow-xl border border-border bg-card text-foreground">

      {/* Header */}

      <CardHeader className="text-center space-y-1">

        <h2 className="text-2xl font-bold text-foreground">
          Move Player
        </h2>

        <p className="text-muted-foreground text-sm">
          Enter ranks to swap players
        </p>

      </CardHeader>


      {/* Inputs */}

      <CardContent className="space-y-4">

        <div className="flex gap-3">

          <Input
            readOnly
            value={fromRank}
            placeholder="From Rank"
            onClick={() => setActiveInput("from")}
            className={`text-center text-xl font-bold cursor-pointer bg-input-theme-bg text-foreground placeholder:text-muted-foreground transition-all duration-200 border
            ${
              activeInput === "from"
                ? "border-primary ring-2 ring-primary/20"
                : "border-input-theme-border"
            }`}
          />

          <Input
            readOnly
            value={toRank}
            placeholder="To Rank"
            onClick={() => setActiveInput("to")}
            className={`text-center text-xl font-bold cursor-pointer bg-input-theme-bg text-foreground placeholder:text-muted-foreground transition-all duration-200 border
            ${
              activeInput === "to"
                ? "border-primary ring-2 ring-primary/20"
                : "border-input-theme-border"
            }`}
          />

        </div>


        {/* NUMPAD */}

        <div className="grid grid-cols-3 gap-3">

          {[1,2,3,4,5,6,7,8,9].map((num) => (
            <Button
              key={num}
              onClick={() => handleDigit(num.toString())}
              variant="secondary"
              className="h-12 text-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              {num}
            </Button>
          ))}

          <Button
            onClick={handleBackspace}
            variant="outline"
            className="h-12 cursor-pointer transition-all duration-200 hover:bg-muted"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </Button>

          <Button
            onClick={() => handleDigit("0")}
            variant="secondary"
            className="h-12 text-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            0
          </Button>

          <Button
            onClick={() => {
              setFromRank("");
              setToRank("");
            }}
            variant="destructive"
            className="h-12 cursor-pointer transition-all duration-200 hover:bg-destructive/90"
          >
            <X size={18} />
          </Button>

        </div>

      </CardContent>


      {/* Buttons */}

      <CardFooter className="flex gap-3">

        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 cursor-pointer"
        >
          Cancel
        </Button>

        <Button
          onClick={movePlayerDirect}
          disabled={!isValid || loading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer transition-all duration-200"
        >
          {loading ? "Moving..." : "Move Player"}
        </Button>

      </CardFooter>

    </Card>
  );
};

export default Best5MovePlayerBox;