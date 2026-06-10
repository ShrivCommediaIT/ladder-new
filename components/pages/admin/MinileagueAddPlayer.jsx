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
import CountrySelect from "@/components/shared/CountrySelect";

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
  const [country, setCountry] = useState("");


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

    if (phone && phone.trim().replace(/\D/g, "").length !== 11) {
      setWelcomeMsg("Phone number must be exactly 11 digits!");
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
    formData.append("country", country);
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
          setCountry("");

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
      <div className="space-y-4 p-4 w-full max-w-sm bg-[var(--best-board-surface)] border border-[var(--best-board-border)] rounded-2xl shadow-xl">
        <Skeleton className="h-24 w-full rounded-xl bg-[var(--best-board-surface-soft)]/50" />
        <Skeleton className="h-10 w-full rounded-md bg-[var(--best-board-surface-soft)]/50" />
        <Skeleton className="h-10 w-full rounded-md bg-[var(--best-board-surface-soft)]/50" />
        <Skeleton className="h-10 w-full rounded-md bg-[var(--best-board-surface-soft)]/50" />
        <Skeleton className="h-10 w-full rounded-md bg-[var(--best-board-surface-soft)]/50" />
        <Skeleton className="h-10 w-[40%] rounded-md bg-[var(--best-board-surface-soft)]/50" />
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
            border border-[var(--best-board-border)]
            bg-[var(--best-board-surface)]
            shadow-2xl
            backdrop-blur-xl
            p-5
            text-[var(--best-board-text)]
            max-h-[80vh]
            overflow-auto
            scrollbar-thin
          "
        >
          {/* Header */}
          <div className="flex items-center justify-center mb-3 sticky top-0 bg-[var(--best-board-surface)]/95 backdrop-blur-md pb-2 z-10 border-b border-[var(--best-board-border)]">
            <div>
              <h2 className="text-lg font-bold text-center tracking-tight text-[var(--best-board-text)]">
                Add Player
              </h2>
            </div>
          </div>

          {/* Profile Upload */}
          <div className="flex items-center gap-4 pt-1">
            <div className="relative flex-shrink-0">
              <div className="h-14 w-14 rounded-full border border-[var(--best-board-border-strong)] bg-[var(--best-board-surface-soft)] overflow-hidden shadow-lg">
                <Image
                  src={profileImage || "/logo.jpg"}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <label className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--best-board-border-strong)] bg-[var(--best-board-surface)] text-xs hover:bg-[var(--best-board-surface-soft)] cursor-pointer">
                <span className="text-[var(--best-board-text)]">✚</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="text-xs text-[var(--best-board-muted)]">
              <p className="font-medium text-[var(--best-board-text)]">Player avatar (optional)</p>
              <p>PNG, JPG up to 2MB.</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-[var(--best-board-muted)]">
                <span className="text-[var(--best-board-danger)]">*</span>
                Name
              </Label>
              <Input
                className="h-10 bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] focus-visible:ring-[var(--best-board-border-strong)] focus-visible:border-[var(--best-board-border-strong)] text-[var(--best-board-text)] placeholder:text-[var(--best-board-muted)] text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                required
              />
            </div>

            {/* ✅ EMAIL INPUT REMOVED FROM UI */}

            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--best-board-muted)]">Phone (Optional)</Label>
              <Input
                type="tel"
                maxLength={11}
                className="h-10 bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] focus-visible:ring-[var(--best-board-border-strong)] focus-visible:border-[var(--best-board-border-strong)] text-[var(--best-board-text)] placeholder:text-[var(--best-board-muted)] text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="Enter 11 digit phone number (Optional)"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-[var(--best-board-muted)]">
                <span className="text-[var(--best-board-danger)]">*</span>
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

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-[var(--best-board-muted)]">
                <span className="text-[var(--best-board-danger)]">*</span>
                Position
              </Label>
              <Input
                type="number"
                className="h-10 bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] focus-visible:ring-[var(--best-board-border-strong)] focus-visible:border-[var(--best-board-border-strong)] text-[var(--best-board-text)] placeholder:text-[var(--best-board-muted)] text-sm"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="Enter ladder position"
                required
              />
            </div>

            {/* GENDER */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--best-board-muted)] font-semibold">Gender</Label>
              <Select
                value={gender}
                onValueChange={setGender}
              >
                <SelectTrigger className="bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] text-[var(--best-board-text)] w-full h-10 focus:ring-1 focus:ring-[var(--best-board-border-strong)] focus:border-[var(--best-board-border-strong)]">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--best-board-surface)] border-[var(--best-board-border)] text-[var(--best-board-text)] shadow-lg z-50">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* COUNTRY */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--best-board-muted)] font-semibold">Country</Label>
              <CountrySelect
                value={country}
                onValueChange={setCountry}
                className="bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] text-[var(--best-board-text)] w-full h-10 focus:ring-1 focus:ring-[var(--best-board-border-strong)] focus:border-[var(--best-board-border-strong)]"
              />
            </div>

            {/* DOB PICKER */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--best-board-muted)] font-semibold">
                Date of Birth
              </Label>

              <DateOfBirthInput
                id="dob"
                value={dob}
                onChange={setDob}
                className="bg-[var(--best-board-surface-soft)] border-[var(--best-board-border)] text-[var(--best-board-text)] w-full h-10 focus:ring-1 focus:ring-[var(--best-board-border-strong)] focus:border-[var(--best-board-border-strong)]"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--best-board-muted)]">
              <span className="text-[var(--best-board-danger)] text-base leading-none">*</span>
              <span>Required fields</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9 text-xs text-[var(--best-board-text)] border-[var(--best-board-border)] hover:bg-[var(--best-board-surface-soft)]" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="h-9 bg-[var(--best-board-success)] hover:bg-[var(--best-board-success)]/90 text-xs font-semibold text-white px-4 hover:brightness-110 rounded-lg transition-all">
                {submitting ? "Adding..." : "Add Player"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[var(--best-board-surface)] border border-[var(--best-board-border)] text-[var(--best-board-text)] w-full max-w-[calc(100%-2rem)] sm:max-w-md shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-[var(--best-board-text)] font-bold">Player Added</DialogTitle>
          </DialogHeader>
          <p className="font-medium text-sm text-center py-2 text-[var(--best-board-text)]">{welcomeMsg}</p>
          <DialogFooter>
            <Button className="bg-[var(--best-board-success)] text-white hover:brightness-110 w-full sm:w-auto rounded-lg" onClick={() => { setShowDialog(false); onClose(); }}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
