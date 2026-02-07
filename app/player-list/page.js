

// import { PlayerLists } from "@/components/pages/players/PlayerLists"


// const PlayerListsRouter = () => {
//   return (
//     <div>
//         <PlayerLists />   
//     </div>
//   )
// }

// export default PlayerListsRouter









// =======================

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { PlayerLists } from "@/components/pages/players/PlayerLists";

// export default function PlayerListsRouter() {
//   const router = useRouter();
//   const [allowed, setAllowed] = useState(false);

//   useEffect(() => {
//     const userData = localStorage.getItem("user"); 
//     // 👆 wahi key jisme aap user store kar rahe ho

//     if (!userData) {
//       router.replace("/404");
//       return;
//     }

//     const user = JSON.parse(userData);

//     if (!user.isLoggedIn) {
//       router.replace("/404");
//       return;
//     }

//     // 🔒 optional: sirf admin allow
//     // if (user.user_type !== "admin") {
//     //   router.replace("/404");
//     //   return;
//     // }

//     setAllowed(true);
//   }, [router]);

//   if (!allowed) return null;

//   return (
//     <div>
//       <PlayerLists />
//     </div>
//   );
// }







// ==============================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerLists } from "@/components/pages/players/PlayerLists";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function PlayerListsRouter() {

  // ... Protected Route ...
  const allowed = useAuthGuard();
  if (!allowed) return null;

  return <PlayerLists />;
}