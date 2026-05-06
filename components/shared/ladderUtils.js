import { IMAGE_BASE_URL } from "@/constants/api";

export const PLAYER_COLOR_CLASSES = [
  "from-violet-500 to-indigo-500",
  "from-cyan-500 to-teal-500",
  "from-orange-500 to-amber-600",
  "from-fuchsia-500 to-pink-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-green-600",
  "from-red-500 to-rose-600",
];

export const formatLadderType = (type) => {
  const map = {
    best5: "Best of 5",
    best3: "Best of 3",
    winlose: "Win / Lose",
  };

  return map[type] || "Best of 5";
};

export const getPlayerInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

export const getPlayerImageUrl = (player) =>
  player?.image ? `${IMAGE_BASE_URL}/${player.image}?t=${Date.now()}` : null;

export const getPhoneText = (phone) => phone || "No phone";
