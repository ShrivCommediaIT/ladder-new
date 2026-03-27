

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowRightLong } from "react-icons/fa6";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import EyeLogo from "@/public/eyeLogin.png";
import "react-toastify/dist/ReactToastify.css";

export default function LoginUser({ ladderId, ladderType }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ direct params (NO decode)
  const finalLadderId =
    searchParams.get("ladder_id") ;

  const finalLadderType =
    searchParams.get("ladder_type") ;

  const from = searchParams.get("from");

  // info toast
  useEffect(() => {
    if (from === "ladder") {
      toast.info(
        "Use the same exact details you used to create your account.",
        { autoClose: 5000 }
      );
    }
  }, [from]);

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!username || !password)
      return toast.error("Username and Password are required!");

    if (!finalLadderId || !finalLadderType)
      return toast.error("Ladder ID or type missing!");

    setLoading(true);

    try {
      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/login",
        {
          user_id: username,
          password,
          user_type: "user",
          ladder_id: finalLadderId,
          ladder_type: finalLadderType,
        },
        {
          headers: {
            APPKEY:
              "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
            "Content-Type": "application/json",
          },
        }
      );

      const userData = res?.data?.data;

      if (!userData?.id) {
        toast.error("Invalid credentials.");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ladder_id: finalLadderId,
          ladder_type: finalLadderType,
          isLoggedIn: true,
          ShowBot:false
        })
      );

      toast.success("Login successful!");

      router.push(
        `/user-page-redirect?ladder_id=${finalLadderId}&ladder_type=${finalLadderType}`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Login failed. Please check credentials."
      );
    }

    setLoading(false);
  };

  // eye click
  const handleEyeClick = () => {
    if (!finalLadderId || !finalLadderType) return;

    router.push(
      `/ladder-view?ladder_id=${finalLadderId}&tab=ladder&ladder_type=${finalLadderType}`
    );
  };

  // ================= UI =================
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 px-6">
      <ToastContainer />

      <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-gray-900/95 backdrop-blur-md border border-gray-700">
        <CardContent>
          {/* Heading */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <button
              type="button"
              onClick={handleEyeClick}
              className="rounded-full p-3 shadow-lg bg-gradient-to-tr from-blue-100 to-purple-100 hover:scale-105 transition-transform"
            >
              <Image src={EyeLogo} alt="eye icon" height={80} width={80} />
            </button>

            <h2 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text">
              Welcome Back!
            </h2>

            <p className="text-gray-300 text-center">
              Please login to your account
            </p>
          </div>

          {/* Username */}
          <div className="mb-6">
            <Label className="text-teal-400 text-md mb-1 block">
              Name
            </Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-gray-600 bg-gray-800 text-gray-100"
              placeholder="Enter your name"
            />
          </div>

          {/* Password */}
          <div className="mb-8 relative">
            <Label className="text-teal-400  text-md mb-1 block">
              4 Digit Pin (numbers only available)
            </Label>

            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              maxLength={4}
              inputMode="numeric"
              onChange={(e) =>
                setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="rounded-xl border-gray-600 bg-gray-800 text-gray-100 pr-12 text-lg tracking-widest"
              placeholder="Enter 4 digit PIN"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Button */}
          <Button
            className="w-full border border-teal-700 bg-teal-800 hover:bg-teal-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <FaArrowRightLong />}
          </Button>

          {/* Register */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Don't have an account?{" "}
              <Link
                href={`/register-user?ladder_id=${finalLadderId}&ladder_type=${finalLadderType}`}
                className="text-teal-400 font-semibold hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
