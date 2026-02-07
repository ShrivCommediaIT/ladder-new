// components/animated-game-select.tsx

// "use client"
// import { useEffect } from "react"
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { motion, AnimatePresence } from "framer-motion"

// import { gsap } from "gsap"

// const games = [
//   { value: "cricket", label: "Cricket" },
//   { value: "football", label: "Football" },
//   { value: "tennis", label: "Tennis" },
//   { value: "basketball", label: "Basketball" },
//   { value: "badminton", label: "Badminton" }
// ]

// export function GameSelect() {
//   useEffect(() => {
//     // GSAP animation for entrance
//     gsap.from(".game-select-container", {
//       duration: 1,
//       y: 50,
//       opacity: 0,
//       ease: "back.out(1.7)"
//     })
//   }, [])

//   return (
//     <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
//       {/* Blurred background image */}
//       <div 
//         className="absolute bg-no-repeat inset-0 bg-cover bg-center"
//         style={{
//           backgroundImage: "url('/select-game.jpg')",
//           filter: "blur(2px)",
//           transform: "scale(1.1)"
//         }}
//       />
      
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/50" />
      
//       {/* Main content */}
//       <motion.div 
//         className="game-select-container relative z-10 px-4 py-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
//         initial={{ scale: 0.9 }}
//         animate={{ scale: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h2 className="text-2xl font-bold text-center text-white mb-6">
//           Choose Your Game
//         </h2>
        
//         <Select>
//           <SelectTrigger 
//             className="w-64 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200"
//           >
//             <SelectValue placeholder="Select a game" />
//           </SelectTrigger>
          
//           <AnimatePresence>
//             <SelectContent 
//               className="backdrop-blur-xl bg-black/40 border-white/20 text-white"
//             >
//               <motion.div
//                 initial={{ opacity: 0, height: 0, scale: 0.95 }}
//                 animate={{ 
//                   opacity: 1, 
//                   height: "auto", 
//                   scale: 1,
//                   transition: {
//                     type: "spring",
//                     stiffness: 300,
//                     damping: 30,
//                   }
//                 }}
//                 exit={{ 
//                   opacity: 0, 
//                   height: 0, 
//                   scale: 0.95,
//                   transition: { duration: 0.2 }
//                 }}
//                 style={{ transformOrigin: "top" }}
//               >
//                 <SelectGroup>
//                   {games.map((game) => (
//                     <SelectItem 
//                       key={game.value}
//                       value={game.value}
//                       className="focus:bg-white/20 focus:text-white transition-colors duration-200 cursor-pointer"
//                     >
//                       {game.label}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </motion.div>
//             </SelectContent>
//           </AnimatePresence>
//         </Select>
//       </motion.div>
//     </div>
//   )
// }






// =====================

// "use client"
// import { useEffect, useState } from "react"
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { motion, AnimatePresence, useAnimation } from "framer-motion"
// import { gsap } from "gsap"
// import { Typewriter } from "./Typewriter"

// const games = [
//   { value: "cricket", label: "Cricket" },
//   { value: "football", label: "Football" },
//   { value: "tennis", label: "Tennis" },
//   { value: "basketball", label: "Basketball" },
//   { value: "badminton", label: "Badminton" }
// ]

// export function GameSelect() {
//   const [isLoaded, setIsLoaded] = useState(false)
//   const controls = useAnimation()

//   useEffect(() => {
//     // GSAP animation for entrance
//     gsap.from(".game-select-container", {
//       duration: 1,
//       y: 50,
//       opacity: 0,
//       ease: "back.out(1.7)"
//     })

//     // Framer Motion for text animation
//     controls.start({
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, ease: "easeOut" }
//     })

//     setIsLoaded(true)
//   }, [controls])

//   const titleWords = [
//     { text: "Welcome" },
//     { text: "to" },
//     { text: "the" },
//     { text: "Ultimate" },
//     { text: "Gaming" },
//     { text: "Experience" }
//   ]

//   return (
//     <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
//       {/* Blurred background image */}
//       <div 
//         className="absolute inset-0 bg-cover bg-center"
//         style={{
//           backgroundImage: "url('/select-game.jpg')",
//           filter: "blur(10px)",
//           transform: "scale(1.1)"
//         }}
//       />
      
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/60" />
      
