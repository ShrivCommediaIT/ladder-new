"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard(options = {}) {
  const { onlyAdmin = false } = options;
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const admin = JSON.parse(sessionStorage.getItem("userData") || "null");
    const subAdmin = JSON.parse(sessionStorage.getItem("subAdmin") || "null");

    let isAllowed = false;

    if (onlyAdmin) {
      // sirf admin (guest is not admin)
      isAllowed = admin && admin.isLoggedIn === true && admin.user_type !== "guest";
    } else {
      // admin ya sub admin dono
      isAllowed =
        (admin && admin.isLoggedIn === true) ||
        (subAdmin && subAdmin.isLoggedIn === true);
    }

    if (isAllowed) {
      const isGuest = admin?.user_type === "guest" || subAdmin?.user_type === "guest";
      if (isGuest && typeof window !== "undefined" && window.location.pathname !== "/submit-performance") {
        isAllowed = false;
      }
    }

    if (!isAllowed) {
      router.replace("/login-page");
    } else {
      setAllowed(true);
    }
  }, [router, onlyAdmin]);

  return allowed;
}









