const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const EM_DASH = '—';

export const formatDuration = (seconds: number | undefined): string => {
  if (seconds === undefined || seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return EM_DASH;
  }

  if (seconds < SECONDS_PER_MINUTE) {
    return '< 1m';
  }

  const totalMinutes = Math.round(seconds / SECONDS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};
