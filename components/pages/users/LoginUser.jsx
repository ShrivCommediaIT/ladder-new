

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, ArrowRight, CalendarIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";
import "react-toastify/dist/ReactToastify.css";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "PIN must be at least 4 digits"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    dob: z.date().optional(),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(4, "PIN must be at least 4 digits"),
    confirmPassword: z.string().min(4, "Confirm your PIN"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PINs do not match",
    path: ["confirmPassword"],
  });

const brandGradient = "linear-gradient(135deg, var(--landing-primary), var(--landing-secondary))";

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200"
      style={
        active
          ? {
              background: brandGradient,
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(41, 171, 226, 0.26)",
            }
          : {
              color: "rgba(215, 228, 255, 0.76)",
            }
      }
    >
      {children}
    </button>
  );
}

export default function LoginUser({ ladderId, ladderType }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ direct params (NO decode)
  const finalLadderId =
    searchParams.get("ladder_id");

  const finalLadderType =
    searchParams.get("ladder_type");

  const from = searchParams.get("from");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      dob: undefined,
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (from === "ladder") {
      toast.info(
        "Use the same exact details you used to create your account.",
        { autoClose: 5000 }
      );
    }
  }, [from]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
  };

  // ================= LOGIN =================
  const onLoginSubmit = async (values) => {
    if (!finalLadderId || !finalLadderType)
      return toast.error("Ladder ID or type missing!");

    setLoading(true);

    try {
      const res = await postRequest(API_ENDPOINTS.LOGIN, {
        user_id: values.username,
        password: values.password,
        user_type: "user",
        ladder_id: finalLadderId,
        ladder_type: finalLadderType,
      });

      const userData = res?.data;

      if (!userData?.id) {
        toast.error("Invalid credentials.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ladder_id: finalLadderId,
          ladder_type: finalLadderType,
          isLoggedIn: true,
          ShowBot: false
        })
      );

      sessionStorage.setItem(
        "adminDetails",
        JSON.stringify({ id: res?.admin_id })
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

  // ================= REGISTER =================
  const onRegisterSubmit = async (values) => {
    if (!values.dob) {
      toast.error("Please select date of birth");
      return;
    }

    if (!finalLadderId || !finalLadderType)
      return toast.error("Ladder ID or type missing!");

    setLoading(true);

    const age = calculateAge(values.dob);
    const dobString = format(values.dob, "dd/MM/yyyy");

    try {
      await postRequest(API_ENDPOINTS.REGISTER, {
        user_id: values.username,
        password: values.password,
        name: values.name,
        user_type: "user",
        ladder_id: finalLadderId,
        ladder_type: finalLadderType,
        age: age,
        dob: dobString,
      });

      toast.success("Account created successfully!");
      registerForm.reset();
      switchMode("login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
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
    <>
      <ToastContainer />
      <div className="min-h-screen overflow-hidden" style={{ backgroundColor: "#050d25" }}>
        <div className="relative min-h-screen">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(41, 171, 226, 0.18), transparent 34%), linear-gradient(180deg, #07112f 0%, #040a1c 100%)",
            }}
          />

          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.45))",
            }}
          />

          <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left Side - Image and Text */}
            <div className="relative min-h-[380px] overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
              <div className="absolute inset-0">
                <Image
                  src="/login/select-game.2.jpeg"
                  alt="Badminton player in action"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,28,0.92)_0%,rgba(5,16,40,0.75)_42%,rgba(5,16,40,0.38)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(41,171,226,0.2),transparent_36%)]" />
              </div>

              <div className="relative z-10 flex h-full max-w-xl flex-col justify-between">
                <div className="space-y-8 pt-2 lg:pt-10">
                  <div
                    className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
                    style={{
                      borderColor: "rgba(41, 171, 226, 0.35)",
                      backgroundColor: "rgba(8, 33, 78, 0.78)",
                      color: "var(--landing-secondary)",
                      boxShadow: "0 0 24px rgba(41, 171, 226, 0.12)",
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: "var(--landing-secondary)" }}
                    />
                    Live Platform
                  </div>

                  <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-white lg:text-5xl">
                      Player Portal
                    </h1>
                    <p className="text-lg text-gray-300">
                      Join the competition. Track your progress, challenge opponents, and climb the ladder.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pb-2 lg:pb-10">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500" />
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-blue-500" />
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-500" />
                    </div>
                    <p className="text-sm text-gray-300">
                      Join <span className="font-semibold text-white">50,000+</span> players worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <div className="w-full max-w-[470px] gap-0 overflow-hidden rounded-[32px] border px-0 py-0 shadow-[0_30px_80px_rgba(0,0,0,0.34)]"
                style={{
                  borderColor: "rgba(69, 115, 214, 0.45)",
                  backgroundColor: "rgba(13, 24, 63, 0.94)",
                }}
              >
                {/* Tabs */}
                <div className="flex rounded-[22px] border p-1.5 mx-6 mt-6" style={{ borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(255, 255, 255, 0.043)" }}>
                  <TabButton active={mode === "login"} onClick={() => switchMode("login")}>
                    Login
                  </TabButton>
                  <TabButton active={mode === "register"} onClick={() => switchMode("register")}>
                    Register
                  </TabButton>
                </div>

                <Card className="border-0 bg-transparent shadow-none">
                  <CardContent className="px-6 pb-6">
                  {/* Heading */}
                  <div className="flex flex-col items-center gap-4 mb-6">
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={handleEyeClick}
                        className="rounded-full p-3 shadow-lg bg-gradient-to-tr from-blue-100 to-purple-100 hover:scale-105 transition-transform"
                      >
                        <Image src="/eyeLogin.png" alt="eye icon" height={80} width={80} className="rounded-full" />
                      </button>
                    )}

                    <h2 className="text-3xl font-extrabold text-white">
                      {mode === "login" ? "Player Login" : "Player Register"}
                    </h2>

                    <p className="text-gray-300 text-center">
                      {mode === "login" ? "Please login to your account" : "Create your player account"}
                    </p>
                  </div>

                  {/* Username */}
                  <div className="mb-6">
                    <Label className="text-sm font-semibold text-slate-200">
                      {mode === "login" ? "Username" : "Name"}
                    </Label>
                    <Input
                      value={mode === "login" ? loginForm.watch("username") : registerForm.watch("name")}
                      onChange={(e) => mode === "login" ? loginForm.setValue("username", e.target.value) : registerForm.setValue("name", e.target.value)}
                      className="h-[52px] rounded-2xl border-0 bg-[#1a254f] text-white placeholder:text-slate-400 focus-visible:ring-2"
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                      }}
                      placeholder={mode === "login" ? "Enter your username" : "Enter your full name"}
                    />
                  </div>

                  {mode === "register" && (
                    <>
                      {/* Date of Birth */}
                      <div className="mb-6">
                        <Label className="text-sm font-semibold text-slate-200">
                          Date of Birth
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-[52px] w-full justify-start rounded-2xl border-0 bg-[#1a254f] text-left font-normal text-white placeholder:text-slate-400 focus-visible:ring-2"
                              style={{
                                boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                              }}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {registerForm.watch("dob") ? (
                                format(registerForm.watch("dob"), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={registerForm.watch("dob")}
                              onSelect={(date) => registerForm.setValue("dob", date)}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div className="mb-8 relative">
                    <Label className="text-sm font-semibold text-slate-200">
                      {mode === "login" ? "PIN" : "Username"}
                    </Label>

                    <Input
                      value={mode === "login" ? loginForm.watch("password") : registerForm.watch("username")}
                      onChange={(e) => mode === "login" ? loginForm.setValue("password", e.target.value.replace(/\D/g, "").slice(0, 4)) : registerForm.setValue("username", e.target.value)}
                      className="h-[52px] rounded-2xl border-0 bg-[#1a254f] text-white placeholder:text-slate-400 focus-visible:ring-2"
                      style={{
                        boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                      }}
                      placeholder={mode === "login" ? "Enter your PIN" : "Choose a username"}
                    />

                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-9 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center"
                      >
                        {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    )}
                  </div>

                  {mode === "register" && (
                    <>
                      {/* PIN */}
                      <div className="mb-8 relative">
                        <Label className="text-sm font-semibold text-slate-200">
                          PIN
                        </Label>

                        <Input
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerForm.watch("password")}
                          onChange={(e) => registerForm.setValue("password", e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="h-[52px] rounded-2xl border-0 bg-[#1a254f] px-11 text-white placeholder:text-slate-400 focus-visible:ring-2"
                          style={{
                            boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                          }}
                          placeholder="Create a PIN"
                        />

                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-9 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center"
                        >
                          {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      {/* Confirm PIN */}
                      <div className="mb-8 relative">
                        <Label className="text-sm font-semibold text-slate-200">
                          Confirm PIN
                        </Label>

                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={registerForm.watch("confirmPassword")}
                          onChange={(e) => registerForm.setValue("confirmPassword", e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="h-[52px] rounded-2xl border-0 bg-[#1a254f] px-11 text-white placeholder:text-slate-400 focus-visible:ring-2"
                          style={{
                            boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                          }}
                          placeholder="Confirm your PIN"
                        />

                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-9 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Button */}
                  <Button
                    className="h-[52px] w-full rounded-2xl text-base font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--landing-primary), var(--landing-secondary))",
                      boxShadow: "0 16px 34px rgba(41, 171, 226, 0.28)",
                    }}
                    onClick={mode === "login" ? loginForm.handleSubmit(onLoginSubmit) : registerForm.handleSubmit(onRegisterSubmit)}
                    disabled={loading}
                  >
                    {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Login" : "Register")}
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </div>

    </>
  );
}
