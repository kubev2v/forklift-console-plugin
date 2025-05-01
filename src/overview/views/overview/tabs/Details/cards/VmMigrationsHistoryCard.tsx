/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { type FC, type MouseEvent, type Ref, useLayoutEffect, useRef, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  type V1beta1ForkliftController,
  type V1beta1Migration,
  type V1beta1MigrationStatusVms,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartScatter,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  getResizeObserver,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import { ChartColors } from '../utils/colors';
import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';
import { type MigrationDataPoint, toDataPoints } from '../utils/toDataPointsHelper';

const toStartedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.started;
const toFinishedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.completed;
const toDataPointsForVmMigrations = (
  allVmMigrations: V1beta1MigrationStatusVms[],
  toTimestamp: (m: V1beta1MigrationStatusVms) => string,
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] => toDataPoints(allVmMigrations.map(toTimestamp), selectedTimeRange);

type MigrationsCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const VmMigrationsHistoryCard: FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null); // Ref for the chart container
  const [chartDimensions, setChartDimensions] = useState({ height: 400, width: 800 }); // Default dimensions

  const handleResize = () => {
    if (chartContainerRef.current?.clientHeight) {
      const { clientHeight: height, clientWidth: width } = chartContainerRef.current;
      setChartDimensions({ height, width }); // Update chart dimensions
    }
  };

  useLayoutEffect(() => {
    if (chartContainerRef.current) {
      // Set up the resize observer
      const resizeObserver = getResizeObserver(chartContainerRef.current, handleResize, true);

      handleResize();

      return () => {
        // Clean up the observer on unmount
        resizeObserver();
      };
    }
  }, []);

  const onToggleClick = () => {
    setIsDropdownOpened((isDropdownOpened) => !isDropdownOpened);
  };

  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsDropdownOpened(false);
  };

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOptions>(
    TimeRangeOptions.Last7Days,
  );
  const [migrations] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });
  const VmMigrationsDataPoints: {
    running: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  } = {
    failed: toDataPointsForVmMigrations(
      migrations
        .map((migration) =>
          migration?.status?.vms?.filter((vm) =>
            vm?.conditions?.find((it) => it?.type === 'Failed'),
          ),
        )
        .reduce((append, vm) => append.concat(vm), []),
      toFinishedVmMigration,
      selectedTimeRange,
    ),
    running: toDataPointsForVmMigrations(
      migrations
        .map((migration) =>
          migration?.status?.vms?.filter(
            (vm) => vm?.phase !== 'Completed' && vm?.phase !== 'Canceled',
          ),
        )
        .reduce((append, vm) => append.concat(vm), []),
      toStartedVmMigration,
      selectedTimeRange,
    ),
    succeeded: toDataPointsForVmMigrations(
      migrations
        .map((migration) =>
          migration?.status?.vms.filter((vm) =>
            vm?.conditions?.find((it) => it?.type === 'Succeeded'),
          ),
        )
        .reduce((append, vm) => append.concat(vm), []),
      toFinishedVmMigration,
      selectedTimeRange,
    ),
  };

  const maxVmMigrationValue = Math.max(
    ...VmMigrationsDataPoints.running.map((migration) => migration.value),
    ...VmMigrationsDataPoints.failed.map((migration) => migration.value),
    ...VmMigrationsDataPoints.succeeded.map((migration) => migration.value),
  );

  const handleTimeRangeSelectedFactory = (timeRange: TimeRangeOptions) => () => {
    onToggleClick();
    setSelectedTimeRange(timeRange);
  };

  const headerActions = (
    <Dropdown
      isOpen={isDropdownOpened}
      onOpenChange={setIsDropdownOpened}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isDropdownOpened}
          variant={'plain'}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        direction: 'down',
      }}
    >
      <DropdownList>
        <DropdownItem
          value={0}
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last7Days)}
          key="7days"
        >
          {t('7 days')}
        </DropdownItem>
        <DropdownItem
          value={1}
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last31Days)}
          key="31days"
        >
          {t('31 days')}
        </DropdownItem>
        <DropdownItem
          value={2}
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last24H)}
          key="24hours"
        >
          {t('24 hours')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  const legendData = [
    { name: t('Running'), symbol: { fill: ChartColors.Running } },
    { name: t('Failed'), symbol: { fill: ChartColors.Failure } },
    { name: t('Succeeded'), symbol: { fill: ChartColors.Success } },
  ];

  return (
    <Card className="pf-m-full-height">
      <CardHeader actions={{ actions: headerActions }}>
        <CardTitle className="forklift-title">
          {t(TimeRangeOptionsDictionary[selectedTimeRange].vmMigrationsLabelKey)}
        </CardTitle>
      </CardHeader>
      <CardBody
        /*className="forklift-status-migration-chart"*/ style={{
          overflow: 'hidden',
          paddingBottom: '16px',
        }}
      >
        <div ref={chartContainerRef} style={{ height: '100%', width: '100%' }}>
          <Chart
            ariaDesc="Area chart with VM migration statistics"
            containerComponent={
              <ChartVoronoiContainer
                // labels={({ datum }) => `${datum.name}: ${datum.y}`}
                labels={({ datum }) =>
                  datum.name?.includes('scatter')
                    ? null
                    : `${datum.x} - ${datum.name ?? 'Unknown'}: ${datum.y ?? 0}`
                }
                constrainToVisibleArea
              />
            }
            //   colorScale={[chartColorBlue200.var, chartColorRed100.var, chartColorGreen400.var]}
            legendData={legendData}
            legendPosition="bottom"
            //   height={240}
            maxDomain={{ y: maxVmMigrationValue ? undefined : 5 }}
            name="chart1"
            padding={{
              bottom: 55,
              left: 50,
              right: 50,
              top: 20,
            }}
            //   width={800}
            width={chartDimensions.width} // Dynamically set width
            height={chartDimensions.height} // Dynamically set height
          >
            <ChartAxis />
            <ChartAxis dependentAxis showGrid tickFormat={(tick) => Math.round(tick)} />
            <ChartGroup>
              <ChartArea
                data={VmMigrationsDataPoints.succeeded.map(({ dateLabel, value }) => ({
                  // label: t('{{dateLabel}} Succeeded: {{value}}', { dateLabel, value }),
                  name: t('Succeeded'),
                  x: dateLabel,
                  y: value,
                }))}
                colorScale={[ChartColors.Success]}
              />
              <ChartScatter
                data={VmMigrationsDataPoints.succeeded.map(({ dateLabel, value }) => ({
                  name: 'Succeeded scatter',
                  x: dateLabel,
                  y: value,
                }))}
                size={3}
                symbol="circle"
                colorScale={[ChartColors.Success]}
              />
              <ChartArea
                data={VmMigrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  // label: t('{{dateLabel}} Failed: {{value}}', { dateLabel, value }),
                  name: t('Failed'),
                  x: dateLabel,
                  y: value,
                }))}
                colorScale={[ChartColors.Failure]}
              />
              <ChartScatter
                data={VmMigrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  name: 'Failed scatter',
                  x: dateLabel,
                  y: value,
                }))}
                size={3}
                symbol="circle"
                colorScale={[ChartColors.Failure]}
              />
              <ChartArea
                data={VmMigrationsDataPoints.running.map(({ dateLabel, value }) => ({
                  // label: t('{{dateLabel}} Running: {{value}}', { dateLabel, value }),
                  name: t('Running'),
                  x: dateLabel,
                  y: value,
                }))}
                colorScale={[ChartColors.Running]}
              />
              <ChartScatter
                data={VmMigrationsDataPoints.running.map(({ dateLabel, value }) => ({
                  name: 'Running scatter',
                  x: dateLabel,
                  y: value,
                }))}
                size={3}
                symbol="circle"
                colorScale={[ChartColors.Running]}
              />
            </ChartGroup>
          </Chart>
        </div>
      </CardBody>
    </Card>
  );
};

export default VmMigrationsHistoryCard;
