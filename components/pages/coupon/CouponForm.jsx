

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

// 🌍 Country List
const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "China",
  "Japan",
  "Singapore",
  "UAE",
  "Saudi Arabia",
  "Brazil",
  "South Africa",
  "Mexico",
  "Russia",
  "Sri Lanka",
  "Nepal",
  "Bangladesh",
  "Pakistan",
  "Other",
];

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

// ✅ Validation schema
const formSchema = z.object({
  adminName: z.string().min(3, "Enter admin name"),
  adminEmail: z.string().email("Enter a valid email"),
  couponName: z
    .string()
    .min(5)
    .max(20)
    .regex(/^[A-Z0-9]+$/i, "Use only letters/numbers"),
  payeeName: z.string().min(3),
  bankNameAndAddress: z.string().min(2, "Bank name is required"),
  bankAddress: z.string().min(5, "Bank address is required"),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2).optional(),
  pincode: z
    .string()
    .regex(/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/, "Enter valid pincode"),
  country: z.string().min(2),
  sortCode: z.string().optional(),
  accountNumberOrIban: z.string().min(6),
  swiftBic: z.string().min(4),
});

export default function CouponForm() {
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminName: "",
      adminEmail: "",
      couponName: "",
      payeeName: "",
      bankNameAndAddress: "",
      bankAddress: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      sortCode: "",
      accountNumberOrIban: "",
      swiftBic: "",
    },
  });

  function normalizeCouponName(value = "") {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  async function validateCoupon(value) {
    const coupon = value.trim();
    const regex = /^[A-Za-z]{3,}\d{2}$/;

    if (!coupon) {
      setIsCouponValid(false);
      setCouponMessage("");
      return;
    }

    if (!regex.test(coupon)) {
      setIsCouponValid(false);
      setCouponMessage(
        "Invalid coupon format! Must be minimum 3 letters followed by exactly 2 digits."
      );
      return;
    }

    setCheckingCoupon(true);
    try {
      const res = await fetch(
        `https://ne-games.com/leaderBoard/api/check/discount?discount_code=${coupon}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", APPKEY },
        }
      );

      const data = await res.json();

      if (
        data?.status === 400 &&
        data?.error_message === "Discount code  exist!"
      ) {
        setIsCouponValid(false);
        setCouponMessage("This discount code already exists!");
      } else {
        setIsCouponValid(true);
        setCouponMessage("Coupon is valid!");
      }
    } catch (err) {
      setIsCouponValid(false);
      setCouponMessage("Error checking coupon");
    } finally {
      setCheckingCoupon(false);
    }
  }

  async function onSubmit(values) {
    if (!isCouponValid) return;

    try {
      const payload = {
        email: values.adminEmail,
        business_name: values.payeeName,
        discount_code: values.couponName,
        discount_percentage: 10,
        address: values.street,
        city: values.city,
        post_code: values.pincode,
        country: values.country,
        bank_name: values.bankNameAndAddress || "Unknown Bank",
        bank_address: values.bankAddress || "No Address Provided",
        bank_sort_code: values.sortCode || "",
        bank_account_number: values.accountNumberOrIban,
        bic_code: values.swiftBic || "",
      };

      const res = await fetch(
        "https://ne-games.com/leaderBoard/api/affiliate/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", APPKEY },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to submit form");

      setShowSuccess(true); // ✅ show alert
      setIsCouponValid(false);
    } catch (err) {
      alert(err.message || "Submission failed."); // fallback error
    }
  }

  function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-sm text-red-600 mt-1">{message}</p>;
  }

  return (
    <>
      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <div className="flex items-center justify-center">
            <Image src="/thumb-up.gif" height={85} width={85} alt="success!" />
          </div>
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle>Coupon Created Successfull !</AlertDialogTitle>
            <AlertDialogDescription>
              Please Check your email !
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccess(false);
                window.location.reload();
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <Card className="max-w-5xl mx-auto bg-white p-4">
          <CardHeader className="text-center border-b pb-4">
            <div className="flex items-center justify-center">
              <Image src="/gift-card.gif" height={70} width={70} alt="gift card" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-900">
              Create Coupon
            </CardTitle>
            <p className="text-gray-600">Fill in your bank details carefully</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Coupon Input */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-blue-800 border-b pb-2">
                  Coupon Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <Label htmlFor="couponName">Coupon Name</Label>
                    <Input
                      id="couponName"
                      {...register("couponName")}
                      placeholder="ABCDE10"
                      className="rounded-md shadow-sm py-2"
                      onChange={(e) => {
                        const normalized = normalizeCouponName(
                          e.target.value
                        ).slice(0, 20);
                        setValue("couponName", normalized, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        validateCoupon(normalized);
                      }}
                    />
                    {checkingCoupon && (
                      <p className="text-sm text-gray-500">
                        Checking coupon...
                      </p>
                    )}
                    {couponMessage && (
                      <p
                        className={`text-sm mt-1 ${
                          isCouponValid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {couponMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rest of form - disabled if coupon invalid */}
              <div
                style={{
                  pointerEvents: isCouponValid ? "auto" : "none",
                  opacity: isCouponValid ? 1 : 0.5,
                }}
                className="space-y-10"
              >
                  <div
                style={{
                  pointerEvents: isCouponValid ? "auto" : "none",
                  opacity: isCouponValid ? 1 : 0.5,
                }}
                className="space-y-10"
              >
                {/* User Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-800 border-b pb-2">
                    User Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">User Name</Label>
                      <Input
                        id="adminName"
                        {...register("adminName")}
                        placeholder="Admin Name"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.adminName?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">User Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        {...register("adminEmail")}
                        placeholder="Example@gmail.com"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.adminEmail?.message} />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-800 border-b pb-2">
                    Bank Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="payeeName">
                        Full Name / Business Name
                      </Label>
                      <Input
                        id="payeeName"
                        {...register("payeeName")}
                        placeholder="John Doe / ACME Ltd"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.payeeName?.message} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="bankNameAndAddress">Bank Name</Label>
                      <Textarea
                        id="bankNameAndAddress"
                        {...register("bankNameAndAddress")}
                        placeholder="SWISS Bank"
                        rows={3}
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError
                        message={errors.bankNameAndAddress?.message}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="bankAddress">Bank Address</Label>
                      <Textarea
                        id="bankAddress"
                        {...register("bankAddress")}
                        placeholder="123 Banking St, London - LS18 5NY, UK"
                        rows={3}
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.bankAddress?.message} />
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-800 border-b pb-2">
                    Company/Private Address Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        placeholder="123 Main Street"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.street?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="London"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.city?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        placeholder="Horsforth"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.state?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        {...register("pincode")}
                        placeholder="LS18 5NY"
                        inputMode="numeric"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.pincode?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        {...register("country")}
                        className="w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 border border-gray-300 p-2 bg-white"
                      >
                        <option value="">Select Country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.country?.message} />
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-800 border-b pb-2">
                    Account Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sortCode">Sort Code</Label>
                      <Input
                        id="sortCode"
                        {...register("sortCode")}
                        placeholder="12-34-56"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.sortCode?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumberOrIban">
                        Account Number / IBAN
                      </Label>
                      <Input
                        id="accountNumberOrIban"
                        {...register("accountNumberOrIban")}
                        placeholder="12345678 / GB29NWBK..."
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError
                        message={errors.accountNumberOrIban?.message}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="swiftBic">SWIFT / BIC Code</Label>
                      <Input
                        id="swiftBic"
                        {...register("swiftBic")}
                        placeholder="ABCDEFGH / ABCDEFGH123"
                        className="rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <FieldError message={errors.swiftBic?.message} />
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <Separator />
              <div className="flex items-center justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isCouponValid}
                  className="cursor-pointer px-12 w-full max-w-md py-5 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 font-semibold"
                >
                  {isSubmitting ? "Creating Coupon Wait..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
