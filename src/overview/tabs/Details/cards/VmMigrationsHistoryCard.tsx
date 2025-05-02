import { type FC, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  type V1beta1ForkliftController,
  type V1beta1Migration,
  type V1beta1MigrationStatusVms,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../utils/timeRangeOptions';
import { type MigrationDataPoint, toDataPoints } from '../utils/toDataPointsHelper';

import HeaderActions from './VmMigrationsHistoryCardHeaderActions';
import VmMigrationsHistoryChart from './VmMigrationsHistoryChart';

const toStartedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.started ?? '';
const toFinishedVmMigration = (migrationStatus: V1beta1MigrationStatusVms): string =>
  migrationStatus.completed ?? '';
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

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOptions>(
    TimeRangeOptions.Last7Days,
  );
  const [migrations] = useK8sWatchResource<V1beta1Migration[]>({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });
  const vmMigrationsDataPoints: {
    running: MigrationDataPoint[];
    failed: MigrationDataPoint[];
    succeeded: MigrationDataPoint[];
  } = {
    failed: toDataPointsForVmMigrations(
      migrations
        .map((migration) =>
          (migration?.status?.vms ?? []).filter((vm) =>
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
          (migration?.status?.vms ?? []).filter(
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
          (migration?.status?.vms ?? []).filter((vm) =>
            vm?.conditions?.find((it) => it?.type === 'Succeeded'),
          ),
        )
        .reduce((append, vm) => append.concat(vm), []),
      toFinishedVmMigration,
      selectedTimeRange,
    ),
  };

  return (
    <Card className="pf-m-full-height">
      <CardHeader
        actions={{ actions: <HeaderActions setSelectedTimeRange={setSelectedTimeRange} /> }}
      >
        <CardTitle className="forklift-title">
          {t(TimeRangeOptionsDictionary[selectedTimeRange].vmMigrationsLabelKey)}
        </CardTitle>
      </CardHeader>
      <CardBody className="forklift-status-migration-chart">
        <VmMigrationsHistoryChart vmMigrationsDataPoints={vmMigrationsDataPoints} />
      </CardBody>
    </Card>
  );
};

export default VmMigrationsHistoryCard;
