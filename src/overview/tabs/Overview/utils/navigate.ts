import type { NavigateFunction } from 'react-router-dom-v5-compat';
import { DateTime } from 'luxon';

import { type TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

export const navigateToHistoryTab = ({
  navigate,
  selectedRange,
  status,
}: {
  navigate: NavigateFunction;
  selectedRange: TimeRangeOptions;
  status?: string;
}) => {
  const dateEnd = DateTime.now().toUTC();
  const dateStart = dateEnd.minus(TimeRangeOptionsDictionary[selectedRange].span);
  const rangeString = `${dateStart.toFormat('yyyy-MM-dd')}/${dateEnd.toFormat('yyyy-MM-dd')}`;
  const param = encodeURIComponent(JSON.stringify([rangeString]));
  const params = [`range=${param}`, `recent=${encodeURIComponent(JSON.stringify(['true']))}`];
  if (status) {
    params.push(`vms=${encodeURIComponent(JSON.stringify([status]))}`);
  }
  navigate(`/mtv/overview/history?${params.join('&')}`);
  return null;
};
