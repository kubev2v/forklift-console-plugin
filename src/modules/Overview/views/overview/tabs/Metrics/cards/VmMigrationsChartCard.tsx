import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1MigrationStatusVms,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartTooltip } from '@patternfly/react-charts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import chartColorBlue200 from '@patternfly/react-tokens/dist/esm/chart_color_blue_200';
import chartColorGreen400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chartColorRed100 from '@patternfly/react-tokens/dist/esm/chart_color_red_100';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';
import { type MigrationDataPoint, toDataPoints } from '../utils/toDataPointsHelper';

import type { MigrationsCardProps } from './MigrationsCard';

const toStartedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.started;
const toFinishedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.completed;
const toDataPointsForVmMigrations = (
  allVmMigrations: V1beta1MigrationStatusVms[],
  toTimestamp: (m: V1beta1MigrationStatusVms) => string,
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] => toDataPoints(allVmMigrations.map(toTimestamp), selectedTimeRange);

export const VmMigrationsChartCard: FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

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
          migration?.status?.vms.filter((vm) =>
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
          migration?.status?.vms.filter(
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

  return (
    <Card>
      <CardHeader actions={{ actions: headerActions }}>
        <CardTitle className="forklift-title">
          {t(TimeRangeOptionsDictionary[selectedTimeRange].vmMigrationsLabelKey)}
        </CardTitle>
      </CardHeader>
      <CardBody className="forklift-status-migration-chart">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <Chart
            ariaDesc="Bar chart with VM migration statistics"
            colorScale={[chartColorBlue200.var, chartColorRed100.var, chartColorGreen400.var]}
            domainPadding={{ x: [30, 25] }}
            maxDomain={{ y: maxVmMigrationValue ? undefined : 5 }}
            legendData={[
              { name: t('Running'), symbol: { fill: chartColorBlue200.var } },
              { name: t('Failed'), symbol: { fill: chartColorRed100.var } },
              { name: t('Succeeded'), symbol: { fill: chartColorGreen400.var } },
            ]}
            legendPosition="bottom"
            height={400}
            width={1100}
            padding={{
              bottom: 75,
              left: 50,
              right: 30,
              top: 50,
            }}
          >
            <ChartAxis />
            <ChartAxis dependentAxis showGrid />
            <ChartGroup offset={11} horizontal={false}>
              <ChartBar
                data={VmMigrationsDataPoints.running.map(({ dateLabel, value }) => ({
                  label: t('{{dateLabel}} Running: {{value}}', { dateLabel, value }),
                  name: t('Running'),
                  x: dateLabel,
                  y: value,
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={VmMigrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  label: t('{{dateLabel}} Failed: {{value}}', { dateLabel, value }),
                  name: t('Failed'),
                  x: dateLabel,
                  y: value,
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={VmMigrationsDataPoints.succeeded.map(({ dateLabel, value }) => ({
                  label: t('{{dateLabel}} Succeeded: {{value}}', { dateLabel, value }),
                  name: 'Succeeded',
                  x: dateLabel,
                  y: value,
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
            </ChartGroup>
          </Chart>
        </Flex>
      </CardBody>
    </Card>
  );
};
