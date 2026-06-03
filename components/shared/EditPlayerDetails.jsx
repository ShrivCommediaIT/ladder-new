

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import {
  editUserDetails,
  resetEditPlayerState,
} from "@/redux/slices/editdetailSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { calculateAge, parseDobToDate } from "@/lib/utils";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";

const EditPlayerDetails = ({
  userId,
  ladderId,
  selectedPlayer,
  onClose = () => {},
  userLevel = false,
}) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderTypeFromUrl = searchParams.get("type") || searchParams.get("ladder_type");


  const { loading, successMessage, error } = useSelector(
    (state) => state.editdetail
  );
  const [form, setForm] = useState({
    id: "",
    user_id: "",
    name: "",
    dob: null,
    phone: "",
    gender: "",
  });

  const [showSkeleton, setShowSkeleton] = useState(false);

  // Prefill form strictly from selectedPlayer (id/user_id/name/phone/dob)
  useEffect(() => {
    if (selectedPlayer) {
      const parsedDob = parseDobToDate(selectedPlayer.dob);

      let correctId = selectedPlayer.id;
      if (!correctId && selectedPlayer.user_id && !isNaN(Number(selectedPlayer.user_id))) {
        correctId = Number(selectedPlayer.user_id);
      }
      if (!correctId && userId && !isNaN(Number(userId))) {
        correctId = Number(userId);
      }

      const idStr = correctId ? correctId.toString() : "";

      setForm({
        id: idStr,
        user_id: idStr,
        dob: parsedDob,
        name: selectedPlayer.name || "",
        phone: selectedPlayer.phone || "",
        gender: selectedPlayer.gender || "",
      });
    } else if (userId) {
      setForm((prev) => ({
        ...prev,
        id: userId.toString(),
        user_id: userId.toString(),
      }));
    }
  }, [selectedPlayer, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setForm((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const targetUserId = form.user_id || form.id || userId;

    const cleanPhone = form.phone ? form.phone.trim().replace(/\D/g, "") : "";
    if (cleanPhone && cleanPhone.length !== 11) {
      toast.error("Phone number must be exactly 11 digits");
      return;
    }

    const formData = userLevel
      ? {
          id: form.id || targetUserId,
          user_id: targetUserId,
          name: form.name,
          phone: cleanPhone,
        }
      : {
          id: form.id || targetUserId,
          user_id: targetUserId,
          name: form.name,
          phone: cleanPhone,
          gender: form.gender,
          dob: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
          age: calculateAge(form.dob),
        };

    setShowSkeleton(true);
    dispatch(editUserDetails({ user_id: targetUserId, formData }));
  };

  useEffect(() => {
    if (successMessage) {
      setShowSkeleton(false); // ✅ Turn off skeleton immediately on success!

      if (ladderId) {
        if (ladderTypeFromUrl === "roster") {
          dispatch(fetchRosterLeaderboard({ ladder_id: ladderId }));
        } else if (ladderTypeFromUrl === "skill") {
          dispatch(fetchSkillLeaderboard({ ladder_id: ladderId, type: "skill" }));
        } else {
          dispatch(
            fetchLeaderboard({ ladder_id: ladderId, type: ladderTypeFromUrl })
          );
        }
        dispatch(
          fetchMiniLeague({ ladder_id: ladderId, ladderType: "minileague" })
        );
      }

      dispatch(resetEditPlayerState());
      onClose(); // ✅ Close immediately!
    }

    if (error) {
      setShowSkeleton(false);
      toast.error(error);
      dispatch(resetEditPlayerState());
    }
  }, [successMessage, error, dispatch, ladderId, onClose]);

  return (
    <Card className="max-w-md mx-auto mt-2 shadow-none rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/55">
      <CardContent className="p-4 space-y-3">
        {selectedPlayer?.name && (
          <div className="text-center bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/50 rounded-lg p-2.5">
            <p className="text-cyan-800 dark:text-cyan-200 font-semibold text-base">
              Editing: {selectedPlayer.name}
            </p>
            <p className="text-cyan-600 dark:text-cyan-400 text-xs opacity-90">
              Rank: {selectedPlayer.rank || "N/A"}
            </p>
          </div>
        )}

        {showSkeleton ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-9 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-9 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-9 w-full rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label
                htmlFor="name"
                className="text-slate-700 dark:text-slate-300 font-semibold py-1 text-sm block"
              >
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter player name"
                className="text-slate-900 bg-white border-slate-200 dark:text-white dark:bg-slate-800/50 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 h-10 rounded-xl"
              />
            </div>


            {!userLevel && (
              <div>
                <Label
                  htmlFor="dob"
                  className="text-slate-700 dark:text-slate-300 font-semibold py-1 text-sm block"
                >
                  Date of Birth
                </Label>

                <DateOfBirthInput
                  id="dob"
                  value={form.dob}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      dob: date,
                    }))
                  }
                  className="text-slate-900 px-4 bg-white border-slate-200 dark:text-white dark:bg-slate-800/50 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 h-10 rounded-xl w-full"
                />
              </div>
            )}

            <div>
              <Label
                htmlFor="phone"
                className="text-slate-700 dark:text-slate-300 font-semibold py-1 text-sm block"
              >
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                maxLength={11}
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="Enter 11 digit phone number (Optional)"
                className="text-slate-900 bg-white border-slate-200 dark:text-white dark:bg-slate-800/50 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 h-10 rounded-xl"
              />
            </div>

            {!userLevel && (
              <div className="w-full">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold py-1 text-sm block">Gender</Label>
                <Select
                  key={form.gender}
                  value={form.gender}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
                >
                  <SelectTrigger className="bg-white border-slate-200 w-full text-slate-900 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white focus:border-cyan-500 focus:ring-cyan-500 focus:ring-1 h-10 rounded-xl">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-md transition-all duration-200 mt-2"
              disabled={loading || !form.name.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default EditPlayerDetails;
