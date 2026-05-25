"use client";

import React from "react";
import Image from "next/image";

export default function BespokeFooter() {
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
    <footer className="w-full border-t border-white/5 bg-[#030712] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 md:gap-5 xl:grid-cols-2 xl:items-stretch">
        <button
          type="button"
          onClick={handleBotClick}
          aria-label="Open SSP AI Assistant"
          className="group relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[20px] border border-fuchsia-500/60 bg-[#070913] shadow-2xl transition-all duration-300 hover:border-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 xl:max-w-none"
        >
          <div className="relative aspect-[680/232] min-h-[118px] w-full sm:min-h-[150px] md:min-h-[185px] lg:min-h-[220px] xl:h-full xl:min-h-[232px]">
            <Image
              src="/ai.PNG"
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
          className="group relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[20px] border border-emerald-500/50 bg-[#04090c] shadow-2xl transition-all duration-300 hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 xl:max-w-none"
        >
          <div className="relative aspect-[612/267] min-h-[138px] w-full sm:min-h-[175px] md:min-h-[220px] lg:min-h-[250px] xl:h-full xl:min-h-[267px]">
            <Image
              src="/wtsapp.PNG"
              alt="WhatsApp contact card"
              fill
              sizes="(max-width: 1279px) 100vw, 50vw"
              className="object-contain object-bottom"
            />
          </div>
        </button>
      </div>
    </footer>
  );
}
