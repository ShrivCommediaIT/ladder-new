
export const convertTimeToSeconds = (timeStr) => {
  if (!timeStr || timeStr === "0" || timeStr === 0) return "0";
  const normalized = String(timeStr).trim();
  
  // Split parts by colon
  const parts = normalized.split(":");
  if (parts.length === 0) return "0";

  // Parse last part containing seconds and decimal milliseconds
  const lastPart = parts[parts.length - 1];
  const secParts = lastPart.split(".");
  const seconds = parseInt(secParts[0], 10) || 0;
  
  let msFraction = 0;
  if (secParts[1]) {
    const msStr = secParts[1].substring(0, 3); // take up to 3 digits
    msFraction = parseFloat("0." + msStr) || 0;
  }
  const secVal = seconds + msFraction;

  let totalSeconds = 0;
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    totalSeconds = (hours * 3600) + (minutes * 60) + secVal;
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0;
    totalSeconds = (minutes * 60) + secVal;
  } else {
    totalSeconds = secVal;
  }

  return totalSeconds.toFixed(2);
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