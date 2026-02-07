"use client";

import Image from "next/image";

export default function PlayerCard({ name, phone, rank, image }) {
  // ✅ Safe image URL
  const imageUrl =
    image && !image.startsWith("http") && !image.startsWith("/")
      ? `https://ne-games.com/leaderBoard/public/admin/clip-one/assets/user/original/${image}`
      : image || "/logo.jpg"; // fallback

  return (
    <div>
      <div className="flex justify-start items-center gap-4 ">
        <div>
          <p className="font-semibold">{rank}</p>
        </div>
        <Image
          src={imageUrl}
          alt="avatar"
          width={100}
          height={100}
          className="rounded-full object-cover w-12 h-12 "
        />
        <div
          style={{
            fontFamily: "Ubuntu",
            fontWeight: 400,
          }}
        >
          <p className="text-xl font-semibold">{name}</p>
          <p className="text-md">{phone}</p>
        </div>
      </div>
    </div>
  );
}
