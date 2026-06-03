"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ArrowRight, Eye, EyeOff, Phone } from "lucide-react";
import { postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { calculateAge } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateOfBirthInput from "@/components/shared/DateOfBirthInput";
import CountrySelect from "@/components/shared/CountrySelect";



const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    dob: z.date().optional(), // optional now
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\d{11}$/.test(val),
        "Phone number must be exactly 11 digits"
      ),
    password: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
    confirmPassword: z.string(),
    gender: z.string().optional(),
    country: z.string().optional(),
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
      phone: "",
      password: "",
      confirmPassword: "",
      gender: "male",
      country: "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState, control } = form;
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
      dob: dobString,
      gender: ladderType !== "minileague" ? values.gender : undefined,
      country: values.country,
      phone: values.phone || undefined,
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
      toast.error(res?.error_message || "Registration failed");
    }
  } catch {
    toast.error("Server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-6">
      <ToastContainer theme="dark" position="top-right" />

      <Card className="w-full max-w-lg py-2 bg-card border border-border rounded-3xl backdrop-blur-xl shadow-2xl">
        <CardContent className="p-8 space-y-6">
          {/* HEADER */}
          <div className="text-center space-y-3">
            <div className="bg-primary/20 p-4 rounded-full inline-block">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-h3 font-bold text-foreground">Create Account</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* NAME */}
            <div>
              <Label className="text-p3 text-foreground block mb-2.5">Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                    }}
                  />
                )}
              />
              <p className="text-red-400 text-xs">{errors.name?.message}</p>
            </div>

            {/* PHONE */}
            <div>
              <Label className="text-p3 text-foreground block mb-2.5">Phone Number (Optional)</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      placeholder="Enter 11-digit phone number"
                      maxLength={11}
                      {...field}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/\D/g, "").slice(0, 11);
                        field.onChange(cleanVal);
                      }}
                      className="h-[52px] rounded-2xl border-0 pl-11 pr-4 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        boxShadow: "inset 0 0 0 1px var(--input-border)",
                      }}
                    />
                  </div>
                )}
              />
              <p className="text-red-400 text-xs">{errors.phone?.message}</p>
            </div>

            {/* GENDER */}
            {ladderType !== "minileague" && (
              <div>
                <Label className="text-p3 text-foreground block mb-2.5">Gender</Label>
                <Select
                  value={watch("gender")}
                  onValueChange={(val) => setValue("gender", val)}
                >
                  <SelectTrigger className="h-[52px] rounded-2xl border-0 text-foreground focus-visible:ring-2"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                    }}>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* COUNTRY */}
            <div>
              <Label className="text-p3 text-foreground block mb-2.5">Country</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CountrySelect
                    value={field.value}
                    onValueChange={field.onChange}
                    className="h-[52px] rounded-2xl border-0 text-foreground focus-visible:ring-2"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                    }}
                  />
                )}
              />
              <p className="text-red-400 text-xs">{errors.country?.message}</p>
            </div>

            {/* DOB PICKER */}
  <div>
    <Label className="text-p3 text-slate-200 block mb-2.5">
      Date of Birth:(for age related solutions)
    </Label>

    <DateOfBirthInput
      id="dob"
      value={watch("dob")}
      onChange={(date) =>
        setValue("dob", date ?? undefined, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
      className="text-white px-4 bg-gray-700/50 border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 h-12"
    />

    <p className="text-red-400 text-xs">{errors.dob?.message}</p>
  </div>

            {/* PIN */}
            <div>
              <Label className="text-p3 text-foreground block mb-2.5">6 Digit PIN (One that you can easily remember - avoid simple patterns)</Label>
              <div className="relative">
                  <Input
                    placeholder="Enter a 6 digit PIN"
                    type={showPassword ? "text" : "password"}
                    maxLength={6}
                    inputMode="numeric"
                    {...register("password")}
                    className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 pr-12"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      boxShadow: "inset 0 0 0 1px var(--input-border)",
                    }}
                  onChange={(e) =>
                    setValue(
                      "password",
                      e.target.value.replace(/\D/g, "").slice(0, 6),
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
              <Label className="text-p3 text-foreground block mb-2.5">Confirm PIN</Label>
              <div className="relative">
                <Input
                  placeholder="Confirm your 6 digit PIN"
                  type={showConfirmPassword ? "text" : "password"}
                  maxLength={6}
                  inputMode="numeric"
                  {...register("confirmPassword")}
                  className="h-[52px] rounded-2xl border-0 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 pr-12"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    boxShadow: "inset 0 0 0 1px var(--input-border)",
                  }}
                  onChange={(e) =>
                    setValue(
                      "confirmPassword",
                      e.target.value.replace(/\D/g, "").slice(0, 6),
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
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg transition-all active:scale-95">
              {loading ? "Creating..." : "Create Account"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>

            {/* LOGIN */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={
                  ladderId
                    ? `/login-user?ladder_id=${ladderId}&ladder_type=${ladderType}`
                    : "/login-user"
                }
                className="text-primary font-semibold hover:underline"
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
