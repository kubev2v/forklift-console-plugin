import React, { useState } from 'react';
import { DateTime, Interval } from 'luxon';
import { useForkliftTranslation } from 'src/utils/i18n';

import { MigrationModelGroupVersionKind, V1beta1Migration } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Chart, ChartAxis, ChartBar, ChartGroup, ChartTooltip } from '@patternfly/react-charts';
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  Flex,
  KebabToggle,
} from '@patternfly/react-core';
import chart_color_blue_200 from '@patternfly/react-tokens/dist/esm/chart_color_blue_200';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_red_100 from '@patternfly/react-tokens/dist/esm/chart_color_red_100';

import { MigrationsCardProps } from './MigrationsCard';

interface MigrationDataPoint {
  dateLabel: string;
  value: number;
}

enum TimeRangeOptions {
  Last7Days = 'Last7Days',
  Last31Days = 'Last31Days',
  Last24H = 'Last24H',
}

const toStarted = (m: V1beta1Migration): string => m.status.started;
const toFinished = (m: V1beta1Migration): string => m.status.completed;
const hasTimestamp = (timestamp: string) => timestamp && DateTime.fromISO(timestamp).isValid;
const toDateTime = (timestamp: string): DateTime => DateTime.fromISO(timestamp);
const isLast7Days = (date: DateTime) => date.diffNow('days').get('days') <= 7;
const isLast31Days = (date: DateTime) => date.diffNow('days').get('days') <= 31;
const isLast24H = (date: DateTime) => date.diffNow('hours').get('hours') <= 24;
const toDayLabel = (date: DateTime): string => date.toFormat('LLL dd');
const toHourLabel = (date: DateTime): string => date.toFormat('HH:mm');

const TimeRangeOptionsDictionary = {
  Last7Days: {
    // t('Migrations (last 7 days)')
    labelKey: 'Migrations (last 7 days)',
    span: { days: 7 },
    bucket: { day: 1 },
    unit: 'day',
    filter: isLast7Days,
  },
  Last31Days: {
    // t('Migrations (last 31 days)')
    labelKey: 'Migrations (last 31 days)',
    span: { days: 31 },
    bucket: { day: 4 },
    unit: 'day',
    filter: isLast31Days,
  },
  Last24H: {
    // t('Migrations (last 24 hours)')
    labelKey: 'Migrations (last 24 hours)',
    span: { hours: 24 },
    bucket: { hour: 4 },
    unit: 'hour',
    filter: isLast24H,
  },
};

const createTimeBuckets = (selectedTimeRange: TimeRangeOptions) =>
  Interval.fromDateTimes(
    DateTime.now()
      .minus(TimeRangeOptionsDictionary[selectedTimeRange].span)
      // adjust the time window granularity i.e.
      // assume 24h window and current time 14:30
      // event that happened at 14:10 on the previous day is older then 24h when calculated with minute-precision
      // but should be included with hour-precision (as we show on the chart)
      .startOf(TimeRangeOptionsDictionary[selectedTimeRange].unit),
    DateTime.now().endOf(TimeRangeOptionsDictionary[selectedTimeRange].unit),
  )
    .splitBy(TimeRangeOptionsDictionary[selectedTimeRange].bucket)
    .map((interval) => [interval, []]);

const groupByBucket = (acc: [Interval, DateTime[]][], date: DateTime) =>
  acc.map(([interval, points]) =>
    interval.contains(date) ? [interval, [...points, date]] : [interval, points],
  );

const toDataPoints = (
  allMigrations: V1beta1Migration[],
  toTimestamp: (m: V1beta1Migration) => string,
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] =>
  allMigrations
    .map(toTimestamp)
    .filter(hasTimestamp)
    .map(toDateTime)
    .filter(TimeRangeOptionsDictionary[selectedTimeRange].filter)
    .reduce(groupByBucket, createTimeBuckets(selectedTimeRange))
    .map(([interval, points]) => ({
      dateLabel:
        selectedTimeRange === TimeRangeOptions.Last24H
          ? toHourLabel(interval)
          : selectedTimeRange === TimeRangeOptions.Last31Days
          ? toDayLabel(interval)
          : toDayLabel(interval.start),
      value: points.length,
    }));

export const ChartsCard: React.FC<MigrationsCardProps> = () => {
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
  const migrationsDataPoints: {
    running: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  } = {
    running: toDataPoints(
      migrations.filter((m) => m?.status?.conditions?.find((it) => it?.type === 'Running')),
      toStarted,
      selectedTimeRange,
    ),
    failed: toDataPoints(
      migrations.filter((m) => m?.status?.conditions?.find((it) => it?.type === 'Failed')),
      toFinished,
      selectedTimeRange,
    ),
    succeeded: toDataPoints(
      migrations.filter((m) => m?.status?.conditions?.find((it) => it?.type === 'Succeeded')),
      toFinished,
      selectedTimeRange,
    ),
  };

  const maxMigrationValue = Math.max(
    ...migrationsDataPoints.running.map((m) => m.value),
    ...migrationsDataPoints.failed.map((m) => m.value),
    ...migrationsDataPoints.succeeded.map((m) => m.value),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="forklift-title">
          {t(TimeRangeOptionsDictionary[selectedTimeRange].labelKey)}
        </CardTitle>
        <CardActions>
          <Dropdown
            toggle={<KebabToggle onToggle={onToggle} />}
            isOpen={isDropdownOpened}
            isPlain
            dropdownItems={[
              <DropdownItem
                onClick={() => {
                  onToggle();
                  setSelectedTimeRange(TimeRangeOptions.Last7Days);
                }}
                key="7days"
              >
                {t('7 days')}
              </DropdownItem>,
              <DropdownItem
                onClick={() => {
                  onToggle();
                  setSelectedTimeRange(TimeRangeOptions.Last31Days);
                }}
                key="31days"
              >
                {t('31 days')}
              </DropdownItem>,
              <DropdownItem
                onClick={() => {
                  onToggle();
                  setSelectedTimeRange(TimeRangeOptions.Last24H);
                }}
                key="24hours"
              >
                {t('24 hours')}
              </DropdownItem>,
            ]}
          />
        </CardActions>
      </CardHeader>
      <CardBody className="forklift-status-migration-chart">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <Chart
            ariaDesc="Bar chart with migration statistics"
            colorScale={[
              chart_color_blue_200.var,
              chart_color_red_100.var,
              chart_color_green_400.var,
            ]}
            domainPadding={{ x: [30, 25] }}
            maxDomain={{ y: maxMigrationValue ? undefined : 5 }}
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
                data={migrationsDataPoints.running.map(({ dateLabel, value }) => ({
                  x: dateLabel,
                  y: value,
                  name: t('Running'),
                  label: t('{{dateLabel}} Running: {{value}}', { dateLabel, value }),
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={migrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  x: dateLabel,
                  y: value,
                  name: t('Failed'),
                  label: t('{{dateLabel}} Failed: {{value}}', { dateLabel, value }),
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={migrationsDataPoints.succeeded.map(({ dateLabel, value }) => ({
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
