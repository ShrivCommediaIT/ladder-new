"use client";

import IngoCard from "./IngoCard";
import { useSelector } from "react-redux";

export default function InfoBar() {
  const user = useSelector((state) => state.user?.user);

  // ✅ check email
  const isJoeBloggs = user?.user_id?.toLowerCase() === "joebloggs@gmail.com";

  return (
    <div className="w-full px-2 sm:px-0 md:px-0">
      {/* ✅ render only if joe bloggs */}
      {isJoeBloggs && <IngoCard />}
    </div>
  );
}
