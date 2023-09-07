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

const toTotal = (m: V1beta1Migration): string => m.metadata?.creationTimestamp;
const toFinished = (m: V1beta1Migration): string => m.status.completed;
const hasTimestamp = (timestamp: string) => timestamp && DateTime.fromISO(timestamp).isValid;
const toDateTime = (timestamp: string): DateTime => DateTime.fromISO(timestamp);
const isLast7Days = (date: DateTime) => date.diffNow('days').get('days') <= 7;
const isLast24H = (date: DateTime) => date.diffNow('hours').get('hours') <= 24;
const toDayLabel = (date: DateTime): string => date.toFormat('LLL dd');
const toHourLabel = (date: DateTime): string => date.toFormat('HH:mm');
const createTimeBuckets = (isDaysViewSelected: boolean) =>
  Interval.fromDateTimes(
    DateTime.now()
      .minus(isDaysViewSelected ? { days: 7 } : { hours: 24 })
      // adjust the time window granularity i.e.
      // assume 24h window and current time 14:30
      // event that happened at 14:10 on the previous day is older then 24h when calculated with minute-precision
      // but should be included with hour-precision (as we show on the chart)
      .startOf(isDaysViewSelected ? 'day' : 'hour'),
    DateTime.now().endOf(isDaysViewSelected ? 'day' : 'hour'),
  )
    .splitBy(isDaysViewSelected ? { day: 1 } : { hour: 4 })
    .map((interval) => [interval, []]);

const groupByBucket = (acc: [Interval, DateTime[]][], date: DateTime) =>
  acc.map(([interval, points]) =>
    interval.contains(date) ? [interval, [...points, date]] : [interval, points],
  );

const toDataPoints = (
  allMigrations: V1beta1Migration[],
  toTimestamp: (m: V1beta1Migration) => string,
  isDaysViewSelected: boolean,
): MigrationDataPoint[] =>
  allMigrations
    .map(toTimestamp)
    .filter(hasTimestamp)
    .map(toDateTime)
    .filter(isDaysViewSelected ? isLast7Days : isLast24H)
    .reduce(groupByBucket, createTimeBuckets(isDaysViewSelected))
    .map(([interval, points]) => ({
      dateLabel: isDaysViewSelected ? toDayLabel(interval.start) : toHourLabel(interval),
      value: points.length,
    }));

export const ChartsCard: React.FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const onToggle = () => setIsDropdownOpened(!isDropdownOpened);
  const [isDaysViewSelected, setIsDaysViewSelected] = useState(true);
  const [migrations] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    namespaced: true,
    isList: true,
  });
  const migrationsDataPoints: {
    total: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  } = {
    total: toDataPoints(migrations, toTotal, isDaysViewSelected),
    succeeded: toDataPoints(
      migrations.filter((m) => m?.status?.conditions?.find((it) => it?.type === 'Succeeded')),
      toFinished,
      isDaysViewSelected,
    ),
    failed: toDataPoints(
      migrations.filter((m) => m?.status?.conditions?.find((it) => it?.type === 'Failed')),
      toFinished,
      isDaysViewSelected,
    ),
  };

  const maxMigrationValue = Math.max(
    ...migrationsDataPoints.total.map((m) => m.value),
    ...migrationsDataPoints.succeeded.map((m) => m.value),
    ...migrationsDataPoints.failed.map((m) => m.value),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isDaysViewSelected ? t('Migrations (last 7 days)') : t('Migrations (last 24 hours)')}
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
                  setIsDaysViewSelected(true);
                }}
                key="7days"
              >
                {t('7 days')}
              </DropdownItem>,
              <DropdownItem
                onClick={() => {
                  onToggle();
                  setIsDaysViewSelected(false);
                }}
                key="24hours"
              >
                {t('24 hours')}
              </DropdownItem>,
            ]}
          />
        </CardActions>
      </CardHeader>
      <CardBody className="forklift-status-migration">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <Chart
            ariaDesc="Bar chart with migration statistics"
            colorScale={[
              chart_color_blue_200.var,
              chart_color_green_400.var,
              chart_color_red_100.var,
            ]}
            domainPadding={{ x: [30, 25] }}
            maxDomain={{ y: maxMigrationValue ? undefined : 5 }}
            legendData={[
              { name: t('Total'), symbol: { fill: chart_color_blue_200.var } },
              { name: t('Succeeded'), symbol: { fill: chart_color_green_400.var } },
              { name: t('Failed'), symbol: { fill: chart_color_red_100.var } },
            ]}
            legendPosition="bottom-left"
            height={400}
            width={450}
            padding={{
              bottom: 75,
              left: isDaysViewSelected ? 100 : 110,
              right: 100,
              top: 50,
            }}
          >
            <ChartAxis />
            <ChartAxis dependentAxis showGrid />
            <ChartGroup offset={11} horizontal>
              <ChartBar
                data={migrationsDataPoints.total.map(({ dateLabel, value }) => ({
                  x: dateLabel,
                  y: value,
                  name: t('Total'),
                  label: t('{{dateLabel}} Started: {{value}}', { dateLabel, value }),
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
              <ChartBar
                data={migrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  x: dateLabel,
                  y: value,
                  name: t('Failed'),
                  label: t('{{dateLabel}} Failed: {{value}}', { dateLabel, value }),
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
