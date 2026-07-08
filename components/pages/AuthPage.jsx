"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import {
  ArrowRight,
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  Users2,
  Activity,
  Target,
  Award,
  Phone,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
import { adminPage, clubIdPage, loginPage, registerPage } from "@/helper/RouteName";
import { loginUser, resetUserState } from "@/redux/slices/userSlice";
import {
  forgotPassword,
  resetForgotPasswordState,
} from "@/redux/slices/forgetPasswordSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import "react-toastify/dist/ReactToastify.css";
import { isValidEmail, checkPasswordStrength } from "@/lib/utils";

const emailValidation = z
  .string()
  .min(1, "Email is required")
  .max(35, "Email must be at most 35 characters")
  .refine(isValidEmail, {
    message: "Invalid email domain or format. Supported domains: .com, .in, .org, .net, .edu, .gov, .co",
  });

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(15, "Password must be at most 15 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const loginSchema = z.object({
  username: emailValidation,
  password: passwordValidation,
});

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .max(20, "Name must be at most 20 characters"),
    username: emailValidation,
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{11}$/.test(val),
        "Phone number must be exactly 11 digits"
      ),
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const heroPoints = [
  { icon: CalendarCheck2, label: "Automate Competitions" },
  { icon: Activity, label: "Track Activity" },
  { icon: Target, label: "Set Challenges" },
  { icon: Award, label: "Create Records" },
];
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

