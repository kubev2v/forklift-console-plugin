import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { MigrationModelGroupVersionKind, type V1beta1Migration } from '@kubev2v/types';
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

const toStartedMigration = (migration: V1beta1Migration): string => migration.status.started;
const toFinishedMigration = (migration: V1beta1Migration): string => migration.status.completed;
const toDataPointsForMigrations = (
  allMigrations: V1beta1Migration[],
  toTimestamp: (m: V1beta1Migration) => string,
  selectedTimeRange: TimeRangeOptions,
): MigrationDataPoint[] => toDataPoints(allMigrations.map(toTimestamp), selectedTimeRange);

export const MigrationsChartCard: FC<MigrationsCardProps> = () => {
  const { t } = useForkliftTranslation();

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOptions>(
    TimeRangeOptions.Last7Days,
  );
  const onToggleClick = () => {
    setIsDropdownOpened((isDropdownOpened) => !isDropdownOpened);
  };
  const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
    setIsDropdownOpened(false);
  };

  const [migrations] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });
  const migrationsDataPoints: {
    running: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  } = {
    failed: toDataPointsForMigrations(
      migrations.filter((migration) =>
        migration?.status?.conditions?.find((it) => it?.type === 'Failed'),
      ),
      toFinishedMigration,
      selectedTimeRange,
    ),
    running: toDataPointsForMigrations(
      migrations.filter((migration) =>
        migration?.status?.conditions?.find((it) => it?.type === 'Running'),
      ),
      toStartedMigration,
      selectedTimeRange,
    ),
    succeeded: toDataPointsForMigrations(
      migrations.filter((migration) =>
        migration?.status?.conditions?.find((it) => it?.type === 'Succeeded'),
      ),
      toFinishedMigration,
      selectedTimeRange,
    ),
  };

  const maxMigrationValue = Math.max(
    ...migrationsDataPoints.running.map((migration) => migration.value),
    ...migrationsDataPoints.failed.map((migration) => migration.value),
    ...migrationsDataPoints.succeeded.map((migration) => migration.value),
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
          {t(TimeRangeOptionsDictionary[selectedTimeRange].migrationsLabelKey)}
        </CardTitle>
      </CardHeader>
      <CardBody className="forklift-status-migration-chart">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <Chart
            ariaDesc="Bar chart with migration statistics"
            colorScale={[chartColorBlue200.var, chartColorRed100.var, chartColorGreen400.var]}
            domainPadding={{ x: [30, 25] }}
            maxDomain={{ y: maxMigrationValue ? undefined : 5 }}
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
                data={migrationsDataPoints.running.map(({ dateLabel, value }) => ({
                  label: t('{{dateLabel}} Running: {{value}}', { dateLabel, value }),
                  name: t('Running'),
                  x: dateLabel,
                  y: value,
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={migrationsDataPoints.failed.map(({ dateLabel, value }) => ({
                  label: t('{{dateLabel}} Failed: {{value}}', { dateLabel, value }),
                  name: t('Failed'),
                  x: dateLabel,
                  y: value,
                }))}
                labelComponent={<ChartTooltip constrainToVisibleArea />}
              />
              <ChartBar
                data={migrationsDataPoints.succeeded.map(({ dateLabel, value }) => ({
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
