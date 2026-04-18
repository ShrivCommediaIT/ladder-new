"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsVisible(false);
    router.push("/register-page");
  };

  const finishOnboarding = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 text-white">
      {/* Background with deep blue color */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#000814] backdrop-blur-[15px]" 
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full max-w-6xl h-full md:h-[650px] bg-[#000814] border-y md:border border-white/10 sm:rounded-xl overflow-hidden flex flex-col z-[160]"
      >
        {/* Top Header - Hidden for initial summary step */}
        {step.type !== "summary" && (
          <div className="flex-shrink-0 w-full bg-black/40 backdrop-blur-md py-4 border-b border-white/10 text-center relative z-20">
            <h1 className="text-white text-2xl sm:text-3xl font-bold italic tracking-wider">
              Participation <span className="text-[#39FF14]">Eco-System</span>
            </h1>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <div className="w-full h-full overflow-y-auto relative z-10 no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 px-4 py-8"
              >
                {step.type === "summary" ? (
                  // Summary Layout (Large image, full visibility)
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <div className="relative w-full h-[95%] max-w-[900px] flex items-center justify-center">
                      <Image
                        src={step.image}
                        alt="Summary Flow"
                        width={1200}
                        height={800}
                        className="object-contain w-auto h-full"
                        priority
                      />
                    </div>
                  </div>
                ) : (
                  // Step Layout: Corrected Grid Design
                  <div className="w-full max-w-5xl flex items-center justify-center p-4">
                    <div className="w-full bg-[#0d2137] border-[3px] border-white/20 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
                      {/* Top Bar (Grid Header) */}
                      <div className="flex h-14 sm:h-16">
                        {/* Top-Left: Green Number Bar */}
                        <div className="w-[35%] sm:w-[30%] bg-[#4a9029] flex items-center justify-center space-x-4 border-r border-[#0d2137]">
                          <div className="w-8 sm:w-16 h-px bg-white/40" />
                          <span className="text-white text-xl sm:text-3xl font-bold">{step.number}</span>
                          <div className="w-8 sm:w-16 h-px bg-white/40" />
                        </div>
                        {/* Top-Right: Blue Title Bar */}
                        <div className="flex-1 bg-[#0d2137] flex items-center justify-center px-4">
                          <h2 className="text-white text-xl sm:text-3xl font-black uppercase tracking-tight">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      {/* Main Body (Grid Body) */}
                      <div className="flex flex-col md:flex-row min-h-[300px] sm:min-h-[400px]">
                        {/* Bottom-Left: Image Area (Deep Blue) */}
                        <div className="w-full md:w-[35%] sm:md:w-[30%] bg-[#0d2137] flex items-center justify-center p-8 border-r border-white/10">
                          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Bottom-Right: Content Area (White) */}
                        <div className="flex-1 bg-white p-6 sm:p-12 flex flex-col justify-center">
                          {step.subtitle && (
                             <h3 className="text-[#0d2137] text-lg sm:text-2xl font-black mb-4 italic leading-tight">
                               {step.subtitle}
                             </h3>
                          )}
                          <p className="text-black text-sm sm:text-xl leading-relaxed font-semibold max-w-lg">
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
        <div className="flex-shrink-0 w-full bg-black/60 backdrop-blur-md py-4 px-4 sm:px-8 border-t border-white/10 flex items-center justify-between relative z-20">
          {/* Desktop Spacer */}
          <div className="hidden md:block w-40" />

          {/* Centered Next Button Container */}
          <div className="flex-1 flex justify-center md:justify-center">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 sm:gap-4 text-white hover:text-[#39FF14] transition-all group"
            >
              <span className="text-lg sm:text-2xl font-black uppercase tracking-widest whitespace-nowrap">
                {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
              </span>
              <ChevronRight size={28} strokeWidth={3} className="hidden sm:block group-hover:translate-x-2 transition-transform" />
              <ChevronRight size={22} strokeWidth={3} className="sm:hidden group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Skip Button Container */}
          <div className="flex-shrink-0">
            <button
              onClick={handleSkip}
              className="bg-[#39FF14] hover:bg-[#32e312] text-black px-4 sm:px-8 py-2 sm:py-3 rounded-md flex items-center gap-2 font-black uppercase text-xs sm:text-base border-2 border-transparent hover:border-white shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all active:scale-95"
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
