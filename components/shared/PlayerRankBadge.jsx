import React from "react";
import Image from "next/image";

const PlayerRankBadge = ({ rank, sizeClass = "h-12 w-12 sm:h-16 sm:w-16", imgSize = 64, textClass = "text-xs sm:text-sm" }) => {
  const rankNum = Number(rank);
  let src = "/ranksImg/rank.png";
  let scaleClass = "scale-[1.5] group-hover:scale-[1.65]";

  const rankStr = String(rank || "").trim();
  const rankLen = rankStr.length;

  let offsetClass = "-translate-y-[2%]";

  if (rankNum === 1) {
    src = "/ranksImg/rank-1.png";
    offsetClass = "-translate-y-[10%]";
  } else if (rankNum === 2) {
    src = "/ranksImg/rank-2.png";
    offsetClass = "-translate-y-[8%]";
  } else if (rankNum === 3) {
    src = "/ranksImg/rank-3.png";
    offsetClass = "-translate-y-[8%]";
  }

  let textScale = "scale-[0.85]";
  if (rankLen === 3) {
    textScale = "scale-[0.68]";
  } else if (rankLen >= 4) {
    textScale = "scale-[0.56]";
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
      <span className={`absolute inset-0 flex items-center justify-center font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] leading-none ${offsetClass} ${textScale} ${textClass}`}>
        {rank}
      </span>
    </div>
  );
};

export default PlayerRankBadge;
