"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { useSelector, useDispatch } from "react-redux";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";

export default function MinileagueAddPlayer({ onClose, onSuccessRefresh }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const ladder_id = searchParams.get("ladder_id");

  const miniLeagueSections = useSelector(
    (state) => state.minileague.data || []
  );
  const [selectedSection, setSelectedSection] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [name, setName] = useState("");
  // Email state ki ab UI mein zaroorat nahi hai
  const [phone, setPhone] = useState("");
  const [rank, setRank] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dob, setDob] = useState(undefined);
  const [gender, setGender] = useState("male");


  useEffect(() => {
    if (ladder_id) {
      dispatch(fetchMiniLeague({ ladder_id }));
    }
  }, [ladder_id, dispatch]);

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
    // Validation se email hata diya gaya hai
    if (!name || !ladder_id || !selectedSection) {
      setWelcomeMsg("Please fill all required fields including Section.");
      setShowDialog(true);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    // ✅ Internally name ko hi email field mein pass kar rahe hain
    formData.append("email", name); 
    formData.append("ladder_id", ladder_id);
    formData.append("section", selectedSection);
    if (rank) formData.append("rank", rank);
    if (phone) formData.append("phone", phone);
    if (profileFile) formData.append("file", profileFile);
    formData.append("gender", gender);
    if (dob) {
      formData.append("age", calculateAge(dob));
      formData.append("dob", format(dob, "dd/MM/yyyy"));
    }

    try {
      const response = await postFormData(API_ENDPOINTS.MINILEAGUE_ADD_BY_ADMIN, formData);

        if (response.status === 200) {
          setWelcomeMsg(`Welcome ${name}! ${response.data.success_message}`);
          setShowDialog(true);

          // Reset fields
          setName("");
          setPhone("");
          setRank("");
          setSelectedSection("");
          setProfileImage(null);
          setProfileFile(null);
          setDob(undefined);
          setGender("male");

          setLoading(true);
        await dispatch(fetchMiniLeague({ ladder_id }));
        onSuccessRefresh?.(); // ✅ Refresh callback
        setLoading(false);
      } else {
        setWelcomeMsg("Player already exist !");
        setShowDialog(true);
      }
    } catch (error) {
      setWelcomeMsg(
        "Error: " + (error.response?.data?.message || error.message)
      );
      setShowDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 w-full max-w-sm">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-[40%] rounded-md" />
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full px-3 sm:px-0">
        <div
          className="
            max-w-sm w-full mx-auto
            rounded-2xl
            border border-white/10
            bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80
            shadow-[0_0_40px_rgba(15,23,42,0.8)]
            backdrop-blur-xl
            p-5
            text-slate-100
            max-h-[80vh]
            overflow-auto
            scrollbar-thin
          "
        >
          {/* Header */}
          <div className="flex items-center justify-center mb-3 sticky top-0 backdrop-blur-md pb-2">
            <div>
              <h2 className="text-lg font-semibold text-center tracking-tight">
                Add Player
              </h2>
            </div>
          </div>

          {/* Profile Upload */}
          <div className="flex items-center gap-4 pt-1">
            <div className="relative flex-shrink-0">
              <div className="h-14 w-14 rounded-full border border-slate-700 bg-slate-900/80 overflow-hidden shadow-lg">
                <Image
                  src={profileImage || "/logo.jpg"}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <label className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs hover:bg-slate-800 cursor-pointer">
                <span className="text-slate-200">✚</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="text-xs text-slate-400">
              <p className="font-medium text-slate-300">Player avatar (optional)</p>
              <p>PNG, JPG up to 2MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-slate-300">
                <span className="text-red-500">*</span>
                Name
              </Label>
              <Input
                className="h-10 bg-slate-900/60 border-slate-700/80 focus-visible:ring-slate-500 text-sm placeholder:text-slate-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                required
              />
            </div>

            {/* ✅ EMAIL INPUT REMOVED FROM UI */}

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Phone (Optional)</Label>
              <Input
                type="tel"
                className="h-10 bg-slate-900/60 border-slate-700/80 focus-visible:ring-slate-500 text-sm placeholder:text-slate-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number (Optional)"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-slate-300">
                <span className="text-red-500">*</span>
                Section
              </Label>
              <select
                className="w-full h-10 rounded-md border border-slate-700/80 bg-slate-900/60 text-sm text-slate-100 px-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                required
              >
                <option className="bg-slate-900" value="">Select section</option>
                {miniLeagueSections.map((sec, idx) => (
                  <option key={idx} value={sec.section} className="bg-slate-900">{sec.section}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-slate-300">
                <span className="text-red-500">*</span>
                Position
              </Label>
              <Input
                type="number"
                className="h-10 bg-slate-900/60 border-slate-700/80 focus-visible:ring-slate-500 text-sm placeholder:text-slate-500"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="Enter ladder position"
                required
              />
            </div>

            {/* GENDER */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-semibold">Gender</Label>
              <Select
                value={gender}
                onValueChange={setGender}
              >
                <SelectTrigger className="bg-slate-900/60 border-slate-700/80 text-white w-full h-10">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DOB PICKER */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-semibold">
                Date of Birth
              </Label>

              <DateOfBirthInput
                id="dob"
                value={dob}
                onChange={setDob}
                className="bg-slate-900/60 border-slate-700/80 text-white h-10"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-red-500 text-base leading-none">*</span>
              <span>Required fields</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 text-xs text-gray-900" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="h-9 bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-slate-950 px-4">
                {submitting ? "Adding..." : "Add Player"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 w-full max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Player Added</DialogTitle>
          </DialogHeader>
          <p className="font-medium text-sm text-center py-2 text-slate-200">{welcomeMsg}</p>
          <DialogFooter>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 w-full sm:w-auto" onClick={() => { setShowDialog(false); onClose(); }}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
