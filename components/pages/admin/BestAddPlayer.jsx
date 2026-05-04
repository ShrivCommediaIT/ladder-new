

"use client";

import { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

import { fetchLeaderboard } from "@/redux/slices/leaderboardSlice";
import { fetchUserActivity } from "@/redux/slices/activitySlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
} from "date-fns";
import { calculateAge } from "@/lib/utils";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";

export default function BestAddPlayer({ onClose, onSuccessRefresh }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");
  const urlType = searchParams.get("type") || searchParams.get("ladder_type");

  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [name, setName] = useState("");
  // Email state ki ab zaroorat nahi hai UI ke liye
  const [phone, setPhone] = useState("");
  const [rank, setRank] = useState("");
  const [dob, setDob] = useState(undefined);
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async () => {
  // Validation
  if (!name || !ladder_id) {
    setWelcomeMsg("Please fill all required fields including ladder ID.");
    setShowDialog(true);
    return;
  }

  setSubmitting(true);

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", name); 
  formData.append("ladder_id", ladder_id);

  if (rank) formData.append("rank", rank);
  if (phone) formData.append("phone", phone);
  if (profileFile) formData.append("file", profileFile);
  
  formData.append("gender", gender);
  if (dob) {
    formData.append("age", calculateAge(dob));
    formData.append("dob", format(dob, "dd/MM/yyyy"));
  }

  try {
    const response = await postFormData(API_ENDPOINTS.ADD_BY_ADMIN, formData);

    if (response.status === 200) {

      setWelcomeMsg(`Welcome ${name}!`);
      setShowDialog(true);

      // Reset fields
      setName("");
      setPhone("");
      setRank("");
      setDob(undefined);
      setGender("male");
      setProfileImage(null);
      setProfileFile(null);

      setLoading(true);

      // Leaderboard refresh
      await dispatch(fetchLeaderboard({ ladder_id, type: urlType }));

      // ⭐ Instant activity refresh (NEW FIX)
      await dispatch(fetchUserActivity({ ladder_id: Number(ladder_id) }));

      onSuccessRefresh?.(); // ✅ Refresh callback
      setLoading(false);

    } else {
      setWelcomeMsg(response.data.message || "Something went wrong.");
      setShowDialog(true);
    }

  } catch (error) {
    setWelcomeMsg(error.response?.data?.message || error.message);
    setShowDialog(true);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <Card className="w-[500px] space-y-4 sm:p-4">
        <Skeleton className="h-28 w-full rounded-full mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  return (
    <Card className=" bg-white/5 backdrop-blur-md border border-white/20 shadow-lg rounded-xl ">
      {/* Profile Upload */}
      <CardHeader className="flex flex-col items-center gap-2 pt-4">
        <div className="relative w-24 h-24 rounded-full border-4 border-cyan-400 overflow-hidden">
          <Image
            src={profileImage || "/logo.jpg"}
            alt="Profile"
            fill
            className="object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <p className="text-sm text-white/80">Click to upload avatar</p>
      </CardHeader>

      {/* Form Fields */}
      <CardContent className="space-y-3">
        {/* NAME */}
        <div className="space-y-1">
          <Label className="text-white">Name <span className="text-red-500">*</span></Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="text-white font-semibold"
          />
        </div>

        {/* EMAIL INPUT REMOVED FROM HERE */}

        <div className="space-y-1">
          <Label className="text-white">Phone (Optional)</Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number (Optional)"
            className="text-white font-semibold"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-white">Place Number to Add New Player<span className="text-red-500">*</span></Label>
          <Input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="Enter rank"
            className="text-white font-semibold"
          />
        </div>

        {/* GENDER */}
        <div className="space-y-1">
          <Label className="text-white font-semibold">Gender</Label>
          <Select
            value={gender}
            onValueChange={setGender}
          >
            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white w-full h-10">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DOB PICKER */}
        <div className="space-y-1">
          <Label className="text-white font-semibold">
            Date of Birth
          </Label>

          <DateOfBirthInput
            id="dob"
            value={dob}
            onChange={setDob}
            className="bg-gray-800/50 border-gray-700 text-white h-10"
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 px-4 pb-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-cyan-500 hover:bg-cyan-600 w-full"
        >
          {submitting ? "Adding..." : "Add Player"}
        </Button>
        <p className="text-xs text-white/60 text-center mt-2">
          <span className="text-red-500">*</span> Required Fields
        </p>
      </CardFooter>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle>Player Added</DialogTitle>
          </DialogHeader>
          <p className="text-center py-2 font-semibold">{welcomeMsg}</p>
          <DialogFooter>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600"
              onClick={() => {
                setShowDialog(false);
                onClose();
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
