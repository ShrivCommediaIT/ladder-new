

"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    title: "24/7 Transparent Rankings",
    points: [
      "Instant, real-time updates visible to all members.",
      "Creates continuous motivation and a buzz around the club.",
    ],
  },
  {
    title: "Self-Managing & Tamper-Proof",
    points: [
      "Players update their own results — no admin intervention.",
      "Only winners can move themselves up; everyone gets notified instantly.",
      "An activity log ensures every result is visible to all.",
    ],
  },
  {
    title: "Comms Made Easy",
    points: [
      "One-click access to contact details for scheduling matches.",
      "Encourages frequent play and community engagement.",
    ],
  },
  {
    title: "Club Community Feel",
    points: [
      "Players upload avatars, strengthening the club’s identity.",
    ],
  },
  {
    title: "Team Selection",
    points: [
      "Stats and rankings support fair team selection and seeding.",
    ],
  },
  {
    title: "Boosts Participation & Revenue",
    points: [
      "More challenges mean more bookings, engagement, and revenue.",
    ],
  },
  {
    title: "Simple Setup",
    points: [
      "Import players via CSV and start instantly.",
    ],
  },
  {
    title: "Customisable & Flexible",
    points: [
      "Adjust ladder size, challenge rules, and color themes.",
      "Perfect for tennis, squash, padel, badminton, and more.",
    ],
  },
];

export default function LadderBenefits() {
  const cardsRef = useRef([]);
  const mainRef = useRef(null);

  useEffect(() => {
    if (cardsRef.current.length) {
      cardsRef.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 85, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: i * 0.07,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 65%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }

    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { background: "black" },
        {
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)",
          duration: 1.2,
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );
    }
  }, []);

  return (
    <main
      ref={mainRef}
      className="relative py-20 min-h-screen bg-black overflow-hidden"
      style={{ transition: "background 0.6s cubic-bezier(0.7,0,0.25,1)" }}
    >
      {/* Decorative BG Glow */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-pink-400/10 pointer-events-none blur-2xl"
        aria-hidden
      />

      {/* HEADER TEXT */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-extrabold text-center mb-10 tracking-tight"
      >
        <span className="text-white drop-shadow-md">Why Clubs Love </span>
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          SportsLaddersPro
        </span>
      </motion.h2>

      {/* BENEFITS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            ref={(el) => (cardsRef.current[index] = el)}
            style={{ opacity: 0, transform: "translateY(85px)" }}
          >
            <Card className="backdrop-blur-md border border-white/10 bg-gradient-to-br from-zinc-900/70 via-zinc-800/70 to-zinc-900/40 hover:from-indigo-900/60 hover:to-purple-800/40 transition-all duration-500 rounded-xl shadow-[0_0_20px_rgba(93,79,240,0.3)] hover:shadow-[0_0_30px_rgba(150,90,255,0.6)] group min-h-[300px]">
              <CardContent className="p-7 space-y-4">
                <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 drop-shadow-md">
                  {benefit.title}
                </h3>
                <ul className="space-y-2 text-gray-200 text-lg leading-relaxed">
                  {benefit.points.map((point, i) => (
                    <li
                      key={i}
                      className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-gradient-to-r before:from-indigo-400 before:to-pink-400 before:rounded-full"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))}
      </section>

      {/* FOOTER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-20 text-center px-6"
      >
        <p className="text-xl sm:text-2xl font-semibold text-gray-100 mb-2">
          Just{" "}
          <span className="bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent font-bold">
            £12
          </span>{" "}
          per player per year
        </p>
        <p className="text-gray-400 text-base">
          That’s only £1/month — covered easily by a small court fee tweak.
        </p>
      </motion.div>
    </main>
  );
}
