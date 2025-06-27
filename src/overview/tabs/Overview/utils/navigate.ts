import type { NavigateFunction } from 'react-router-dom-v5-compat';
import { DateTime, type Interval } from 'luxon';

import { type TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

export const navigateToHistoryTab = ({
  interval,
  navigate,
  selectedRange,
  status,
}: {
  navigate: NavigateFunction;
  selectedRange?: TimeRangeOptions;
  status?: string;
  interval?: Interval<true> | Interval<false>;
}) => {
  const dateEnd = interval?.end ?? DateTime.now().toUTC();
  const dateStart =
    interval?.start ?? dateEnd.minus(TimeRangeOptionsDictionary[selectedRange!].span);
  const rangeString = `${dateStart.toLocal().toFormat("yyyy-MM-dd'T'HH:mm:ss")}/${dateEnd.toLocal().toFormat("yyyy-MM-dd'T'HH:mm:ss")}`;
  const param = encodeURIComponent(JSON.stringify([rangeString]));
  const params = [`range=${param}`, `recent=${encodeURIComponent(JSON.stringify(['true']))}`];
  if (status) {
    params.push(`vms=${encodeURIComponent(JSON.stringify([status]))}`);
  }
  navigate(`/mtv/overview/history?${params.join('&')}`);
  return null;
};
