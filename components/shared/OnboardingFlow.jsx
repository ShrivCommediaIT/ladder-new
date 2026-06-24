"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = [
  {
    type: "summary",
    title: "Participation Eco-System Summary",
    content: "PLAY > EARN > SPEND > REPEAT. The Perpetual Sales Loop Keeps You in the Game.",
    image: "/onboarding/1.jpg",
  },
  {
    type: "step",
    number: "1",
    title: "PARTICIPATION",
    content: "Members engage in structured sporting activity — matches, challenges, leagues — all recorded digitally through the SSP™ platform.",
    image: "/onboarding/2.jpg",
  },
  {
    type: "step",
    number: "2",
    title: "PLAYERS EARN TOKENS",
    content: "Every time a member participates, they automatically earn tokens. This creates a simple and consistent reward mechanism that drives ongoing engagement.",
    image: "/onboarding/3.jpg",
  },
  {
    type: "step",
    number: "3",
    title: "REDEEM TOKENS",
    subtitle: "Spend with Sponsor",
    content: "Members redeem tokens for discounted products, receiving tangible value. This reinforces behaviour and encourages continued participation.",
    image: "/onboarding/4.jpg",
  },
];

export default function OnboardingFlow({setIsONboardingFlowVisible}) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Preload all onboarding images to prevent lag/flashing when switching steps
    STEPS.forEach((stepItem) => {
      if (typeof window !== "undefined" && stepItem.image) {
        const img = new window.Image();
        img.src = stepItem.image;
      }
    });
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push("/register-page");
    setIsONboardingFlowVisible(false);
    localStorage.setItem("hasSeenOnboarding", "true");
    setCurrentStep(0);
  };

  const finishOnboarding = () => {
    router.push("/register-page");
    setIsONboardingFlowVisible(false);
    localStorage.setItem("hasSeenOnboarding", "true");
    setCurrentStep(0);
  };

  const handleClose = () => {
    setIsONboardingFlowVisible(false);
    setCurrentStep(0);
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 text-foreground transition-colors duration-300">
      {/* Background Overlay - Theme adaptive */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-[12px] transition-colors duration-300" 
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-6xl h-[80vh] sm:h-[82vh] md:h-[680px] max-h-[540px] sm:max-h-[620px] md:max-h-[680px] bg-background border-y md:border border-border dark:border-white/10 rounded-2xl overflow-hidden flex flex-col z-[160] shadow-2xl transition-all duration-300"
      >
        {/* Close Button - Responsive and beautiful */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all duration-200 cursor-pointer shadow-sm"
          aria-label="Close onboarding"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Top Header - Hidden for initial summary step */}
        {step.type !== "summary" && (
          <div className="flex-shrink-0 w-full bg-white/70 dark:bg-black/30 backdrop-blur-md py-2.5 sm:py-4 px-6 sm:px-12 border-b border-border dark:border-white/10 text-center relative z-20 transition-colors duration-300">
            <h1 className="text-foreground dark:text-white text-2xl sm:text-3xl font-black italic tracking-wider uppercase">
              Participation <span className="text-primary">Eco-System</span>
            </h1>
          </div>
        )}

        {/* Content Area - Floating layouts */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-50/30 dark:bg-slate-950/20">
          <div className="w-full h-full overflow-y-auto relative z-10 no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-16 px-4 py-4 sm:py-8"
              >
                {step.type === "summary" ? (
                  // Summary Layout (Large image, floating in a premium themed card)
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
                    <div className="text-center mb-3 sm:mb-6 max-w-2xl px-4">
                      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-foreground dark:text-white leading-tight">
                        Participation <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Eco-System</span>
                      </h1>
                      <p className="text-muted-foreground dark:text-slate-400 text-sm sm:text-base font-semibold leading-relaxed">
                        {"PLAY > EARN > SPEND > REPEAT. The Perpetual Sales Loop Keeps You in the Game."}
                      </p>
                    </div>
                    <div className="relative w-full h-[65%] sm:h-[72%] md:h-[75%] max-w-[850px] flex items-center justify-center bg-white dark:bg-[#0D1F35] rounded-2xl overflow-hidden shadow-xl p-2 sm:p-4 md:p-6 border border-border dark:border-white/10 transition-all duration-300">
                      <Image
                        src={step.image}
                        alt="Summary Flow"
                        width={1200}
                        height={800}
                        className="object-contain w-auto h-full rounded-xl transition-all duration-300 hover:scale-[1.01]"
                        priority
                      />
                    </div>
                  </div>
                ) : (
                  // Step Layout: Premium Theme-Aware Grid Design
                  <div className="w-full max-w-5xl flex items-center justify-center p-2 sm:p-4">
                    <div className="w-full bg-card dark:bg-[#0D1F35] border border-border dark:border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all duration-300">
                      {/* Top Bar (Grid Header) */}
                      <div className="flex h-14 sm:h-16">
                        {/* Top-Left: Primary Color Number Bar */}
                        <div className="w-[25%] sm:w-[20%] bg-primary flex items-center justify-center space-x-2 border-r border-border dark:border-white/10">
                          <div className="w-4 sm:w-10 h-px bg-white/40" />
                          <span className="text-white text-xl sm:text-3xl font-black">{step.number}</span>
                          <div className="w-4 sm:w-10 h-px bg-white/40" />
                        </div>
                        {/* Top-Right: Dynamic Title Bar */}
                        <div className="flex-1 bg-slate-50 dark:bg-[#0A1829]/40 flex items-center justify-center px-4">
                          <h2 className="text-foreground dark:text-white text-lg sm:text-2xl font-black uppercase tracking-tight text-center">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      {/* Main Body (Grid Body) */}
                      <div className="flex flex-col md:flex-row min-h-[260px] sm:min-h-[340px] md:min-h-[400px]">
                        {/* Bottom-Left: Image Area */}
                        <div className="w-full md:w-[35%] sm:md:w-[30%] bg-slate-50/50 dark:bg-[#0A1829]/60 flex items-center justify-center p-4 sm:p-8 border-b md:border-b-0 md:border-r border-border dark:border-white/10">
                          <div className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full border-[3px] border-primary/20 dark:border-primary/30 overflow-hidden shadow-lg transition-transform duration-500 hover:scale-105">
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-cover"
                              priority
                            />
                          </div>
                        </div>

                        {/* Bottom-Right: Content Area */}
                        <div className="flex-1 bg-white dark:bg-[#0D1F35] p-4 sm:p-8 md:p-12 flex flex-col justify-center transition-all duration-300">
                          {step.subtitle && (
                             <h3 className="text-primary dark:text-accent text-lg sm:text-2xl font-extrabold mb-4 italic leading-tight uppercase">
                               {step.subtitle}
                             </h3>
                          )}
                          <p className="text-foreground/90 dark:text-white/90 text-base sm:text-xl leading-relaxed font-semibold max-w-lg">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation Control Bar */}
        <div className="flex-shrink-0 w-full bg-white/90 dark:bg-[#0A1829] backdrop-blur-md py-3 sm:py-4 px-4 sm:px-8 border-t border-border dark:border-white/10 flex items-center justify-between relative z-20 transition-all duration-300">
          {/* Back Button Container */}
          <div className="w-20 sm:w-40 flex justify-start">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-all duration-200 group font-bold cursor-pointer"
              >
                <ChevronLeft size={24} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                  Back
                </span>
              </button>
            )}
          </div>

          {/* Centered Next Button Container */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 sm:gap-4 text-primary hover:text-accent dark:hover:text-accent transition-all duration-200 group font-black cursor-pointer"
            >
              <span className="text-lg sm:text-2xl font-black uppercase tracking-widest whitespace-nowrap">
                {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
              </span>
              <ChevronRight size={28} strokeWidth={3} className="hidden sm:block group-hover:translate-x-2 transition-transform duration-200" />
              <ChevronRight size={22} strokeWidth={3} className="sm:hidden group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          </div>

          {/* Skip Button Container */}
          <div className="w-20 sm:w-40 flex justify-end">
            <button
              onClick={handleSkip}
              className="bg-primary hover:bg-[#0284C7] dark:bg-primary dark:hover:bg-[#0284C7] text-white px-3 sm:px-8 py-2 sm:py-3 rounded-xl flex items-center gap-1 sm:gap-2 font-black uppercase text-[10px] sm:text-base border border-transparent shadow-[0_0_20px_rgba(14,165,233,0.25)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Skip <ChevronRight size={20} strokeWidth={4} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
        `}</style>
      </motion.div>
    </div>
  );
}
