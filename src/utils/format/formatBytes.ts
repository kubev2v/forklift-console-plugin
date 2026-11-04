import { EMPTY_VALUE } from './formatConstants';

const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
const DIVISOR = 1024;

export const formatBytes = (bytes: number | undefined): string => {
  if (!bytes || bytes <= 0 || !Number.isFinite(bytes)) {
    return EMPTY_VALUE;
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= DIVISOR && unitIndex < UNITS.length - 1) {
    value /= DIVISOR;
    unitIndex += 1;
  }

  const formatted = value >= 100 ? Math.round(value).toString() : value.toFixed(1);

  return `${formatted} ${UNITS[unitIndex]}`;
};
