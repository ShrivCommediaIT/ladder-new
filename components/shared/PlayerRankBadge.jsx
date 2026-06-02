import React from "react";
import Image from "next/image";

const PlayerRankBadge = ({ rank, sizeClass = "h-12 w-12 sm:h-16 sm:w-16", imgSize = 64, textClass = "text-xs sm:text-sm" }) => {
  const rankNum = Number(rank);
  let src = "/ranksImg/rank.png";
  let scaleClass = "scale-[1.3] group-hover:scale-[1.43]";

  if (rankNum === 1) {
    src = "/ranksImg/rank-1.png";
    scaleClass = "scale-[1.3] group-hover:scale-[1.43]";
  } else if (rankNum === 2) {
    src = "/ranksImg/rank-2.png";
    scaleClass = "scale-100 group-hover:scale-110";
  } else if (rankNum === 3) {
    src = "/ranksImg/rank-3.png";
    scaleClass = "scale-100 group-hover:scale-110";
  }

  return (
    <div className={`relative flex shrink-0 items-center justify-center select-none ${sizeClass}`}>
      <Image
        src={src}
        alt={`Rank ${rank}`}
        width={imgSize}
        height={imgSize}
        className={`object-contain transition-transform duration-200 ${scaleClass} ${sizeClass}`}
        unoptimized
      />
      <span className={`absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] ${textClass}`}>
        {rank}
      </span>
    </div>
  );
};

export default PlayerRankBadge;
