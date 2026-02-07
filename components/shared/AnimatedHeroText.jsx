"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

// Register GSAP plugin
gsap.registerPlugin(TextPlugin);

export default function AnimatedHeroText() {
  const welcomeRef = useRef(null);
  const brandRef = useRef(null);
  const subtitleRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Ensure DOM is ready
    if (typeof window === "undefined") return;

    // Split text for better control
    const welcomeEl = welcomeRef.current;
    const brandEl = brandRef.current;
    const subtitleEl = subtitleRef.current;

    // Hide initially
    gsap.set([welcomeEl, brandEl, subtitleEl], { opacity: 0 });

    // Animate "Welcome to" — word by word
    gsap.fromTo(
      welcomeEl.children,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.2)",
      }
    );

    // Typewriter effect on brand name
    gsap.to(brandEl, {
      duration: 2,
      text: "Sportssolutionspro",
      ease: "power2.out",
      delay: 0.8,
      onComplete: () => {
        // Add shine after text appears
        const shine = document.createElement("span");
        shine.className = "shine-effect";
        brandEl.appendChild(shine);

        gsap.fromTo(
          shine,
          { x: "-100%" },
          {
            x: "200%",
            duration: 2,
            ease: "none",
            repeat: -1,
            delay: 0.5,
          }
        );

        // Style shine with CSS (inject once)
        if (!document.getElementById("shine-style")) {
          const style = document.createElement("style");
          style.id = "shine-style";
          style.textContent = `
            .shine-effect {
              position: absolute;
              top: 0; left: 0; width: 100%; height: 100%;
              background: linear-gradient(90deg, 
                transparent, 
                rgba(255,255,255,0.4), 
                transparent);
              background-size: 200% 100%;
              pointer-events: none;
              opacity: 0.3;
              clip-path: inset(0 0 90% 0);
            }
          `;
          document.head.appendChild(style);
        }
      },
    });

    // Animate subtitle — word by word
    const words = subtitleEl.innerText.split(" ");
    subtitleEl.innerHTML = words
      .map(
        (word) =>
          `<span class="inline-block opacity-0"> ${word} </span>`
      )
      .join("");

    gsap.to(subtitleEl.children, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      delay: 2.2,
      ease: "power2.out",
    });

    // Optional: Add floating pulse to container
    gsap.to(containerRef.current, {
      y: -5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 3,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-10 text-center max-w-2xl mx-auto px-6"
    >
      {/* "Welcome to" */}
      <h2 className="text-4xl sm:text-5xl md:text-5xl font-extrabold mb-4 leading-tight text-zinc-800">
        <span ref={welcomeRef}>
          <span className="inline-block">Welcome</span>
          <span className="inline-block mx-2">to</span>
        </span>
      </h2>

      {/* Brand Name with GSAP Typewriter */}
      <h1
        ref={brandRef}
        className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent relative leading-tight overflow-hidden"
        style={{ position: "relative" }}
      >
        {/* Text will be filled by GSAP */}
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="text-lg sm:text-xl md:text-2xl text-zinc-700 mb-8 max-w-3xl mx-auto leading-relaxed"
        style={{ whiteSpace: "pre" }}
      >
        {"Join clubs across the UK and manage your ladder with real-time rankings, easy match scheduling, and full transparency."}
      </p>

      {/* CTA Button (Optional) */}
      <button
        className="px-8 py-3 mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
        style={{ opacity: 0, transform: "scale(0.8)", transition: "all 0.4s ease" }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.4)";
        }}
        onClick={() => alert("Let's build your ladder!")}
      >
        Start Your Ladder
      </button>
    </div>
  );
}
