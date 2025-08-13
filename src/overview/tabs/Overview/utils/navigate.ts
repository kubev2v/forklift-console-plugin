import type { NavigateFunction } from 'react-router-dom-v5-compat';
import { DateTime, type Interval } from 'luxon';

import { isEmpty } from '@utils/helpers';

import { type TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

const DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

export const navigateToHistoryTab = ({
  interval,
  migrations,
  navigate,
  selectedRange,
  status,
}: {
  navigate: NavigateFunction;
  selectedRange?: TimeRangeOptions;
  status?: string;
  interval?: Interval<true> | Interval<false>;
  migrations?: string[] | null;
}) => {
  const dateEnd = interval?.end ?? DateTime.now().toUTC();
  const dateStart =
    interval?.start ?? dateEnd.minus(TimeRangeOptionsDictionary[selectedRange!].span);
  const rangeString = `${dateStart.toLocal().toFormat(DATE_TIME_FORMAT)}/${dateEnd.toLocal().toFormat(DATE_TIME_FORMAT)}`;
  const param = encodeURIComponent(JSON.stringify([rangeString]));
  const params = [`range=${param}`, `recent=${encodeURIComponent(JSON.stringify(['true']))}`];
  if (status) {
    const statuses = status === 'Running' ? [status] : [status, 'Running'];
    params.push(`vms=${encodeURIComponent(JSON.stringify(statuses))}`);
  }
  if (!isEmpty(migrations)) {
    params.push(`name=${encodeURIComponent(JSON.stringify(migrations))}`);
  }
  navigate(`/mtv/overview/history?${params.join('&')}`);
  return null;
};
