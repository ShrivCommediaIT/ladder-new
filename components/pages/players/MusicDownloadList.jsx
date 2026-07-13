"use client";

import { useState } from "react";
import { Music, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const musicList = [
  {
    title: "Loud - for 1, 60 sec with 30 rest x 10",
    file: "https://ne-games.com/leaderBoard/public/admin/SSP%20Quiet%20Exercise%20Track%20for%201,%2010x60%20sec%20with%2030%20sec%20rest.mp3",
  },
  {
    title: "Quiet - for 1, 60 sec with 30 rest x 10",
    file: "https://ne-games.com/leaderBoard/public/admin/SSP%20Loud%20Exercise%20Track%20for%202,%2020x60%20secs,%20alternate%20exercising.mp3",
  },
  {
    title: "Loud - for 2, 20x60 secs, alternate exercising",
    file: "https://ne-games.com/leaderBoard/public/admin/SSP%20Quiet%20Exercise%20Track%20for%202,%2020x60%20secs,%20alternate%20exercising.mp3",
  },
  {
    title: "Quiet - for 2, 20x60 secs, alternate exercising",
    file: "https://ne-games.com/leaderBoard/public/admin/SSP%20Quiet%20Exercise%20Track%20for%202,%2020x60%20secs,%20alternate%20exercising.mp3",
  },
];

export default function MusicDownloadList() {
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleDownload = async (url, title, index) => {
    if (loadingIndex !== null) return;
    setLoadingIndex(index);

    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = title.replace(/[^a-zA-Z0-9\s]/g, "").trim() + ".mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      toast.success(`"${title}" downloaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Please try again.");
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="best-board-card rounded-xl p-4 w-full">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Music className="h-4 w-4 text-[var(--best-board-muted)]" />
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--best-board-muted)]">
          Music to Train To
        </p>
      </div>

      {/* Track list */}
      <div className="space-y-1">
        {musicList.map((item, i) => {
          const isLoading = loadingIndex === i;
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-150"
              style={{ background: "var(--best-board-surface-soft)" }}
            >
              <span
                className="text-xs leading-snug flex-1 min-w-0 truncate"
                style={{ color: "var(--best-board-text)" }}
                title={item.title}
              >
                {item.title}
              </span>

              <button
                onClick={() => handleDownload(item.file, item.title, i)}
                disabled={loadingIndex !== null}
                className="shrink-0 flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: "var(--best-board-border-strong)",
                  background: "var(--best-board-accent-soft)",
                  color: "var(--best-board-text)",
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                {isLoading ? "Downloading…" : "Download"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}