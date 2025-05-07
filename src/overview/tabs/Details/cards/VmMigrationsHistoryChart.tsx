import { useLayoutEffect, useRef, useState } from 'react';
import { useResizeObserver } from 'src/overview/hooks/useResizeObserver';

import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartScatter,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { getResizeObserver } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ChartColors } from '../utils/colors';
import { mapDataPoints } from '../utils/getVmMigrationsDataPoints';
import type { MigrationDataPoint } from '../utils/toDataPointsHelper';
import type { ChartDatumWithName } from '../utils/types';

const MAX_DOMAIN_Y = 5;

const VmMigrationsHistoryChart = ({
  vmMigrationsDataPoints,
}: {
  vmMigrationsDataPoints: {
    running: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  };
}) => {
  const { t } = useForkliftTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartDimensions = useResizeObserver(chartContainerRef);
  const { failed, running, succeeded } = vmMigrationsDataPoints;

  const maxVmMigrationValue = Math.max(
    ...running.map((migration) => migration.value),
    ...failed.map((migration) => migration.value),
    ...succeeded.map((migration) => migration.value),
  );

  const legendData = [
    { name: t('Running'), symbol: { fill: ChartColors.Running } },
    { name: t('Failed'), symbol: { fill: ChartColors.Failure } },
    { name: t('Succeeded'), symbol: { fill: ChartColors.Success } },
  ];

  const maxTicks = Math.max(MAX_DOMAIN_Y, Math.ceil(maxVmMigrationValue) + 1);
  const tickValues = Array.from({ length: maxTicks }, (_, i) => i + 1);

  return (
    <div ref={chartContainerRef} className="pf-u-h-100 pf-u-w-100">
      <Chart
        ariaDesc={t('Area chart with VM migration statistics')}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }: { datum: ChartDatumWithName }) =>
              datum.y === 0 || !datum.name
                ? (undefined as unknown as string)
                : `${datum.x} - ${datum.name}: ${datum.y}`
            }
            constrainToVisibleArea
          />
        }
        legendData={legendData}
        legendPosition="bottom"
        maxDomain={{ y: maxVmMigrationValue ? undefined : MAX_DOMAIN_Y }}
        padding={{
          bottom: 55,
          left: 50,
          right: 50,
          top: 20,
        }}
        width={chartDimensions.width}
        height={chartDimensions.height}
      >
        <ChartAxis />
        <ChartAxis dependentAxis showGrid tickValues={tickValues} />
        <ChartGroup>
          <ChartArea
            data={mapDataPoints(succeeded, t('Succeeded'))}
            colorScale={[ChartColors.Success]}
          />
          <ChartScatter
            data={mapDataPoints(succeeded)}
            size={3}
            symbol="circle"
            colorScale={[ChartColors.Success]}
          />
          <ChartArea data={mapDataPoints(failed, t('Failed'))} colorScale={[ChartColors.Failure]} />
          <ChartScatter
            data={mapDataPoints(failed)}
            size={3}
            symbol="circle"
            colorScale={[ChartColors.Failure]}
          />
          <ChartArea
            data={mapDataPoints(running, t('Running'))}
            colorScale={[ChartColors.Running]}
          />
          <ChartScatter
            data={mapDataPoints(running)}
            size={3}
            symbol="circle"
            colorScale={[ChartColors.Running]}
          />
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default VmMigrationsHistoryChart;
