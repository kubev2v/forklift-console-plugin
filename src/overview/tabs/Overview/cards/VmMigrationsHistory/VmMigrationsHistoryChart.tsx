import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
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
import { mapDataPoints } from '../../utils/getVmMigrationsDataPoints';
import { navigateToHistoryTab } from '../../utils/navigate';
import type { TimeRangeOptions } from '../../utils/timeRangeOptions';
import type { MigrationDataPoint } from '../../utils/toDataPointsHelper';
import type { ChartDatumWithName } from '../../utils/types';

import { useResizeObserver } from './useResizeObserver';

const MAX_DOMAIN_Y = 5;

const VmMigrationsHistoryChart = ({
  selectedTimeRange,
  vmMigrationsDataPoints,
}: {
  selectedTimeRange: TimeRangeOptions;
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
  const tickValues = Array.from({ length: maxTicks }, (_, i) => i + 1);

  const getAreaProps = (dataPoints: MigrationDataPoint[], areaName: string, color: string) => ({
    colorScale: [color],
    data: mapDataPoints(dataPoints, areaName).slice(-12),
    events: [
      {
        eventHandlers: {
          onClick: () => navigateToHistoryTab({ navigate, selectedRange: selectedTimeRange }),
          onMouseOut: () => {
            setActiveArea(null);
            return null;
          },
          onMouseOver: () => {
            setActiveArea(areaName);
            return null;
          },
        },
        target: 'data',
      },
    ],
    style: {
      data: {
        cursor: 'pointer',
        opacity: activeArea === areaName ? 1 : 0.7,
        stroke: activeArea === areaName ? color : undefined,
        strokeWidth: activeArea === areaName ? 4 : 2,
      },
    },
  });

  return (
    <div ref={chartContainerRef} className="pf-u-h-100 pf-u-w-100">
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
            voronoiDimension="x"
            labels={({ datum }: { datum: ChartDatumWithName }) =>
              datum.y === 0 || !datum.name
                ? (undefined as unknown as string)
                : `${t('{{count}} VM migration', { count: datum.y })} ${datum.name.toLowerCase()}`
            }
            constrainToVisibleArea
            onActivated={(points: ChartDatumWithName[]) => {
              setActiveArea(points[0]?.name ?? null);
            }}
            onDeactivated={() => {
              setActiveArea(null);
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
