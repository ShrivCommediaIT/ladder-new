"use client";

import IngoCard from "./IngoCard";
import { useSelector } from "react-redux";

export default function InfoBar() {
  const user = useSelector((state) => state.user?.user);

  // ✅ check email
  const isJoeBloggs = user?.user_id?.toLowerCase() === "joebloggs@gmail.com";

  return (
    <div className="w-full px-2 sm:px-0 md:px-0">
      {/* <p className="bg-white/60 dark:bg-gray-800/60 py-2 px-3 sm:px-4 md:px-6 rounded-lg text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 leading-relaxed text-center sm:text-left">
        <span className="font-bold">Click on your icon to:</span> Move up after a win, change status, edit details, upload avatar, get stats, challenge others above you
        Tap on chosen activity (top line) to update it
      </p> */}

      {/* ✅ render only if joe bloggs */}
      {isJoeBloggs && <IngoCard />}
    </div>
  );
}
