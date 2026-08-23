import type { NavigateFunction } from 'react-router';
import type { Interval } from 'luxon';

import type { ChartAreaProps } from '@patternfly/react-charts/victory';

import { navigateToHistoryTab } from '../../utils/navigate';
import type { ChartDatumWithName, MigrationDataPoint } from '../../utils/types';

export const MAX_DOMAIN_Y = 5;

const mapDataPoints = (dataPoints: MigrationDataPoint[], name = ''): ChartDatumWithName[] =>
  dataPoints.map(({ dateLabel, interval, migrations, value }) => ({
    interval,
    migrations,
    name,
    x: dateLabel,
    y: value,
  }));

type GetAreaPropsArgs = {
  activeArea: string | null;
  activeInterval: Interval<true> | Interval<false> | null;
  areaName: string;
  color: string;
  dataPoints: MigrationDataPoint[];
  navigate: NavigateFunction;
};

export const getAreaProps = ({
  activeArea,
  activeInterval,
  areaName,
  color,
  dataPoints,
  navigate,
}: GetAreaPropsArgs): ChartAreaProps => ({
  colorScale: [color],
  data: mapDataPoints(dataPoints, areaName),
  events: [
    {
      eventHandlers: {
        onClick: (): void => {
          if (!activeInterval) {
            return;
          }
          navigateToHistoryTab({
            interval: activeInterval,
            navigate,
            status: areaName,
          });
        },
      },
      target: 'data',
    },
  ],
  style: {
    data: {
      cursor: activeArea === areaName && activeInterval ? 'pointer' : 'default',
      opacity: activeArea === areaName && activeInterval ? 1 : 0.7,
      stroke: activeArea === areaName && activeInterval ? color : undefined,
      strokeWidth: activeArea === areaName && activeInterval ? 4 : 2,
    },
  },
});

export const getTickValues = (maxVmMigrationValue: number): number[] => {
  const maxTicks = Math.max(MAX_DOMAIN_Y, Math.ceil(maxVmMigrationValue) + 1);
  const tickStep = Math.ceil(maxTicks / 6);
  return Array.from({ length: maxTicks }, (_, i) => i + 1).filter(
    (val) => val === 1 || val % tickStep === 0 || val === maxTicks,
  );
};
