import type { NavigateFunction } from 'react-router-dom-v5-compat';
import { DateTime } from 'luxon';
import { PlanTableResourceId } from 'src/plans/list/utils/constants';

import { type TimeRangeOptions, TimeRangeOptionsDictionary } from './timeRangeOptions';

export const navigateToPlans = ({
  navigate,
  plansListURL,
  selectedRange,
}: {
  navigate: NavigateFunction;
  plansListURL: string;
  selectedRange: TimeRangeOptions;
}) => {
  const dateEnd = DateTime.now().toUTC();
  const dateStart = dateEnd.minus(TimeRangeOptionsDictionary[selectedRange].span);
  const rangeString = `${dateStart.toFormat('yyyy-MM-dd')}/${dateEnd.toFormat('yyyy-MM-dd')}`;
  const param = encodeURIComponent(JSON.stringify([rangeString]));
  navigate(`${plansListURL}?${PlanTableResourceId.MigrationStarted}=${param}`);
  return null;
};
