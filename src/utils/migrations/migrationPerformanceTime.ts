import {
  MILLISECONDS_PER_SECOND,
  MIN_COPY_TIME_DIFFERENCE_SECONDS,
} from './migrationPerformanceConstants';

export const toMilliseconds = (value?: string): number | undefined => {
  const milliseconds = value ? new Date(value).getTime() : undefined;

  return milliseconds !== undefined && Number.isFinite(milliseconds) ? milliseconds : undefined;
};

export const secondsBetween = (from?: number, to?: number): number | undefined =>
  from !== undefined && to !== undefined && to > from
    ? (to - from) / MILLISECONDS_PER_SECOND
    : undefined;

export const shouldShowCopyTime = (durationSeconds?: number, transferSeconds?: number): boolean =>
  transferSeconds !== undefined &&
  durationSeconds !== undefined &&
  Math.abs(durationSeconds - transferSeconds) >= MIN_COPY_TIME_DIFFERENCE_SECONDS;
