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

import { LogIn, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";
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
        setDialogMessage(res?.message || "Invalid Club ID or PIN");
        setOpen(true);
        return;
      }

      // ✅ Success storage logic
      const storageKey =
        values.userType === "sub_admin" ? "subAdmin" : "userData";

      const user =
        values.userType === "sub_admin"
          ? { ...res.subadmin, isLoggedIn: true }
          : { ...res.data, isLoggedIn: true };

      sessionStorage.setItem(storageKey, JSON.stringify(user));
      sessionStorage.setItem("adminDetails", JSON.stringify({ ...res.data, }));

      const route = values.userType === "sub_admin" ? subAdminPage : adminPage;

      router.push(route);
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      let message = "Something went wrong. Please try again.";

      if (err.code === "ECONNABORTED") {
        message = "Server timeout. Please try again.";
      } else if (!err.response) {
        message = "Network error or CORS blocked the request.";
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
      <div className="min-h-screen overflow-hidden bg-background">
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
            {/* Left Side - Image and Text */}
            <div className="relative min-h-[380px] overflow-hidden px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-14">
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

                  <div className="space-y-6">
                    <h1 className="text-h11 font-bold text-white">
                      Welcome Back,
                    </h1>
                    <p className="text-p2 text-gray-300">
                      Manage your sports club with ease. Access ladders, players, and competitions all in one place.
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
                      Join <span className="font-semibold text-white">10,000+</span> clubs worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
              <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-gray-900/95 backdrop-blur-md border border-teal-500"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(10, 24, 54, 0.94)",
                }}
              >
                <CardContent>
                  {/* Heading */}
                  <div className="flex flex-col items-center gap-4 mb-6">

                    <h2 className="text-h3 font-extrabold text-white text-center">
                      Club Access
                    </h2>

                    <p className="text-p2 text-gray-300 text-center">
                      Enter your Club ID and PIN to access the dashboard
                    </p>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                      {/* Club ID */}
                      <FormField
                        control={form.control}
                        name="clubId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-p3 block mb-2.5 font-semibold text-slate-200">
                              Club ID
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter Club ID (A-Z only)"
                                maxLength={8}
                                className="h-[52px] rounded-2xl border-0 bg-[#1a254f] text-white placeholder:text-slate-400 focus-visible:ring-2"
                                style={{
                                  boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                                }}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .toUpperCase()
                                      .replace(/[^A-Z]/g, "")
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* PIN */}
                      <FormField
                        control={form.control}
                        name="pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-p3 block mb-2.5 font-semibold text-slate-200">
                              4-Digit PIN
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  maxLength={4}
                                  inputMode="numeric"
                                  onChange={(e) =>
                                    field.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))
                                  }
                                  className="h-[52px] rounded-2xl border-0 bg-[#1a254f] px-11 text-white placeholder:text-slate-400 focus-visible:ring-2"
                                  style={{
                                    boxShadow: "inset 0 0 0 1px rgba(120, 147, 214, 0.28)",
                                  }}
                                  placeholder="Enter 4 digit PIN"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center"
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Login Type */}
                      <FormField
                        control={form.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-p3 block mb-2.5 font-semibold text-slate-200">
                              Login As
                            </FormLabel>
                            <FormControl>
                              <div className="flex rounded-[22px] border p-1.5" style={{ borderColor: "rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(255, 255, 255, 0.043)" }}>
                                <button
                                  type="button"
                                  onClick={() => field.onChange("admin")}
                                  className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200"
                                  style={
                                    field.value === "admin"
                                      ? {
                                          background: "var(--background-image-gradient-brand)",
                                          color: "#ffffff",
                                          boxShadow: "0 10px 30px rgba(41, 171, 226, 0.26)",
                                        }
                                      : {
                                          color: "rgba(215, 228, 255, 0.76)",
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
                                          boxShadow: "0 10px 30px rgba(41, 171, 226, 0.26)",
                                        }
                                      : {
                                          color: "rgba(215, 228, 255, 0.76)",
                                        }
                                  }
                                >
                                  Section Admin
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Saved Credentials */}
                      {userData.login_id && (
                        <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4 flex items-center justify-between text-sm">
                          <div className="space-y-1">
                            <p className="text-gray-300">
                              <span className="font-medium">ID:</span> {userData.login_id}
                            </p>
                            <p className="text-gray-300">
                              <span className="font-medium">PIN:</span> {userData.password}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Copy
                          </Button>
                        </div>
                      )}

                      {/* Button */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-[52px] w-full rounded-2xl text-base font-bold text-white"
                        style={{
                          background: "var(--background-image-gradient-brand)",
                          boxShadow: "0 16px 34px rgba(41, 171, 226, 0.28)",
                        }}
                      >
                        {loading ? "Logging in..." : "Login"}
                        {!loading && <ArrowRight className="h-5 w-5" />}
                      </Button>
                    </form>
                  </Form>

                  {/* Register or other link */}
                  <div className="mt-6 text-center text-p3 text-gray-400">
                    <p>
                      Already have an account?{" "}
                      <Link
                        href={loginPage}
                        className="text-primary font-semibold hover:underline"
                      >
                        Login with admin
                      </Link>
                    </p>
                    <p className="mt-2">
                      Need help?{" "}
                      <Link
                        href={loginPage}
                        className="text-primary font-semibold hover:underline"
                      >
                        Contact Support
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Error Dialog (Only shows on failure) */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-destructive">
                      {dialogTitle}
                    </DialogTitle>
                    <DialogDescription>{dialogMessage}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => setOpen(false)} variant="destructive">
                      OK
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
