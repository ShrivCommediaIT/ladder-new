// components/typewriter-effect.tsx
"use client"
import { motion } from "framer-motion"

export function Typewriter({ words, delay = 0.5, className }) {
  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={`text-3xl md:text-5xl font-bold text-white ${word.className}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: delay * index,
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          {word.text}
        </motion.span>
      ))}
    </div>
  )
}
