"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { isValidEmail } from "@/lib/utils";

//  Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .refine(isValidEmail, {
      message: "Invalid email domain or format. Supported domains: .com, .in, .org, .net, .edu, .gov, .co",
    }),
  password: z.string().min(3, "Enter password"),
});

export default function CouponLogin() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
      });

      
      reset();
    } catch (err) {
      toast.error(err.message || "Login failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }

  function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-sm text-red-600 mt-1">{message}</p>;
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <Card className="w-full max-w-md bg-white p-6 shadow-xl rounded-2xl">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Login
            </CardTitle>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 mt-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="user@example.com"
                  className="rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Enter password"
                  className="rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
                />
                <FieldError message={errors.password?.message} />
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 font-semibold"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
