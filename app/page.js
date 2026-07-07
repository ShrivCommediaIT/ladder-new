
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetUserState } from "@/redux/slices/userSlice";
import dynamic from "next/dynamic";

const PlanHeading = dynamic(() => import("@/components/pages/payment/PlanHeading"), {
  ssr: true,
});

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.removeItem("persist:root");
      dispatch(resetUserState());
    }
  }, [dispatch]);

  return (
    <>
        <div className=" min-h-screen">
          {/* <GameSelect /> */}
            <div>
              <PlanHeading />
            </div>
        </div>
    </>
  );
}
