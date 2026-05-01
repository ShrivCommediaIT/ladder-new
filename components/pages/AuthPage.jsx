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
  Trophy,
  UserRound,
  Users2,
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

const loginSchema = z.object({
  username: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    username: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const heroPoints = [
  { icon: CalendarCheck2, label: "Manage Bookings" },
  { icon: Users2, label: "Track Players" },
  { icon: Trophy, label: "Run Tournaments" },
];

const brandGradient = "var(--background-image-gradient-brand)";

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
      password: "",
      confirmPassword: "",
    },
  });

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
      const res = await dispatch(loginUser(payload)).unwrap();

      if (res?.data?.user_type === "user") {
        toast.error("Incorrect login type! This account is a normal user, not an admin.");
        return;
      }

      if (res?.status === 200) {
        const userData = {
          ...res.data,
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
      <div className="min-h-screen overflow-hidden bg-background">
        {/* Floating Theme Toggle */}
        <div className="fixed top-4 right-4 z-[60]">
          <ThemeToggle />
        </div>
        <div className="relative min-h-screen">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(41, 171, 226, 0.18), transparent 34%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.45))",
          }}
        />

        <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative min-h-[380px] overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
            <div className="absolute inset-0">
              <Image
                src="/login/select-game.3.jpeg"
                alt="Badminton player in action"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,47,0.92)_0%,rgba(7,17,47,0.75)_42%,rgba(7,17,47,0.38)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(41,171,226,0.2),transparent_36%)]" />
            </div>

            <div className="relative z-10 flex h-full max-w-xl flex-col justify-between">
              <div className="space-y-8 pt-2 lg:pt-10">
                <div
                  className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    borderColor: "rgba(41, 171, 226, 0.35)",
                    backgroundColor: "rgba(10, 24, 54, 0.78)",
                    color: "var(--primary)",
                    boxShadow: "0 0 24px rgba(41, 171, 226, 0.12)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                  Live Platform
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-md text-h11 font-extrabold leading-[0.95] text-white">
                    Welcome
                    <br />
                    Back,
                  </h1>

                  <p className="max-w-md text-p2 leading-8 text-slate-300">
                    Manage your internal club competitions with real-time digital scoring,
                    player tracking, bookings, and live leaderboards in one place.
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-4 lg:mb-6">
                {heroPoints.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-4 text-slate-100">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                      style={{
                        borderColor: "rgba(41, 171, 226, 0.3)",
                        backgroundColor: "rgba(9, 28, 66, 0.72)",
                        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.28)",
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    </div>
                    <span className="text-p1 font-medium tracking-[0.01em]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
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
                        boxShadow: "0 12px 28px rgba(41, 171, 226, 0.28)",
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
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
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
                            boxShadow: "0 16px 34px rgba(41, 171, 226, 0.28)",
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
                                    className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
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
                            boxShadow: "0 16px 34px rgba(41, 171, 226, 0.28)",
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
