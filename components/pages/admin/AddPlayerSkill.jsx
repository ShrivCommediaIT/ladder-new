import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Phone, User } from "lucide-react";
import { postWithParams } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
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

const AddPlayerSkill = ({ ladderId, onClose, onSuccessRefresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: undefined,
    gender: "male",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 11);
    }
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Player name is required!");
      return;
    }

    if (formData.phone.trim() && formData.phone.trim().replace(/\D/g, "").length !== 11) {
      setError("Phone number must be exactly 11 digits!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ladder_id: ladderId,
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        gender: formData.gender,
        country: formData.country,
      };

      if (formData.dob) {
        payload.age = calculateAge(formData.dob);
        payload.dob = format(formData.dob, "dd/MM/yyyy");
      }

      const response = await postWithParams(API_ENDPOINTS.ADD_USER_SKILLBOARD, payload);

      if (response?.status === 200) {
        setSuccessData({
          playerName: formData.name.trim(),
          ladderId,
        });
        setShowSuccess(true);
        setFormData({ name: "", phone: "", dob: undefined, gender: "male", country: "" });
        onSuccessRefresh?.();
      } else {
        setError(response?.error_message || "Failed to add player. Please try again.");
      }
    } catch (error) {
      setError("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose?.();
  };

  if (showSuccess) {
    return <SuccessDialog {...successData} onCloseAll={handleSuccessClose} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Add New Player
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-foreground font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Player Name *
        </label>
        <input
          type="text"
          name="name"
          placeholder="Enter player full name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full p-4 bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all h-14"
        />
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <label className="text-foreground font-semibold flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Phone Number (Optional)
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">+91</div>
          <input
            type="tel"
            name="phone"
            maxLength={11}
            placeholder="Enter your phone number (Optional)"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full pl-16 p-4 bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all h-14"
          />
        </div>
        <p className="text-xs text-muted-foreground">Enter 11-digit number (optional)</p>
      </div>

      {/* Gender Field */}
      <div className="space-y-2">
        <label className="text-foreground font-semibold flex items-center gap-2">
          Gender
        </label>
        <Select
          value={formData.gender}
          onValueChange={(val) => setFormData({ ...formData, gender: val })}
        >
          <SelectTrigger className="w-full p-4 bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 transition-all h-14">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border text-foreground">
            <SelectItem className="cursor-pointer" value="male">Male</SelectItem>
            <SelectItem className="cursor-pointer" value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Field */}
      <div className="space-y-2">
        <label className="text-foreground font-semibold flex items-center gap-2">
          Country
        </label>
        <CountrySelect
          value={formData.country}
          onValueChange={(val) => setFormData({ ...formData, country: val })}
          className="w-full p-4 bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/20 transition-all h-14"
        />
      </div>

      {/* DOB Field */}
      <div className="space-y-2">
        <label className="text-foreground font-semibold flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          Date of Birth
        </label>
        <DateOfBirthInput
          id="dob"
          value={formData.dob}
          onChange={(date) => setFormData({ ...formData, dob: date })}
          className="w-full bg-input-theme-bg border border-input-theme-border rounded-xl text-foreground h-14"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          disabled={loading}
          className="flex-1 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Player"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddPlayerSkill;
