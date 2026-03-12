const UNITS = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
const DIVISOR = 1024;

export const formatThroughput = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) {
    return '0 B/s';
  }

  let value = Math.abs(bytesPerSecond);
  let unitIndex = 0;

  while (value >= DIVISOR && unitIndex < UNITS.length - 1) {
    value /= DIVISOR;
    unitIndex += 1;
  }

  const formatted = value < 10 ? value.toFixed(1) : Math.round(value).toString();

  return `${formatted} ${UNITS[unitIndex]}`;
};

export const formatThroughputTick = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) {
    return '0';
  }

  let value = Math.abs(bytesPerSecond);
  let unitIndex = 0;

  while (value >= DIVISOR && unitIndex < UNITS.length - 1) {
    value /= DIVISOR;
    unitIndex += 1;
  }

  const unit = UNITS[unitIndex].replace('/s', '');
  const formatted = value < 10 ? value.toFixed(1) : Math.round(value).toString();

  return `${formatted} ${unit}`;
};