//       {/* Main content */}
//       <motion.div 
//         className="game-select-container relative z-10 w-full max-w-4xl px-8 py-12 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"
//         initial={{ scale: 0.9 }}
//         animate={{ scale: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* Animated header content */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={controls}
//           className="text-center mb-8"
//         >
//           <Typewriter words={titleWords} />
          
//           <motion.p 
//             className="text-lg text-gray-300 mt-4 leading-relaxed"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.5, duration: 0.8 }}
//           >
//             Choose your favorite game and start your journey to victory
//           </motion.p>
//         </motion.div>
        
//         {/* Left-aligned dropdown */}
//         <div className="flex justify-center items-center">
//           <Select>
//             <SelectTrigger 
//               className="w-md cursor-pointer text-white border-white/30 backdrop-blur-sm transition-all duration-200"
//             >
//               <SelectValue placeholder="Select a game" />
//             </SelectTrigger>
            
//             <SelectContent 
//               align="start"
//               className="backdrop-blur-xl bg-black/40 border-white/20 text-white min-w-64"
//             >
//               <motion.div
//                 initial={{ opacity: 0, height: 0, scale: 0.95 }}
//                 animate={{ 
//                   opacity: 1, 
//                   height: "auto", 
//                   scale: 1,
//                   transition: {
//                     type: "spring",
//                     stiffness: 300,
//                     damping: 30,
//                   }
//                 }}
//                 exit={{ 
//                   opacity: 0, 
//                   height: 0, 
//                   scale: 0.95,
//                   transition: { duration: 0.2 }
//                 }}
//                 style={{ transformOrigin: "top" }}
//               >
//                 <SelectGroup>
//                   {games.map((game) => (
//                     <SelectItem 
//                       key={game.value}
//                       value={game.value}
//                       className="focus:bg-white/20 focus:text-white transition-colors duration-200 cursor-pointer"
//                     >
//                       {game.label}
//                     </SelectItem>
//                   ))}
//                 </SelectGroup>
//               </motion.div>
//             </SelectContent>
//           </Select>
//         </div>
//       </motion.div>
//     </div>
//   )
// }





// ==================

"use client"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { gsap } from "gsap"
import { Typewriter } from "./Typewriter"

const games = [
  { value: "cricket", label: "Cricket" },
  { value: "football", label: "Football" },
  { value: "tennis", label: "Tennis" },
  { value: "basketball", label: "Basketball" },
  { value: "badminton", label: "Badminton" }
]

export function GameSelect() {
  const [isLoaded, setIsLoaded] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    // GSAP animation for entrance
    gsap.from(".game-select-container", {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: "back.out(1.7)"
    })

    // Framer Motion for text animation
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    })

    setIsLoaded(true)
  }, [controls])

  const titleWords = [
    { text: "Welcome" },
    { text: "to" },
    { text: "the" },
    { text: "Ultimate" },
    { text: "Gaming" },
    { text: "Experience" }
  ]

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/select-game.jpg')",
          filter: "blur(2px)",
          transform: "scale(1.1)"
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Main content */}
      <motion.div 
        className="game-select-container relative z-10 w-full max-w-4xl px-8 py-12 rounded-2xl bg-white/2 backdrop-blur-sm border border-white/20 shadow-sm"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated header content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={controls}
          className="text-center mb-8"
        >
          <Typewriter words={titleWords} />
          
          <motion.p 
            className="text-lg text-gray-300 mt-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            Choose your favorite game and start your journey to victory
          </motion.p>
        </motion.div>
        
        {/* Left-aligned dropdown with enhanced text visibility */}
        <div className="flex justify-center items-center">
          <Select>
            <SelectTrigger 
              className="w-md cursor-pointer text-white border-white/30  transition-all duration-200"
            >
              <SelectValue 
                placeholder="Select a game" 
                className="font-bold text-sm text-white"
              />
            </SelectTrigger>
            
            <SelectContent 
              align="start"
              className="backdrop-blur-xl bg-black/40 border-white/30 text-white min-w-64 shadow-2xl"
            >
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  height: "auto", 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0, 
                  scale: 0.95,
                  transition: { duration: 0.2 }
                }}
                style={{ transformOrigin: "top" }}
              >
                <SelectGroup>
                  {games.map((game) => (
                    <SelectItem 
                      key={game.value}
                      value={game.value}
                      className="py-3 focus:bg-white/20 focus:text-white transition-all duration-200 cursor-pointer hover:bg-white/10"
                    >
                      <span className="font-bold text-lg text-white">
                        {game.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </motion.div>
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </div>
  )
}
