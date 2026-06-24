"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  User, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  ArrowLeft, 
  Shield, 
  Mail, 
  Check, 
  AlertTriangle,
  Loader2,
  Trophy
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuthGuard from "@/hooks/useAuthGuard";
import Navbar from "@/components/shared/Navbar";
import { postRequest, postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { checkPasswordStrength } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getUserImage } from "@/lib/utils";

export default function ProfilePage() {
  const allowed = useAuthGuard();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Loading States
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Password States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Image Upload / Preview States
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // General Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // 'details' | 'image' | 'password'
    title: "",
    description: "",
    onConfirm: () => {}
  });

  // Load user data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadUserData = () => {
      try {
        const storedAdminDetails = sessionStorage.getItem("adminDetails");
        const storedSubAdmin = sessionStorage.getItem("subAdmin");
        const storedAdmin = sessionStorage.getItem("userData");

        const adminDetails = storedAdminDetails ? JSON.parse(storedAdminDetails) : null;
        const subAdmin = storedSubAdmin ? JSON.parse(storedSubAdmin) : null;
        const admin = storedAdmin ? JSON.parse(storedAdmin) : null;

        let mergedUser = null;
        if (subAdmin?.user_type === "sub_admin" || subAdmin) {
          mergedUser = { ...subAdmin };
          if (!mergedUser.user_type) mergedUser.user_type = "sub_admin";
        } else if (admin?.user_type === "admin" || admin) {
          mergedUser = { ...admin, ...adminDetails };
          if (!mergedUser.user_type) mergedUser.user_type = "admin";
        } else if (adminDetails?.user_type === "admin" || adminDetails) {
          mergedUser = { ...adminDetails };
          if (!mergedUser.user_type) mergedUser.user_type = "admin";
        }

        if (mergedUser) {
          if (!mergedUser.user_id) {
            mergedUser.user_id = mergedUser.login_id || mergedUser.email || "";
          }
          setUser(mergedUser);
          setName(mergedUser.name || mergedUser.admin_name || "");
          setPhone(mergedUser.phone || mergedUser.admin_phone || "");
        }
      } catch (err) {
        console.error("Failed to parse user session in profile page", err);
      }
    };

    loadUserData();
  }, []);

  if (!allowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle phone changes (limit to 11 digits and numbers only)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(value);
  };

  // Open confirmation modal
  const openConfirm = (type, title, description, onConfirmAction) => {
    setConfirmModal({
      isOpen: true,
      type,
      title,
      description,
      onConfirm: onConfirmAction
    });
  };

  // Save Name & Phone details
  const saveDetails = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : "";
    if (cleanPhone && cleanPhone.length !== 11) {
      toast.error("Phone number must be exactly 11 digits");
      return;
    }

    openConfirm(
      "details",
      "Update Profile Details",
      "Are you sure you want to update your name and phone number?",
      async () => {
        setUpdatingDetails(true);
        try {
          const endpoint = user.user_type === "admin"
            ? API_ENDPOINTS.EDIT_DETAILS
            : "/app/user/updateSubadminProfile";

          const payload = user.user_type === "admin"
            ? { id: user.id, user_id: user.user_id, name: name.trim(), phone: cleanPhone, role: user.user_type }
            : { id: user.id, name: name.trim(), phone: cleanPhone };

          const res = await postRequest(endpoint, payload);

          if (res.status == 200 || res.status === "success") {
            toast.success("Profile details updated successfully!");

            // Update sessionStorage dynamically
            if (user.user_type === "sub_admin") {
              const existing = JSON.parse(sessionStorage.getItem("subAdmin") || "{}");
              const updated = { ...existing, name: name.trim(), phone: cleanPhone };
              sessionStorage.setItem("subAdmin", JSON.stringify(updated));
              setUser(updated);
            } else {
              const existingUserData = JSON.parse(sessionStorage.getItem("userData") || "{}");
              const existingAdminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");

              const updatedUserData = { 
                ...existingUserData, 
                name: name.trim(), 
                phone: cleanPhone,
                admin_name: name.trim(),
                admin_phone: cleanPhone
              };
              const updatedAdminDetails = { 
                ...existingAdminDetails, 
                name: name.trim(), 
                phone: cleanPhone,
                admin_name: name.trim(),
                admin_phone: cleanPhone
              };

              sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
              sessionStorage.setItem("adminDetails", JSON.stringify(updatedAdminDetails));
              setUser({ ...updatedUserData, ...updatedAdminDetails });
            }

            // Sync with other tabs/components
            window.dispatchEvent(new Event("profileUpdate"));
          } else {
            toast.error(res.message || "Failed to update profile details");
          }
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || "Failed to update profile details");
        } finally {
          setUpdatingDetails(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    );
  };

  // Profile Image Selection Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Open confirm dialog with the newly selected image preview
    openConfirm(
      "image",
      "Confirm Profile Picture Change",
      "Would you like to upload this selected picture as your new profile photo?",
      async () => {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("id", String(user.id));
        formData.append("image", file);

        try {
          const endpoint = user.user_type === "admin"
            ? API_ENDPOINTS.UPDATE_PROFILE_IMAGE
            : "/app/user/updateSubadminimage";

          const res = await postFormData(endpoint, formData);

          if (res.status == 200 || res.status === "success" || res.status === true || res.success) {
            let imageUrl = res?.image || res?.data?.image || res?.path || res?.subadmin?.image || res?.data?.subadmin?.image || res?.image_name;

            if (imageUrl) {
              let filename = imageUrl;
              if (imageUrl.startsWith("http")) {
                filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
              } else if (imageUrl.includes("/")) {
                filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
              }

              // Update sessionStorage
              if (user.user_type === "sub_admin") {
                const existing = JSON.parse(sessionStorage.getItem("subAdmin") || "{}");
                const updated = { 
                  ...existing, 
                  image: filename,
                  image_path: res?.image_path || res?.data?.image_path || existing.image_path || "https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original"
                };
                sessionStorage.setItem("subAdmin", JSON.stringify(updated));
                setUser(updated);
              } else {
                const existingUserData = JSON.parse(sessionStorage.getItem("userData") || "{}");
                const existingAdminDetails = JSON.parse(sessionStorage.getItem("adminDetails") || "{}");

                const updatedUserData = { ...existingUserData, image: filename };
                const updatedAdminDetails = { ...existingAdminDetails, image: filename };

                sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
                sessionStorage.setItem("adminDetails", JSON.stringify(updatedAdminDetails));
                setUser({ ...updatedUserData, ...updatedAdminDetails });
              }

              toast.success("Profile picture updated successfully!");
              window.dispatchEvent(new Event("profileUpdate"));
            } else {
              toast.error("Upload succeeded, but no image URL was returned");
            }
          } else {
            toast.error(res.message || "Failed to upload image");
          }
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || "Upload error occurred");
        } finally {
          setUploadingImage(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    );
  };

  // Change Password Handler
  const changePasswordSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password do not match");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 15) {
      toast.error("New Password must be between 8 and 15 characters");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast.error("New Password must contain at least one lowercase letter");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error("New Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error("New Password must contain at least one digit");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      toast.error("New Password must contain at least one special character");
      return;
    }

    openConfirm(
      "password",
      "Confirm Password Change",
      "Are you sure you want to change your password? You will need to use your new password next time you log in.",
      async () => {
        setChangingPassword(true);
        try {
          const res = await postRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
            id: user.id,
            old_password: oldPassword,
            password: newPassword
          });

          if (res.status == 200 || res.status === "success" || res.status === true) {
            if (res.status == 400 || res.error_message) {
              toast.error(res.error_message || res.message || "Failed to change password");
              return;
            }
            toast.success("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } else {
            toast.error(res.error_message || res.message || "Failed to change password");
          }
        } catch (err) {
          const errorData = err.response?.data;
          const errorMsg = errorData?.error_message || errorData?.message || err.message || "Failed to change password";
          toast.error(errorMsg);
        } finally {
          setChangingPassword(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    );
  };

  const handleBackToDashboard = () => {
    if (!user) return;
    if (user.user_type === "admin") {
      router.push("/admin-page");
    } else if (user.user_type === "sub_admin") {
      router.push("/admin-page/sub-admin-page");
    }
  };

  const currentAvatarSrc = getUserImage(user);
  const initials = user?.name ? user.name.trim()[0].toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <ToastContainer />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button / Page Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-[1.125rem] w-[1.125rem]" />
            Back to {user?.user_type === "sub_admin" ? "Sub-Admin Dashboard" : "Admin Dashboard"}
          </button>
        </div>

        {/* Dynamic Layout */}
        <div className={user?.user_type === "sub_admin" ? "max-w-2xl mx-auto w-full" : "grid grid-cols-1 lg:grid-cols-12 gap-8"}>
          
          {/* LEFT CARD - Profile Info & Image */}
          <div className={user?.user_type === "sub_admin" ? "w-full" : "lg:col-span-5 flex flex-col gap-6"}>
            <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl p-6 sm:p-8 transition-all duration-300">
              
              <div className="flex flex-col items-center mb-6">
                
                {/* Avatar wrapper */}
                <div className="relative">
                  {/* Avatar container */}
                  <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-muted shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center">
                    
                    {currentAvatarSrc ? (
                      <img
                        src={currentAvatarSrc}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                        {initials}
                      </span>
                    )}

                    {/* Overlay on Hover */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                      aria-label="Upload profile image"
                    >
                      <Camera className="h-6 w-6 mb-1 text-zinc-200" />
                      <span className="text-[10px] font-semibold tracking-wider uppercase">
                        Change Photo
                      </span>
                    </button>

                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white text-xs">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Camera icon down right side */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg border border-white dark:border-zinc-900 transition-all hover:scale-110 duration-200 cursor-pointer"
                    aria-label="Change profile image"
                  >
                    <Camera className="h-[1.125rem] w-[1.125rem]" />
                  </button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                <h3 className="mt-4 text-lg font-bold text-foreground leading-tight">
                  {name || "User Profile"}
                </h3>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-widest mt-1 bg-blue-500/10 dark:bg-blue-500/20 px-3 py-1 rounded-full">
                  {user?.user_type === "sub_admin" ? "Section Admin" : "Admin"}
                </span>
              </div>

              <div className="space-y-4">
                
                {/* Readonly username/email */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 block">
                    Email / ID
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                    <Input
                      value={user?.user_id || ""}
                      disabled
                      className="h-11 pl-10 rounded-xl w-full bg-[var(--input-bg)] opacity-60 border border-[var(--input-border)] text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 block">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="h-11 pl-10 rounded-xl w-full border bg-[var(--input-bg)] border-[var(--input-border)] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="profile-phone" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 block">
                    Phone Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                    <Input
                      id="profile-phone"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="11-digit Phone Number (Optional)"
                      className="h-11 pl-10 rounded-xl w-full border bg-[var(--input-bg)] border-[var(--input-border)] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Only digits are allowed. Must be exactly 11 digits.
                  </p>
                </div>

                {/* Save details button */}
                <Button
                  onClick={saveDetails}
                  disabled={updatingDetails}
                  className="w-full h-11 mt-6 rounded-xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg shadow-blue-500/20 flex gap-2 items-center justify-center"
                >
                  {updatingDetails ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile Details
                </Button>

              </div>

            </div>
          </div>

          {/* RIGHT CARD - Change Password */}
          {user?.user_type !== "sub_admin" && (
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-card backdrop-blur-xl border border-border shadow-xl rounded-2xl p-6 sm:p-8 transition-all duration-300">
                
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">
                  Change Account Password
                </h2>
                <p className="text-xs text-muted-foreground mb-6">
                  Ensure your account is secure by using a strong, unique password.
                </p>

                <div className="space-y-4">
                  
                  {/* Old Password */}
                  <div>
                    <Label htmlFor="old-password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 block">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                      <Input
                        id="old-password"
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter Current Password"
                        className="h-11 pl-10 pr-10 rounded-xl w-full border bg-[var(--input-bg)] border-[var(--input-border)] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showOldPassword ? <EyeOff className="h-[1.125rem] w-[1.125rem]" /> : <Eye className="h-[1.125rem] w-[1.125rem]" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <Label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 block">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter New Password (8-15 characters)"
                        maxLength={15}
                        className="h-11 pl-10 pr-10 rounded-xl w-full border bg-[var(--input-bg)] border-[var(--input-border)] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-[1.125rem] w-[1.125rem]" /> : <Eye className="h-[1.125rem] w-[1.125rem]" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {newPassword && (() => {
                      const strength = checkPasswordStrength(newPassword);
                      return (
                        <div className="mt-2.5 p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] opacity-90 transition-all duration-300">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-muted-foreground">Password Strength:</span>
                            <span className={`font-bold transition-all duration-300 ${strength.color}`}>{strength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.bgColor : "bg-muted"}`} />
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.bgColor : "bg-muted"}`} />
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.bgColor : "bg-muted"}`} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Must be 8-15 characters, containing at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special symbol.
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5 block">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.125rem] w-[1.125rem] text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter New Password"
                        className="h-11 pl-10 pr-10 rounded-xl w-full border bg-[var(--input-bg)] border-[var(--input-border)] text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-[1.125rem] w-[1.125rem]" /> : <Eye className="h-[1.125rem] w-[1.125rem]" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Change Password button */}
                  <Button
                    onClick={changePasswordSubmit}
                    disabled={changingPassword}
                    className="w-full h-11 mt-6 rounded-xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg shadow-blue-500/20 flex gap-2 items-center justify-center"
                  >
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    Change Password
                  </Button>

                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* Reusable confirmation modal */}
      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(isOpen) => setConfirmModal((prev) => ({ ...prev, isOpen }))}
      >
        <DialogContent className="max-w-md p-6 rounded-2xl border border-border shadow-2xl backdrop-blur-md bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              {confirmModal.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {confirmModal.description}
            </DialogDescription>
          </DialogHeader>

          {/* Special Preview for Profile Image Confirmation */}
          {confirmModal.type === "image" && previewUrl && (
            <div className="flex flex-col items-center my-4 p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)]">
              <span className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">New Avatar Preview</span>
              <img
                src={previewUrl}
                alt="New upload preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/30 shadow-md"
              />
            </div>
          )}

          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                // If cancelled image upload, clean up memory reference
                if (confirmModal.type === "image") {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              }}
              className="px-5 h-10.5 rounded-xl border border-border hover:bg-muted/50 transition-colors text-xs font-semibold text-foreground/80"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmModal.onConfirm}
              className="px-5 h-10.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-blue-500/10 transition-all"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
