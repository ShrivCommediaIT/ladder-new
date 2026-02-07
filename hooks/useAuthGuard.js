"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard(options = {}) {
  const { onlyAdmin = false } = options;
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("userData") || "null");
    const subAdmin = JSON.parse(localStorage.getItem("subAdmin") || "null");

    let isAllowed = false;

    if (onlyAdmin) {
      // sirf admin
      isAllowed = admin && admin.isLoggedIn === true;
    } else {
      // admin ya sub admin dono
      isAllowed =
        (admin && admin.isLoggedIn === true) ||
        (subAdmin && subAdmin.isLoggedIn === true);
    }

    if (!isAllowed) {
      router.replace("/404");
    } else {
      setAllowed(true);
    }
  }, [router, onlyAdmin]);

  return allowed;
}









