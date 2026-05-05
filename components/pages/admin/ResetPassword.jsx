
"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  resetResetPasswordState,
} from "@/redux/slices/resetPasswordSlice";

const ResetPassword = ({ param }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const dispatch = useDispatch();

  const { loading, success, error } = useSelector(
    (state) => state.resetPassword
  );

  const handleReset = () => {
    if (!email || !newPassword) {
      toast.error("Email and New Password are required!");
      return;
    }

    dispatch(resetPassword({ email, password: newPassword, id: param }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Password reset successful!");
      setEmail("");
      setNewPassword("");
      dispatch(resetResetPasswordState());

      // ✅ Wait 1.5 sec so toast can be seen, then redirect
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
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
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
