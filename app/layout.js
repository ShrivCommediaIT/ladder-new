
// app/layout.js (or wherever your Redux Provider is)
"use client";
import './globals.css'
import { Provider } from "react-redux";
import { store, persistor } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AppInit from '@/components/AppInit';
import SupportChatBot from '@/helper/SupportChatBot';
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
       <body>
         <Provider store={store}>
           <PersistGate loading={null} persistor={persistor}>
            <AppInit />
            {children}
            {(pathname != "/login-page") && <SupportChatBot />}
           </PersistGate>
         </Provider>
       </body>
     </html>
  );
}




// ========== hydration error fix

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body suppressHydrationWarning>
//         <Provider store={store}>
//           <PersistGate loading={null} persistor={persistor}>
//             {children}
//           </PersistGate>
//         </Provider>
//       </body>
//     </html>
//   );
// }