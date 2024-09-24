import React, { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  V1beta1Migration,
  V1beta1MigrationStatusVms,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartTooltip } from '@patternfly/react-charts';
import { Card, CardBody, CardHeader, CardTitle, Flex } from '@patternfly/react-core';
import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core/deprecated';
import chart_color_blue_200 from '@patternfly/react-tokens/dist/esm/chart_color_blue_200';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_red_100 from '@patternfly/react-tokens/dist/esm/chart_color_red_100';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';
import { MigrationDataPoint, toDataPoints } from '../utils/toDataPointsHelper';

import { MigrationsCardProps } from './MigrationsCard';

const toStartedVmMigration = (v: V1beta1MigrationStatusVms): string => v.started;
const toFinishedVmMigration = (v: V1beta1MigrationStatusVms): string => v.completed;
const toDataPointsForVmMigrations = (
  allVmMigrations: V1beta1MigrationStatusVms[],
  toTimestamp: (m: V1beta1MigrationStatusVms) => string,
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] => toDataPoints(allVmMigrations.map(toTimestamp), selectedTimeRange);

export const VmMigrationsChartCard: React.FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const onToggle = () => setIsDropdownOpened(!isDropdownOpened);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOptions>(
    TimeRangeOptions.Last7Days,
  );
  const [migrations] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    namespaced: true,
    isList: true,
  });
  const VmMigrationsDataPoints: {
    running: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  } = {
    running: toDataPointsForVmMigrations(
      migrations
        .map((migration) =>
          migration?.status?.vms.filter(
            (vm) => vm?.phase !== 'Completed' && vm?.phase != 'Canceled',
          ),
        )
        .reduce((append, vm) => append.concat(vm), []),
      toStartedVmMigration,
      selectedTimeRange,
    ),
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
    ...VmMigrationsDataPoints.running.map((m) => m.value),
    ...VmMigrationsDataPoints.failed.map((m) => m.value),
    ...VmMigrationsDataPoints.succeeded.map((m) => m.value),
  );

  const handleTimeRangeSelectedFactory = (timeRange: TimeRangeOptions) => () => {
    onToggle();
    setSelectedTimeRange(timeRange);
  };

  const headerActions = (
    <Dropdown
      toggle={<KebabToggle onToggle={onToggle} />}
      isOpen={isDropdownOpened}
      isPlain
      dropdownItems={[
        <DropdownItem
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last7Days)}
          key="7days"
        >
          {t('7 days')}
        </DropdownItem>,
        <DropdownItem
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last31Days)}
          key="31days"
        >
          {t('31 days')}
        </DropdownItem>,
        <DropdownItem
          onClick={handleTimeRangeSelectedFactory(TimeRangeOptions.Last24H)}
          key="24hours"
        >
          {t('24 hours')}
        </DropdownItem>,
      ]}
    />
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
            colorScale={[
              chart_color_blue_200.var,
              chart_color_red_100.var,
              chart_color_green_400.var,
            ]}
            domainPadding={{ x: [30, 25] }}
            maxDomain={{ y: maxVmMigrationValue ? undefined : 5 }}
            legendData={[
              { name: t('Running'), symbol: { fill: chart_color_blue_200.var } },
              { name: t('Failed'), symbol: { fill: chart_color_red_100.var } },
              { name: t('Succeeded'), symbol: { fill: chart_color_green_400.var } },
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
                  x: dateLabel,
                  y: value,
                  name: t('Running'),
                  label: t('{{dateLabel}} Running: {{value}}', { dateLabel, value }),
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={VmMigrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  x: dateLabel,
                  y: value,
                  name: t('Failed'),
                  label: t('{{dateLabel}} Failed: {{value}}', { dateLabel, value }),
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={VmMigrationsDataPoints.succeeded.map(({ dateLabel, value }) => ({
                  x: dateLabel,
                  y: value,
                  name: 'Succeeded',
                  label: t('{{dateLabel}} Succeeded: {{value}}', { dateLabel, value }),
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
