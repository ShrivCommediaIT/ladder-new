"use client";
import React from "react";
import Image from "next/image";
import { ArrowRight, Phone, Video, MoreVertical } from "lucide-react";

export default function BespokeFooter() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/441134180902", "_blank", "noopener,noreferrer");
  };

  const handleBotClick = () => {
    const event = new CustomEvent("open-ssp-chatbot");
    window.dispatchEvent(event);
  };

  return (
    <footer className="w-full border-t border-border bg-background p-6 text-foreground sm:p-10">
      <div className="max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* CARD 1: SSP AI ASSISTANT */}
        <div 
          onClick={handleBotClick}
          className="relative flex cursor-pointer flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-card p-3 text-foreground shadow-2xl transition-all duration-300 hover:border-primary/40 lg:flex-row"
        >
          <div className="flex items-start gap-4 flex-1">
            {/* Robot 3D Avatar */}
            <div className="relative flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-[color:color-mix(in_srgb,var(--card),var(--primary)_8%)] shadow-lg">
                <svg className="w-12 h-12 text-slate-200" viewBox="0 0 64 64" fill="none">
                  <rect x="16" y="20" width="32" height="28" rx="8" fill="url(#botHeadGrad)" stroke="#A78BFA" strokeWidth="1.5" />
                  <path d="M32 20V10" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="32" cy="8" r="3" fill="#EC4899" />
                  <path d="M22 20l-4-6M42 20l4-6" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="17" cy="13" r="2" fill="#A78BFA" />
                  <circle cx="47" cy="13" r="2" fill="#A78BFA" />
                  <rect x="22" y="26" width="20" height="10" rx="4" fill="#020617" />
                  <circle cx="28" cy="31" r="2.5" fill="#818CF8" />
                  <circle cx="36" cy="31" r="2.5" fill="#818CF8" />
                  <circle cx="20" cy="39" r="1.5" fill="#F472B6" />
                  <circle cx="44" cy="39" r="1.5" fill="#F472B6" />
                  <path d="M28 41h8" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="botHeadGrad" x1="16" y1="20" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1E1B4B" />
                      <stop offset="1" stopColor="#312E81" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* Description Text */}
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-wide text-primary">
                SSP AI ASSISTANT
              </h3>
              <p className="text-sm font-medium text-foreground">
                Your intelligent assistant available anytime.
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                Get help with setup, competitions, members, tokens, rewards and more.
              </p>
            </div>
          </div>

          {/* Workflow Steps on Right */}
          <div className="flex items-center gap-1 sm:gap-2.5 justify-center p-2 rounded-2xl w-full lg:w-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center w-[72px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="mt-2 text-[9px] leading-tight text-muted-foreground">Ask a question</span>
            </div>
            
            <div className="text-purple-900/60 font-bold hidden sm:block">→</div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center w-[72px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="mt-2 text-[9px] leading-tight text-muted-foreground">Get instant answers</span>
            </div>
            
            <div className="text-purple-900/60 font-bold hidden sm:block">→</div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center w-[72px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="mt-2 text-[9px] leading-tight text-muted-foreground">Step-by-step guidance</span>
            </div>
            
            <div className="text-purple-900/60 font-bold hidden sm:block">→</div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center w-[72px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500/10 text-emerald-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mt-2 text-[9px] leading-tight text-muted-foreground">Get things done faster</span>
            </div>
          </div>
        </div>

        {/* CARD 2: WHATSAPP CONTACT */}
        <div 
          onClick={handleWhatsAppClick}
          className="group relative flex cursor-pointer flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl transition-all duration-300 hover:border-emerald-500/40 md:flex-row"
        >
          {/* Left section: WhatsApp icon, main text, and Graham info */}
          <div className="flex flex-col gap-8 h-full flex-1 w-full text-left">
            {/* WhatsApp header inside card */}
            <div className="flex items-center gap-2">
              {/* WhatsApp logo icon */}
              <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.58 1.98 14.106.953 11.993.953c-5.456 0-9.88 4.371-9.884 9.8.002 2.11.575 4.166 1.662 5.957l-1.01 3.693 3.797-.977zM17.13 14.54c-.282-.14-.1.665-.83.665h-.02c-.37-.02-.8-.2-1.34-.43-.72-.31-1.44-.81-1.95-1.32-.45-.45-.88-.99-1.2-1.58-.29-.53-.41-.95-.41-1.33 0-.61.35-.93.53-1.12.1-.11.23-.26.31-.38.09-.13.15-.22.23-.38.08-.16.04-.3-.02-.44-.06-.14-.52-1.26-.72-1.74-.19-.46-.39-.4-.53-.41h-.45c-.15 0-.4.06-.61.28-.21.22-.8.78-.8 1.9s.82 2.2 1.05 2.5c.23.3 2.14 3.27 5.18 4.58.72.31 1.28.5 1.72.64.73.23 1.4.2 1.93.12.59-.09 1.8-.74 2.05-1.45.26-.71.26-1.32.18-1.45-.07-.13-.27-.21-.55-.35z" />
                </svg>
              </div>
              <span className="text-xs font-bold tracking-wider text-emerald-500">
                WHATSAPP CONTACT
              </span>
            </div>
            <div className="flex justify-between">
            {/* Connect with the Creator text */}
            <h4 className="mt-4 mb-5 text-2xl font-bold leading-snug text-foreground">
              Connect with <br /> 
              the <br /> 
              Creator
            </h4>
            
            {/* Graham Jaggers Profile details */}
            <div className="flex flex-col items-center w-24">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-emerald-500/20 bg-[color:color-mix(in_srgb,var(--card),black_8%)]">
                <Image 
                  src="/graham_jaggers.png" 
                  alt="Graham Jaggers" 
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-center text-[11px] font-medium whitespace-nowrap text-muted-foreground">
                Graham Jaggers
              </p>
            </div>
            </div>
          </div>

          {/* Right section: Beautiful Phone chat mockup (EXACT match to image) */}
          <div className="relative w-64 h-[210px] bg-[#070b0e] rounded-t-3xl rounded-b-md border-t-4 border-x-4 border-b-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between shrink-0">
            {/* Top status bar */}
            <div className="w-full bg-[#075E54] px-3 pt-1 flex justify-between items-center text-[8.5px] text-white/80 select-none">
              <span>10:31</span>
              <div className="flex items-center gap-1 font-sans">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Whatsapp App Header */}
            <div className="bg-[#075E54] px-2 py-1 flex items-center justify-between text-white border-b border-[#054c43]/40">
              <div className="flex items-center gap-0.5">
                {/* Profile Circle */}
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white relative">
                  SSP
                  {/* Glowing Green Online Status indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-[#075E54] rounded-full"></span>
                </div>
                {/* Contact Name & Status */}
                <div className="ml-1 text-left leading-tight">
                  <p className="font-bold text-[9.5px] tracking-wide text-white">Sports Solutions Pro</p>
                  <p className="text-[7px] text-[#25D366] font-semibold">Business Account</p>
                </div>
              </div>
              
              {/* Header Action Icons */}
              <div className="flex items-center gap-2.5 text-white/90">
                <Video size={10} />
                <Phone size={9.5} />
                <MoreVertical size={10} />
              </div>
            </div>

            {/* Chat Body Area (Whatsapp theme colors and wallpaper pattern) */}
            <div className="flex-1 bg-[#0b141a] p-3 flex flex-col justify-end gap-2 overflow-y-auto">
              
              {/* Left Message Bubble (from SSP) */}
              <div className="relative self-start max-w-[85%] bg-white text-slate-800 text-[9.5px] px-2.5 py-1 rounded-r-xl rounded-bl-xl shadow-md border border-white/10">
                {/* Small WhatsApp bubble hook */}
                <div className="absolute top-0 -left-1 w-2 h-2 bg-white clip-whatsapp-left"></div>
                <p className="leading-snug">Hi! How can we help you today?</p>
                <span className="text-[6.5px] text-slate-500 block text-right mt-1 font-semibold">10:30 AM</span>
              </div>
              
              {/* Right Message Bubble (from User) */}
              <div className="relative self-end max-w-[85%] bg-[#dcf8c6] text-slate-800 text-[9.5px] px-2.5 py-1 rounded-l-xl rounded-br-xl shadow-md border border-emerald-950/10">
                {/* Small WhatsApp bubble hook */}
                <div className="absolute top-0 -right-1 w-2 h-2 bg-[#dcf8c6] clip-whatsapp-right"></div>
                <p className="leading-snug">Hello, I need help with my competition.</p>
                <div className="flex items-center justify-end gap-0.5 mt-1">
                  <span className="text-[6.5px] text-emerald-800/60 font-semibold">10:31 AM</span>
                  <span className="text-[8px] text-[#34B7F1] font-bold leading-none">✓✓</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
