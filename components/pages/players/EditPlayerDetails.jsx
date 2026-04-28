
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import {
  editUserDetails,
  resetEditPlayerState,
} from "@/redux/slices/editdetailSlice";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { fetchMiniLeague } from "@/redux/slices/minileagueSlice"; // ✅ ADDED FOR MINILEAGUE
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";

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
    gender: "male",
  });

  const [calendarMonth, setCalendarMonth] = useState(new Date());
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

      const parsedDob = initialDob && !isNaN(initialDob.getTime()) ? initialDob : null;

      setForm({
        id: selectedPlayer.id || "",
        user_id:
          selectedPlayer.user_id?.toString() ||
          selectedPlayer.id?.toString() ||
          "",
        dob: parsedDob,
        name: selectedPlayer.name || "",
        phone: selectedPlayer.phone || "",
        gender: selectedPlayer.gender || "male",
      });

      if (parsedDob) {
        setCalendarMonth(parsedDob);
      }
    }
    
  }, [selectedPlayer]);

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

    const formData = { id: form.id, name: form.name, phone: form.phone, gender: form.gender, dob: form.dob ? format(form.dob, "yyyy-MM-dd") : null,
          age: calculateAge(form.dob), };

    setShowSkeleton(true);
    dispatch(editUserDetails({ user_id: form.user_id, formData }));
  };

  // ✅ FIXED: Real-time refresh on success (SAME AS IMAGE UPLOAD)
  useEffect(() => {
    if (successMessage) {
      gsap.to(cardRef.current, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });

      const timer = setTimeout(() => {
        setShowSkeleton(false);
        
        // ✅ REAL-TIME REFRESH - BOTH LEADERBOARD & MINILEAGUE
        if (ladder_id) {
          const urlType = searchParams.get("type") || searchParams.get("ladder_type");
          dispatch(fetchLeaderboard({ ladder_id, type: urlType }));
          dispatch(fetchMiniLeague({ ladder_id, ladderType: "minileague" }));
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
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onSelect={(date) => {
                      setForm((prev) => ({
                        ...prev,
                        dob: date,
                      }));
                      if (date) {
                        setCalendarMonth(date);
                      }
                    }}
                    captionLayout="dropdown"
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Label htmlFor="phone" className="text-blue-200 mb-2 font-semibold">
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="bg-white/10 py-6 border-white/30 text-white focus:ring-2 focus:ring-cyan-400"
                  placeholder="Enter phone number (Optional)"
                />
              </motion.div>

              {/* GENDER */}
              { ladderType !== "minileague" && <motion.div whileHover={{ scale: 1.02 }} className="space-y-2 w-full">
                <Label className="text-blue-200 font-semibold">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="bg-white/10 border-white/30 text-white w-full focus:ring-2 focus:ring-cyan-400 py-6 h-12">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>}

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
