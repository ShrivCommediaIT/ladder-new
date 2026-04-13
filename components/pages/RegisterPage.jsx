



// ====================================== with email id register page ======================================
"use client";

import { useState } from "react";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify"; // Kept for API success/failure
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clubIdPage, loginPage } from "@/helper/RouteName";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- ZOD SCHEMA ---------------- */

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    username: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ---------------- COMPONENT ---------------- */

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // New state for validation errors

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for a field when user starts typing again
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /* ---------------- REGISTER FUNCTION ---------------- */

  const handleRegister = async () => {
    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
      // ✅ Better way: flatten() use karein errors nikalne ke liye
      const fieldErrors = validation.error.flatten().fieldErrors;

      // fieldErrors ek array return karta hai, humein sirf pehla message chahiye
      const formattedErrors = {};
      for (const key in fieldErrors) {
        formattedErrors[key] = fieldErrors[key][0];
      }

      setErrors(formattedErrors);
      return;
    }

    // Reset errors if validation passes
    setErrors({});

    const payload = {
      user_id: formData.username,
      password: formData.password,
      name: formData.name,
      user_type: "admin",
    };

    try {
      setLoading(true);
      await postRequest(API_ENDPOINTS.REGISTER, payload);

      toast.success("Account created successfully!");
      setTimeout(() => router.push(loginPage), 1500);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI HELPER ---------------- */

  const ErrorMsg = ({ message }) =>
    message ? (
      <p className="text-red-500 text-xs mt-1 animate-pulse">{message}</p>
    ) : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-indigo-900 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-900 z-0"></div>

      {/* Left Section */}
      <motion.div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 lg:py-0 relative z-10">
        <div className="text-center max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-zinc-900">
            Welcome to <br />{" "}
            <span className="text-black">Sports Solutions Pro</span>
          </h2>
          <p className="lg:block text-white/90 text-lg mt-6 leading-relaxed">
            Manage your internal club competitions with real time digital score
            inputs, live rankings, leaderboards, ladders, mini-leagues and more
            — perfect for coaching, motivation and self-improvement.
          </p>
        </div>
      </motion.div>

      {/* Right Section - Form */}
      <motion.div className="w-full lg:w-1/2 flex items-center justify-center px-4 pb-10 lg:pb-0 relative z-10">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-800">
                Create Your Account
              </h1>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <Label className="font-semibold text-gray-700 mb-2">
                Full Name
              </Label>
              <Input
                className={errors.name ? "border-red-500" : ""}
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <ErrorMsg message={errors.name} />
            </div>

            {/* Email */}
            <div className="mb-4">
              <Label className="font-semibold text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                className={errors.username ? "border-red-500" : ""}
                placeholder="you@example.com"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
              <ErrorMsg message={errors.username} />
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <Label className="font-semibold text-gray-700 mb-2">
                Password
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0.5 top-6 cursor-pointer h-8 w-8 rounded flex items-center justify-center text-gray-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <ErrorMsg message={errors.password} />
            </div>

            {/* Confirm Password */}
            <div className="mb-6 relative">
              <Label className="font-semibold text-gray-700 mb-2">
                Confirm Password
              </Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0.5 top-6 cursor-pointer h-8 w-8 rounded flex items-center justify-center text-gray-800"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <ErrorMsg message={errors.confirmPassword} />
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 text-lg rounded-xl font-bold bg-teal-800 hover:bg-teal-900 text-white cursor-pointer"
            >
              {loading ? "Creating Account..." : "Register Now"}
            </Button>

            <div className="mt-6 text-center text-sm text-black">
              Already have an account?{" "}
              <Link href={loginPage} className="text-blue-600 font-medium">
                Login here
              </Link>
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              Already have a Club Id?{" "}
              <Link href={clubIdPage} className="text-purple-500 font-medium">
                Login with ClubId
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
