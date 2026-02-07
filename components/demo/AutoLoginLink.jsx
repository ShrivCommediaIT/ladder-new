"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AutoLoginLink({ autoLoginUrl }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const [finalUrl, setFinalUrl] = useState(null);

  useEffect(() => {
    if (autoLoginUrl) {
      try {
        const encodedId = autoLoginUrl.split("/").pop(); // last slug -> "MjM%3D"
        const decodedId = atob(decodeURIComponent(encodedId)); // decode -> "23"

        // ✅ Always force login as Joe Bloggs (not admin)
        dispatch({
          type: "user/setUser",
          payload: {
            id: decodedId,
            name: "Joe Bloggs",
            email: "joebloggs@gmail.com",
            user_type: "user", // ✅ Always normal user
            player_status: "1",
          },
        });

        // ✅ Dynamic base URL
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        setFinalUrl(`${origin}/player-list?ladder_id=${decodedId}/ladderType="winlose"`);
      } catch (err) {
        console.error("Auto login decode error:", err);
      }
    }
  }, [autoLoginUrl, dispatch]);

  const handleClick = (e) => {
    e.preventDefault();
    if (finalUrl) {
      window.open(finalUrl, "_blank"); // ✅ Auto login as Joe
    }
  };

  if (!finalUrl) return null;

  return (
    <button
      onClick={handleClick}
      className="text-blue-700 underline cursor-pointer"
    >
      Click here
    </button>
  );
}