export default function AuthPage({ initialMode = "login" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [mode, setMode] = useState(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const { loading, error, isFreePlanExpired } = useSelector((state) => state.user);
  const {
    loading: forgotLoading,
    success: forgotSuccess,
    error: forgotError,
  } = useSelector((state) => state.forgotPassword);

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
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerPassword = registerForm.watch("password") || "";
  const passwordStrength = registerPassword ? checkPasswordStrength(registerPassword) : null;

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (searchParams.get("from") === "ladder") {
      toast.info("Use the same exact details you used to create your account.", {
        autoClose: 5000,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (forgotSuccess) {
      toast.success("Reset link sent to your registered email!");
      setIsForgotOpen(false);
      setForgotEmail("");
      dispatch(resetForgotPasswordState());
    }

    if (forgotError) {
      toast.error(typeof forgotError === "string" ? forgotError : "Failed to send reset link");
      dispatch(resetForgotPasswordState());
    }
  }, [dispatch, forgotError, forgotSuccess]);

  useEffect(() => {
    if (error) {
      dispatch(resetUserState());
    }
  }, [dispatch, error]);

  const switchMode = (nextMode, updateRoute = true) => {
    setMode(nextMode);

    if (!updateRoute) return;

    const nextPath = nextMode === "login" ? loginPage : registerPage;
    if (pathname !== nextPath) {
      router.replace(nextPath);
    }
  };

  const onLoginSubmit = async (values) => {
    const payload = {
      user_id: values.username.trim().toLowerCase(),
      password: values.password.trim(),
      user_type: "admin",
    };

    try {
      // Clear any previous session & reset redux user state
      sessionStorage.clear();
      dispatch(resetUserState());

      const res = await dispatch(loginUser(payload)).unwrap();

      if (res?.data?.user_type === "user") {
        toast.error("Incorrect login type! This account is a normal user, not an admin.");
        return;
      }

      if (res?.status === 200) {
        const userData = {
          ...res.data,
          image_path: res.image_path,
          subscription: res.subscription || null,
          isLoggedIn: true,
        };
        sessionStorage.setItem("userData", JSON.stringify(userData));
        sessionStorage.setItem("adminDetails", JSON.stringify(userData));
        toast.success(res?.success_message || "Login successful!");
        router.push(adminPage);
      }
    } catch (err) {
      toast.error(err?.error_message || err?.message || "Login failed.");
    }
  };

  const onRegisterSubmit = async (values) => {
    const payload = {
      user_id: values.username.trim().toLowerCase(),
      password: values.password.trim(),
      name: values.name.trim(),
      user_type: "admin",
      phone: values.phone || undefined,
    };

    try {
      setRegisterLoading(true);
      await postRequest(API_ENDPOINTS.REGISTER, payload);
      toast.success("Account created successfully!");
      registerForm.reset();
      switchMode("login", false);
      setTimeout(() => {
        router.replace(loginPage);
      }, 900);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email!");
      return;
    }

    dispatch(forgotPassword(forgotEmail.trim()));
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background">
      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-[60]">
        <ThemeToggle />
      </div>
      <div className="relative min-h-screen lg:h-screen lg:overflow-hidden">
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

        <div className="relative z-10 grid min-h-screen lg:h-screen lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative min-h-[380px] overflow-hidden px-6 py-8 sm:px-8 lg:h-screen lg:px-10 lg:py-6">
            <div className="absolute inset-0">
              <Image
                src="/login/select-game.3.jpeg"
                alt="Badminton player in action"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0" style={{ background: "var(--hero-image-overlay)" }} />
              <div className="absolute inset-0" style={{ background: "var(--hero-image-glow)" }} />
            </div>

            <div className="relative z-10 flex h-full max-w-xl flex-col justify-between">
              <div className="space-y-4 pt-1 lg:pt-2">
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

                <div className="space-y-3 lg:space-y-2">
                  {/* Top Welcome Title */}
                  <div className="space-y-1.5">
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                      Welcome to <br />
                      <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">Sports Solutions Pro</span><br />
                      <span className="text-cyan-400 text-h2 drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]">For Clubs and Coaches</span>
                    </h1>

                    <p className="max-w-md text-xs sm:text-sm leading-relaxed text-slate-300 mt-1 font-medium">
                      Manage your internal club competitions with real time digital score inputs, live rankings, leaderboards, ladders, mini leagues and more &ndash; perfect for coaching, motivation and self-improvement.
                    </p>
                  </div>

                  {/* Horizontal dividing glow separator */}
                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent my-3 lg:my-2" />

                  {/* Talent Board promo block */}
                  <div className="space-y-2 lg:space-y-1.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/10 p-4 lg:p-3.5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <Star className="h-4 w-4 fill-cyan-400/20" />
                      </div>
                      <h2 className="text-base font-extrabold tracking-wide uppercase text-white">
                        The SSP <span className="text-cyan-400">Talent Board</span>
                      </h2>
                    </div>

                    <div className="space-y-1.5 text-xs leading-relaxed text-slate-300 font-medium">
                      <p>
                        Please visit the SSP &ldquo;Talent Board&rdquo; and appreciate some of the amazing
                        talent and achievement achieved by dedicated and talented people worldwide.
                      </p>
                      <p>
                        If you are a talent scout please feel free to contact the promoter of the
                        relevant athlete or athlete&apos;s club for more information.
                      </p>
                    </div>

                    <div className="pt-1.5">
                      <Link
                        href="/#talent-board"
                        prefetch={false}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold border-b border-cyan-400/40 hover:border-cyan-400 transition-all pb-0.5 text-xs"
                      >
                        Click Here
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 lg:mt-3 space-y-2 lg:space-y-1.5 lg:mb-2">
                {heroPoints.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-slate-100">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: "var(--brand-badge-border)",
                        backgroundColor: "var(--brand-icon-surface)",
                        boxShadow: "var(--brand-icon-shadow)",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "var(--primary)" }} />
                    </div>
                    <span className="text-sm font-medium tracking-[0.01em]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex items-center justify-center px-4 py-8 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-10 lg:py-6">
            <Card
              className="w-full max-w-[470px] gap-0 rounded-[32px] border px-0 py-0 shadow-2xl"
              style={{
                background: "var(--auth-card-bg)",
                borderColor: "var(--auth-card-border)",
                boxShadow: "var(--auth-card-shadow)",
                backdropFilter: "blur(18px)",
              }}
            >
              <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{
                        background: brandGradient,
                        boxShadow: "var(--brand-card-shadow)",
                      }}
                    >
                      <ShieldCheck className="h-7 w-7 text-white" />
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-foreground">Sports Solutions Pro</p>
                      <p className="text-sm text-muted-foreground">Admin Dashboard </p>
                    </div>
                  </div>
                  <div
                    className="flex rounded-[22px] border p-1.5"
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
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate className="space-y-5">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 mb-2.5 block font-semibold text-foreground">
                                Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                    maxLength={35}
                                    {...field}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 mb-2.5 block font-semibold text-foreground">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    type={showLoginPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    maxLength={15}
                                    {...field}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowLoginPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
                                  >
                                    {showLoginPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={loading}
                          className="h-[52px] w-full rounded-2xl text-base font-bold text-white"
                          style={{
                            background: brandGradient,
                            boxShadow: brandButtonShadow,
                          }}
                        >
                          {loading ? "Logging in..." : "Login"}
                          {!loading && <ArrowRight className="h-5 w-5" />}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        noValidate
                        className="space-y-5"
                      >
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 font-semibold text-foreground">
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                    {...field}
                                    maxLength={20}
                                    className="h-[52px] px-11 rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 font-semibold text-foreground">
                                Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                    maxLength={35}
                                    {...field}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 font-semibold text-foreground">
                                Phone Number (Optional)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    type="text"
                                    placeholder="Enter 11-digit phone number"
                                    maxLength={11}
                                    {...field}
                                    onChange={(e) => {
                                      const cleanVal = e.target.value.replace(/\D/g, "").slice(0, 11);
                                      field.onChange(cleanVal);
                                    }}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 font-semibold text-foreground">
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    type={showRegisterPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Create your password"
                                    maxLength={15}
                                    {...field}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
                                  >
                                    {showRegisterPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                              {passwordStrength && (
                                <div className="mt-2.5 space-y-1.5 rounded-xl bg-black/10 p-3 border border-white/10">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Password Strength:</span>
                                    <span className={`font-bold transition-all duration-300 ${passwordStrength.color}`}>{passwordStrength.label}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.bgColor : "bg-white/10"}`} />
                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.bgColor : "bg-white/10"}`} />
                                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.bgColor : "bg-white/10"}`} />
                                  </div>
                                </div>
                              )}
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 font-semibold text-foreground">
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Confirm your password"
                                    maxLength={15}
                                    {...field}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={registerLoading}
                          className="h-[52px] w-full rounded-2xl text-base font-bold text-white"
                          style={{
                            background: brandGradient,
                            boxShadow: brandButtonShadow,
                          }}
                        >
                          {registerLoading ? "Creating account..." : "Register"}
                          {!registerLoading && <ArrowRight className="h-5 w-5" />}
                        </Button>
                      </form>
                    </Form>
                  )}

                  <div className="space-y-2 text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="w-full"
                      >
                        Don&apos;t have an account?{" "}
                        <span className="font-semibold" style={{ color: "var(--primary)" }}>
                          Register here
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="w-full"
                      >
                        Already have an account?{" "}
                        <span className="font-semibold" style={{ color: "var(--primary)" }}>
                          Login here
                        </span>
                      </button>
                    )}

                    <p>
                      Already have a Club ID?{" "}
                      <Link
                        href={clubIdPage}
                        prefetch={false}
                        className="font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        Login with ClubID
                      </Link>
                    </p>

                    {mode === "login" && (
                      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="w-full font-semibold"
                            style={{ color: "var(--primary)" }}
                          >
                            Forgot Password
                          </button>
                        </DialogTrigger>

                        <DialogContent
                          className="border border-border bg-card text-foreground"
                        >
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Enter your registered email to receive a reset link.
                            </p>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              className="h-[52px] rounded-2xl border-0 px-4 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                              style={{
                                backgroundColor: "var(--input-bg)",
                                boxShadow: "inset 0 0 0 1px var(--input-border)",
                              }}
                            />
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={handleForgotPassword}
                              disabled={forgotLoading}
                              className="h-11 w-full rounded-xl text-white"
                              style={{ background: brandGradient }}
                            >
                              {forgotLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {isFreePlanExpired && mode === "login" && (
                    <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200">
                      Your free plan has expired. Please upgrade to continue.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}
