"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

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

import { LogIn, UserCog, Loader2 } from "lucide-react";
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
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const pinRefs = useRef([]);
  const [userData, setUserData] = useState({ login_id: "", password: "" });
  const [loading, setLoading] = useState(false);

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
    const saved = localStorage.getItem("userData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.login_id && parsed?.password) setUserData(parsed);
      } catch {
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const handlePinChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);

    if (value && index < 3) pinRefs.current[index + 1]?.focus();
    if (!value && index > 0) pinRefs.current[index - 1]?.focus();

    setValue("pin", newPin.join(""));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Login ID: ${userData.login_id}, Password: ${userData.password}`,
    );
    alert("Credentials copied to clipboard!");
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const payload = {
      login_id: values.clubId,
      password: values.pin,
      user_type: values.userType,
    };

    const config = {
      headers: {
        APPKEY: "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 sec timeout
    };

    try {
      let res;

      // ✅ First try
      try {
        res = await axios.post(
          "https://ne-games.com/leaderBoard/api/app/user/login",
          payload,
          config,
        );
      } catch (e) {
        // ✅ Retry once automatically
        res = await axios.post(
          "https://ne-games.com/leaderBoard/api/app/user/login",
          payload,
          config,
        );
      }

      // ✅ Response check
      if (res.data?.status !== 200 || !res.data) {
        setDialogTitle("Login Failed");
        setDialogMessage(res.data?.message || "Invalid Club ID or PIN");
        setOpen(true);
        return;
      }

      // ✅ Success storage logic
      const storageKey =
        values.userType === "sub_admin" ? "subAdmin" : "userData";

      const user =
        values.userType === "sub_admin"
          ? { ...res.data.subadmin, isLoggedIn: true }
          : { ...res.data.data, isLoggedIn: true };

      localStorage.setItem(storageKey, JSON.stringify(user));

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] px-4 py-12">
      <Card className="w-full max-w-md border shadow-sm ">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Club Login
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your Club ID and PIN to access the dashboard
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Club ID */}
              <FormField
                control={form.control}
                name="clubId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club ID</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter Club ID (A-Z only)"
                          maxLength={8}
                          className="pl-10"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z]/g, ""),
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIN */}
              <FormField
                control={form.control}
                name="pin"
                render={() => (
                  <FormItem>
                    <FormLabel>4-Digit PIN</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-4 gap-3">
                        {pinDigits.map((digit, idx) => (
                          <Input
                            key={idx}
                            ref={(el) => (pinRefs.current[idx] = el)}
                            maxLength={1}
                            value={digit}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            onChange={(e) =>
                              handlePinChange(idx, e.target.value)
                            }
                            className="text-center text-lg font-medium"
                          />
                        ))}
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
                  <FormItem className="space-y-3">
                    <FormLabel>Login As</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-start gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="admin"
                            checked={field.value === "admin"}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium">Admin</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="sub_admin"
                            checked={field.value === "sub_admin"}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium">
                            Section Admin
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Saved Credentials */}
              {userData.login_id && (
                <div className="rounded-lg border bg-muted/40 p-4 flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">ID:</span>{" "}
                      {userData.login_id}
                    </p>
                    <p>
                      <span className="font-medium">PIN:</span>{" "}
                      {userData.password}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    Copy
                  </Button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-800 hover:bg-teal-900 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-black ">
            Already have an account?{" "}
            <Link
              href={loginPage}
              className="text-blue-600 font-medium hover:underline cursor-pointer "
            >
              Login with admin
            </Link>
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
  );
}
