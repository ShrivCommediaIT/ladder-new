

"use client";

import Image from "next/image";
import game from "@/public/game.png";
import logo from "@/public/logo.jpg";
import Link from "next/link";

const UserHeading1 = ({ ladderId }) => {
  const encodedLadderId = encodeURIComponent(btoa(ladderId)); // "21" => "MjE="

  return (
    <div className="">
      <div className="flex items-center justify-between py-4 px-4 gap-4">
        <div className="flex items-center gap-4">
          <Image src={game} alt="game" width={70} height={70} />
          <div>
             <h1 className="text-4xl font-semibold">Adel Recketball Ladder</h1>
          <p className="text-lg font-semibold">★ ★ ★ Tap on your name to move, edit details or status and upload avatar ★ ★ ★</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHeading1;
