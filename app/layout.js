"use client";
import './globals.css'
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "next-themes";
import AppInit from '@/components/AppInit';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Script from 'next/script';

export default function RootLayout({ children }) {
  const [userType, setUserType] = useState("")
  const pathname = usePathname()

  useEffect(() => {
    const parsed = JSON.parse(sessionStorage.getItem("userData") || "null");
    const role = parsed?.user_type;

    if (role === "admin" || role === "sub_admin") {
      setUserType(role);
    } else {
      setUserType(null);
    }
  }, []);

  const isAuthOrLandingRoute = pathname === "/" ||
                               pathname === "/terms-and-conditions" ||
                               pathname?.startsWith("/login") ||
                               pathname?.startsWith("/register") ||
                               pathname?.startsWith("/reset-password") ||
                               pathname?.startsWith("/change-password") ||
                               pathname?.startsWith("/demo-login");

  return (
    <html lang="en" suppressHydrationWarning>
       <body suppressHydrationWarning>
         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
           <Provider store={store}>
             <PersistGate loading={null} persistor={persistor}>
               <AppInit />
               {isAuthOrLandingRoute ? (
                 children
               ) : (
                 <div className="flex flex-col min-h-screen">
                   <Navbar />
                   <main className="flex-grow w-full">{children}</main>
                   <Footer />
                 </div>
               )}
             </PersistGate>
           </Provider>
           <Script id="chatling-config" strategy="afterInteractive">
             {`window.chtlConfig = { chatbotId: "7385437887" };`}
           </Script>
           <Script
             async
             data-id="7385437887"
             id="chtl-script"
             src="https://chatling.ai/js/embed.js"
             strategy="afterInteractive"
           />
           <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
         </ThemeProvider>
       </body>
     </html>
  );
}
