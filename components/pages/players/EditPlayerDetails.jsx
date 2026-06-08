
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import {
  editUserDetails,
  resetEditPlayerState,
} from "@/redux/slices/editdetailSlice";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";
import CountrySelect from "@/components/shared/CountrySelect";

import { fetchMiniLeague } from "@/redux/slices/minileagueSlice"; // ✅ ADDED FOR MINILEAGUE
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchRosterLeaderboard } from "@/redux/slices/rosterLeaderboardSlice";
import { fetchSkillLeaderboard } from "@/redux/slices/BasicLeaderboardSlice";
import { format } from "date-fns";
import { calculateAge, parseDobToDate } from "@/lib/utils";

const EditPlayerDetails = ({ userId, ladderId, minileagueSelectedPlayer = null, onClose = () => {}, isReadOnly = false }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladderType = searchParams.get("type")
  const ladder_id = ladderId || searchParams.get("ladder_id"); // ✅ PRIORITIZE PROPS LADDER ID

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const players =
    useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];

  const minileagueData = minileagueSelectedPlayer || []; // ✅ MINILEAGUE DATA


  const numericUserId = Number(userId);
  

  const { loading, successMessage, error } = useSelector(
    (state) => state.editdetail
  );

  const [form, setForm] = useState({
    id: "",
    user_id: "",
    name: "",
    dob:null,
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
  const cardRef = useRef(null);

  useEffect(() => {
    let selectedPlayer;
    if(ladderType === "minileague"){
       selectedPlayer = minileagueSelectedPlayer
    }else{
       selectedPlayer =
    players.length > 0
      ? players.find((p) => Number(p.id) === numericUserId)
      : null;
    }
    setSelectedPlayer(selectedPlayer);
    
  }, []);

  // GSAP: animate card entrance
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
      }
    );
  }, []);

  // Prefill form
  useEffect(() => {
    if (selectedPlayer) {
      const parsedDob = parseDobToDate(selectedPlayer.dob);

      setForm({
        id: selectedPlayer.id || "",
        user_id:
          selectedPlayer.user_id?.toString() ||
          selectedPlayer.id?.toString() ||
          "",
        dob: parsedDob,
        name: selectedPlayer.name || "",
        phone: selectedPlayer.phone || "",
        gender: selectedPlayer.gender || "",
        country: selectedPlayer.country || "",
      });
    }
    
  }, [selectedPlayer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 11) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.user_id || !form.id) {
      toast.error("User ID or Player ID is missing.");
      return;
    }

    if (form.phone && form.phone.trim().replace(/\D/g, "").length !== 11) {
      toast.error("Phone number must be exactly 11 digits!");
      return;
    }

    const formData = { id: form.id, name: form.name, phone: form.phone, gender: form.gender, dob: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
          age: calculateAge(form.dob), country: form.country };

    setShowSkeleton(true);
    dispatch(editUserDetails({ user_id: form.user_id, formData }));
  };

  // ✅ FIXED: Real-time refresh on success (SAME AS IMAGE UPLOAD)
  useEffect(() => {
    if (successMessage) {
      setShowSkeleton(false); // ✅ Turn off skeleton immediately on success!

      // ✅ REAL-TIME REFRESH - SUPPORT ALL LADDERS INSTANTLY
      if (ladder_id) {
        const urlType = searchParams.get("type") || searchParams.get("ladder_type");
        if (urlType === "roster") {
          dispatch(fetchRosterLeaderboard({ ladder_id }));
        } else if (urlType === "skill") {
          dispatch(fetchSkillLeaderboard({ ladder_id, type: "skill" }));
        } else {
          dispatch(fetchLeaderboard({ ladder_id, type: urlType }));
        }
        dispatch(fetchMiniLeague({ ladder_id, ladderType: "minileague" }));
      }
      
      dispatch(resetEditPlayerState());
      onClose(); // ✅ Close immediately!
    }

    if (error) {
      setShowSkeleton(false);
      toast.error(error);
      dispatch(resetEditPlayerState());
    }
  }, [successMessage, error, dispatch, ladder_id, onClose]);

  // Handle no players
  if (!players.length && !minileagueData.length) {
    return (
      <Card className="max-w-md mx-auto mt-10 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-6 text-center text-white">
          Loading players...
        </CardContent>
      </Card>
    );
  }



  if (!selectedPlayer) {
    return (
      <Card className="max-w-md mx-auto mt-10 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-2xl">
        <CardContent className="p-6 text-center text-white">
          Could not find player with ID {numericUserId}.
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-full"
    >
      <Card className="bg-gradient-to-br from-[#0f172a]/90 to-[#1e3a8a]/80 border border-white/20 shadow-2xl rounded-xl p-1 backdrop-blur-lg">
        <CardContent className="p-6 text-white">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-center bg-gradient-to-r from-blue-100 to-cyan-300 text-transparent bg-clip-text mb-4"
          >
            Edit Player Details 
          </motion.h2>

          {showSkeleton ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-white/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <Label htmlFor="name" className="text-blue-200 mb-2 font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-white/10 border-white/30 text-white focus:ring-2 focus:ring-cyan-400 py-6"
                  required
                />
              </motion.div>

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

              <motion.div whileHover={{ scale: 1.02 }}>
                <Label htmlFor="phone" className="text-blue-200 mb-2 font-semibold">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={11}
                  value={form.phone}
                  onChange={handleChange}
                  className="bg-white/10 py-6 border-white/30 text-white focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter 11 digit phone number (Optional)"
                />
              </motion.div>

              {/* GENDER */}
              { ladderType !== "minileague" && <motion.div whileHover={{ scale: 1.02 }} className="space-y-2 w-full" ref={genderRef}>
                <Label className="text-blue-200 font-semibold">Gender</Label>

                {/* Custom theme-aware gender dropdown */}
                <div className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => !isReadOnly && setGenderOpen((o) => !o)}
                    disabled={isReadOnly}
                    className={`h-12 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-left text-sm flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-white ${isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className={form.gender ? "text-white" : "text-white/50"}>
                      {form.gender === "male" ? "Male" : form.gender === "female" ? "Female" : "Select Gender"}
                    </span>
                    {/* Chevron */}
                    <svg
                      className={`w-4 h-4 text-white/60 shrink-0 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {genderOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/20 bg-slate-800 shadow-lg overflow-hidden">
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
                          className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors hover:bg-white/10
                            ${opt.placeholder ? "text-white/40" : "text-white"}
                          `}
                        >
                          {opt.label}
                          {form.gender === opt.value && !opt.placeholder && (
                            <svg className="w-4 h-4 text-cyan-400 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>}

              {/* COUNTRY */}
              <motion.div whileHover={{ scale: 1.02 }} className="space-y-2 w-full">
                <Label className="text-blue-200 font-semibold">Country</Label>
                <CountrySelect
                  value={form.country}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, country: val }))}
                  className="bg-white/10 border-white/30 text-white w-full focus:ring-2 focus:ring-cyan-400 py-6 h-12"
                />
              </motion.div>

              <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    className={`w-full bg-gradient-to-r from-cyan-700 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg transition-all duration-300 ${isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={loading || isReadOnly}
                  >
                    {loading ? "Saving..." : (isReadOnly ? "Read Only Mode" : " Save Changes")}
                  </Button>
              </motion.div>
            </motion.form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EditPlayerDetails;
