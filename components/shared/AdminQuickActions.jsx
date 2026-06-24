"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, ShieldCheck, CreditCard, Zap, Coins, Award } from "lucide-react";

export default function AdminQuickActions() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/441134180902", "_blank", "noopener,noreferrer");
  };

  // Load and render PayPal SDK hosted buttons dynamically when Dialog is open
  useEffect(() => {
    if (!showPaymentPlans) return;

    const scriptId = "paypal-hosted-buttons-sdk";
    const scriptSrc = "https://www.paypal.com/sdk/js?client-id=BAAc2_cQyRDE1kjkpMPKFbAJgSS7H4EX2qcxO7brl9fOl0hvYya7c92nDBIus93UObSqywxRScV34mrX5g&components=hosted-buttons&disable-funding=venmo,paylater&currency=GBP";

    const initializeButtons = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        const container1 = document.getElementById("paypal-container-XT89PWWRFSPNQ");
        if (container1) {
          container1.innerHTML = "";
          try {
            window.paypal.HostedButtons({
              hostedButtonId: "XT89PWWRFSPNQ",
            }).render("#paypal-container-XT89PWWRFSPNQ");
          } catch (e) {
            console.error("Paypal render error 1", e);
          }
        }

        const container2 = document.getElementById("paypal-container-HXX74PMDL43FE");
        if (container2) {
          container2.innerHTML = "";
          try {
            window.paypal.HostedButtons({
              hostedButtonId: "HXX74PMDL43FE",
            }).render("#paypal-container-HXX74PMDL43FE");
          } catch (e) {
            console.error("Paypal render error 2", e);
          }
        }
      }
    };

    if (window.paypal && window.paypal.HostedButtons) {
      setTimeout(initializeButtons, 100);
      return;
    }

    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      setTimeout(initializeButtons, 150);
    };
    script.addEventListener("load", handleLoad);

    return () => {
      if (script) {
        script.removeEventListener("load", handleLoad);
      }
    };
  }, [showPaymentPlans]);

  return (
    <>
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 md:gap-5 md:grid-cols-2 xl:items-stretch justify-items-center mt-10 mb-10">
        <button
          type="button"
          onClick={handleWhatsAppClick}
          aria-label="Open WhatsApp chat"
          className="group relative w-full overflow-hidden rounded-[20px] border border-emerald-200 bg-white shadow-xl transition-all duration-300 hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 dark:border-emerald-500/50 dark:bg-[#04090c] dark:shadow-2xl cursor-pointer aspect-[3/1]"
        >
          <div className="relative w-full h-full">
            <Image
              src={isDark ? "/wtsapp.png" : "/wtsapp-1.png"}
              alt="WhatsApp contact card"
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 45vw, 40vw"
              className="object-fill"
              priority
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowPaymentPlans(true)}
          aria-label="View Payment Plans"
          className="group relative w-full overflow-hidden rounded-[20px] border border-cyan-200 bg-white shadow-xl transition-all duration-300 hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 dark:border-cyan-500/50 dark:bg-[#020813] dark:shadow-2xl p-2 cursor-pointer aspect-[3/1]"
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0c1020] rounded-[16px] border border-cyan-100 dark:border-cyan-950 transition-all duration-300">
            <div className="text-center transition-transform duration-300 group-hover:scale-105 flex flex-col items-center justify-center">
              <span className="text-sm xs:text-base sm:text-lg md:text-xl xl:text-2xl font-black tracking-widest text-cyan-600 dark:text-cyan-400 leading-none">
                PAYMENT
              </span>
              <span className="text-sm xs:text-base sm:text-lg md:text-xl xl:text-2xl font-black tracking-widest text-cyan-600 dark:text-cyan-400 leading-none mt-1 sm:mt-2">
                PLANS
              </span>
            </div>
          </div>
        </button>
      </div>

      <Dialog open={showPaymentPlans} onOpenChange={setShowPaymentPlans}>
        <DialogContent className="w-[95vw] sm:max-w-3xl bg-background border border-border text-foreground rounded-[28px] p-0 shadow-2xl backdrop-blur-xl max-h-[92vh] overflow-hidden flex flex-col">
          {/* Header Banner */}
          <div className="relative p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                <Zap className="h-3 w-3" /> Billing & Licenses
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-foreground">
                Payment & Subscription Plans
              </DialogTitle>
            </div>
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Platform Access Plans */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-primary" /> Platform Access Plans
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clubs Card */}
                <div className="relative group overflow-hidden rounded-[20px] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        For Clubs
                      </span>
                      <span className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        Invoice Billing
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-foreground">
                        Club Membership
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Full dashboard & administrative tools
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border space-y-2 text-xs sm:text-sm text-foreground/90">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span><strong>30 days</strong> of free trial access.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Service agreement sent on active status.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span><strong>14 days</strong> payment term by bank transfer or PayPal.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coaches Card */}
                <div className="relative group overflow-hidden rounded-[20px] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        For Coaches
                      </span>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Active Pay-As-You-Go
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-foreground">
                        Coaching Groups
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Billed based on roster count
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border space-y-2 text-xs sm:text-sm text-foreground/90">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Only <strong>£2 per pupil</strong> in the roster.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Billed end of month in arrears.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Payable by direct bank transfer or PayPal.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: AD-HOC LICENSES */}
            <div className="space-y-3 mt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-primary" /> One-Off Licenses & Competitions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Competition Product */}
                <div className="rounded-[20px] border border-border p-5 bg-card flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        Competition Card
                      </span>
                      <span className="text-lg font-black text-foreground">£2</span>
                    </div>
                    <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-snug">
                      SSP International Competitions
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Instant competition listing license. Only single purchases allowed.
                    </p>
                  </div>
                  <div className="flex items-center justify-center min-h-[48px] w-full bg-background rounded-xl p-2.5 border border-border">
                    <div id="paypal-container-XT89PWWRFSPNQ" className="w-full text-center"></div>
                  </div>
                </div>

                {/* Talent Board Product */}
                <div className="rounded-[20px] border border-border p-5 bg-card flex flex-col justify-between space-y-4 hover:border-secondary/30 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">
                        Leaderboard Card
                      </span>
                      <span className="text-lg font-black text-foreground">£5</span>
                    </div>
                    <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-snug">
                      SSP Talent Board
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Talent leaderboard list upload. Multiple purchases available.
                    </p>
                  </div>
                  <div className="flex items-center justify-center min-h-[48px] w-full bg-background rounded-xl p-2.5 border border-border">
                    <div id="paypal-container-HXX74PMDL43FE" className="w-full text-center"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Note */}
            <div className="rounded-[16px] bg-primary/5 border border-primary/15 p-4 flex items-start gap-3 mt-6">
              <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Secure Checkout
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All online payments are securely processed by PayPal. For custom setups or billing inquiries, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
