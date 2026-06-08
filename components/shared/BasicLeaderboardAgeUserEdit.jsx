"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { ToastContainer, toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { calculateAge, parseDobToDate } from "@/lib/utils";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";
import CountrySelect from "@/components/shared/CountrySelect";
import { createPortal } from "react-dom";
import { COUNTRIES } from "@/constants/countries";


const EDIT_FORM_TOAST_CONTAINER_ID = "basic-leaderboard-age-user-edit";
const editFormToastOptions = { containerId: EDIT_FORM_TOAST_CONTAINER_ID };

const normalizeCountry = (countryValue) => {
  const normalizedCountry = String(countryValue || "").trim().toLowerCase();
  if (!normalizedCountry) return "";

  const matchedCountry = COUNTRIES.find(
    (country) =>
      country.name.toLowerCase() === normalizedCountry ||
      country.code.toLowerCase() === normalizedCountry,
  );

  return matchedCountry?.name || countryValue;
};

const BasicLeaderboardAgeUserEdit = ({
  userId,
  ladderId,
  selectedPlayer,
  onClose = () => { },
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

  const [genderOpen, setGenderOpen] = useState(false);
  const genderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genderRef.current && !genderRef.current.contains(e.target)) {
        setGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [toastPortalReady, setToastPortalReady] = useState(false);
  console.log("Selected Player in Edit Form:", selectedPlayer);

  useEffect(() => {
    setToastPortalReady(true);
  }, []);

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
        country: normalizeCountry(selectedPlayer.country),
      });

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
  }, [
    selectedPlayer?.country,
    selectedPlayer?.dob,
    selectedPlayer?.gender,
    selectedPlayer?.id,
    selectedPlayer?.name,
    selectedPlayer?.phone,
    selectedPlayer?.user_id,
    userId,
  ]);

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
      toast.error("User ID or Player ID is missing.", editFormToastOptions);
      return;
    }

    const cleanPhone = String(form.phone || "").trim().replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length !== 11) {
      toast.error("Phone number must be exactly 11 digits", {
        ...editFormToastOptions,
        toastId: "phone-number-length-error",
      });
      document.getElementById("phone")?.focus();
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
      toast.success("Profile updated successfully!", editFormToastOptions);
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
      toast.error(error, editFormToastOptions);
      dispatch(resetEditPlayerState());
    }
  }, [successMessage, error, dispatch, ladderId, onClose]);


  return (
    <>
      {toastPortalReady &&
        createPortal(
          <ToastContainer
            containerId={EDIT_FORM_TOAST_CONTAINER_ID}
            position="top-right"
            autoClose={3000}
            hideProgressBar
            theme="colored"
            style={{ zIndex: 100000 }}
          />,
          document.body,
        )}
      <Card className="max-w-full mx-auto mt-6 shadow-xl rounded-2xl bg-card border border-border">
        <CardContent className="p-6 space-y-4">
          {selectedPlayer?.name && (
            <div className="text-center bg-accent border border-border rounded-lg p-3">
              <p className="text-dark font-semibold text-lg">
                Editing: {selectedPlayer.name}
              </p>
              <p className="text-dark/70 text-sm opacity-90">
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
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label
                  htmlFor="name"
                  className="text-foreground font-semibold py-2 text-lg"
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
                  className="text-foreground bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/50 h-12"
                />
              </div>

              <div>
                <Label
                  htmlFor="dob"
                  className="text-foreground font-semibold py-2 text-lg"
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
                  className="text-foreground px-4 bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/50 h-12"
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="text-foreground font-semibold py-2 text-lg"
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
                  className="text-foreground bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/50 h-12"
                />
              </div>

              <div className="w-full" ref={genderRef}>
                <Label className="text-foreground font-semibold py-2 text-lg">Gender</Label>

                {/* Custom theme-aware gender dropdown */}
                <div className="relative mt-1">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setGenderOpen((o) => !o)}
                    className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-left text-foreground text-sm flex items-center justify-between gap-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <span className={form.gender ? "text-foreground" : "text-muted-foreground"}>
                      {form.gender === "male" ? "Male" : form.gender === "female" ? "Female" : "Select Gender"}
                    </span>
                    {/* Chevron */}
                    <svg
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {genderOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                      {[
                        { value: "", label: "Select Gender", placeholder: true },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, gender: opt.value }));
                            setGenderOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors
                            ${
                              opt.placeholder
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }
                            hover:bg-muted
                          `}
                        >
                          {opt.label}
                          {form.gender === opt.value && !opt.placeholder && (
                            <svg className="w-4 h-4 text-primary shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full">
                <Label className="text-foreground font-semibold py-2 text-lg">Country</Label>
                <CountrySelect
                  value={form.country}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, country: val }))}
                  className="bg-muted border-border text-foreground w-full focus:border-primary focus:ring-2 focus:ring-primary/50 h-12"
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
    </>
  );
};

export default BasicLeaderboardAgeUserEdit;
