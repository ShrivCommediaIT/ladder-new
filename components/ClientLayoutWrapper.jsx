"use client";

import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Script from 'next/script';

export default function ClientLayoutWrapper({ children }) {
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

  // Intercept and suppress the non-actionable PayPal SDK eligibility warnings from printing to the console.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const isPaylaterWarning = args.some(arg => {
          if (typeof arg === "string" && arg.includes("ncps_standalone_paylater_ineligible")) {
            return true;
          }
          if (arg && typeof arg === "object") {
            try {
              const str = JSON.stringify(arg);
              if (str && str.includes("ncps_standalone_paylater_ineligible")) {
                return true;
              }
            } catch (_) {}
          }
          return false;
        });

        if (isPaylaterWarning) {
          return; // Suppress
        }

        originalConsoleError.apply(console, args);
      };

      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);

  const isAuthOrLandingRoute = pathname === "/" ||
                               pathname === "/terms-and-conditions" ||
                               pathname === "/privacy-policy" ||
                               pathname === "/refund-policy" ||
                               pathname?.startsWith("/login") ||
                               pathname?.startsWith("/register") ||
                               pathname?.startsWith("/reset-password") ||
                               pathname?.startsWith("/change-password") ||
                               pathname?.startsWith("/demo-login") ||
                               pathname?.startsWith("/super-admin");

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
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
      {!pathname?.startsWith("/super-admin") && (
        <>
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
        </>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
    </ThemeProvider>
  );
}
