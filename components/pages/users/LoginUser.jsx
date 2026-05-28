

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { format } from "date-fns";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";
import { calculateAge } from "@/lib/utils";
import "react-toastify/dist/ReactToastify.css";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    dob: z.date().optional(),
    password: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
    confirmPassword: z.string().min(1, "Confirm your PIN"),
    gender: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PINs do not match",
    path: ["confirmPassword"],
  });

const brandGradient = "var(--background-image-gradient-brand)";
const brandButtonShadow = "var(--brand-button-shadow)";
const brandTabShadow = "var(--brand-tab-shadow)";

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
              boxShadow: brandTabShadow,
            }
          : {
              color: "var(--muted-foreground)",
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
      password: "",
      confirmPassword: "",
      gender: "male",
    },
  });
  const { errors: loginErrors } = loginForm.formState;
  const { errors: registerErrors } = registerForm.formState;

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
        user_id: values.name,
        password: values.password,
        name: values.name,
        user_type: "user",
        ladder_id: finalLadderId,
        ladder_type: finalLadderType,
        age: age,
        dob: dobString,
        gender: finalLadderType !== "minileague" ? values.gender : undefined,
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
      <div className="min-h-screen overflow-hidden bg-background">
        {/* Floating Theme Toggle */}
        <div className="fixed top-4 right-4 z-[60]">
          <ThemeToggle />
        </div>
        <div className="relative min-h-screen">
          <div
            className="absolute inset-0"
            style={{
              background: "var(--page-glow-top-left)",
            }}
          />

          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "var(--page-grid-overlay)",
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
                <div className="absolute inset-0" style={{ background: "var(--hero-image-overlay)" }} />
                <div className="absolute inset-0" style={{ background: "var(--hero-image-glow)" }} />
              </div>

              <div className="relative z-10 flex h-full max-w-xl flex-col justify-between">
                <div className="space-y-8 pt-2 lg:pt-10">
                  <div
                    className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
                    style={{
                      borderColor: "var(--brand-badge-border)",
                      backgroundColor: "var(--brand-badge-bg)",
                      color: "var(--primary)",
                      boxShadow: "var(--brand-badge-shadow)",
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                    Live Platform
                  </div>

                  <div className="space-y-6">
                    <h1 className="text-h11 font-bold text-white">
                      Welcome Back,
                    </h1>
                    <p className="text-p2 text-slate-300">
                      Manage your sports club with ease. Access ladders, players, and competitions all in one place.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pb-2 lg:pb-10">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div
                        className="h-8 w-8 rounded-full border-2 border-white"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                      />
                      <div
                        className="h-8 w-8 rounded-full border-2 border-white"
                        style={{ background: "linear-gradient(135deg, var(--accent-theme), var(--primary))" }}
                      />
                      <div
                        className="h-8 w-8 rounded-full border-2 border-white"
                        style={{ background: "linear-gradient(135deg, var(--secondary), var(--accent-theme))" }}
                      />
                    </div>
                    <p className="text-sm text-slate-300">
                      Join <span className="font-semibold text-white">50,000+</span> players worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <Card
                className="w-full max-w-[470px] gap-0 rounded-[32px] border px-0 py-0 shadow-2xl"
                style={{
                  background: "var(--auth-card-bg)",
                  borderColor: "var(--auth-card-border)",
                  boxShadow: "var(--auth-card-shadow)",
                  backdropFilter: "blur(18px)",
                }}
              >
                <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
                    {/* Heading */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                      <button
                        type="button"
                        onClick={handleEyeClick}
                        className="rounded-full p-3 shadow-lg hover:scale-105 transition-transform bg-white"
                      >
                        <Image
                          src="/eyeLogin.png"
                          alt="eye icon"
                          height={80}
                          width={80}
                          className="rounded-full"
                        />
                      </button>

                      <h2 className="text-h3 font-extrabold text-foreground text-center">
                        {mode === "login" ? "Player Login" : "Player Register"}
                      </h2>

                      <p className="text-p2 text-muted-foreground text-center">
                        {mode === "login"
                          ? "Please login to your account"
                          : "Create your player account"}
                      </p>
                    </div>

                    {/* Tabs - MOVED HERE */}
                    <div
                      className="flex rounded-[22px] border p-1.5 mb-8"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--muted)",
                      }}
                    >
                      <TabButton active={mode === "login"} onClick={() => switchMode("login")}>
                        Login
                      </TabButton>
                      <TabButton active={mode === "register"} onClick={() => switchMode("register")}>
                        Register
                      </TabButton>
                    </div>

                  {mode === "login" ? (
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      {/* Username */}
                      <div>
                        <Label className="text-p3 block mb-2.5 font-semibold text-foreground">
                          Username
                        </Label>
                        <Input
                          {...loginForm.register("username")}
                          className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                          style={{
                            backgroundColor: "var(--input-bg)",
                            boxShadow: "inset 0 0 0 1px var(--input-border)",
                          }}
                          placeholder="Enter your username"
                        />
                        {loginErrors.username?.message && (
                          <p className="text-red-400 text-xs mt-1">{loginErrors.username.message}</p>
                        )}
                      </div>

                      {/* PIN */}
                      <div className="relative">
                        <Label className="text-p3 block mb-2.5 font-semibold text-foreground">
                          PIN
                        </Label>
                        <div className="relative">
                          <Input
                            type={showLoginPassword ? "text" : "password"}
                            {...loginForm.register("password")}
                            onChange={(e) => loginForm.setValue("password", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 pr-12"
                            style={{
                              backgroundColor: "var(--input-bg)",
                              boxShadow: "inset 0 0 0 1px var(--input-border)",
                            }}
                            placeholder="Enter your 6 digit PIN"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-3 bg-muted h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            {showLoginPassword ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                          </button>
                        </div>
                        {loginErrors.password?.message && (
                          <p className="text-red-400 text-xs mt-1">{loginErrors.password.message}</p>
                        )}
                      </div>

                      {/* Login Button */}
                      <Button
                        type="submit"
                        className="h-[52px] w-full rounded-2xl text-base font-bold text-white mt-4"
                        style={{
                          background: "linear-gradient(135deg, var(--landing-primary), var(--landing-secondary))",
                          boxShadow: brandButtonShadow,
                        }}
                        disabled={loading}
                      >
                        {loading ? "Logging in..." : "Login"}
                        {!loading && <ArrowRight className="h-5 w-5 ml-2 inline" />}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                      {/* Name */}
                      <div>
                        <Label className="text-p3 block mb-2.5 font-semibold text-foreground">
                          Name
                        </Label>
                        <Input
                          {...registerForm.register("name")}
                          className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                          style={{
                            backgroundColor: "var(--input-bg)",
                            boxShadow: "inset 0 0 0 1px var(--input-border)",
                          }}
                          placeholder="Enter your full name"
                        />
                        {registerErrors.name?.message && (
                          <p className="text-red-400 text-xs mt-1">{registerErrors.name.message}</p>
                        )}
                      </div>

                      {/* Gender Selection */}
                      {finalLadderType !== "minileague" && (
                        <div>
                          <Label className="text-p3 block mb-2.5 font-semibold text-foreground">
                            Gender
                          </Label>
                          <Select
                            value={registerForm.watch("gender")}
                            onValueChange={(val) => registerForm.setValue("gender", val)}
                          >
                            <SelectTrigger
                              className="w-full h-[52px] rounded-2xl border-0 text-foreground focus-visible:ring-2"
                              style={{
                                backgroundColor: "var(--input-bg)",
                                boxShadow: "inset 0 0 0 1px var(--input-border)",
                              }}
                            >
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-foreground">
                              <SelectItem className="focus:bg-accent focus:text-accent-foreground text-foreground cursor-pointer" value="male">Male</SelectItem>
                              <SelectItem className="focus:bg-accent focus:text-accent-foreground text-foreground cursor-pointer" value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          {registerErrors.gender?.message && (
                            <p className="text-red-400 text-xs mt-1">{registerErrors.gender.message}</p>
                          )}
                        </div>
                      )}

                      {/* Date of Birth */}
                      <div>
                        <Label className="text-p3 block mb-2.5 font-semibold text-foreground">
                          Date of Birth
                        </Label>
                        <DateOfBirthInput
                          id="dob"
                          value={registerForm.watch("dob")}
                          onChange={(date) =>
                            registerForm.setValue("dob", date ?? undefined, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className="text-white px-4 bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
                        />
                        {registerErrors.dob?.message && (
                          <p className="text-red-400 text-xs mt-1">{registerErrors.dob.message}</p>
                        )}
                      </div>

                      {/* PIN */}
                      <div className="relative">
                        <Label className="text-p3 block mb-2.5 font-semibold text-slate-200">
                          PIN
                        </Label>
                        <div className="relative">
                          <Input
                            type={showRegisterPassword ? "text" : "password"}
                            {...registerForm.register("password")}
                            onChange={(e) => registerForm.setValue("password", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 pr-12"
                            style={{
                              backgroundColor: "var(--input-bg)",
                              boxShadow: "inset 0 0 0 1px var(--input-border)",
                            }}
                            placeholder="Create a 6 digit PIN"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-3 bg-muted h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            {showRegisterPassword ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                          </button>
                        </div>
                        {registerErrors.password?.message && (
                          <p className="text-red-400 text-xs mt-1">{registerErrors.password.message}</p>
                        )}
                      </div>

                      {/* Confirm PIN */}
                      <div className="relative">
                        <Label className="text-p3 block mb-2.5 font-semibold text-foreground">
                          Confirm PIN
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            {...registerForm.register("confirmPassword")}
                            onChange={(e) => registerForm.setValue("confirmPassword", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                            className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 pr-12"
                            style={{
                              backgroundColor: "var(--input-bg)",
                              boxShadow: "inset 0 0 0 1px var(--input-border)",
                            }}
                            placeholder="Confirm your 6 digit PIN"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 bg-muted h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                          </button>
                        </div>
                        {registerErrors.confirmPassword?.message && (
                          <p className="text-red-400 text-xs mt-1">{registerErrors.confirmPassword.message}</p>
                        )}
                      </div>

                      {/* Register Button */}
                      <Button
                        type="submit"
                        className="h-[52px] w-full rounded-2xl text-base font-bold text-white mt-4"
                        style={{
                          background: "linear-gradient(135deg, var(--landing-primary), var(--landing-secondary))",
                          boxShadow: brandButtonShadow,
                        }}
                        disabled={loading}
                      >
                        {loading ? "Creating account..." : "Register"}
                        {!loading && <ArrowRight className="h-5 w-5" />}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
