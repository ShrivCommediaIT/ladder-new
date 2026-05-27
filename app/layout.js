"use client";
import './globals.css'
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "next-themes";
import AppInit from '@/components/AppInit';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }) {
  const [userType, setUserType] = useState("")

useEffect(() => {
  const parsed = JSON.parse(sessionStorage.getItem("userData") || "null");
  const role = parsed?.user_type;

  if (role === "admin" || role === "sub_admin") {
    setUserType(role);
  } else {
    setUserType(null);
  }
}, []);

  return (
    <html lang="en" suppressHydrationWarning>
       <body suppressHydrationWarning>
         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
           <Provider store={store}>
             <PersistGate loading={null} persistor={persistor}>
              <AppInit />
              {children}
             </PersistGate>
           </Provider>
         </ThemeProvider>
       </body>
     </html>
  );
}
