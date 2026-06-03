"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminPage, subAdminPage } from "@/helper/RouteName";
import Link from "next/link";
import { loginPage } from "@/helper/RouteName";

import { LogIn, Loader2, Eye, EyeOff, ArrowRight, Shield, Key, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ---------------- ZOD SCHEMA ---------------- */
const formSchema = z.object({
  clubId: z
    .string()
    .min(3, "Club ID must be at least 3 letters")
    .max(8, "Club ID must be at most 8 letters")
    .regex(/^[A-Z]+$/, "Club ID must contain only uppercase letters (A-Z)"),

  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),

  userType: z.enum(["admin", "sub_admin"], {
    required_error: "Please select login type",
  }),
});

export default function LoginByClubForm() {
  const router = useRouter();
  const [userData, setUserData] = useState({ login_id: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dialog States (Sirf error ke liye)
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { clubId: "", pin: "", userType: "admin" },
  });

  const { setValue } = form;
  const brandButtonShadow = "var(--brand-button-shadow)";
  const brandTabShadow = "var(--brand-tab-shadow)";

  useEffect(() => {
    const saved = sessionStorage.getItem("userData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.login_id && parsed?.password) setUserData(parsed);
      } catch {
        sessionStorage.removeItem("userData");
      }
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Login ID: ${userData.login_id}, Password: ${userData.password}`,
    );
    toast.success("Credentials copied to clipboard!");
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const payload = {
      login_id: values.clubId,
      password: values.pin,
      user_type: values.userType,
    };

    try {
      let res;

      // ✅ First try
      try {
        res = await postRequest("/app/user/login", payload);
      } catch (e) {
        // ✅ Retry once automatically
        res = await postRequest("/app/user/login", payload);
      }

      // ✅ Response check
      if (res?.status !== 200 || !res) {
        setDialogTitle("Login Failed");
        setDialogMessage(res?.error_message || res?.message || "Invalid Club ID or PIN");
        setOpen(true);
        return;
      }

      // ✅ Success storage logic
      const storageKey =
        values.userType === "sub_admin" ? "subAdmin" : "userData";

      const user =
        values.userType === "sub_admin"
          ? { ...(res.subadmin || {}), isLoggedIn: true }
          : { ...(res.data || {}), isLoggedIn: true };

      sessionStorage.setItem(storageKey, JSON.stringify(user));
      sessionStorage.setItem("adminDetails", JSON.stringify({ ...(res.data || {}), }));

      const route = values.userType === "sub_admin" ? subAdminPage : adminPage;

      router.push(route);
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      let message = "Something went wrong. Please try again.";

      if (err.code === "ECONNABORTED") {
        message = "Server timeout. Please try again.";
      } else if (!err.response) {
        message = "Network error or CORS blocked the request.";
      } else if (err.response?.data?.error_message) {
        message = err.response.data.error_message;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      setDialogTitle("Network Error");
      setDialogMessage(message);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen overflow-y-auto bg-background">
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
          <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
            {/* Left Side - Image and Text */}
            <div className="relative flex min-h-[400px] w-full flex-col overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:w-[58%] lg:px-14 lg:py-14">
              <div className="absolute inset-0">
                <Image
                  src="/login/select-game.3.jpeg"
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
                    <h1 className="text-h11 font-bold text-white">Welcome Back,</h1>
                    <p className="text-p2 text-slate-300">
                      Manage your sports club with ease. Access ladders, players, and competitions
                      all in one place.
                    </p>
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
                        Join <span className="font-semibold text-white">10,000+</span> clubs
                        worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className="relative flex w-full flex-1 items-center justify-center bg-muted/30 px-4 py-8 sm:px-6 lg:w-[42%] lg:px-10">
              <Card
                className="w-full max-w-[470px] border px-0 py-0 shadow-2xl rounded-[32px] overflow-hidden"
                style={{
                  background: "var(--auth-card-bg)",
                  borderColor: "var(--auth-card-border)",
                  boxShadow: "var(--auth-card-shadow)",
                  backdropFilter: "blur(18px)",
                }}
              >
                <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
                  <div className="space-y-6">
                    {/* Header Branding */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{
                          background: "var(--background-image-gradient-brand)",
                          boxShadow: "var(--brand-card-shadow)",
                        }}
                      >
                        <ShieldCheck className="h-7 w-7 text-white" />
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-foreground">Sports Solutions Pro</p>
                        <p className="text-sm text-muted-foreground">Club Portal</p>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                        {/* Club ID */}
                        <FormField
                          control={form.control}
                          name="clubId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 block mb-2.5 font-semibold text-foreground">
                                Club ID
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    {...field}
                                    placeholder="Enter Club ID "
                                    maxLength={8}
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value.toUpperCase().replace(/[^A-Z]/g, "")
                                      )
                                    }
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        {/* PIN */}
                        <FormField
                          control={form.control}
                          name="pin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 block mb-2.5 font-semibold text-foreground">
                                4-Digit PIN
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Key className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    maxLength={4}
                                    inputMode="numeric"
                                    onChange={(e) =>
                                      field.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))
                                    }
                                    className="h-[52px] rounded-2xl border-0 px-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                                    style={{
                                      backgroundColor: "var(--input-bg)",
                                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                                    }}
                                    placeholder="Enter 4 digit PIN"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition hover:text-primary"
                                  >
                                    {showPassword ? (
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

                        {/* Login Type Switcher (TabButton Style) */}
                        <FormField
                          control={form.control}
                          name="userType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-p3 block mb-2.5 font-semibold text-foreground">
                                Login As
                              </FormLabel>
                              <FormControl>
                                <div
                                  className="flex rounded-[22px] border p-1.5"
                                  style={{
                                    borderColor: "var(--border)",
                                    backgroundColor: "var(--muted)",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => field.onChange("admin")}
                                    className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200"
                                    style={
                                      field.value === "admin"
                                        ? {
                          background: "var(--background-image-gradient-brand)",
                          color: "#ffffff",
                          boxShadow: brandTabShadow,
                        }
                                        : {
                                            color: "var(--muted-foreground)",
                                          }
                                    }
                                  >
                                    Admin
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => field.onChange("sub_admin")}
                                    className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200"
                                    style={
                                      field.value === "sub_admin"
                                        ? {
                          background: "var(--background-image-gradient-brand)",
                          color: "#ffffff",
                          boxShadow: brandTabShadow,
                        }
                                        : {
                                            color: "var(--muted-foreground)",
                                          }
                                    }
                                  >
                                    Section Admin
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs text-red-300" />
                            </FormItem>
                          )}
                        />

                        {/* Saved Credentials */}
                        {userData.login_id && (
                          <div className="rounded-2xl border border-border bg-muted/40 p-4 flex items-center justify-between text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-1">
                              <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">ID:</span>{" "}
                                {userData.login_id}
                              </p>
                              <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">PIN:</span>{" "}
                                {userData.password}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCopy}
                              className="rounded-xl border-border bg-background/50 text-primary hover:bg-muted font-semibold shadow-sm"
                            >
                              Copy
                            </Button>
                          </div>
                        )}

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={loading}
                          className="h-[56px] w-full rounded-2xl text-base font-bold text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                          style={{
                            background: "var(--background-image-gradient-brand)",
                            boxShadow: brandButtonShadow,
                          }}
                        >
                          {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Login to Club <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-border/50 text-center text-p3 text-muted-foreground">
                      <p>
                        Admin or Section Admin?{" "}
                        <Link
                          href={loginPage}
                          className="text-primary font-semibold hover:underline"
                        >
                          Login here
                        </Link>
                      </p>
                      <p className="mt-3">
                        Need assistance?{" "}
                        <a
                          href="mailto:support@sportssolutionspro.com"
                          className="text-primary font-semibold hover:underline"
                        >
                          Contact Support
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Dialog */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md border-border bg-card text-foreground rounded-[32px]">
                  <DialogHeader>
                    <DialogTitle className="text-destructive text-xl font-bold">
                      {dialogTitle}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                      {dialogMessage}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="sm:justify-center pt-4">
                    <Button
                      onClick={() => setOpen(false)}
                      variant="destructive"
                      className="rounded-xl px-8 font-semibold"
                    >
                      OK, Understood
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

