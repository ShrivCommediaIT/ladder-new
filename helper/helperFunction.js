
export  const convertTimeToSeconds = (timeStr) => {
    if (!timeStr || timeStr === "0" || timeStr === 0) return "0";
    const normalized = String(timeStr).trim();
    const match = normalized.match(/^(?:00:)?(\d{2}):(\d{2})\.(\d{2})\d?$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);
      const totalSeconds = (minutes * 60) + seconds + (milliseconds / 100);
      return totalSeconds.toFixed(2);
    }
    return "0";
  };

export const formatSecondsToTime = (val) => {
  if (val === "" || val === null || val === undefined) return "00:00.00";
  const num = Math.abs(Number(val));
  if (isNaN(num)) return "00:00.00";

  const totalSeconds = Math.floor(num);
  const mPart = Math.floor(totalSeconds / 60);
  const sPart = totalSeconds % 60;

  const parts = String(val).split(".");
  let msPart = "00";
  if (parts.length > 1) {
    msPart = parts[1].padEnd(2, "0").substring(0, 2);
  }

  const mm = String(mPart).padStart(2, "0");
  const ss = String(sPart).padStart(2, "0");
  const ms = msPart;

  return `${mm}:${ss}.${ms}`;
};