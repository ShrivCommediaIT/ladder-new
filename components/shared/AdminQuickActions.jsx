"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, CreditCard, Zap, Coins } from "lucide-react";

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
                {/* Clubs Column */}
                <div className="flex flex-col gap-4">
                  {/* Clubs Card */}
                  <div className="relative group overflow-hidden rounded-[20px] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col justify-between flex-1">
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

                  {/* Examples for Clubs */}
                  <div className="rounded-[20px] border border-[#16215c] bg-[#050B3B] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px bg-blue-500/30 flex-1"></div>
                      <span className="text-xs font-extrabold tracking-wider text-blue-400 uppercase">Examples</span>
                      <div className="h-px bg-blue-500/30 flex-1"></div>
                    </div>
                    <div className="space-y-4 text-xs sm:text-sm text-slate-200">
                      <div className="space-y-1">
                        <p className="font-bold text-white">Example 1 - 190 on the roster</p>
                        <p className="text-slate-300">First 150 users @ £2.00 = £300</p>
                        <p className="text-slate-300">Remaining 40 users @ £1.60 = £64</p>
                        <p className="font-extrabold text-sky-400 mt-1">TOTAL = £364 per month</p>
                      </div>
                      <div className="space-y-1 pt-3 border-t border-blue-950/40">
                        <p className="font-bold text-white">Example 2 - 340 on the roster</p>
                        <p className="text-slate-300">First 150 users @ £2.00 = £300</p>
                        <p className="text-slate-300">Next 150 users @ £1.60 = £240</p>
                        <p className="text-slate-300">Remaining 40 users @ £1.30 = £52</p>
                        <p className="font-extrabold text-sky-400 mt-1">TOTAL = £592 per month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coaches Column */}
                <div className="flex flex-col gap-4">
                  {/* Coaches Card */}
                  <div className="relative group overflow-hidden rounded-[20px] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col justify-between flex-1">
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

                  {/* Examples for Coaches */}
                  <div className="rounded-[20px] border border-[#16215c] bg-[#050B3B] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px bg-blue-500/30 flex-1"></div>
                      <span className="text-xs font-extrabold tracking-wider text-blue-400 uppercase">Examples</span>
                      <div className="h-px bg-blue-500/30 flex-1"></div>
                    </div>
                    <div className="space-y-4 text-xs sm:text-sm text-slate-200">
                      <div className="space-y-1">
                        <p className="font-bold text-white">Example 1 - 12 on the roster</p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Fee for month:</p>
                        <p className="text-slate-300">12 students @ £2.00 = £24.00</p>
                      </div>
                      <div className="space-y-1 pt-3 border-t border-blue-950/40">
                        <p className="font-bold text-white">Example 2 - 30 on the roster</p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Fee for month:</p>
                        <p className="text-slate-300">30 students @ £2.00 = £60.00</p>
                      </div>
                      <div className="space-y-1 pt-3 border-t border-blue-950/40">
                        <p className="font-bold text-white">Example 3 - 45 on the roster</p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Fee for month:</p>
                        <p className="text-slate-300">45 students @ £2.00 = £90.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
