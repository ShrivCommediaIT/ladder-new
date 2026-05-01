

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
    gender: "male",
  });

  const [showSkeleton, setShowSkeleton] = useState(false);

  // Prefill form strictly from selectedPlayer (id/user_id/name/phone/dob)
  useEffect(() => {
    if (selectedPlayer) {
      const parsedDob = parseDobToDate(selectedPlayer.dob);

      setForm({
        id: (selectedPlayer.id ?? selectedPlayer.user_id)?.toString() || "",
        user_id:
          (selectedPlayer.user_id ?? selectedPlayer.id)?.toString() || "",
        dob: parsedDob,
        name: selectedPlayer.name || "",
        phone: selectedPlayer.phone || "",
        gender: selectedPlayer.gender || "male",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.user_id || !form.id) {
      toast.error("User ID or Player ID is missing.");
      return;
    }

    const formData = {
      id: form.id,
      name: form.name,
      phone: form.phone,
      gender: form.gender,
      dob: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
      age: calculateAge(form.dob),
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
          if (ladderTypeFromUrl === "roster") {
            dispatch(fetchRosterLeaderboard({ ladder_id: ladderId }));
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
    <Card className="max-w-md mx-auto mt-6 shadow-xl rounded-2xl bg-gray-800 border border-gray-600">
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

              <DateOfBirthInput
                id="dob"
                value={form.dob}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    dob: date,
                  }))
                }
                className="text-white px-4 bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
              />
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

            <div className="w-full">
              <Label className="text-gray-300 font-semibold py-2 text-lg">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-500 w-full text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
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

export default EditPlayerDetails;
