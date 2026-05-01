
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