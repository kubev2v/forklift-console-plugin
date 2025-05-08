import { type FC, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  MigrationModelGroupVersionKind,
  type V1beta1ForkliftController,
  type V1beta1Migration,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { getVmMigrationsDataPoints } from '../../utils/getVmMigrationsDataPoints';
import { TimeRangeOptions, TimeRangeOptionsDictionary } from '../../utils/timeRangeOptions';

import HeaderActions from './VmMigrationsHistoryCardHeaderActions';
import VmMigrationsHistoryChart from './VmMigrationsHistoryChart';

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

  const vmMigrationsDataPoints = getVmMigrationsDataPoints(migrations, selectedTimeRange);

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
