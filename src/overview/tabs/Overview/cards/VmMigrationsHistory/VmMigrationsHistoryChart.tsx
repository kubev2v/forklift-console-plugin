import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import type { Interval } from 'luxon';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { PlanModelRef } from '@kubev2v/types';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartStack,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { Button } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import useMigrationCounts from '../../hooks/useMigrationCounts';
import { ChartColors } from '../../utils/colors';
import { navigateToHistoryTab } from '../../utils/navigate';
import type { ChartDatumWithName, MigrationDataPoint } from '../../utils/types';

import { useResizeObserver } from './useResizeObserver';

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
  const { count } = useMigrationCounts();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartDimensions = useResizeObserver(chartContainerRef);
  const { failed, running, succeeded } = vmMigrationsDataPoints;
  const navigate = useNavigate();
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [activeInterval, setActiveInterval] = useState<Interval<true> | Interval<false> | null>(
    null,
  );

  const plansListURL = useMemo(() => {
    return getResourceUrl({
      namespaced: true,
      reference: PlanModelRef,
    });
  }, []);

  const maxVmMigrationValue = Math.max(
    ...running.map((migration) => migration.value),
    ...failed.map((migration) => migration.value),
    ...succeeded.map((migration) => migration.value),
  );

  const legendData = [
    { name: t('Running'), symbol: { fill: ChartColors.Executing } },
    { name: t('Failed'), symbol: { fill: ChartColors.Failure } },
    { name: t('Succeeded'), symbol: { fill: ChartColors.Success } },
  ];

  const maxTicks = Math.max(MAX_DOMAIN_Y, Math.ceil(maxVmMigrationValue) + 1);
  const tickStep = Math.ceil(maxTicks / 6);
  const tickValues = Array.from({ length: maxTicks }, (_, i) => i + 1).filter(
    (val) => val === 1 || val % tickStep === 0 || val === maxTicks,
  );

  const mapDataPoints = (dataPoints: MigrationDataPoint[], name = ''): ChartDatumWithName[] =>
    dataPoints.map(({ dateLabel, interval, value }) => ({
      interval,
      name,
      x: dateLabel,
      y: value,
    }));

  const getAreaProps = (dataPoints: MigrationDataPoint[], areaName: string, color: string) => ({
    colorScale: [color],
    data: mapDataPoints(dataPoints, areaName).slice(-12),
    events: [
      {
        eventHandlers: {
          onClick: () => {
            if (!activeInterval) return;
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

  return (
    <div ref={chartContainerRef} className="pf-v5-u-h-100 pf-v5-u-w-100">
      {count.Total === 0 && (
        <div className="forklift-overview__create-plan-btn">
          <Button
            variant="primary"
            onClick={() => {
              navigate(`${plansListURL}/~new`);
            }}
          >
            {t('Create migration plan')}
          </Button>
        </div>
      )}
      <Chart
        ariaDesc={t('Area chart with VM migration history')}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }: { datum: ChartDatumWithName }) => {
              return datum.y === 0 || !datum.name
                ? (undefined as unknown as string)
                : `${t('{{count}} VM migration', { count: datum.y })} ${datum.name.toLowerCase()}`;
            }}
            constrainToVisibleArea
            onActivated={(points: ChartDatumWithName[]) => {
              const activePoint = points.find((pt) => pt.y > 0);
              if (activePoint) {
                setActiveArea(activePoint.name);
                setActiveInterval(activePoint.interval);
              } else {
                setActiveArea(null);
                setActiveInterval(null);
              }
            }}
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
        <ChartAxis dependentAxis tickValues={tickValues} />
        <ChartStack>
          <ChartArea {...getAreaProps(failed, t('Failed'), ChartColors.Failure)} />
          <ChartArea {...getAreaProps(running, t('Running'), ChartColors.Executing)} />
          <ChartArea {...getAreaProps(succeeded, t('Succeeded'), ChartColors.Success)} />
        </ChartStack>
      </Chart>
    </div>
  );
};

export default VmMigrationsHistoryChart;
