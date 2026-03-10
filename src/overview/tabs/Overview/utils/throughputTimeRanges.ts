import { t } from '@utils/i18n';

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;

export enum ThroughputTimeRange {
  Last1H = 'Last1H',
  Last24H = 'Last24H',
  Last2D = 'Last2D',
  Last30Min = 'Last30Min',
  Last6H = 'Last6H',
  Last7D = 'Last7D',
}

type ThroughputTimeRangeConfig = {
  label: string;
  samples: number;
  timespan: number;
};

export const throughputTimeRangeToLabel: Record<ThroughputTimeRange, string> = {
  [ThroughputTimeRange.Last1H]: t('Last 1 hour'),
  [ThroughputTimeRange.Last24H]: t('Last day'),
  [ThroughputTimeRange.Last2D]: t('Last 2 days'),
  [ThroughputTimeRange.Last30Min]: t('Last 30 minutes'),
  [ThroughputTimeRange.Last6H]: t('Last 6 hours'),
  [ThroughputTimeRange.Last7D]: t('Last 1 week'),
};

export const THROUGHPUT_TIME_RANGE_CONFIG: Record<ThroughputTimeRange, ThroughputTimeRangeConfig> =
  {
    [ThroughputTimeRange.Last1H]: {
      label: throughputTimeRangeToLabel[ThroughputTimeRange.Last1H],
      samples: 60,
      timespan: HOURS,
    },
    [ThroughputTimeRange.Last24H]: {
      label: throughputTimeRangeToLabel[ThroughputTimeRange.Last24H],
      samples: 96,
      timespan: 24 * HOURS,
    },
    [ThroughputTimeRange.Last2D]: {
      label: throughputTimeRangeToLabel[ThroughputTimeRange.Last2D],
      samples: 96,
      timespan: 2 * DAYS,
    },
    [ThroughputTimeRange.Last30Min]: {
      label: throughputTimeRangeToLabel[ThroughputTimeRange.Last30Min],
      samples: 30,
      timespan: 30 * MINUTES,
    },
    [ThroughputTimeRange.Last6H]: {
      label: throughputTimeRangeToLabel[ThroughputTimeRange.Last6H],
      samples: 72,
      timespan: 6 * HOURS,
    },
    [ThroughputTimeRange.Last7D]: {
      label: throughputTimeRangeToLabel[ThroughputTimeRange.Last7D],
      samples: 168,
      timespan: 7 * DAYS,
    },
  };
