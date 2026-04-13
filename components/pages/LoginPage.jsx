

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowRightLong } from "react-icons/fa6";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

// Shadcn UI Form Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { loginUser, resetUserState } from "@/redux/slices/userSlice";
import {
  forgotPassword,
  resetForgotPasswordState,
} from "@/redux/slices/forgetPasswordSlice";
import { adminPage, clubIdPage, registerPage } from "@/helper/RouteName";
import { Eye, EyeOff } from "lucide-react";

// Shadcn Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Framer Motion for Animations
import { motion } from "framer-motion";

/* ---------------- ZOD SCHEMA ---------------- */
const loginSchema = z.object({
  username: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, error, isFreePlanExpired } = useSelector((state) => state.user);
  const {
    loading: forgotLoading,
    success: forgotSuccess,
    error: forgotError,
  } = useSelector((state) => state.forgotPassword);

  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  /* ---------------- REACT HOOK FORM ---------------- */
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (from === "ladder") {
      toast.info("Use the same exact details you used to create your account.", {
        autoClose: 5000,
      });
    }
  }, [from]);

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
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("adminDetails", JSON.stringify(userData));
        toast.success(res?.success_message || "Login successful!");
        router.push(adminPage);
      }
    } catch (err) {
      toast.error(err?.error_message || err?.message || "Login failed.");
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      toast.error("Please enter your email!");
      return;
    }
    dispatch(forgotPassword(forgotEmail));
  };

  useEffect(() => {
    if (forgotSuccess) {
      toast.success("Reset link sent to your Registered Email!");
      setIsForgotOpen(false);
      setForgotEmail("");
      dispatch(resetForgotPasswordState());
    }
    if (forgotError) {
      toast.error(typeof forgotError === "string" ? forgotError : "Failed to send reset link");
      dispatch(resetForgotPasswordState());
    }
  }, [forgotSuccess, forgotError, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(resetUserState());
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-indigo-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-900 z-0"></div>
      <div
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: "radial-gradient(#ffffff33 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:flex-1 flex items-center justify-center p-4 relative z-10 min-h-[40vh] lg:min-h-screen"
      >
        <div className="text-center max-w-md mx-auto w-full">
          <h2 className="text-2xl lg:text-4xl font-extrabold mb-4">
            <span className="text-zinc-800 block">Welcome Back to</span>
            <span className="text-zinc-900 block mt-2">Sports Solutions Pro</span>
          </h2>
          <p className="text-sm lg:text-lg text-white/95 leading-relaxed">
            Access your admin dashboard to manage club solutions, players, and more.
          </p>
        </div>
      </motion.div>

      {/* Right Side - Login Form with Shadcn Form & Zod */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:flex-1 flex items-center justify-center p-4 relative z-10 min-h-[50vh] lg:min-h-screen"
      >
        <Card className="w-full max-w-md shadow-2xl border-none bg-white/80 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Admin Login</h1>
              {/* <p className="text-gray-500 mt-2">Enter your credentials to proceed.</p> */}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-5">
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email address" 
                          {...field} 
                          className="rounded-lg py-3 focus:ring-2 focus:ring-purple-500/50"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className="font-semibold text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="rounded-lg py-3 pr-10 focus:ring-2 focus:ring-purple-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-800 hover:bg-teal-900 cursor-pointer text-white font-extrabold py-3.5 rounded-xl transition-all shadow-lg "
                >
                  {loading ? "Logging in..." : "Login"}
                  {!loading && <FaArrowRightLong className="ml-2 w-5 h-5" />}
                </Button>
              </form>
            </Form>

            {/* Links and Dialog */}
            <div className="mt-6 text-sm text-center space-y-3">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href={registerPage} className="text-blue-600 font-medium hover:underline">
                  Register here
                </Link>
              </p>

              <p className="text-gray-600">
                Already have a Club Id?{" "}
                <Link href={clubIdPage} className="text-purple-500 font-medium hover:underline">
                  Login with ClubId
                </Link>
              </p>

              {/* Forgot Password Modal */}
              <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                <DialogTrigger asChild>
                  <button className="text-purple-600 font-medium hover:underline w-full">
                    Forgot Password
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[375px]">
                  <DialogHeader>
                    <DialogTitle className="font-bold">Reset Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-600">Enter email to receive reset link.</p>
                    <Input
                      placeholder="example@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isFreePlanExpired && (
              <p className="mt-4 text-sm text-red-600 font-semibold text-center p-2 bg-red-50 rounded-lg border border-red-200">
                Your free plan has expired. Please upgrade to continue.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}