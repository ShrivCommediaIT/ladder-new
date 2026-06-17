"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { checkPasswordStrength } from "@/lib/utils";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  resetResetPasswordState,
} from "@/redux/slices/resetPasswordSlice";

const ResetPassword = ({ param }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();

  const { loading, success, error } = useSelector(
    (state) => state.resetPassword
  );

  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleReset = () => {
    if (!email || !newPassword || !confirmPassword) {
      toast.error("Email, New Password and Confirm Password are required!");
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
    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password do not match");
      return;
    }

    dispatch(resetPassword({ email, password: newPassword, id: param }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Password reset successful!");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      dispatch(resetResetPasswordState());

      // Wait 1.5 sec so toast can be seen, then redirect.
      setTimeout(() => {
        window.location.href = "https://sportssolutionspro.com/login-page";
      }, 1500);
    }

    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to reset password");
      dispatch(resetResetPasswordState());
    }
  }, [success, error, dispatch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <ToastContainer />
      <Card className="w-[380px] rounded-2xl border border-border bg-card shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="mb-4 text-center text-2xl font-bold text-primary">
            Reset Password
          </h2>

          <div>
            <Label htmlFor="email" className="font-semibold text-primary">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="newPassword" className="font-semibold text-primary">
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
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
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
                <div className="mt-2.5 space-y-1.5 rounded-xl bg-black/10 p-3 border border-white/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Password Strength:</span>
                    <span className={`font-bold transition-all duration-300 ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.bgColor : "bg-white/10"}`} />
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.bgColor : "bg-white/10"}`} />
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.bgColor : "bg-white/10"}`} />
                  </div>
                </div>
              );
            })()}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="font-semibold text-primary">
              Confirm Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                maxLength={15}
                className={`pr-10 ${passwordsMismatch ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            className="w-full font-semibold text-white hover:opacity-90"
            style={{
              background: "var(--background-image-gradient-brand)",
              boxShadow: "var(--brand-button-shadow)",
            }}
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;