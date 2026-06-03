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
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { calculateAge, parseDobToDate } from "@/lib/utils";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";
import CountrySelect from "@/components/shared/CountrySelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    gender: "",
    country: "",
  });

  const [showSkeleton, setShowSkeleton] = useState(false);
  console.log("Selected Player in Edit Form:", selectedPlayer);
  // Auto-fill strictly from selectedPlayer (id/user_id/name/phone/dob)
  useEffect(() => {
    if (selectedPlayer) {
      const initialDob = parseDobToDate(selectedPlayer.dob);
      setForm({
        id: (selectedPlayer.id ?? selectedPlayer.user_id)?.toString() || "",
        user_id:
          (selectedPlayer.user_id ?? selectedPlayer.id)?.toString() || "",
        name: selectedPlayer.name || "",
        dob: initialDob,
        phone: selectedPlayer.phone || "",
        gender: selectedPlayer.gender || "",
        country: selectedPlayer.country || "",
      });
  console.log("Selected Player in Edit Form:", selectedPlayer.gender);

    } else if (userId) {
      // Fallback if somehow selectedPlayer missing
      setForm({
        id: userId.toString(),
        user_id: userId.toString(),
        name: "",
        dob: null,
        phone: "",
        country: "",
      });
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

    if (!form.user_id || !form.id) {
      toast.error("User ID or Player ID is missing.");
      return;
    }

    const cleanPhone = form.phone ? form.phone.trim().replace(/\D/g, "") : "";
    if (cleanPhone && cleanPhone.length !== 11) {
      toast.error("Phone number must be exactly 11 digits");
      return;
    }

    const formData = {
      id: form.id,
      name: form.name,
      dob: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
      age: calculateAge(form.dob),
      phone: cleanPhone,
      gender: form.gender,
      country: form.country,
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


      console.log("Selected Player in Edit Form:==>1", form);


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

              <DateOfBirthInput
                id="dob"
                value={form.dob}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    dob: date,
                  }))
                }
                className="text-white px-4 bg-white border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
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
                maxLength={11}
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="Enter 11 digit phone number (Optional)"
                className="text-white bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
              />
            </div>

            <div className="w-full">
              <Label className="text-gray-300 font-semibold py-2 text-lg">Gender</Label>
              <Select
                key={form.gender}
                value={form.gender}
                onValueChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-500 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Label className="text-gray-300 font-semibold py-2 text-lg">Country</Label>
              <CountrySelect
                value={form.country}
                onValueChange={(val) => setForm((prev) => ({ ...prev, country: val }))}
                className="bg-gray-700/50 border-gray-500 text-white w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
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
