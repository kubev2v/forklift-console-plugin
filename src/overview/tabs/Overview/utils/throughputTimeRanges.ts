import { t } from '@utils/i18n';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export enum ThroughputTimeRange {
  Last1H = 'Last1H',
  Last24H = 'Last24H',
  Last2D = 'Last2D',
  Last30Min = 'Last30Min',
  Last6H = 'Last6H',
  Last7D = 'Last7D',
}

type ThroughputTimeRangeConfig = {
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
      samples: 60,
      timespan: MS_PER_HOUR,
    },
    [ThroughputTimeRange.Last24H]: {
      samples: 96,
      timespan: 24 * MS_PER_HOUR,
    },
    [ThroughputTimeRange.Last2D]: {
      samples: 96,
      timespan: 2 * MS_PER_DAY,
    },
    [ThroughputTimeRange.Last30Min]: {
      samples: 30,
      timespan: 30 * MS_PER_MINUTE,
    },
    [ThroughputTimeRange.Last6H]: {
      samples: 72,
      timespan: 6 * MS_PER_HOUR,
    },
    [ThroughputTimeRange.Last7D]: {
      samples: 168,
      timespan: 7 * MS_PER_DAY,
    },
  };
