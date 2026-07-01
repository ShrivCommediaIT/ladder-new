"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import BgHome from "@/public/topLogo.png";
import Facebook from "@/public/facebook.png";
import Youtube from "@/public/youtube.png";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { loginPage } from "@/helper/RouteName";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useSelector } from "react-redux";

// live key
// const stripePromise = loadStripe(
//   "pk_live_51LFh2OJsNwj9rybc0tvpLTAqLfEweHmbDAkv3YukrUIXrIxtXPd7tqBvGxSSZEA55r3KlH2V7AZETbQhuqwn4OqT00NdPDedFd"
// );

// ------------------------------------
// testing

const stripePromise = loadStripe(
  "pk_test_51LFh2OJsNwj9rybczkrJhz3tV7ve8NEGquIRdIt0TqqMlBEZaZmeoIHkITvpPdPBFW36Cwgbztkj44iiN4igjc4300OB2xb1bU"
);

// -------------------------------------

import { postRequest, getRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";
// ADD THIS IMPORT

function CheckoutForm({
  amount,
  noOfUsers,
  subscriptionType,
  onClose,
  response,
  ladderId,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter(); // ✅ INIT ROUTER
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [activeLadderId, setActiveLadderId] = useState(null);

  const userId = useSelector((state) => state.user?.user?.id);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: window.location.href },
      });

      if (error) {
        setDialogTitle("Payment Failed");
        setDialogMessage(error.message);
        setDialogOpen(true);
      } else if (paymentIntent?.status === "succeeded") {
        setDialogTitle("Payment Successful");
        setDialogMessage("Processing your subscription...");
        setDialogOpen(true);

        try {
          const result = await postRequest("/user/buySubscription", {
            user_id: userId,
            no_of_users: noOfUsers ,
            subscription_type: subscriptionType,
            amount: amount,
            transaction_id: paymentIntent.id,
            transaction_status: paymentIntent.status,
            discount_code: response?.discount_code || null,
            ladder_id: ladderId,
          });

          const getData = await getRequest("/user/getsubsciptionDetails", { user_id: userId });

          if (getData?.data) {
            const sub = getData.data;
            console.log("subscription details : ", sub);
            setDialogTitle("Subscription Activated ");
            setDialogMessage(
              `Plan: ${sub.subscription_type}\n` +
                `Users: ${sub.no_of_users}\n` +
                `Amount: £${(sub.amount / 100).toFixed(2)}\n` +
                `Transaction_id: ${sub.transaction_id}\n` +
                `Status: ${sub.transaction_status}\n` +
                `Valid Till: ${sub.subscription_expired_date}\n\n` +
                `Please click OK to go to the Login page, then sign in with your email and password to view the ladder lists and see how many players are unlocked in your ladder.`
            );
          } else {
            setDialogTitle("Subscription Activated Failed ");
            setDialogMessage("But failed to fetch subscription details.");
          }
        } catch (apiErr) {
          console.error("Failed to call buySubscription API", apiErr);
          setDialogTitle("Subscription Error");
          setDialogMessage(
            "Failed to activate subscription. Please contact support."
          );
        }
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setDialogTitle("Error");
      setDialogMessage("Something went wrong. Please try again.");
      setDialogOpen(true);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button
        onClick={handleSubmit}
        disabled={loading || !stripe || !elements}
        className="w-full bg-green-500 hover:bg-green-600 cursor-pointer"
      >
        {loading ? "Processing..." : "Pay Now"}
      </Button>

      {/* Result Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="border-b py-2 border-gray-500 text-2xl text-center">
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line text-blue-950 text-md font-semibold">
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 py-2 "
              onClick={() => {
                setDialogOpen(false);
                onClose?.();
                router.push(`${loginPage}`); // REDIRECT TO PLAYER LIST PAGE
              }}
            >
              Login Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Main Component */
export default function SubscriptionPlan({ ladderId }) {
  // State for Monthly Plan
  const [monthlyPlayers, setMonthlyPlayers] = useState(10);
  const [monthlyCost, setMonthlyCost] = useState(10);

  // Constants for Yearly Tiers
  const YEARLY_TIERS = [
    { id: 1, label: "Tier 1 - 0 to 150 Members", cost: 1000, maxUsers: 150 },
    { id: 2, label: "Tier 2 - 151 to 300 Members", cost: 2000, maxUsers: 300 },
    { id: 3, label: "Tier 3 - 301 to 600 Members", cost: 3000, maxUsers: 600 },
    { id: 4, label: "Tier 4 - 601 to 1000 Members", cost: 4000, maxUsers: 1000 },
    { id: 5, label: "Tier 5 - 1001+ Members", cost: 5000, maxUsers: 5000 },
  ];

  // State for Yearly Plan
  const [selectedTier, setSelectedTier] = useState(YEARLY_TIERS[0]);
  const [yearlyCost, setYearlyCost] = useState(YEARLY_TIERS[0].cost);

  // ------------------- ADD THESE STATES -------------------
  const [monthlyCoupon, setMonthlyCoupon] = useState("");
  const [yearlyCoupon, setYearlyCoupon] = useState("");
  const [monthlyCouponValid, setMonthlyCouponValid] = useState(false);
  const [yearlyCouponValid, setYearlyCouponValid] = useState(false);
  const [checkingMonthlyCoupon, setCheckingMonthlyCoupon] = useState(false);
  const [checkingYearlyCoupon, setCheckingYearlyCoupon] = useState(false);

  // NEW STATES FOR DIALOGS
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false);
  const [monthlyDialogMessage, setMonthlyDialogMessage] = useState("");
  const [yearlyDialogOpen, setYearlyDialogOpen] = useState(false);
  const [yearlyDialogMessage, setYearlyDialogMessage] = useState("");
  const [monthlyCouponResponse, setMonthlyCouponResponse] = useState(null);
  const [yearlyCouponResponse, setYearlyCouponResponse] = useState(null);


  // Update cost whenever players change
  useEffect(() => {
    if (!monthlyCouponValid) {
      setMonthlyCost(monthlyPlayers * 1); // £1 per month per player
    }
  }, [monthlyPlayers, monthlyCouponValid]);

  useEffect(() => {
    if (!yearlyCouponValid) {
      setYearlyCost(selectedTier.cost);
    }
  }, [selectedTier, yearlyCouponValid]);

  const [monthlyClientSecret, setMonthlyClientSecret] = useState(null);
  const [yearlyClientSecret, setYearlyClientSecret] = useState(null);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // "monthly" or "yearly"

  useEffect(() => {
    async function createMonthlyIntent() {
      const data = await postRequest("/payment/intent", { amount: Math.round(monthlyCost * 100) });
      if (data.paymentIntent) setMonthlyClientSecret(data.paymentIntent);
    }
    createMonthlyIntent();
  }, [monthlyCost]);

  useEffect(() => {
    async function createYearlyIntent() {
      const data = await postRequest("/payment/intent", { amount: Math.round(yearlyCost * 100) });
      if (data.paymentIntent) setYearlyClientSecret(data.paymentIntent);
    }
    createYearlyIntent();
  }, [yearlyCost]);

  const handleOpenPayment = (type) => {
    setSelectedPlan(type);
    setOpenPaymentDialog(true);
  };

  const handleCheckMonthlyCoupon = async () => {
    setCheckingMonthlyCoupon(true);
    try {
      const data = await getRequest("/apply/discountCode", { discount_code: monthlyCoupon, amount: monthlyCost });

      if (data.status === 200) {
        setMonthlyCouponValid(true);
        setMonthlyCouponResponse(data); 
        if (data.afterDiscount_amount) {
          setMonthlyCost(Number(data.afterDiscount_amount));
        }
        setMonthlyDialogMessage(
          `Coupon Applied!\n${data.discount_percentage}% OFF\nFinal Price: £${data.afterDiscount_amount}`
        );
      } else {
        setMonthlyCouponValid(false);
        setMonthlyCouponResponse(null); 
        setMonthlyDialogMessage("Invalid Coupon Code. Please try again.");
      }
      setMonthlyDialogOpen(true);
    } catch (error) {
      console.error("Coupon check error:", error);
      setMonthlyCouponResponse(null);
      setMonthlyDialogMessage(" Server error while checking coupon.");
      setMonthlyDialogOpen(true);
    }
    setCheckingMonthlyCoupon(false);
  };

  const handleCheckYearlyCoupon = async () => {
    setCheckingYearlyCoupon(true);
    try {
      const data = await getRequest("/apply/discountCode", { discount_code: yearlyCoupon, amount: yearlyCost });

      if (data.status === 200) {
        setYearlyCouponValid(true);
        setYearlyCouponResponse(data);
        if (data.afterDiscount_amount) {
          setYearlyCost(Number(data.afterDiscount_amount));
        }
        setYearlyDialogMessage(
          `Coupon Applied!\n${data.discount_percentage}% OFF\nFinal Price: £${data.afterDiscount_amount}`
        );
      } else {
        setYearlyCouponValid(false);
        setYearlyCouponResponse(null);
        setYearlyDialogMessage("Invalid Coupon Code. Please try again.");
      }
      setYearlyDialogOpen(true);
    } catch (error) {
      console.error("Yearly coupon check error:", error);
      setYearlyCouponResponse(data);
      setYearlyDialogMessage(" Server error while checking coupon.");
      setYearlyDialogOpen(true);
    }
    setCheckingYearlyCoupon(false);
  };

  return (
    <main
      className="px-4 py-6 sm:px-8 md:px-12 lg:px-20 xl:px-32 w-full mx-auto min-h-screen"
    >
      {/* ✅ Subscription Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4 max-w-5xl mx-auto">
        
        {/* Pay per Solution (Blue Card) */}
        <div className="bg-gradient-to-b from-[#042793] to-[#00278a] p-3 rounded-none shadow-2xl border-[1px] border-black">
          <div className="text-center pb-2">
            <h2 className="text-3xl font-black text-white italic leading-tight">Pay per Solution</h2>
            <p className="text-[10px] font-bold text-white italic opacity-100">£1 per month per player per solution</p>
          </div>

          {/* Inner Content Card (Nested Div) */}
          <div className="bg-gradient-to-b from-[#00009d] to-[#0000cd] border border-black/40 p-4 flex flex-col items-center gap-4">
            <div className="w-full bg-[#cbd5e1] rounded-sm relative shadow-inner">
              <select
                value={monthlyPlayers}
                onChange={(e) => setMonthlyPlayers(Number(e.target.value))}
                className="w-full bg-[#cbd5e1] px-4 py-2 text-2xl font-black text-gray-800 appearance-none cursor-pointer focus:outline-none"
              >
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250].map((size) => (
                  <option key={size} value={size}>
                    {size} Players
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800">
                <span className="text-lg">↕</span>
              </div>
            </div>

            <div className="text-center space-y-1 w-full">
              <p className="text-white font-bold text-xs uppercase">Monthly Cost</p>
              <div className="bg-[#cbd5e1] py-2 px-6 inline-block rounded-sm shadow-inner min-w-[100px]">
                <span className="text-2xl font-black text-gray-800">£{monthlyCost}</span>
              </div>
            </div>

            <Button
              className="bg-[#2fb000] hover:bg-green-600 text-black font-black text-lg py-4 px-8 rounded-sm shadow-lg border-b-2 border-black/30 active:border-b-0 transition-all uppercase leading-none"
              onClick={() => handleOpenPayment("monthly")}
            >
              Pay Now
            </Button>
          </div>
        </div>

        {/* Year Licences (Green Card) */}
        <div className="bg-gradient-to-b from-[#119f33] to-[#84c533] p-3 rounded-none shadow-2xl border-[1px] border-black">
          <div className="text-center pb-2">
            <h2 className="text-3xl font-black text-white italic leading-tight">Year Licences</h2>
            <p className="text-[10px] font-bold text-white italic opacity-100">Unlimited Access to All Solutions</p>
          </div>

          {/* Inner Content Card (Nested Div) */}
          <div className="bg-gradient-to-b from-[#0aa132] to-[#88f406] border border-black/40 p-4 flex flex-col items-center gap-4">
            <div className="w-full text-center space-y-1">
              <p className="text-white font-black text-sm uppercase">Select Your Tier</p>
              <div className="w-full bg-[#cbd5e1] rounded-sm relative shadow-inner">
                <select
                  value={selectedTier.id}
                  onChange={(e) => setSelectedTier(YEARLY_TIERS.find(t => t.id === Number(e.target.value)))}
                  className="w-full bg-[#cbd5e1] px-4 py-2 text-md font-black text-gray-800 appearance-none cursor-pointer focus:outline-none"
                >
                  {YEARLY_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800">
                  <span className="text-lg">↕</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-1 w-full">
              <p className="text-white font-bold text-[10px] italic">Yearly Cost including the App</p>
              <div className="bg-[#cbd5e1] py-1 px-8 inline-block rounded-sm shadow-inner min-w-[120px]">
                <span className="text-xl font-black text-gray-800">£{yearlyCost}</span>
              </div>
            </div>

            {/* Coupon Inside Content */}
            <div className="flex gap-1 w-full items-center">
              <input
                type="text"
                value={yearlyCoupon}
                onChange={(e) => {
                  setYearlyCoupon(e.target.value);
                  setYearlyCouponValid(false);
                }}
                placeholder="Coupon Code"
                className="flex-1 bg-[#cbd5e1] border-none p-2 rounded-sm text-xs font-bold text-gray-800 placeholder:text-gray-500"
              />
              <Button
                type="button"
                onClick={handleCheckYearlyCoupon}
                disabled={!yearlyCoupon || checkingYearlyCoupon}
                className="bg-[#2fb000] hover:bg-[#258d00] text-white font-bold py-2 px-3 text-xs rounded-sm"
              >
                {checkingYearlyCoupon ? "..." : "Apply"}
              </Button>
            </div>

            <Button
              className="bg-[#2fb000] hover:bg-[#258d00] text-black font-black text-lg py-4 px-8 rounded-sm shadow-xl border-b-2 border-black/30 active:border-b-0 transition-all uppercase leading-none"
              onClick={() => handleOpenPayment("yearly")}
            >
              Pay Now
            </Button>
          </div>
        </div>

      </section>
      {/* ✅ Stripe Dialog */}
      <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
          </DialogHeader>

  {selectedPlan === "monthly" && monthlyClientSecret && (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: monthlyClientSecret }}
    >
      <CheckoutForm
        amount={Math.round(monthlyCost * 100)}
        noOfUsers={monthlyPlayers}
        subscriptionType="monthly"
        response={monthlyCouponResponse}
        ladderId={ladderId}
        onClose={() => setOpenPaymentDialog(false)}
      />
    </Elements>
  )}

  {selectedPlan === "yearly" && yearlyClientSecret && (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: yearlyClientSecret }}
    >
      <CheckoutForm
        amount={Math.round(yearlyCost * 100)}
        noOfUsers={selectedTier.maxUsers}
        subscriptionType="yearly"
        response={yearlyCouponResponse}
        ladderId={ladderId}
        onClose={() => setOpenPaymentDialog(false)}
      />
    </Elements>
  )}
</DialogContent>
</Dialog>
      {/* ✅ Footer Section */}
      <section className="bg-yellow-100/100 border border-black pt-10 pb-4 px-6 sm:px-12 mt-12 space-y-8 rounded-sm">
          
        <div className="text-center space-y-6">
          <h2 className="text-md sm:text-lg font-black text-gray-800">
            You will get a confirmation email immediately after payment. Thank You.
          </h2>

          <div className="space-y-4">
            <h3 className="font-black text-3xl underline text-blue-600 tracking-tight">
              <Link href="/pricing.pdf" target="_blank" rel="noopener noreferrer">
                Our Guide to Pricing
              </Link>
            </h3>
            
            <h3 className="font-black text-3xl underline text-blue-600 tracking-tight pt-4">
              Follow us on:
            </h3>

            <div className="flex items-center justify-center gap-12 pt-2">
              <Link href="https://www.facebook.com/profile.php?id=61580051563946" target="_blank" className="relative">
                <Image src={Facebook} height={70} width={70} alt="facebook1" />
                <span className="absolute -right-4 bottom-0 font-black text-3xl text-blue-600">1</span>
              </Link>
              <Link href="https://www.facebook.com/profile.php?id=61561085668817" target="_blank" className="relative">
                <Image src={Facebook} height={70} width={70} alt="facebook2" />
                <span className="absolute -right-4 bottom-0 font-black text-3xl text-blue-600">2</span>
              </Link>
              <Link href="https://www.youtube.com/@sspro-squash" target="_blank">
                <Image src={Youtube} height={70} width={70} alt="youtube" />
              </Link>
            </div>
          </div>
        </div>

        {/* Company Info Box */}
        <div className="max-w-4xl mx-auto bg-white border-2 border-black p-6 sm:p-10 shadow-lg">
          <div className="text-center space-y-1 font-bold text-gray-800 text-xs sm:text-sm">
            <p className="font-black text-base pb-1">Sports Solutions Pro – a subsidiary of NE Games Ltd</p>
            <p>NE Games Ltd (Company No. 12345678) Registered in England & Wales</p>
            <p>Registered Office: Richmond House, Lawnswood Business Park, Redvers Close, Leeds LS16 6QY</p>
            <p className="pt-2">An ISO 9001 : 2015 Certified. Designed and Developed by Shriv ComMedia Solutions Pvt. Ltd.</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span>Software Development Company in India. All Rights Reserved -</span>
              <Link href="https://www.commediait.com/" target="_blank" className="text-blue-600 underline">
                www.commediait.com
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-bold text-blue-600 pt-4 pb-4">
          <Link href="/privacy-policy" className="underline">Data and Privacy Policy</Link>
          <span className="hidden sm:block text-black">|</span>
          <Link href="/refund-policy" className="underline">Refund Policy</Link>
          <span className="hidden sm:block text-black">|</span>
          <Link href="/terms-and-conditions" className="underline">Terms and Conditions</Link>
        </div>
      </section>
      {/* Monthly Coupon Dialog */}
      <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly Coupon Status</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-start text-lg text-blue-950 font-semibold">
              {monthlyDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setMonthlyDialogOpen(false)}
              className="cursor-pointer"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Yearly Coupon Dialog */}
      <Dialog open={yearlyDialogOpen} onOpenChange={setYearlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yearly Coupon Status</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-start text-lg text-blue-950 font-semibold">
              {yearlyDialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setYearlyDialogOpen(false)}
              className="cursor-pointer"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

