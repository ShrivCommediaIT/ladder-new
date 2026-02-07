// "use client";

// import { useParams } from "next/navigation";
// import RegisterPage from "@/components/pages/RegisterPage";
// import LoginPage from "@/components/pages/LoginPage";
// import RegisterUser from "@/components/pages/users/RegisterUser";
// import LoginUser from "@/components/pages/users/LoginUser";
// import { motion } from "framer-motion";
// import Link from "next/link";

// export default function DynamicPage() {
//   const { action, encodedId } = useParams(); // Extracts both from the URL
//   const decodedId = atob(encodedId); // Decode MzQ5 → 349

//   if (!action || !encodedId) return <p>Invalid URL</p>;

//   switch (action) {
//     case "register-user":
//       return <RegisterUser id={decodedId} />;
//     case "login-user":
//       return <LoginUser id={decodedId} />;

//     default:
//         return (
//           <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#050816]">
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.6, ease: "easeOut" }}
//               className="relative min-h-screen w-full text-center bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center flex-col shadow-2xl"
//             >
//               <motion.h1
//                 className="text-8xl font-extrabold text-cyan-400 mb-4"
//                 initial={{ rotate: -10 }}
//                 animate={{ rotate: 10 }}
//                 transition={{
//                   repeat: Infinity,
//                   repeatType: "reverse",
//                   duration: 1.5,
//                   ease: "easeInOut",
//                 }}
//               >
//                 404
//               </motion.h1>
      
//               <motion.h2
//                 className="text-2xl font-semibold text-white mb-4"
//                 initial={{ y: -20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.3, duration: 0.6 }}
//               >
//                 Page Not Found
//               </motion.h2>
      
//               <motion.p
//                 className="text-white/70 mb-8"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.6, duration: 0.8 }}
//               >
//                 Sorry bhai, ye page exist nahi karta ya aapko access nahi hai.
//               </motion.p>
      
//               <motion.div
//                 className="flex items-center justify-center gap-4"
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.9, duration: 0.5 }}
//               >
//                 <Link
//                   href="/"
//                   className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
//                 >
//                   Go Home
//                 </Link>
      
//                 {/* <button
//                   onClick={() => window.history.back()}
//                   className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
//                 >
//                   Go Back
//                 </button> */}
//               </motion.div>
//             </motion.div>
//           </div>
//         );
//   }
// }








// =============================== Protected Route Example ===============================
"use client";

import { useParams, useRouter } from "next/navigation";
import RegisterUser from "@/components/pages/users/RegisterUser";
import LoginUser from "@/components/pages/users/LoginUser";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DynamicPage() {
  const router = useRouter();
  const { action, encodedId } = useParams();
  const [allowed, setAllowed] = useState(false);
  const [decodedId, setDecodedId] = useState(null);

  // ✅ Auth + decode check
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("userData") || "null");
    const subAdmin = JSON.parse(localStorage.getItem("subAdmin") || "null");

    const isLoggedIn =
      (admin && admin.isLoggedIn === true) ||
      (subAdmin && subAdmin.isLoggedIn === true);

    if (!isLoggedIn) {
      router.replace("/404");
      return;
    }

    // Decode base64 safely
    if (encodedId) {
      try {
        setDecodedId(atob(encodedId));
      } catch (err) {
        router.replace("/404");
      }
    } else {
      router.replace("/404");
    }

    setAllowed(true);
  }, [encodedId, router]);

  if (!allowed) return null;

  if (!action || !decodedId)
    return (
      <p className="text-white text-center mt-20">Invalid URL</p>
    );

  switch (action) {
    case "register-user":
      return <RegisterUser id={decodedId} />;

    case "login-user":
      return <LoginUser id={decodedId} />;

    default:
      // ✅ Animated 404
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#050816] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative min-h-screen w-full text-center bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center flex-col shadow-2xl"
          >
            <motion.h1
              className="text-8xl font-extrabold text-cyan-400 mb-4"
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              404
            </motion.h1>

            <motion.h2
              className="text-2xl font-semibold text-white mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Page Not Found
            </motion.h2>

            {/* <motion.p
              className="text-white/70 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Sorry, this page doesn't exist or you're not authorized to view it.
            </motion.p> */}

            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
              >
                Go Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      );
  }
}