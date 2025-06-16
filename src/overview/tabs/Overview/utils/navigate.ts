import type { NavigateFunction } from 'react-router-dom-v5-compat';
import { DateTime } from 'luxon';

import { type TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

export const navigateToHistoryTab = ({
  navigate,
  selectedRange,
}: {
  navigate: NavigateFunction;
  selectedRange: TimeRangeOptions;
}) => {
  const dateEnd = DateTime.now().toUTC();
  const dateStart = dateEnd.minus(TimeRangeOptionsDictionary[selectedRange].span);
  const rangeString = `${dateStart.toFormat('yyyy-MM-dd')}/${dateEnd.toFormat('yyyy-MM-dd')}`;
  const param = encodeURIComponent(JSON.stringify([rangeString]));
  navigate(`/mtv/overview/history?range=${param}`);
  return null;
};
