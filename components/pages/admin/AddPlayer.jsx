"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { postFormData, postWithParams } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "react-toastify";

import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchUserActivity } from "@/redux/slices/activitySlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, AlertCircle, Phone, User, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";
import CountrySelect from "@/components/shared/CountrySelect";

const SuccessDialog = ({ playerName, ladderId, onCloseAll }) => (
  <Dialog open={true} onOpenChange={() => { }}>
    <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
      <DialogHeader>
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-bounce" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground text-center">
            Player Added Successfully!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            <strong className="text-foreground">{playerName}</strong> has been added to the Skill Leaderboard.
          </DialogDescription>
        </div>
      </DialogHeader>
      <DialogFooter className="sm:justify-center gap-3">
        <Button
          onClick={onCloseAll}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg w-full sm:w-auto cursor-pointer"
        >
          Close & Refresh
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const AddPlayer = ({ ladderId, onClose, onSuccessRefresh }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const resolvedLadderId = ladderId || searchParams.get("ladder_id");
  const typeFromParams = searchParams.get("type") || searchParams.get("ladder_type");

  const playerLadderType = useSelector(
    (state) => state.player?.players?.[resolvedLadderId]?.ladderDetails?.type
  );
  const miniLeagueLadderType = useSelector(
    (state) => state.minileague?.ladderDetails?.type
  );

  const ladderType = typeFromParams || playerLadderType || miniLeagueLadderType;
  const isSkill = ["skill", "positive", "negative", "roster"].includes(ladderType);
  const isMiniLeague = ladderType === "minileague";

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rank, setRank] = useState("");
  const [dob, setDob] = useState(undefined);
  const [gender, setGender] = useState("male");
  const [country, setCountry] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  // Status State
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Mini League Sections
  const miniLeagueSections = useSelector(
    (state) => state.minileague?.data || []
  );

  useEffect(() => {
    if (isMiniLeague && resolvedLadderId) {
      dispatch(fetchMiniLeague({ ladder_id: resolvedLadderId }));
    }
  }, [isMiniLeague, resolvedLadderId, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose?.();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 1. Validation
    if (!name.trim()) {
      if (isSkill) {
        setError("Player name is required!");
      } else {
        toast.warning("Please fill all required fields including name.");
      }
      return;
    }

    if (phone.trim() && phone.trim().replace(/\D/g, "").length !== 11) {
      if (isSkill) {
        setError("Phone number must be exactly 11 digits!");
      } else {
        toast.warning("Phone number must be exactly 11 digits!");
      }
      return;
    }

    if (!isSkill) {
      if (!rank) {
        toast.warning(isMiniLeague ? "Position is required!" : "Rank is required!");
        return;
      }
      if (isMiniLeague && !selectedSection) {
        toast.warning("Please fill all required fields including Section.");
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const urlType = searchParams.get("type") || searchParams.get("ladder_type");

      // 2. Perform API Call
      if (isSkill) {
        const payload = {
          ladder_id: resolvedLadderId,
          name: name.trim(),
          phone: phone.trim() || undefined,
          gender: gender,
          country: country,
        };

        if (dob) {
          payload.age = calculateAge(dob);
          payload.dob = format(dob, "dd/MM/yyyy");
        }

        const response = await postWithParams(API_ENDPOINTS.ADD_USER_SKILLBOARD, payload);

        if (response?.status === 200 || response?.status === "200") {
          setSuccessData({
            playerName: name.trim(),
            ladderId: resolvedLadderId,
          });
          setShowSuccess(true);
          // Reset fields
          setName("");
          setPhone("");
          setDob(undefined);
          setGender("male");
          setCountry("");
          onSuccessRefresh?.();
        } else {
          setError(response?.error_message || "Failed to add player. Please try again.");
        }
      } else {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", name.trim());
        formData.append("ladder_id", resolvedLadderId);
        if (rank) formData.append("rank", rank);
        if (phone) formData.append("phone", phone.trim());
        if (profileFile) formData.append("file", profileFile);
        formData.append("gender", gender);
        formData.append("country", country);
        if (dob) {
          formData.append("age", calculateAge(dob));
          formData.append("dob", format(dob, "dd/MM/yyyy"));
        }

        if (isMiniLeague) {
          formData.append("section", selectedSection);
          const response = await postFormData(API_ENDPOINTS.MINILEAGUE_ADD_BY_ADMIN, formData);

          if (response && (response.status === 200 || response.status === "200")) {
            toast.success(`Welcome ${name}! ${response.success_message || "Player added successfully."}`);
            
            // Reset fields
            setName("");
            setPhone("");
            setRank("");
            setSelectedSection("");
            setProfileImage(null);
            setProfileFile(null);
            setDob(undefined);
            setGender("male");
            setCountry("");

            setLoading(true);
            await dispatch(fetchMiniLeague({ ladder_id: resolvedLadderId }));
            onSuccessRefresh?.();
            setLoading(false);
            onClose();
          } else {
            const errorMsg = response?.error_message || response?.message || "Player already exists!";
            toast.error(errorMsg);
          }
        } else {
          const response = await postFormData(API_ENDPOINTS.ADD_BY_ADMIN, formData);

          if (response && (response.status === 200 || response.status === "200")) {
            toast.success(`Welcome ${name}! Player added successfully.`);

            // Reset fields
            setName("");
            setPhone("");
            setRank("");
            setDob(undefined);
            setGender("male");
            setCountry("");
            setProfileImage(null);
            setProfileFile(null);

            setLoading(true);
            await dispatch(fetchLeaderboard({ ladder_id: resolvedLadderId, type: urlType || ladderType }));
            await dispatch(fetchUserActivity({ ladder_id: Number(resolvedLadderId) }));
            onSuccessRefresh?.();
            setLoading(false);
            onClose();
          } else {
            const errorMsg = response?.error_message || response?.message || "Something went wrong.";
            toast.error(errorMsg);
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (isSkill) {
        setError("Failed to add player. Please try again.");
      } else {
        const errorMsg = err.response?.data?.error_message || err.response?.data?.message || err.message || "Failed to add player.";
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6 w-full max-w-md mx-auto">
        <Skeleton className="h-28 w-28 rounded-full mx-auto" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  if (isSkill && showSuccess) {
    return <SuccessDialog {...successData} onCloseAll={handleSuccessClose} />;
  }

  // Dynamic CSS styling to support original page style variables
  const inputClass = isSkill
    ? "w-full p-4 bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all h-14"
    : isMiniLeague
    ? "h-10 bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] focus-visible:ring-[var(--best-board-border-strong)] focus-visible:border-[var(--best-board-border-strong)] text-[var(--best-board-text)] placeholder:text-[var(--best-board-muted)] text-sm w-full rounded-lg px-3 focus:outline-none"
    : "text-foreground font-semibold border-0 w-full h-10 rounded-lg px-3 bg-[var(--input-bg)] shadow-[inset_0_0_0_1px_var(--input-border)] focus:outline-none";

  const labelClass = isSkill
    ? "text-foreground font-semibold flex items-center gap-2 text-sm"
    : isMiniLeague
    ? "flex items-center gap-1 text-xs text-[var(--best-board-muted)]"
    : "text-foreground text-sm font-semibold";

  const selectTriggerClass = isSkill
    ? "w-full p-4 bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 transition-all h-14"
    : isMiniLeague
    ? "bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] text-[var(--best-board-text)] w-full h-10 focus:ring-1 focus:ring-[var(--best-board-border-strong)] focus:border-[var(--best-board-border-strong)] rounded-lg"
    : "w-full h-10 border-0 text-foreground rounded-lg bg-[var(--input-bg)] shadow-[inset_0_0_0_1px_var(--input-border)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin">
      {/* Title Header */}
      <div className="pb-2 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {isMiniLeague ? "Add Player" : "Add New Player"}
        </h2>
      </div>

      {/* Error banner for skill board */}
      {isSkill && error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar Image Upload for non-skill types */}
      {!isSkill && (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="relative w-20 h-20 rounded-full border-4 border-cyan-400 overflow-hidden shadow-md group cursor-pointer">
            <Image
              src={profileImage || "/logo.jpg"}
              alt="Profile"
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Click avatar to upload image (optional)</p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1">
        <Label className={labelClass}>
          {!isSkill && <span className="text-red-500 mr-0.5">*</span>}
          {isSkill && <User className="w-4 h-4 text-muted-foreground inline mr-1" />}
          Name {isSkill && "*"}
        </Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isSkill ? "Enter player full name" : "Enter name"}
          className={inputClass}
          required
        />
      </div>

      {/* Phone Field */}
      <div className="space-y-1">
        <Label className={labelClass}>
          {isSkill && <Phone className="w-4 h-4 text-muted-foreground inline mr-1" />}
          Phone Number (Optional)
        </Label>
        <div className="relative">
          {isSkill && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+91</div>
          )}
          <Input
            type="tel"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder={isSkill ? "Enter your phone number (Optional)" : "Enter 11 digit phone number (Optional)"}
            className={`${inputClass} ${isSkill ? "pl-16" : ""}`}
          />
        </div>
        {isSkill && <p className="text-[11px] text-muted-foreground mt-1">Enter 11-digit number (optional)</p>}
      </div>

      {/* Section Field (Minileague Only) */}
      {isMiniLeague && (
        <div className="space-y-1">
          <Label className={labelClass}>
            <span className="text-red-500 mr-0.5">*</span>
            Section
          </Label>
          <select
            className="w-full h-10 rounded-lg border border-[var(--best-board-border)] bg-[var(--best-board-surface-soft)] text-sm text-[var(--best-board-text)] px-2.5 focus:outline-none focus:border-[var(--best-board-border-strong)] focus:ring-1 focus:ring-[var(--best-board-border-strong)] transition-all duration-200"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            required
          >
            <option className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]" value="">Select section</option>
            {miniLeagueSections.map((sec, idx) => (
              <option key={idx} value={sec.section} className="bg-[var(--best-board-surface)] text-[var(--best-board-text)]">{sec.section}</option>
            ))}
          </select>
        </div>
      )}

      {/* Rank / Position Field (Non-Skill Only) */}
      {!isSkill && (
        <div className="space-y-1">
          <Label className={labelClass}>
            <span className="text-red-500 mr-0.5">*</span>
            {isMiniLeague ? "Position" : "Place Number to Add New Player"}
          </Label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={rank}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val === "") {
                setRank("");
              } else {
                const num = parseInt(val, 10);
                if (num >= 1) {
                  setRank(num);
                }
              }
            }}
            placeholder={isMiniLeague ? "Enter ladder position" : "Enter rank"}
            className={inputClass}
            required
          />
        </div>
      )}

      {/* Gender Field */}
      <div className="space-y-1">
        <Label className={labelClass}>Gender</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border text-foreground shadow-md z-[60]">
            <SelectItem className="cursor-pointer text-foreground" value="male">Male</SelectItem>
            <SelectItem className="cursor-pointer text-foreground" value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Field */}
      <div className="space-y-1">
        <Label className={labelClass}>Country</Label>
        <CountrySelect
          value={country}
          onValueChange={setCountry}
          className={selectTriggerClass}
        />
      </div>

      {/* Date of Birth Field */}
      <div className="space-y-1">
        <Label className={labelClass}>
          {isSkill && <CalendarIcon className="w-4 h-4 text-muted-foreground inline mr-1" />}
          Date of Birth
        </Label>
        <DateOfBirthInput
          id="dob"
          value={dob}
          onChange={setDob}
          className={selectTriggerClass}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          disabled={submitting}
          className={
            isMiniLeague
              ? "flex-1 h-9 text-xs text-[var(--best-board-text)] border-[var(--best-board-border)] hover:bg-[var(--best-board-surface-soft)] rounded-lg cursor-pointer"
              : "flex-1 cursor-pointer"
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting || !name.trim()}
          className={
            isSkill
              ? "flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg disabled:opacity-50 cursor-pointer h-14"
              : isMiniLeague
              ? "flex-1 h-9 bg-[var(--best-board-success)] hover:bg-[var(--best-board-success)]/90 text-xs font-semibold text-white px-4 hover:brightness-110 rounded-lg transition-all cursor-pointer"
              : "flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-lg disabled:opacity-50 cursor-pointer h-10"
          }
        >
          {submitting ? "Adding..." : "Add Player"}
        </Button>
      </div>
    </form>
  );
};

export default AddPlayer;
