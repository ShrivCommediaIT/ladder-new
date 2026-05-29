"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { changePassword, resetChangePasswordState } from "@/redux/slices/changePassword";
import { checkPasswordStrength } from "@/lib/utils";

const ChangePassword = ({ userId }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, success, error, message } = useSelector(
    (state) => state.changePassword
  );

  const handleChange = () => {
    if (!oldPassword || !newPassword) {
      toast.error("Both fields are required!");
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

    dispatch(changePassword({ id: userId, old_password: oldPassword, password: newPassword }));
  };

  useEffect(() => {
    if (success) {
      setOldPassword("");
      setNewPassword("");
      toast.success(message || "Password changed successfully!");
      dispatch(resetChangePasswordState());
    }
    if (error) {
      const errorMsg = typeof error === "string"
        ? error
        : (error.error_message || error.message || "Failed to change password");
      toast.error(errorMsg);
      dispatch(resetChangePasswordState());
    }
  }, [success, error, message, dispatch]);

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div>
        <Label htmlFor="oldPassword" className="text-sm font-semibold text-foreground">
          Old Password
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="oldPassword"
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter your old password"
            className="h-11 rounded-xl border-0 pr-10 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
            style={{
              backgroundColor: "var(--input-bg)",
              boxShadow: "inset 0 0 0 1px var(--input-border)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowOldPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
          >
            {showOldPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
          New Password
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            maxLength={15}
            className="h-11 rounded-xl border-0 pr-10 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
            style={{
              backgroundColor: "var(--input-bg)",
              boxShadow: "inset 0 0 0 1px var(--input-border)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {newPassword && (() => {
          const strength = checkPasswordStrength(newPassword);
          return (
            <div className="mt-2 space-y-1.5 rounded-xl bg-black/5 p-3 border border-black/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Password Strength:</span>
                <span className={`font-bold transition-all duration-300 ${strength.color}`}>{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.bgColor : "bg-black/10"}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.bgColor : "bg-black/10"}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.bgColor : "bg-black/10"}`} />
              </div>
            </div>
          );
        })()}
      </div>

      <Button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white mt-2"
        style={{
          background: "var(--background-image-gradient-brand)",
          boxShadow: "var(--brand-button-shadow)",
        }}
        onClick={handleChange}
        disabled={loading}
      >
        {loading ? "Changing..." : "Change Password"}
      </Button>
    </div>
  );
};

export default ChangePassword;
