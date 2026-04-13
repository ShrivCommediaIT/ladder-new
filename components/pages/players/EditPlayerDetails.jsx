
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
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice"; // ✅ ADDED FOR MINILEAGUE
import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";

const EditPlayerDetails = ({ userId, ladderId, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladder_id = ladderId || searchParams.get("ladder_id"); // ✅ PRIORITIZE PROPS LADDER ID

  const players =
    useSelector((state) => state.player?.players?.[ladder_id]?.data) || [];

  const minileagueData = useSelector((state) => state.minileague?.data) || []; // ✅ MINILEAGUE DATA

  const numericUserId = Number(userId);
  const selectedPlayer =
    players.length > 0
      ? players.find((p) => Number(p.id) === numericUserId)
      : null;

  const { loading, successMessage, error } = useSelector(
    (state) => state.editdetail
  );

  const [form, setForm] = useState({
    id: "",
    user_id: "",
    name: "",
    phone: "",
  });

  const [showSkeleton, setShowSkeleton] = useState(false);
  const cardRef = useRef(null);

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
      setForm({
        id: selectedPlayer.id || "",
        user_id:
          selectedPlayer.user_id?.toString() ||
          selectedPlayer.id?.toString() ||
          "",
        name: selectedPlayer.name || "",
        phone: selectedPlayer.phone || "",
      });
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

    const formData = { id: form.id, name: form.name, phone: form.phone };

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
          dispatch(fetchLeaderboard({ ladder_id }));
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

              <motion.div whileHover={{ scale: 1.02 }}>
                <Label htmlFor="phone" className="text-blue-200 mb-2 font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="bg-white/10 py-6 border-white/30 text-white focus:ring-2 focus:ring-cyan-400"
                  required
                />
              </motion.div>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-700 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Saving..." : " Save Changes"}
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
