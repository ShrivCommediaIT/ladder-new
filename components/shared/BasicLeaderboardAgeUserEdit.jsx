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
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { calculateAge } from "@/lib/utils";

const BasicLeaderboardAgeUserEdit = ({
  userId,
  ladderId,
  selectedPlayer,
  onClose = () => {},
}) => {

  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderTypeFromUrl = searchParams.get("type") || searchParams.get("ladder_type");
  const { loading, successMessage, error } = useSelector(
    (state) => state.editdetail,
  );

  const [form, setForm] = useState({
    id: "",
    user_id: "",
    name: "",
    dob: null,
    phone: "",
  });

  const [showSkeleton, setShowSkeleton] = useState(false);

  // Auto-fill strictly from selectedPlayer (id/user_id/name/phone/dob)
  useEffect(() => {
    if (selectedPlayer) {
      let initialDob = null;
      if (selectedPlayer.dob) {
        if (selectedPlayer.dob instanceof Date) {
          initialDob = selectedPlayer.dob;
        } else if (typeof selectedPlayer.dob === "string") {
          if (selectedPlayer.dob.includes("-")) {
            // Handle YYYY-MM-DD (e.g., 2010-04-07)
            const parts = selectedPlayer.dob.split("-");
            if (parts.length === 3) {
              initialDob = new Date(parts[0], parts[1] - 1, parts[2]);
            }
          } else if (selectedPlayer.dob.includes("/")) {
            // Handle DD/MM/YYYY
            const parts = selectedPlayer.dob.split("/");
            if (parts.length === 3) {
              initialDob = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          }

          if (!initialDob) {
            initialDob = new Date(selectedPlayer.dob);
          }
        }
      }

      setForm({
        id: (selectedPlayer.id ?? selectedPlayer.user_id)?.toString() || "",
        user_id:
          (selectedPlayer.user_id ?? selectedPlayer.id)?.toString() || "",
        name: selectedPlayer.name || "",
        dob: initialDob && !isNaN(initialDob.getTime()) ? initialDob : null,
        phone: selectedPlayer.phone || "",
      });
    } else if (userId) {
      // Fallback if somehow selectedPlayer missing
      setForm({
        id: userId.toString(),
        user_id: userId.toString(),
        name: "",
        dob: null,
        phone: "",
      });
    }
  }, [selectedPlayer, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.user_id || !form.id) {
      toast.error("User ID or Player ID is missing.");
      return;
    }

    const formData = {
      id: form.id,
      name: form.name,
      dob: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
      age: calculateAge(form.dob),
      phone: form.phone,
    };

    setShowSkeleton(true);
    dispatch(editUserDetails({ user_id: form.user_id, formData }));
  };

  useEffect(() => {
    if (successMessage) {
      // toast.success("Profile updated successfully!  Refreshing...");
      const timer = setTimeout(() => {
        setShowSkeleton(false);

        if (ladderId) {
          dispatch(fetchLeaderboard({ ladder_id: ladderId, type: ladderTypeFromUrl }));
          dispatch(
            fetchMiniLeague({ ladder_id: ladderId, ladderType: "minileague" }),
          );
        }

        dispatch(resetEditPlayerState());
        onClose();
      }, 1200);

      return () => clearTimeout(timer);
    }

    if (error) {
      setShowSkeleton(false);
      toast.error(error);
      dispatch(resetEditPlayerState());
    }
  }, [successMessage, error, dispatch, ladderId, onClose]);

  return (
    <Card className="max-w-full mx-auto mt-6 shadow-xl rounded-2xl bg-gray-800 border border-gray-600">
      <CardContent className="p-6 space-y-4">
        {selectedPlayer?.name && (
          <div className="text-center bg-blue-900/50 border border-blue-500/50 rounded-lg p-3">
            <p className="text-blue-200 font-semibold text-lg">
              Editing: {selectedPlayer.name}
            </p>
            <p className="text-blue-300 text-sm opacity-90">
              Rank: {selectedPlayer.rank || "N/A"}
            </p>
          </div>
        )}

        {showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-6 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-gray-300 font-semibold py-2 text-lg"
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
                className="text-white bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
              />
            </div>

            <div>
              <Label
                htmlFor="dob"
                className="text-gray-300 font-semibold py-2 text-lg"
              >
                Date of Birth
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    id="dob"
                    readOnly
                    value={form.dob ? format(form.dob, "dd/MM/yyyy") : ""}
                    placeholder="Enter Date of Birth"
                    className="text-white text-start px-4 bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12 cursor-pointer"
                  />
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 bg-slate-300 border-gray-700">
                  <Calendar
                    mode="single"
                    selected={form.dob}
                    onSelect={(date) =>
                      setForm((prev) => ({
                        ...prev,
                        dob: date,
                      }))
                    }
                    captionLayout="dropdown"
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label
                htmlFor="phone"
                className="text-gray-300 font-semibold py-2 text-lg"
              >
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number (Optional)"
                className="text-white bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200"
              disabled={loading || !form.name.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

export default BasicLeaderboardAgeUserEdit;
