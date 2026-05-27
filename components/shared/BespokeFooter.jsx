"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function BespokeFooter() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setIsDark(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/441134180902", "_blank", "noopener,noreferrer");
  };

  const handleBotClick = () => {
    window.open(
      "https://chatgpt.com/g/g-6a0e2c4800e48191b115f12efef3522b-ai-guide-to-ssp-ask-any-question",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 px-4 py-6 text-slate-900 dark:border-white/5 dark:bg-[#030712] dark:text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 md:gap-5 xl:grid-cols-2 xl:items-stretch">
        <button
          type="button"
          onClick={handleBotClick}
          aria-label="Open SSP AI Assistant"
          className="group relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[20px] border border-fuchsia-200 bg-white shadow-xl transition-all duration-300 hover:border-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 dark:border-fuchsia-500/60 dark:bg-[#070913] dark:shadow-2xl xl:max-w-none"
        >
          <div className="relative aspect-[680/232] min-h-[118px] w-full sm:min-h-[150px] md:min-h-[185px] lg:min-h-[220px] xl:h-full xl:min-h-[232px]">
            <Image
              src={isDark ? "/ai.png" : "/ai-1.png"}
              alt="SSP AI Assistant"
              fill
              sizes="(max-width: 1279px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppClick}
          aria-label="Open WhatsApp chat"
          className="group relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[20px] border border-emerald-200 bg-white shadow-xl transition-all duration-300 hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 dark:border-emerald-500/50 dark:bg-[#04090c] dark:shadow-2xl xl:max-w-none"
        >
          <div className="relative aspect-[612/267] min-h-[138px] w-full sm:min-h-[175px] md:min-h-[220px] lg:min-h-[250px] xl:h-full xl:min-h-[267px]">
            <Image
              src={isDark ? "/wtsapp.png" : "/wtsapp-1.png"}
              alt="WhatsApp contact card"
              fill
              sizes="(max-width: 1279px) 100vw, 50vw"
              className="object-contain object-bottom"
              unoptimized
            />
          </div>
        </button>
      </div>
    </footer>
  );
}
