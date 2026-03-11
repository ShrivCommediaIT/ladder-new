"use client";

const musicList = [
  {
    title: "Loud - for 1, 60 sec with 30 rest x 10",
    file:
      "https://ne-games.com/leaderBoard/public/admin/SSP%20Quiet%20Exercise%20Track%20for%201,%2010x60%20sec%20with%2030%20sec%20rest.mp3",
  },
  {
    title: "Quiet - for 1, 60 sec with 30 rest x 10",
    file:
      "https://ne-games.com/leaderBoard/public/admin/SSP%20Quiet%20Exercise%20Track%20for%202,%2020x60%20secs,%20alternate%20exercising.mp3",
  },
  {
    title: "Loud - for 2, 20x60 secs, alternate exercising",
    file:
      "https://ne-games.com/leaderBoard/public/admin/SSP%20Loud%20Exercise%20Track%20for%202,%2020x60%20secs,%20alternate%20exercising.mp3",
  },
  {
    title: "Quiet - for 2, 20x60 secs, alternate exercising",
    file:
      "https://ne-games.com/leaderBoard/public/admin/SSP%20Quiet%20Exercise%20Track%20for%202,%2020x60%20secs,%20alternate%20exercising.mp3",
  },
];

export default function MusicDownloadList() {
  const handleDownload = (url) => {
    const link = `/api/download?url=${encodeURIComponent(url)}`;
    window.open(link);
  };

  return (
    <div className="bg-[#1f2a3a] text-white rounded-md w-full max-w-md p-6">
      <h2 className="font-semibold text-lg mb-3">
        Music to Train To
      </h2>

      <div className="space-y-2 text-sm">
        {musicList.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-white/10 pb-1"
          >
            <span className="text-gray-200">
              {item.title}
            </span>

            <button
              onClick={() => handleDownload(item.file)}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}