"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ArrowRight, Eye, EyeOff, CalendarIcon } from "lucide-react";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";



const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    dob: z.date().optional(), // optional now
    password: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "PIN does not match",
    path: ["confirmPassword"],
  });

export default function RegisterUser({ ladderId, ladderType }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      dob: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState } = form;
  const { errors } = formState;

  /* ✅ SUBMIT */
  const onSubmit = async (values) => {
    if (!values.dob) {
      toast.error("Please select date of birth");
      return;
    }

    const age = calculateAge(values.dob);
    const dobString = format(values.dob, "dd/MM/yyyy");

    const payload = {
      user_id: values.name,
      password: values.password,
      name: values.name,
      user_type: "user",
      ladder_id: ladderId,
      ladder_type: ladderType,
      age: age,
      dob: dobString
    };


  try {
    setLoading(true);

    const res = await postRequest(API_ENDPOINTS.REGISTER, payload);

    if (res?.status === 200) {
      toast.success("Account created!");

      const url = ladderId
        ? `/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
        : "/login-user";

      setTimeout(() => router.replace(url), 1200);
    } else {
      toast.error(res?.message || "Registration failed");
    }
  } catch {
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 px-6">
      <ToastContainer theme="dark" position="top-right" />

      <Card className="w-full max-w-lg py-2 bg-slate-900/80 border border-gray-700 rounded-3xl">
        <CardContent className="p-8 space-y-6">
          {/* HEADER */}
          <div className="text-center space-y-3">
            <div className="bg-teal-400/20 p-4 rounded-full inline-block">
              <User className="h-10 w-10 text-teal-400" />
            </div>
            <h1 className="text-3xl font-bold text-teal-400">Create Account</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* NAME */}
            <div>
              <Label className="text-teal-400 mb-1">Name</Label>
              <Input
                placeholder="Enter your name"
                {...register("name")}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-red-400 text-xs">{errors.name?.message}</p>
            </div>

            {/* DOB PICKER */}
  <div>
    <Label className="text-teal-400 mb-1">
      Date of Birth:(Only for age related solutions)
    </Label>

    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start cursor-pointer bg-gray-900 border-gray-700 text-white"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {watch("dob")
            ? format(watch("dob"), "dd/MM/yyyy")
            : "Select Date of birth"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 cursor-pointer bg-slate-300 border-gray-700">
        <Calendar
          mode="single"
          selected={watch("dob")}
          onSelect={(date) =>
            setValue("dob", date, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          captionLayout="dropdown"
          fromYear={1920}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>

    <p className="text-red-400 text-xs">{errors.dob?.message}</p>
  </div>

            {/* PIN */}
            <div>
              <Label className="text-teal-400 mb-1">4 Digit PIN (One that you can easily remember - avoid 1111 and 1234)</Label>
              <div className="relative">
                <Input
                  placeholder="Enter a 4 digit PIN"
                  type={showPassword ? "text" : "password"}
                  maxLength={4}
                  inputMode="numeric"
                  {...register("password")}
                  className="bg-gray-800 border-gray-700 text-white pr-12"
                  onChange={(e) =>
                    setValue(
                      "password",
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-0.5 bg-gray-700 text-white p-1 rounded-full cursor-pointer"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <p className="text-red-400 text-xs">{errors.password?.message}</p>
            </div>

            {/* CONFIRM PIN */}
            <div>
              <Label className="text-teal-400 mb-1">Confirm PIN</Label>
              <div className="relative">
                <Input
                  placeholder="Confirm your 4 digit PIN"
                  type={showConfirmPassword ? "text" : "password"}
                  maxLength={4}
                  inputMode="numeric"
                  {...register("confirmPassword")}
                  className="bg-gray-800 border-gray-700 text-white pr-12"
                  onChange={(e) =>
                    setValue(
                      "confirmPassword",
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-0.5 bg-gray-700 text-white p-1 rounded-full cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <p className="text-red-400 text-xs">
                {errors.confirmPassword?.message}
              </p>
            </div>

            {/* SUBMIT */}
            <Button type="submit" disabled={loading} className="w-full bg-teal-800 cursor-pointer hover:bg-teal-900 text-white">
              {loading ? "Creating..." : "Create Account"}
              {!loading && <ArrowRight className="ml-2" />}
            </Button>

            {/* LOGIN */}
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href={
                  ladderId
                    ? `/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
                    : "/login-user"
                }
                className="text-teal-400 font-semibold hover:underline"
              >
                Login Now
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
